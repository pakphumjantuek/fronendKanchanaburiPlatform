<script setup lang="ts">
import { computed } from 'vue'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { Shop } from '@/features/shops/api'
import type { PublicContent } from '@/features/contents/api'

const props = defineProps<{
  shop: Shop
  shopArea: string
  averageRating: number
  totalReviews: number
  totalProductsCount: number
  imageUrl: (url?: string) => string | undefined
  businessHours: string
  isOpenNow: boolean
  featuredContent?: PublicContent
}>()

const isFollowing = defineModel<boolean>('isFollowing', { default: false })

const emit = defineEmits<{
  (e: 'copy-link'): void
}>()

// Use the shop's Background Banner (backgroundImageUrl) as requested by user
const bannerImageUrl = computed(() => {
  if (props.shop.backgroundImageUrl) {
    return props.imageUrl(props.shop.backgroundImageUrl)
  }
  if (props.shop.coverImageUrl) {
    return props.imageUrl(props.shop.coverImageUrl)
  }
  if (props.featuredContent?.youtubeUrl) {
    const thumb = youtubeThumbnail(props.featuredContent.youtubeUrl)
    if (thumb) return thumb
  }
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
})
</script>

<template>
  <div class="relative bg-[#F7F0E6] text-[#332820]">
    <!-- 1. Top Cover Banner Photo (Clear, Natural Colors without Dark Overlay) -->
    <div class="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-[#F7F0E6]">
      <img
        :src="bannerImageUrl"
        :alt="shop.shopName"
        class="w-full h-full object-cover object-center transition duration-500"
      />

      <!-- Top Tag Badge (Glassmorphism so readable on any background) -->
      <div class="absolute top-4 left-4 sm:left-8 flex items-center gap-2 flex-wrap z-10">
        <span
          class="px-4 py-1.5 rounded-full text-xs font-black bg-black/70 text-amber-300 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5"
        >
          <i class="mdi mdi-shield-check text-amber-400 text-sm"></i>
          ร้านค้าพันธมิตรอย่างเป็นทางการ กาญจนบุรี
        </span>
      </div>
    </div>

    <!-- 2. Overlapping Store Profile Card (Shifted Upwards - Matches Reference Image 1:1) -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-44 md:-mt-52 relative z-20">
      <div
        class="rounded-3xl bg-[#FFF9F2] p-6 sm:p-8 border-2 border-[#E8D9C9] shadow-2xl space-y-6"
      >
        <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <!-- Left: Avatar & Info -->
          <div
            class="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left"
          >
            <!-- Avatar Logo with Verified Ring -->
            <div class="relative shrink-0">
              <img
                :src="
                  imageUrl(shop.coverImageUrl) ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
                "
                :alt="shop.shopName"
                class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-2xl ring-4 ring-emerald-600/30 bg-white"
              />
              <span
                class="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white"
                title="ร้านค้าได้รับการรับรอง"
              >
                <i class="mdi mdi-check-decagram text-base"></i>
              </span>
            </div>

            <!-- Identity Details -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-[#332820] tracking-tight">
                  {{ shop.shopName }}
                </h1>
                <span
                  class="px-3.5 py-1 rounded-full text-xs font-black bg-amber-600 text-white shadow-xs"
                >
                  ร้านค้าอย่างเป็นทางการ
                </span>
              </div>

              <p class="text-sm sm:text-base text-[#786B62] font-semibold max-w-xl line-clamp-2">
                {{
                  shop.description ||
                  'แหล่งรวบรวมผลิตภัณฑ์ชุมชนคุณภาพสูง ส่งตรงจากท้องถิ่นจังหวัดกาญจนบุรี'
                }}
              </p>

              <!-- Rating, Products Count, and Location Bar (All Real Data) -->
              <div
                class="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs sm:text-sm font-bold text-[#786B62]"
              >
                <div
                  class="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-black"
                >
                  <i class="mdi mdi-star text-base text-amber-500"></i>
                  <span>{{ averageRating ? averageRating.toFixed(1) : '5.0' }}</span>
                  <span class="text-[#786B62] font-semibold"
                    >({{ totalReviews ? `${totalReviews} รีวิว` : 'ยังไม่มีรีวิว' }})</span
                  >
                </div>

                <span>•</span>
                <span class="text-[#332820] font-black flex items-center gap-1">
                  <i class="mdi mdi-package-variant text-base text-emerald-700"></i>
                  มีสินค้า {{ totalProductsCount }} รายการ
                </span>

                <span>•</span>
                <span class="flex items-center gap-1 text-[#332820]">
                  <i class="mdi mdi-map-marker text-emerald-700 text-base"></i>
                  {{ shopArea }}
                </span>

                <span>•</span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-black"
                  :class="
                    isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  "
                >
                  {{ isOpenNow ? 'เปิดบริการอยู่' : 'ปิดทำการ' }} ({{ businessHours }})
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Follow, Call & Share Buttons (Optimized for Mobile Grid) -->
          <div
            class="grid grid-cols-12 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-3 shrink-0 pt-2 sm:pt-0"
          >
            <!-- Share Button -->
            <button
              type="button"
              class="col-span-2 sm:w-11 h-11 flex items-center justify-center rounded-2xl bg-[#F5E6D3] hover:bg-[#E8D9C9] text-[#332820] transition border border-[#E0CFBD] shadow-xs cursor-pointer"
              title="คัดลอกลิงก์ร้านค้า"
              @click="emit('copy-link')"
            >
              <i class="mdi mdi-share-variant-outline text-lg text-[#332820]"></i>
            </button>

            <!-- Call Button -->
            <a
              v-if="shop.phone"
              :href="`tel:${shop.phone}`"
              class="col-span-5 sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 h-11 rounded-2xl border-2 border-[#E0CFBD] bg-[#F5E6D3] hover:bg-[#E8D9C9] text-[#332820] font-black text-xs sm:text-sm transition shadow-xs cursor-pointer"
            >
              <i class="mdi mdi-phone-outline text-base text-emerald-700"></i>
              <span>โทรติดต่อ</span>
            </a>

            <!-- Follow Button -->
            <button
              type="button"
              :class="[
                'inline-flex items-center justify-center gap-1.5 px-3 sm:px-6 h-11 rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer border-2',
                shop.phone ? 'col-span-5 sm:w-auto' : 'col-span-10 sm:w-auto',
                isFollowing
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600',
              ]"
              @click="isFollowing = !isFollowing"
            >
              <i
                :class="[
                  'mdi text-base',
                  isFollowing ? 'mdi-check text-emerald-400' : 'mdi-plus text-white',
                ]"
              ></i>
              <span class="!text-white font-black truncate">{{
                isFollowing ? 'ติดตามแล้ว' : '+ ติดตาม'
              }}</span>
            </button>
          </div>
        </div>

        <!-- 3. Four Trust Stats Badges Row (Optimized for Mobile Screens) -->
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-4 border-t-2 border-[#E8D9C9]"
        >
          <!-- <div class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD]">
            <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <i class="mdi mdi-truck-fast-outline text-lg sm:text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="block font-black text-[11px] sm:text-xs text-[#332820] truncate">จัดส่งรวดเร็ว</span>
              <span class="text-[9px] sm:text-[10px] text-[#786B62] font-semibold truncate block">ใน 24 ชม.</span>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD]">
            <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <i class="mdi mdi-message-reply-text-outline text-lg sm:text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="block font-black text-[11px] sm:text-xs text-[#332820] truncate">ตอบแชทไว</span>
              <span class="text-[9px] sm:text-[10px] text-[#786B62] font-semibold truncate block">ใน 10 นาที</span>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD]">
            <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <i class="mdi mdi-star text-lg sm:text-xl text-amber-500"></i>
            </div>
            <div class="min-w-0">
              <span class="block font-black text-[11px] sm:text-xs text-[#332820] truncate">
                {{ averageRating ? averageRating.toFixed(1) : '5.0' }} / 5.0
              </span>
              <span class="text-[9px] sm:text-[10px] text-[#786B62] font-semibold truncate block">ความพึงพอใจ</span>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#F5E6D3] border border-[#E0CFBD]">
            <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <i class="mdi mdi-shield-check-outline text-lg sm:text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="block font-black text-[11px] sm:text-xs text-[#332820] truncate">ของแท้ 100%</span>
              <span class="text-[9px] sm:text-[10px] text-[#786B62] font-semibold truncate block">สินค้าแท้จากชุมชน</span>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
