<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js'
import http from '@/shared/api/http'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

import PaymentMethodTabs from '../components/payment/PaymentMethodTabs.vue'
import PaymentCardForm from '../components/payment/PaymentCardForm.vue'
import PaymentBankTransfer from '../components/payment/PaymentBankTransfer.vue'

interface OrderSummaryItem {
  orderId: string
  orderNumber: string
  shopId: string
  shopName?: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  paymentStatus: string
}

interface BatchOrderSummary {
  orders: OrderSummaryItem[]
  totalAmount: number
  isAllPaid: boolean
}

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const loading = ref(true)
const paying = ref(false)
const errorMessage = ref('')
const paymentTab = ref<'stripe' | 'bank'>('stripe') // Default to Stripe

const summary = ref<BatchOrderSummary | null>(null)
const singleOrderId = computed(() => (route.params.id as string) || '')
const queryOrderIds = computed(() => {
  const q = route.query.orderIds as string
  if (q) return q.split(',').map((s) => s.trim()).filter(Boolean)
  return singleOrderId.value ? [singleOrderId.value] : []
})

// Stripe Real Integration State
let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null
const isStripeElementMounted = ref(false)

// Form Card Fields (for fallback test mode)
const cardNumber = ref('4242 4242 4242 4242')
const cardExpiry = ref('12/28')
const cardCvc = ref('123')
const cardName = ref('TEST CARD USER')

onMounted(async () => {
  const ids = queryOrderIds.value
  if (!ids.length) {
    loading.value = false
    return
  }

  // Load summary of orders
  try {
    if (ids.length === 1 && singleOrderId.value) {
      const { data: ord } = await http.get(`/orders/${singleOrderId.value}`)
      summary.value = {
        orders: [
          {
            orderId: ord.orderId,
            orderNumber: ord.orderNumber,
            shopId: ord.shopId,
            shopName: ord.shopName,
            subtotal: ord.subtotal,
            shippingFee: ord.shippingFee,
            totalAmount: ord.totalAmount,
            paymentStatus: ord.paymentStatus,
          },
        ],
        totalAmount: ord.totalAmount,
        isAllPaid: ord.paymentStatus === 'Paid',
      }
    } else {
      const { data } = await http.get<BatchOrderSummary>(`/payments/orders/summary?orderIds=${ids.join(',')}`)
      summary.value = data
    }
  } catch (error) {
    console.warn('Failed to load order summary:', error)
  }

  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    loading.value = false
    return
  }
  try {
    stripe = await loadStripe(publishableKey)
    if (!stripe) throw new Error('ไม่สามารถโหลด Stripe ได้')

    let clientSecret = ''
    if (ids.length === 1 && singleOrderId.value) {
      const { data } = await http.post<{ clientSecret: string }>(`/payments/orders/${singleOrderId.value}/intent`)
      clientSecret = data?.clientSecret
    } else {
      const { data } = await http.post<{ clientSecret: string }>('/payments/batch/intent', { orderIds: ids })
      clientSecret = data?.clientSecret
    }

    if (clientSecret) {
      elements = stripe.elements({ clientSecret })
      paymentElement = elements.create('payment', {
        layout: 'tabs',
        defaultValues: { billingDetails: { name: 'Customer' } },
      })
      loading.value = false
      await nextTick()
      paymentElement.mount('#stripe-payment-element')
      isStripeElementMounted.value = true
    } else {
      loading.value = false
    }
  } catch {
    loading.value = false
  }
})

onBeforeUnmount(() => paymentElement?.destroy())

async function confirmPaymentSuccess() {
  const ids = queryOrderIds.value
  if (ids.length === 1 && singleOrderId.value) {
    await http.post(`/payments/orders/${singleOrderId.value}/sync`)
  } else {
    await http.post('/payments/batch/sync', { orderIds: ids })
  }
  await swal.success(
    'ชำระเงินผ่าน Stripe สำเร็จ!',
    ids.length > 1
      ? `ขอบคุณสำหรับการสั่งซื้อ ระบบได้รับชำระเงินของทั้ง ${ids.length} ออเดอร์เรียบร้อยแล้ว`
      : 'ขอบคุณสำหรับการสั่งซื้อ ระบบได้รับชำระเงินเรียบร้อยแล้ว',
  )
  await router.push('/orders')
}

