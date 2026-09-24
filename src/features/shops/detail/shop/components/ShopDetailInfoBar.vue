<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  businessHours: string
  isOpenNow: boolean
  shopAddress: string
  hasShopLocation: boolean
}>()

const emit = defineEmits<{
  (e: 'open-map'): void
}>()
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
    <div
      class="rounded-3xl bg-[#FFF9F2] p-5 sm:p-6 border-2 border-[#E8D9C9] shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <!-- Phone -->
      <div
        class="flex items-center gap-3.5 border-b sm:border-b-0 sm:border-r border-[#E8D9C9] pb-3 sm:pb-0 pr-0 sm:pr-4"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20"
        >
          <i class="mdi mdi-phone-outline text-xl"></i>
        </div>
        <div>
          <span class="block text-[11px] text-[#786B62] font-black uppercase">เบอร์โทรศัพท์</span>
          <a
            v-if="shop.phone"
            :href="`tel:${shop.phone}`"
            class="text-xs sm:text-sm font-black text-[#332820] hover:text-[#D96C2C] transition"
          >
            {{ shop.phone }}
          </a>
          <span v-else class="text-xs sm:text-sm font-black text-[#786B62]">ยังไม่ได้ระบุ</span>
        </div>
      </div>

      <!-- Hours -->
      <div
        class="flex items-center gap-3.5 border-b lg:border-b-0 lg:border-r border-[#E8D9C9] pb-3 lg:pb-0 pr-0 lg:pr-4"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20"
        >
          <i class="mdi mdi-clock-outline text-xl"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-[#786B62] font-black uppercase">เวลาเปิดทำการ</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-black"
              :class="isOpenNow ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
            >
              {{ isOpenNow ? 'เปิดอยู่' : 'ปิดทำการ' }}
            </span>
          </div>
          <span class="text-xs sm:text-sm font-black text-[#332820] block">{{ businessHours }}</span>
        </div>
      </div>

      <!-- Address -->
      <div class="flex items-center gap-3.5 sm:col-span-2 lg:col-span-2">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20"
        >
          <i class="mdi mdi-map-marker-outline text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <span class="block text-[11px] text-[#786B62] font-black uppercase">ที่ตั้งร้านค้า</span>
          <span class="text-xs sm:text-sm font-black text-[#332820] truncate block">{{ shopAddress }}</span>
        </div>
        <button
          v-if="hasShopLocation"
          type="button"
          class="hidden sm:flex items-center gap-1 text-xs font-black text-[#D96C2C] hover:underline shrink-0"
          @click="emit('open-map')"
        >
          <span>นำทาง</span>
          <i class="mdi mdi-arrow-right text-sm"></i>
        </button>
      </div>
    </div>
  </div>
</template>
