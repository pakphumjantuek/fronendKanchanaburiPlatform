<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
}>()
</script>

<template>
  <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
    <div class="border-b-2 border-[#E8D9C9] pb-3">
      <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
        <i class="mdi mdi-star-circle-outline text-xl text-[#D96C2C]"></i>
        <span>จุดเด่นของร้านค้า</span>
      </h3>
    </div>

    <div class="space-y-3 text-xs font-bold text-[#786B62]">
      <div class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>สินค้าชุมชนแท้ 100% ส่งตรงจากผู้ผลิต</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>การันตีโดยแพลตฟอร์มท่องเที่ยวชุมชน</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>สนับสนุนเศรษฐกิจชุมชนกาญจนบุรี</span>
      </div>
    </div>
  </div>
</template>
