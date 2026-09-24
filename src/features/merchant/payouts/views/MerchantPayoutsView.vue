<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { onMounted, ref } from 'vue'
import http from '@/shared/api/http'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderDto {
  orderId: string
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

interface MerchantPayoutRecord {
  payoutId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  totalAmount: number
  slipImageUrl?: string
  transactionRef?: string
  note?: string
  status: string
  createdAt: string
  ordersCount: number
  orders: OrderDto[]
}

interface MerchantPayoutSummary {
  pendingPayoutAmount: number
  totalPaidOutAmount: number
  history: MerchantPayoutRecord[]
}

const summary = ref<MerchantPayoutSummary | null>(null)
const loading = ref(true)
const selectedSlipUrl = ref<string | null>(null)
const swal = useSwal()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}



async function loadMerchantPayouts() {
  loading.value = true
  try {
    const { data } = await http.get<MerchantPayoutSummary>('/shops/mine/payouts')
    summary.value = data
  } catch (error) {
    await swal.error('โหลดข้อมูลสรุปการรับเงินไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

onMounted(loadMerchantPayouts)
</script>

<template>
  <div class="space-y-6 text-[#332820] max-w-[1920px] mx-auto pb-12">
    <!-- Header Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C] mb-2">
          <i class="mdi mdi-cash-multiple"></i> Merchant Payout History
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">ประวัติการรับเงินยอดขาย (Payouts)</h1>
        <p class="mt-1 text-xs sm:text-sm text-[#786B62] font-semibold">
          สรุปยอดเงินขายสินค้า และหลักฐานสลิปการโอนเงินคืนจากแอดมิน
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#F2E5D5] border-2 border-[#E8D9C9] px-4 py-2.5 text-xs font-black text-[#332820] shadow-xs transition active:scale-95 cursor-pointer"
        :disabled="loading"
        @click="loadMerchantPayouts"
      >
        <i class="mdi mdi-refresh text-base text-[#D96C2C]" :class="{ 'animate-spin': loading }"></i>
        <span>รีเฟรชข้อมูล</span>
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div v-for="i in 2" :key="i" class="h-32 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>
      <div class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <template v-else-if="summary">
      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Pending Payout Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                ยอดเงินยอดขายรอแอดมินโอน
              </p>
              <h2 class="mt-2 text-3xl font-black text-amber-700">
                {{ formatCurrency(summary.pendingPayoutAmount) }}
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800">
              <i class="mdi mdi-clock-outline text-2xl"></i>
            </div>
          </div>
          <p class="text-xs text-[#786B62] font-semibold border-t border-[#E8D9C9]/60 pt-3">
            ยอดขายจากออเดอร์ที่ผู้ซื้อชำระเงินแล้ว อยู่ระหว่างรอแอดมินสั่งจ่ายเข้าบัญชีธนาคารร้าน
          </p>
        </div>

        <!-- Total Paid Out Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                ยอดเงินที่ได้รับโอนแล้วทั้งหมด
              </p>
              <h2 class="mt-2 text-3xl font-black text-emerald-700">
                {{ formatCurrency(summary.totalPaidOutAmount) }}
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-800">
              <i class="mdi mdi-check-decagram-outline text-2xl"></i>
            </div>
          </div>
          <p class="text-xs text-[#786B62] font-semibold border-t border-[#E8D9C9]/60 pt-3">
            ยอดเงินขายทั้งหมดที่แอดมินโอนเข้าบัญชีธนาคารของร้านค้าเรียบร้อยแล้ว
          </p>
        </div>
      </div>

      <!-- Payout History Table & Slip View -->
      <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] text-white flex items-center justify-center text-xl font-bold shadow-md">
              <i class="mdi mdi-history"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-[#332820]">ประวัติการโอนเงินจากแอดมิน</h2>
              <p class="text-xs text-[#786B62] font-semibold">รายการรับเงินจากแพลตฟอร์มพร้อมรูปหลักฐานสลิปการโอนเงิน</p>
            </div>
          </div>
        </div>

        <div v-if="summary.history.length === 0" class="py-12 text-center text-xs text-[#786B62] font-semibold space-y-2">
          <i class="mdi mdi-text-box-search-outline text-4xl text-[#D96C2C]"></i>
          <p class="font-black text-sm text-[#332820]">ยังไม่มีประวัติการรับเงินโอนจากแอดมิน</p>
          <p>เมื่อแอดมินดำเนินการโอนเงินยอดขายให้แก่ร้านค้า รายการและสลิปหลักฐานจะแสดงขึ้นที่นี่</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="record in summary.history"
            :key="record.payoutId"
            class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 space-y-3 shadow-2xs hover:border-[#D96C2C] transition"
          >
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8D9C9]/60 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-black text-base text-[#332820]">โอนเงินยอดขายสำเร็จ</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    <i class="mdi mdi-check"></i> ได้รับเงินแล้ว
                  </span>
                </div>
                <p class="text-xs text-[#786B62] font-semibold mt-0.5">
                  โอนเมื่อ: {{ formatDate(record.createdAt, { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }} | {{ record.ordersCount }} คำสั่งซื้อ
                  <span v-if="record.transactionRef" class="ml-2 font-mono text-[#332820]">Ref: {{ record.transactionRef }}</span>
                </p>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-2xl font-black text-[#D96C2C]">
                  {{ formatCurrency(record.totalAmount) }}
                </span>

                <button
                  v-if="record.slipImageUrl"
                  type="button"
                  class="px-4 py-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#D96C2C] hover:text-white border-2 border-[#D96C2C] text-xs font-black text-[#D96C2C] transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
                  @click="selectedSlipUrl = imageUrl(record.slipImageUrl)"
                >
                  <i class="mdi mdi-eye-outline text-base"></i>
                  <span>ดูสลิปโอนเงิน</span>
                </button>
              </div>
            </div>

            <div v-if="record.note" class="text-xs text-[#786B62] font-semibold bg-[#FFF9F2] p-2.5 rounded-xl border border-[#E8D9C9]/80">
              💬 หมายเหตุจากแอดมิน: <span class="text-[#332820] font-bold">{{ record.note }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Modal for Zoomed Admin Payout Slip Image -->
    <div
      v-if="selectedSlipUrl"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      @click="selectedSlipUrl = null"
    >
      <div class="relative max-w-2xl max-h-[90vh] bg-white p-4 rounded-3xl shadow-2xl space-y-3" @click.stop>
        <div class="flex items-center justify-between border-b pb-2 px-2">
          <span class="text-xs font-black text-[#332820]">หลักฐานสลิปโอนเงินจากแอดมิน</span>
          <button type="button" class="text-rose-600 font-black text-lg p-1 cursor-pointer" @click="selectedSlipUrl = null">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <img :src="selectedSlipUrl" alt="สลิปจากแอดมิน" class="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl" />
      </div>
    </div>
  </div>
</template>
