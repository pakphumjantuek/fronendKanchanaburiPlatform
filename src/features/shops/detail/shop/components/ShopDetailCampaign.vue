<script setup lang="ts">
import { computed } from 'vue'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { Product, Shop } from '@/features/shops/api'
import type { PublicContent } from '@/features/contents/api'

const props = defineProps<{
  shop: Shop
  featuredContent?: PublicContent
  featuredProducts: Product[]
  imageUrl: (url?: string) => string | undefined
  formatPrice: (value: number) => string
}>()

const emit = defineEmits<{
  (e: 'scroll-to-products'): void
}>()

// Use real content image / video thumbnail if available
const campaignCover = computed(() => {
  if (props.featuredContent?.youtubeUrl) {
    const thumb = youtubeThumbnail(props.featuredContent.youtubeUrl)
    if (thumb) return thumb
  }
  return (
    props.imageUrl(props.shop.backgroundImageUrl || props.shop.coverImageUrl) ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80'
  )
})
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <!-- Big Campaign / Story Banner (Left 8 Cols - Displays Real Shop Content) -->
    <div
      class="lg:col-span-8 rounded-3xl overflow-hidden relative bg-[#171412] min-h-[280px] sm:min-h-[320px] flex flex-col justify-end p-6 sm:p-10 border-2 border-[#E8D9C9] shadow-md group"
    >
      <img
        :src="campaignCover"
        :alt="featuredContent?.title || shop.shopName"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-90"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#171412]/95 via-[#171412]/65 to-transparent"></div>

      <div class="relative z-10 space-y-3 max-w-xl">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-700 text-white shadow-md">
          <i class="mdi mdi-book-open-page-variant text-xs"></i>
          {{ featuredContent ? (featuredContent.contentCategoryName || 'เรื่องราวชุมชน') : 'เรื่องราวประจำร้าน' }}
        </span>

        <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight line-clamp-2">
          {{ featuredContent ? featuredContent.title : `สัมผัสเอกลักษณ์ของ ${shop.shopName}` }}
        </h3>

        <p class="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed line-clamp-2">
          {{ featuredContent ? (featuredContent.summary || shop.description) : (shop.description || 'แหล่งรวบรวมผลิตภัณฑ์ชุมชนคุณภาพสูง ส่งตรงจากท้องถิ่นจังหวัดกาญจนบุรี') }}
        </p>

        <div class="pt-2 flex items-center gap-3">
          <RouterLink
            v-if="featuredContent"
            :to="`/contents/${featuredContent.contentId}`"
            class="inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 border border-amber-600 cursor-pointer"
          >
            <span>อ่านเรื่องราวและชมวิดีโอ</span>
            <i class="mdi mdi-arrow-right text-base text-white"></i>
          </RouterLink>

          <button
            v-else
            type="button"
            class="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 border border-amber-600 cursor-pointer"
            @click="emit('scroll-to-products')"
          >
            เลือกชมสินค้าทั้งหมด >
          </button>
        </div>
      </div>
    </div>

    <!-- 2 Side Highlight Cards (Right 4 Cols - Displays Real Products from Shop) -->
    <div class="lg:col-span-4 flex flex-col gap-4">
      <!-- Product 1 (Real Product) -->
      <RouterLink
        v-if="featuredProducts[0]"
        :to="`/products/${featuredProducts[0].productId}`"
        class="flex-1 rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-4 shadow-xs flex items-center gap-4 hover:border-amber-500 transition group/card"
      >
        <img
          :src="
            imageUrl(featuredProducts[0].imageUrl) ||
            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=250&q=80'
          "
          :alt="featuredProducts[0].productName"
          class="w-24 h-24 rounded-2xl object-cover border border-[#E8D9C9] shrink-0 group-hover/card:scale-105 transition duration-300"
        />
        <div class="space-y-1 min-w-0">
          <span class="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
            สินค้าจำนวนจำกัด
          </span>
          <h4 class="font-black text-xs sm:text-sm text-[#332820] group-hover/card:text-amber-700 transition truncate">
            {{ featuredProducts[0].productName }}
          </h4>
          <p class="text-[11px] text-[#786B62] truncate">
            {{ featuredProducts[0].description || 'สินค้าชุมชนการันตีคุณภาพ' }}
          </p>
          <div class="flex items-baseline gap-2 pt-0.5">
            <span class="font-black text-amber-700 text-sm sm:text-base">
              {{ formatPrice(featuredProducts[0].price) }}
            </span>
            <span class="text-[10px] text-[#786B62] line-through font-semibold">
              {{ formatPrice(featuredProducts[0].price * 1.2) }}
            </span>
          </div>
        </div>
      </RouterLink>

      <!-- Product 2 (Real Product) -->
      <RouterLink
        v-if="featuredProducts[1]"
        :to="`/products/${featuredProducts[1].productId}`"
        class="flex-1 rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-4 shadow-xs flex items-center gap-4 hover:border-amber-500 transition group/card"
      >
        <img
          :src="
            imageUrl(featuredProducts[1].imageUrl) ||
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=250&q=80'
          "
          :alt="featuredProducts[1].productName"
          class="w-24 h-24 rounded-2xl object-cover border border-[#E8D9C9] shrink-0 group-hover/card:scale-105 transition duration-300"
        />
        <div class="space-y-1 min-w-0">
          <span class="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
            สินค้าขายดี
          </span>
          <h4 class="font-black text-xs sm:text-sm text-[#332820] group-hover/card:text-amber-700 transition truncate">
            {{ featuredProducts[1].productName }}
          </h4>
          <p class="text-[11px] text-[#786B62] truncate">
            {{ featuredProducts[1].description || 'สินค้าขายดีประจำร้าน' }}
          </p>
          <div class="flex items-baseline gap-2 pt-0.5">
            <span class="font-black text-amber-700 text-sm sm:text-base">
              {{ formatPrice(featuredProducts[1].price) }}
            </span>
            <span class="text-[10px] text-[#786B62] line-through font-semibold">
              {{ formatPrice(featuredProducts[1].price * 1.25) }}
            </span>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
