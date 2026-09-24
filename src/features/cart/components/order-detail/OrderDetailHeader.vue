<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
interface Props {
  orderNumber: string
  createdAt: string
  paymentStatus: string
  orderStatus: string
}

const props = defineProps<Props>()

function getStatusTitle(status: string) {
  if (status === 'Pending') return 'รอยืนยันคำสั่งซื้อ'
  if (status === 'Confirmed') return 'ร้านกำลังเตรียมจัดส่ง'
  if (status === 'Shipped') return 'จัดส่งสินค้าแล้ว'
  if (status === 'Completed') return 'สำเร็จสมบูรณ์'
  if (status === 'Cancelled') return 'ยกเลิกคำสั่งซื้อ'
  return status
}


</script>

<template>
  <div
    class="border-b-2 border-[#E8D9C9] bg-[#171412] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
  >
    <div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-[#F7F0E6]/70">คำสั่งซื้อหมายเลข:</span>
        <h1 class="text-xl sm:text-2xl font-black text-white font-mono">
          #{{ props.orderNumber }}
        </h1>
      </div>
      <p class="mt-1 text-xs text-[#F7F0E6]/80 flex items-center gap-1 font-semibold">
        <i class="mdi mdi-clock-outline text-[#F2A65A]"></i>
        <span>สั่งซื้อเมื่อ: {{ formatDate(props.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black border"
        :class="
          props.paymentStatus === 'Paid'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
            : 'bg-[#D96C2C]/30 text-[#F2A65A] border-amber-400/40'
        "
      >
        <i
          :class="[
            'mdi',
            props.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline',
          ]"
        ></i>
        {{ props.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอการชำระเงิน' }}
      </span>

      <span
        class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1 text-xs font-black text-white border border-white/20"
      >
        {{ getStatusTitle(props.orderStatus) }}
      </span>
    </div>
  </div>
</template>