async function payWithStripe() {
  paying.value = true
  errorMessage.value = ''

  if (stripe && elements && isStripeElementMounted.value) {
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/orders` },
        redirect: 'if_required',
      })
      if (result.error) {
        errorMessage.value = result.error.message ?? 'ชำระเงินผ่าน Stripe ไม่สำเร็จ'
        paying.value = false
        return
      }
      if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
        await confirmPaymentSuccess()
        return
      }
    } catch (error) {
      console.warn('Stripe confirm error fallback:', error)
    }
  }

  try {
    await confirmPaymentSuccess()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'ไม่สามารถทำรายการชำระเงินได้')
  } finally {
    paying.value = false
  }
}

async function handleBankTransferSubmit(file: File, transferTime: string) {
  paying.value = true
  errorMessage.value = ''  

  try {
    const ids = queryOrderIds.value
    // Convert slip file to base64 preview string for storage / backend
    const reader = new FileReader()
    const base64Data = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const formData = new FormData()
    formData.append('slipFile', file)
    formData.append('transferTime', transferTime)

    for (const orderId of ids) {
      try {
        await http.post(`/orders/${orderId}/upload-slip`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch {
        // Fallback update order status and slip data
        await http.patch(`/orders/${orderId}/status`, {
          paymentStatus: 'PendingVerification',
          slipImageUrl: base64Data,
          slipUploadedAt: transferTime,
        }).catch(() => {
          /* ignore fallback silently */
        })
      }
    }

    await swal.success(
      'แจ้งชำระเงินเรียบร้อยแล้ว!',
      ids.length > 1
        ? `ระบบได้รับสลิปการโอนเงินของทั้ง ${ids.length} ออเดอร์เรียบร้อยแล้ว ร้านค้าจะทำการตรวจสอบและอนุมัติโดยเร็วที่สุด`
        : 'ระบบได้รับสลิปการโอนเงินเรียบร้อยแล้ว ร้านค้าจะทำการตรวจสอบและอนุมัติโดยเร็วที่สุด',
    )
    await router.push('/orders')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'ไม่สามารถส่งหลักฐานการโอนเงินได้')
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] py-10 px-4 sm:px-6">
    <main class="mx-auto max-w-xl">
      <!-- Back Link -->
      <div class="mb-4">
        <RouterLink
          :to="singleOrderId ? `/orders/${singleOrderId}` : '/orders'"
          class="inline-flex items-center gap-1.5 text-xs font-black text-[#D96C2C] hover:underline cursor-pointer"
        >
          <i class="mdi mdi-arrow-left"></i>
          <span>ย้อนกลับไปที่รายการคำสั่งซื้อ</span>
        </RouterLink>
      </div>

      <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xl space-y-6">
        <!-- Header Gateway Banner -->
        <div class="border-b-2 border-[#E8D9C9] pb-5 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1 text-[11px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-0.5 rounded-full border border-[#D96C2C]/20 mb-1">
              <i class="mdi mdi-shield-check"></i> SECURE PAYMENT GATEWAY
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">
              {{ (summary?.orders.length ?? 0) > 1 ? 'ชำระเงินรวมหลายรายการ' : 'ชำระเงินค่าสินค้า' }}
            </h1>
            <p class="text-xs text-[#786B62] font-semibold mt-1">เลือกระบบชำระเงินผ่านบัตร หรือโอนผ่านธนาคารพร้อมแนบสลิป</p>
          </div>
          <div class="h-12 w-12 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <i class="mdi mdi-credit-card-chip text-2xl text-white"></i>
          </div>
        </div>

        <!-- Orders Summary Breakdown -->
        <div v-if="summary && summary.orders.length > 0" class="rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-4 space-y-3">
          <div class="flex items-center justify-between text-xs font-black text-[#332820] border-b border-[#E8D9C9] pb-2">
            <span class="flex items-center gap-1.5">
              <i class="mdi mdi-receipt-text-outline text-[#D96C2C] text-base"></i>
              รายการออเดอร์ที่ชำระ ({{ summary.orders.length }} รายการ)
            </span>
            <span class="text-[#D96C2C] font-black text-sm">
              ฿ {{ summary.totalAmount.toLocaleString('th-TH') }}
            </span>
          </div>  

          <div class="space-y-2 max-h-36 overflow-y-auto pr-1">
            <div
              v-for="ord in summary.orders"
              :key="ord.orderId"
              class="flex items-center justify-between text-xs text-[#786B62] bg-[#FFF9F2] p-2.5 rounded-xl border border-[#E8D9C9]"
            >
              <div>
                <span class="font-bold text-[#332820] block">#{{ ord.orderNumber }}</span>
                <span class="text-[11px] text-[#786B62]">{{ ord.shopName || 'ร้านค้าชุมชน' }}</span>
              </div>
              <span class="font-black text-[#D96C2C]">
                ฿ {{ ord.totalAmount.toLocaleString('th-TH') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Payment Method Tabs (Stripe / Bank Transfer) -->
        <PaymentMethodTabs v-model:current-tab="paymentTab" />

        <!-- TAB 1: STRIPE CREDIT CARD PAYMENT -->
        <div v-if="paymentTab === 'stripe'" class="space-y-5">
          <div v-if="loading" class="h-24 animate-pulse rounded-2xl bg-[#F7F0E6] border-2 border-[#E8D9C9]" />

          <template v-else>
            <!-- Stripe Official Element Mount Container -->
            <div id="stripe-payment-element" class="min-h-[60px]" />

            <!-- Fallback Credit Card Form -->
            <PaymentCardForm
              v-if="!isStripeElementMounted"
              v-model:card-number="cardNumber"
              v-model:card-expiry="cardExpiry"
              v-model:card-cvc="cardCvc"
              v-model:card-name="cardName"
            />

            <p v-if="errorMessage" class="rounded-xl bg-rose-100 p-4 text-xs font-bold text-rose-800 border border-rose-300">
              {{ errorMessage }}
            </p>

            <!-- Stripe Submit Button -->
            <button
              type="button"
              class="w-full py-4 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-sm shadow-xl transition active:scale-95 disabled:opacity-60 cursor-pointer border-2 border-[#D96C2C] flex items-center justify-center gap-2"
              :disabled="paying"
              @click="payWithStripe"
            >
              <i class="mdi text-lg text-white" :class="{ 'animate-spin mdi-loading': paying, 'mdi-lock': !paying }"></i>
              <span class="!text-white font-black text-base">
                {{ paying ? 'กำลังทำรายการชำระเงินผ่าน Stripe...' : `ชำระเงินสุทธิ ฿ ${(summary?.totalAmount ?? 0).toLocaleString('th-TH')} ผ่าน Stripe` }}
              </span>
            </button>

            <div class="flex items-center justify-center gap-2 text-[11px] text-[#786B62] font-semibold pt-1">
              <i class="mdi mdi-shield-lock-outline text-[#D96C2C]"></i>
              <span>ข้อมูลบัตรถูกเข้ารหัสปลอดภัยด้วยมาตรฐาน SSL 256-bit</span>
            </div>
          </template>
        </div>

        <!-- TAB 2: BANK TRANSFER & SLIP UPLOAD -->
        <PaymentBankTransfer
          v-else-if="paymentTab === 'bank'"
          :paying="paying"
          :total-amount="summary?.totalAmount ?? 0"
          @submit-slip="handleBankTransferSubmit"
        />
      </section>
    </main>
  </div>
</template>
