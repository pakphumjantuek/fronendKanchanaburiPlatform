<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
}>()
</script>

<template>
  <section class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-xs space-y-5">
    <div class="flex items-center gap-3 border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs font-bold">
        <i class="mdi mdi-store-check-outline text-xl text-white"></i>
      </div>
      <div>
        <h2 class="text-2xl font-black text-[#332820]">เกี่ยวกับร้านค้า</h2>
        <p class="text-xs sm:text-sm text-[#786B62]">ข้อมูลความเป็นมาและบริการของร้านค้า</p>
      </div>
    </div>

    <p class="text-sm sm:text-base text-[#786B62] leading-relaxed whitespace-pre-line font-semibold">
      {{
        shop.description ||
        'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี ผลิตภัณฑ์ชุมชนคุณภาพสูง ส่งตรงจากเกษตรกรและชุมชนท้องถิ่น'
      }}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
      <div class="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD] text-xs sm:text-sm font-bold text-[#332820]">
        <i class="mdi mdi-leaf text-emerald-700 text-xl shrink-0"></i>
        <span>สินค้าชุมชนแท้ 100%</span>
      </div>

      <div class="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD] text-xs sm:text-sm font-bold text-[#332820]">
        <i class="mdi mdi-truck-check-outline text-emerald-700 text-xl shrink-0"></i>
        <span>บริการจัดส่งทั่วประเทศ</span>
      </div>

      <div class="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD] text-xs sm:text-sm font-bold text-[#332820]">
        <i class="mdi mdi-shield-check-outline text-emerald-700 text-xl shrink-0"></i>
        <span>รับประกันคุณภาพสินค้า</span>
      </div>
    </div>
  </section>
</template>
