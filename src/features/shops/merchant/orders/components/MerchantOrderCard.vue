<script setup lang="ts">
import AppSelect from '@/components/common/input/AppSelect.vue'
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
}

const props = defineProps<{
  order: OrderItem
  orderStatusOptions: { title: string; value: string }[]
  updatingId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update-status', payload: { order: OrderItem; status: string }): void
  (e: 'ship-order', payload: { order: OrderItem; provider: string; trackingNumber: string }): void
}>()

function getStatusTitle(status: string) {
  const match = props.orderStatusOptions.find((opt) => opt.value === status)
  if (match) return match.title
  if (status === 'Pending') return 'รอยืนยัน'
  if (status === 'Processing') return 'กำลังเตรียมส่ง'
  if (status === 'Shipped') return 'จัดส่งแล้ว'
  return status
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
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
          <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt) }}</span>
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

      <!-- Update Order Status Dropdown -->
      <div class="flex items-center gap-3">
        <div class="w-full sm:w-56">
          <label class="block text-[10px] font-black uppercase tracking-wider text-[#786B62] mb-1">
            เปลี่ยนสถานะออเดอร์
          </label>
          <AppSelect
            :model-value="order.orderStatus"
            :items="orderStatusOptions"
            item-title="title"
            item-value="value"
            :disabled="order.paymentStatus !== 'Paid' || updatingId === order.orderId"
            @update:model-value="emit('update-status', { order, status: String($event) })"
          />
        </div>
      </div>
    </div>

    <!-- FULFILLMENT & SHIPPING FULFILL SECTION -->
    <ShipmentFulfillmentForm
      v-if="
        order.paymentStatus === 'Paid' &&
        order.orderStatus !== 'Shipped' &&
        order.orderStatus !== 'Completed' &&
        order.orderStatus !== 'Cancelled'
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
