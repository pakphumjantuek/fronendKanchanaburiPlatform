<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  hasShopLocation: boolean
}>()

const isFollowing = defineModel<boolean>('isFollowing', { default: false })

const emit = defineEmits<{
  (e: 'copy-link'): void
  (e: 'open-directions'): void
}>()
</script>

<template>
  <div
    class="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-t-2 border-[#E8D9C9] px-4 py-3 shadow-2xl flex items-center gap-2"
  >
    <button
      type="button"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-95 cursor-pointer"
      :class="
        isFollowing
          ? 'bg-slate-800 border-slate-800 text-white'
          : 'bg-[#FFF9F2] border-[#E8D9C9] text-amber-600'
      "
      :aria-pressed="isFollowing"
      aria-label="ติดตามร้านค้า"
      @click="isFollowing = !isFollowing"
    >
      <i class="mdi text-lg" :class="isFollowing ? 'mdi-check' : 'mdi-heart-outline'"></i>
    </button>

    <button
      type="button"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-[#332820] cursor-pointer"
      aria-label="แชร์ร้านค้านี้"
      @click="emit('copy-link')"
    >
      <i class="mdi mdi-share-variant-outline text-lg"></i>
    </button>

    <a
      v-if="shop.phone"
      :href="`tel:${shop.phone}`"
      class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#FFF9F2] border-2 border-[#E8D9C9] text-emerald-800 font-extrabold text-xs active:scale-95 transition"
    >
      <i class="mdi mdi-phone-outline text-base text-emerald-700"></i>
      <span>โทรติดต่อ</span>
    </a>

    <button
      v-if="hasShopLocation"
      type="button"
      class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-amber-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer border border-amber-600"
      @click="emit('open-directions')"
    >
      <i class="mdi mdi-navigation-variant text-base text-white"></i>
      <span class="text-white">นำทาง</span>
    </button>
  </div>
</template>
