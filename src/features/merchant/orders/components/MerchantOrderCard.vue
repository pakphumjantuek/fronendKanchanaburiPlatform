<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import ShipmentFulfillmentForm from './ShipmentFulfillmentForm.vue'

export interface OrderItem {
  orderId: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  shippingMethod: string
  createdAt: string
  slipImageUrl?: string
  slipUploadedAt?: string
  items: {
    orderItemId: string
    productName: string
    imageUrl?: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

const props = defineProps<{
  order: OrderItem
  updatingId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update-status', payload: { order: OrderItem; status: string }): void
  (e: 'ship-order', payload: { order: OrderItem; provider: string; trackingNumber: string }): void
}>()

function getStatusTitle(status: string) {
  if (status === 'Confirmed') return 'ยืนยันออเดอร์แล้ว'
  if (status === 'Pending') return 'รอยืนยัน'
  if (status === 'Processing') return 'กำลังเตรียมจัดส่ง'
  if (status === 'Shipped') return 'จัดส่งแล้ว'
  if (status === 'Completed') return 'สำเร็จ'
  if (status === 'Cancelled') return 'ยกเลิกแล้ว'
  return status
}

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string | null) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}
</script>

<template>
  <article
    class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-6 shadow-xs transition hover:shadow-xl hover:border-[#D96C2C] space-y-4"
  >
    <!-- Order Header Row -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E8D9C9] pb-4"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black text-[#786B62]">ออเดอร์:</span>
          <span class="text-base font-black text-[#332820] font-mono">
            #{{ order.orderNumber }}
          </span>
        </div>
        <div class="text-xs text-[#786B62] font-semibold flex items-center gap-1">
          <i class="mdi mdi-clock-time-four-outline text-[#D96C2C]"></i>
          <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
      </div>

      <div class="text-left sm:text-right">
        <span class="block text-[10px] text-[#786B62] font-black uppercase">ยอดรวมคำสั่งซื้อ</span>
        <span class="text-xl sm:text-2xl font-black text-[#D96C2C]">
          ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
        </span>
      </div>
    </div>

    <!-- Order Status & Badges -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Payment Status Badge -->
        <span
          class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border-2"
          :class="{
            'bg-emerald-100 text-emerald-800 border-emerald-300': order.paymentStatus === 'Paid',
            'bg-orange-100 text-orange-900 border-orange-300':
              order.paymentStatus === 'PendingVerification',
            'bg-amber-100 text-amber-800 border-amber-300':
              order.paymentStatus !== 'Paid' && order.paymentStatus !== 'PendingVerification',
          }"
        >
          <i
            :class="[
              'mdi',
              order.paymentStatus === 'Paid'
                ? 'mdi-check-circle'
                : order.paymentStatus === 'PendingVerification'
                  ? 'mdi-file-document-outline'
                  : 'mdi-clock-outline',
            ]"
          ></i>
          {{
            order.paymentStatus === 'Paid'
              ? 'ชำระเงินเรียบร้อย'
              : order.paymentStatus === 'PendingVerification'
                ? 'รอ Admin ตรวจสอบสลิป'
                : 'รอการชำระเงิน'
          }}
        </span>

        <!-- Current Order Status Badge -->
        <span
          class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-[#332820] border-2 border-[#E8D9C9]"
        >
          <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
          สถานะ: {{ getStatusTitle(order.orderStatus) }}
        </span>

        <span
          class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-800 border-2 border-sky-200"
        >
          <i class="mdi mdi-truck-outline"></i>
          จัดส่งสินค้าทางพัสดุ
        </span>
      </div>

      <div
        v-if="order.orderStatus === 'Pending'"
        class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
      >
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="updatingId === order.orderId"
          @click="emit('update-status', { order, status: 'Confirmed' })"
        >
          <i class="mdi mdi-check-circle-outline text-base"></i>
          ยืนยันออเดอร์
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-black text-rose-700 transition hover:border-rose-600 hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="updatingId === order.orderId"
          @click="emit('update-status', { order, status: 'Cancelled' })"
        >
          <i class="mdi mdi-close-circle-outline text-base"></i>
          ยกเลิกออเดอร์
        </button>
      </div>

      <button
        v-else-if="order.orderStatus === 'Confirmed'"
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        :disabled="updatingId === order.orderId"
        @click="emit('update-status', { order, status: 'Processing' })"
      >
        <i class="mdi mdi-package-variant-closed-check text-base"></i>
        เตรียมจัดส่ง
      </button>
    </div>

    <section class="rounded-2xl border-2 border-[#E8D9C9] bg-white">
      <div class="flex items-center gap-2 border-b border-[#E8D9C9] px-4 py-3">
        <i class="mdi mdi-package-variant-closed text-lg text-[#D96C2C]"></i>
        <h3 class="text-sm font-black text-[#332820]">
          สินค้าในออเดอร์ ({{ order.items.reduce((total, item) => total + item.quantity, 0) }} ชิ้น)
        </h3>
      </div>

      <div class="divide-y divide-[#E8D9C9]">
        <div
          v-for="item in order.items"
          :key="item.orderItemId"
          class="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E8D9C9] bg-[#F7F0E6]">
              <img
                v-if="item.imageUrl"
                :src="imageUrl(item.imageUrl)"
                :alt="item.productName"
                class="h-full w-full object-cover"
              />
              <i v-else class="mdi mdi-shopping-outline text-xl text-[#D96C2C]"></i>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-[#332820]">{{ item.productName }}</p>
              <p class="mt-0.5 text-xs font-semibold text-[#786B62]">
                ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} × {{ item.quantity }} ชิ้น
              </p>
            </div>
          </div>
          <p class="shrink-0 text-sm font-black text-[#D96C2C]">
            ฿ {{ Number(item.totalPrice).toLocaleString('th-TH') }}
          </p>
        </div>
      </div>
    </section>

    <!-- FULFILLMENT & SHIPPING FULFILL SECTION -->
    <ShipmentFulfillmentForm
      v-if="
        order.paymentStatus === 'Paid' &&
        order.orderStatus === 'Processing'
      "
      :updating="updatingId === order.orderId"
      @submit="emit('ship-order', { order, ...$event })"
    />

    <!-- Unpaid Warning Banner -->
    <div
      v-else-if="order.paymentStatus !== 'Paid'"
      class="rounded-2xl bg-amber-100/80 px-4 py-2.5 text-xs text-amber-900 border border-amber-300 flex items-center gap-2 font-bold"
    >
      <i class="mdi mdi-alert-circle-outline text-amber-700 text-lg shrink-0"></i>
      <span>
        {{
          order.paymentStatus === 'PendingVerification'
            ? 'ลูกค้าได้แนบสลิปชำระเงินแล้ว ระบบกำลังอยู่ระหว่างรอ Admin ตรวจสอบอนุมัติ'
            : 'ลูกค้ายังไม่ได้ชำระเงินในระบบ กรุณารอการชำระเงินสำเร็จก่อนจัดส่งสินค้า'
        }}
      </span>
    </div>
  </article>
</template>
