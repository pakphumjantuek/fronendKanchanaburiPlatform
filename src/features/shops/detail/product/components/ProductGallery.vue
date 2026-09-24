<script setup lang="ts">
import type { Product } from '@/features/shops/api'

defineProps<{
  product: Product
  galleryImages: string[]
}>()

const selectedImageIndex = defineModel<number>('selectedImageIndex', { default: 0 })
const isFavorite = defineModel<boolean>('isFavorite', { default: false })
</script>

<template>
  <div class="space-y-4">
    <!-- Main Preview Frame -->
    <div
      class="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-[#171412] shadow-xl border-2 border-[#E8D9C9] group"
    >
      <img
        :src="galleryImages[selectedImageIndex] || galleryImages[0]"
        :alt="product.productName"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Top Left Badge "สินค้าแนะนำ" -->
      <div class="absolute top-3 left-3">
        <span
          class="px-3.5 py-1 rounded-xl text-xs font-black bg-[#D96C2C] text-white shadow-lg border border-white/20"
        >
          ✨ สินค้าแนะนำ
        </span>
      </div>

      <!-- Top Right Favorite Heart Button -->
      <button
        type="button"
        class="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/95 text-[#332820] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition border border-[#E8D9C9] cursor-pointer"
        @click="isFavorite = !isFavorite"
      >
        <i
          class="mdi text-xl"
          :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline text-[#D96C2C]'"
        ></i>
      </button>

      <!-- Gallery Navigation Arrows -->
      <button
        v-if="galleryImages.length > 1"
        type="button"
        class="absolute top-1/2 left-3 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#332820] flex items-center justify-center shadow-lg hover:bg-white transition cursor-pointer"
        @click="
          selectedImageIndex = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length
        "
      >
        <i class="mdi mdi-chevron-left text-2xl"></i>
      </button>
      <button
        v-if="galleryImages.length > 1"
        type="button"
        class="absolute top-1/2 right-3 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#332820] flex items-center justify-center shadow-lg hover:bg-white transition cursor-pointer"
        @click="selectedImageIndex = (selectedImageIndex + 1) % galleryImages.length"
      >
        <i class="mdi mdi-chevron-right text-2xl"></i>
      </button>

      <!-- Bottom Zoom Hint -->
      <div class="absolute bottom-3 right-3">
        <span
          class="px-3 py-1 rounded-xl bg-slate-950/80 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20"
        >
          <i class="mdi mdi-magnify text-[#F2A65A]"></i> คลิกเพื่อภาพขยาย
        </span>
      </div>
    </div>

    <!-- Thumbnail Strip Gallery -->
    <div v-if="galleryImages.length > 1" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
      <button
        v-for="(img, idx) in galleryImages"
        :key="idx"
        type="button"
        class="relative aspect-square rounded-2xl overflow-hidden border-2 transition duration-200 cursor-pointer"
        :class="
          selectedImageIndex === idx
            ? 'border-[#D96C2C] ring-4 ring-[#D96C2C]/20 scale-95 shadow-md'
            : 'border-[#E8D9C9] hover:border-[#D96C2C] opacity-80'
        "
        @click="selectedImageIndex = idx"
      >
        <img :src="img" :alt="`ภาพสินค้า ${idx + 1}`" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>
