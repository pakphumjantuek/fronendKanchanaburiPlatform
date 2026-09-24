<script setup lang="ts">
import type { District } from '@/features/shops/shared/types/shop'

interface Props {
  districts: District[]
  selectedDistrictId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  select: [districtId: string | null]
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-black text-[#D96C2C] uppercase tracking-wider flex items-center gap-1.5">
        <i class="mdi mdi-map-marker-radius text-[#D96C2C] text-base"></i>
        <span>เลือกตามอำเภอในกาญจนบุรี</span>
      </h3>
    </div>

    <!-- District Pills Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        class="shrink-0 rounded-2xl border-2 px-4.5 py-2 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
        :class="
          selectedDistrictId === null
            ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
            : 'border-[#E8D9C9] bg-[#FFF9F2] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('select', null)"
      >
        <i class="mdi mdi-map-marker text-xs"></i>
        <span class="font-black">ทุกอำเภอ</span>
      </button>

      <button
        v-for="dist in districts"
        :key="dist.districtId"
        type="button"
        class="shrink-0 rounded-2xl border-2 px-4.5 py-2 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5"
        :class="
          selectedDistrictId === dist.districtId
            ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
            : 'border-[#E8D9C9] bg-[#FFF9F2] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('select', dist.districtId)"
      >
        <i class="mdi mdi-map-marker-outline text-xs"></i>
        <span class="font-black">อ.{{ dist.districtName }}</span>
      </button>
    </div>
  </section>
</template>
