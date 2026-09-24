<script setup lang="ts">
import { ref } from 'vue'
import AppTextField from '@/components/common/input/AppTextField.vue'

const props = defineProps<{
  initialProvider?: string
  initialTracking?: string
  presetProviders?: string[]
  updating?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { provider: string; trackingNumber: string }): void
}>()

const defaultPresets = [
  'Flash Express',
  'Kerry Express',
  'ไปรษณีย์ไทย (EMS)',
  'J&T Express',
  'Ninja Van',
]

const provider = ref(props.initialProvider || 'Flash Express')
const trackingNumber = ref(props.initialTracking || '')

function handleSubmit() {
  emit('submit', {
    provider: provider.value.trim(),
    trackingNumber: trackingNumber.value.trim(),
  })
}
</script>

<template>
  <div class="rounded-3xl border-2 border-[#D96C2C]/30 bg-white p-4 shadow-2xs space-y-3">
    <div class="flex items-center justify-between border-b border-[#E8D9C9] pb-2">
      <div class="flex items-center gap-2">
        <i class="mdi mdi-truck-fast-outline text-xl text-[#D96C2C]"></i>
        <span class="font-black text-sm text-[#332820]">กรอกข้อมูลจัดส่งพัสดุ</span>
      </div>
      <span class="text-[11px] font-extrabold text-[#786B62]">เลือกขนส่งที่ใช้ส่งสินค้า</span>
    </div>

    <!-- Preset Delivery Company Chips -->
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-xs font-bold text-[#786B62] mr-1">ขนส่งยอดฮิต:</span>
      <button
        v-for="preset in presetProviders || defaultPresets"
        :key="preset"
        type="button"
        class="px-2.5 py-1 rounded-xl text-xs font-black transition border cursor-pointer"
        :class="
          provider === preset
            ? 'bg-[#D96C2C] text-white border-[#D96C2C] shadow-xs'
            : 'bg-[#F7F0E6] text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="provider = preset"
      >
        {{ preset }}
      </button>
    </div>

    <!-- Provider & Tracking Input Fields -->
    <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end pt-1">
      <AppTextField
        v-model="provider"
        label="บริษัทขนส่ง *"
        placeholder="เช่น Flash Express, Kerry"
      />
      <AppTextField
        v-model="trackingNumber"
        label="เลขพัสดุ (Tracking Number) *"
        placeholder="เช่น TH123456789"
      />
      <button
        type="button"
        class="rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 font-black text-xs sm:text-sm text-white shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer border border-[#D96C2C]"
        :disabled="updating"
        @click="handleSubmit"
      >
        <i class="mdi mdi-truck-check mr-1 text-white"></i>
        <span class="!text-white font-black">{{
          updating ? 'กำลังบันทึก...' : 'ยืนยันการจัดส่ง'
        }}</span>
      </button>
    </div>
  </div>
</template>
