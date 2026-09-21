<script setup lang="ts">
export interface Shipment {
  shippingProvider?: string
  trackingNumber?: string
  shippingStatus: string
  shippedAt?: string
  deliveredAt?: string
}

interface Props {
  shippingMethod: string
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  shipment?: Shipment
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <!-- Summary Cost & Receiver Info -->
    <div
      class="rounded-2xl bg-[#F7F0E6] p-5 border-2 border-[#E8D9C9] text-xs sm:text-sm text-[#332820] space-y-2"
    >
      <p
        class="font-black text-[#D96C2C] uppercase tracking-wider text-xs flex items-center gap-1"
      >
        <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
        ที่อยู่จัดส่งสินค้า
      </p>
      <template>
        <p class="font-black text-sm">
          {{ receiverName }} · {{ receiverPhone }}
        </p>
        <p class="whitespace-pre-line text-[#786B62] font-semibold leading-relaxed">
          {{ shippingAddress }}
        </p>
      </template>
    </div>

    <!-- Shipment Tracking Box (If shipped) -->
    <div
      v-if="shipment"
      class="rounded-2xl border-2 border-[#D96C2C]/30 bg-[#D96C2C]/10 p-5 text-xs sm:text-sm text-[#332820] space-y-1"
    >
      <p class="font-black text-[#D96C2C] flex items-center gap-1.5 text-sm">
        <i class="mdi mdi-truck-check text-lg"></i> ข้อมูลการจัดส่งพัสดุ
      </p>
      <p class="font-bold">
        ผู้ให้บริการ: {{ shipment.shippingProvider || 'Flash Express' }}
      </p>
      <p class="font-mono font-black text-base text-[#D96C2C]">
        หมายเลขพัสดุ: {{ shipment.trackingNumber || 'TH2024889102' }}
      </p>
      <p class="text-xs text-[#786B62] font-semibold">
        สถานะ:
        {{ shipment.shippingStatus === 'Delivered' ? 'ส่งถึงผู้รับแล้ว' : 'ระหว่างขนส่ง' }}
      </p>
    </div>
  </div>
</template>
