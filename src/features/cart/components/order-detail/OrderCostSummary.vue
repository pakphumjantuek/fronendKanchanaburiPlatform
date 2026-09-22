<script setup lang="ts">
interface Props {
  subtotal: number
  shippingFee: number
  totalAmount: number
  orderId: string
  canPay: boolean
  canConfirmReceipt?: boolean
}

defineEmits<{
  (event: 'confirm-receipt'): void
}>()

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <div class="border-t-2 border-[#E8D9C9] pt-6 space-y-3 text-sm font-semibold">
      <div class="flex justify-between text-[#786B62]">
        <span>ราคาสินค้ารวม</span>
        <span class="font-black text-[#332820]"
          >฿ {{ Number(subtotal).toLocaleString('th-TH') }}</span
        >
      </div>
      <div class="flex justify-between text-[#786B62]">
        <span>ค่าจัดส่ง</span>
        <span class="font-black text-[#332820]"
          >฿ {{ Number(shippingFee).toLocaleString('th-TH') }}</span
        >
      </div>
      <div
        class="flex justify-between border-t-2 border-[#E8D9C9] pt-4 text-base font-black"
      >
        <span class="text-[#332820]">ยอดรวมสุทธิ</span>
        <span class="text-2xl text-[#D96C2C]"
          >฿ {{ Number(totalAmount).toLocaleString('th-TH') }}</span
        >
      </div>
    </div>

    <!-- Pay CTA if not paid -->
    <div v-if="canPay" class="pt-4 flex justify-end">
      <RouterLink
        :to="`/orders/${orderId}/pay`"
        class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition border border-[#D96C2C] active:scale-95 cursor-pointer"
      >
        <i class="mdi mdi-credit-card-outline text-lg text-white"></i>
        <span class="!text-white font-black">ไปที่หน้าชำระเงิน</span>
      </RouterLink>
    </div>

    <div v-else-if="canConfirmReceipt" class="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-black text-emerald-900">ได้รับสินค้าแล้วหรือไม่?</p>
        <p class="mt-1 text-xs font-semibold text-emerald-800">
          ยืนยันเมื่อได้รับสินค้าครบถ้วน เพื่อเปิดสิทธิ์เขียนรีวิวสินค้า
        </p>
      </div>
      <button
        type="button"
        class="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 sm:mt-0"
        @click="$emit('confirm-receipt')"
      >
        <i class="mdi mdi-package-check text-base"></i>
        ยืนยันว่าได้รับสินค้าแล้ว
      </button>
    </div>
  </div>
</template>
