<script setup lang="ts">
// Public storefront - Orange + Cream Order Detail View
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/shared/api/http'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

import OrderDetailHeader from '../components/order-detail/OrderDetailHeader.vue'
import OrderProgressTimeline from '../components/order-detail/OrderProgressTimeline.vue'
import OrderItemsList, { type OrderItem } from '../components/order-detail/OrderItemsList.vue'
import OrderShippingInfo, { type Shipment } from '../components/order-detail/OrderShippingInfo.vue'
import OrderCostSummary from '../components/order-detail/OrderCostSummary.vue'

import { getMyReviewedProducts } from '@/features/shops/api/productApi'

interface Order {
  orderId: string
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  paymentExpiresAt?: string | null
  createdAt: string
  items: OrderItem[]
  shippingMethod: string
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  shipment?: Shipment
}

const route = useRoute()
const order = ref<Order | null>(null)
const reviewedProductIds = ref<string[]>([])
const loading = ref(true)
const swal = useSwal()
const now = ref(Date.now())
let paymentTimer: ReturnType<typeof setInterval> | undefined
function toUtcMilliseconds(value: string) {
  const isoValue = value.replace(' ', 'T')
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(isoValue)
  return new Date(hasTimezone ? isoValue : `${isoValue}Z`).getTime()
}
const paymentExpiresAt = computed(() => {
  if (!order.value) return null
  return order.value.paymentExpiresAt ?? new Date(toUtcMilliseconds(order.value.createdAt) + 30 * 60 * 1000).toISOString()
})
const isAwaitingPayment = computed(() => order.value?.orderStatus === 'Pending' && order.value?.paymentStatus === 'Pending')
const isExpired = computed(() => order.value?.orderStatus === 'Expired' || order.value?.paymentStatus === 'Expired' || (isAwaitingPayment.value && !!paymentExpiresAt.value && toUtcMilliseconds(paymentExpiresAt.value) <= now.value))

const totalItems = computed(
  () => order.value?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
)

// Progress Steps calculation for Timeline
const currentStepIndex = computed(() => {
  if (!order.value) return 1
  if (order.value.orderStatus === 'Cancelled' || isExpired.value) return 0
  if (order.value.orderStatus === 'Completed') return 4
  if (order.value.orderStatus === 'Shipped') return 3
  if (order.value.orderStatus === 'Confirmed' || order.value.paymentStatus === 'Paid') return 2
  return 1
})

const canPay = computed(
  () => order.value?.paymentStatus !== 'Paid' && order.value?.orderStatus !== 'Cancelled' && !isExpired.value,
)

async function fetchMyReviewedProducts() {
  try {
    reviewedProductIds.value = await getMyReviewedProducts()
  } catch {
    reviewedProductIds.value = []
  }
}

onMounted(async () => {
  paymentTimer = setInterval(() => { now.value = Date.now() }, 1000)
  try {
    const [{ data }] = await Promise.all([
      http.get<Order>(`/orders/${route.params.id}`),
      fetchMyReviewedProducts(),
    ])
    order.value = data
  } catch (error) {
    await swal.error('ไม่พบออเดอร์', getApiErrorMessage(error, 'คำสั่งซื้อนี้อาจไม่มีอยู่ในระบบ'))
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => { if (paymentTimer) clearInterval(paymentTimer) })
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- Top Navigation Bar -->
    <div class="border-b-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <RouterLink
          to="/orders"
          class="inline-flex items-center gap-2 rounded-xl border-2 border-[#E8D9C9] bg-white px-3.5 py-1.5 text-xs font-black text-[#332820] transition hover:border-[#D96C2C] hover:text-[#D96C2C]"
        >
          <i class="mdi mdi-arrow-left text-sm text-[#D96C2C]"></i>
          <span>กลับไปรายการคำสั่งซื้อทั้งหมด</span>
        </RouterLink>
      </div>
    </div>

    <!-- Main Container -->
    <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>

      <template v-else-if="order">
        <section
          class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-md space-y-6"
        >
          <!-- Header Banner -->
          <OrderDetailHeader
            :order-number="order.orderNumber"
            :created-at="order.createdAt"
            :payment-status="order.paymentStatus"
            :order-status="order.orderStatus"
          />

          <!-- Order Progress Stepper Timeline -->
          <OrderProgressTimeline
            v-if="order.orderStatus !== 'Cancelled' && !isExpired"
            :current-step-index="currentStepIndex"
          />

          <!-- Order Details Body -->
          <div class="p-6 sm:p-8 space-y-6">
            <div v-if="isExpired" class="rounded-2xl border border-slate-300 bg-slate-100 p-4 text-sm font-semibold text-slate-700">
              <i class="mdi mdi-clock-remove-outline mr-1.5 text-lg"></i>คำสั่งซื้อนี้หมดเวลาชำระเงินแล้ว สินค้าถูกคืนเข้าสต็อกเรียบร้อย
            </div>
            <!-- Items List -->
            <OrderItemsList
              :items="order.items"
              :total-items="totalItems"
              :order-status="order.orderStatus"
              :reviewed-product-ids="reviewedProductIds"
              @review-added="fetchMyReviewedProducts"
            />

            <!-- Shipping & Delivery Address Info -->
            <OrderShippingInfo
              :shipping-method="order.shippingMethod"
              :receiver-name="order.receiverName"
              :receiver-phone="order.receiverPhone"
              :shipping-address="order.shippingAddress"
              :shipment="order.shipment"
            />

            <!-- Price Breakdown & Pay CTA -->
            <OrderCostSummary
              :subtotal="order.subtotal"
              :shipping-fee="order.shippingFee"
              :total-amount="order.totalAmount"
              :order-id="order.orderId"
              :can-pay="canPay"
            />
          </div>
        </section>
      </template>

      <div v-else class="py-20 text-center text-[#786B62] space-y-2">
        <i class="mdi mdi-text-box-remove-outline text-4xl text-[#D96C2C] block mb-2"></i>
        <span class="font-black text-[#332820] text-base">ไม่พบข้อมูลคำสั่งซื้อนี้</span>
      </div>
    </main>
  </div>
</template>
