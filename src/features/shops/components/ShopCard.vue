<script setup lang="ts">
import type { Shop } from '@/features/shops/shared/types/shop'

interface Props {
  shop: Shop
  index: number
}

const props = defineProps<Props>()

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://localhost:7289'
const apiOrigin = rawApiUrl.startsWith('http')
  ? rawApiUrl.replace(/\/api$/, '')
  : 'https://localhost:7289'

function resolveImageUrl(url?: string) {
  if (!url || !url.trim()) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

const defaultCovers: string[] = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
]

const fallbackCover = 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80'

function getShopCover(): string {
  const resolved = resolveImageUrl(props.shop.coverImageUrl)
  if (resolved) return resolved
  return defaultCovers[props.index % defaultCovers.length] || fallbackCover
}
</script>

<template>
  <RouterLink
    :to="`/shops/${shop.shopId}`"
    class="group bg-[#FFF9F2] rounded-[2rem] overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-[#D96C2C] transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between relative"
  >
    <div>
      <!-- COVER PHOTO CONTAINER -->
      <div class="relative aspect-[16/10] w-full overflow-hidden bg-[#171412]">
        <img
          :src="getShopCover()"
          :alt="shop.shopName"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          @error="(e) => ((e.target as HTMLImageElement).src = fallbackCover)"
        />

        <!-- Smooth Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#171412]/85 via-[#171412]/20 to-transparent"></div>

        <!-- Featured Badge for Top Shops -->
        <div v-if="index < 3" class="absolute top-3.5 left-3.5">
          <span
            class="px-3 py-1 rounded-full text-xs font-black bg-[#D96C2C] text-white shadow-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-md"
          >
            <i class="mdi mdi-star text-[#F2A65A] text-sm"></i>
            ร้านค้าแนะนำ
          </span>
        </div>

        <!-- District Tag Badge -->
        <div class="absolute top-3.5 right-3.5">
          <span
            class="px-3.5 py-1 rounded-full text-xs font-black bg-[#171412]/90 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1"
          >
            <i class="mdi mdi-map-marker text-[#F2A65A] text-xs"></i>
            อ.{{ shop.districtName || 'กาญจนบุรี' }}
          </span>
        </div>

        <!-- Shop Avatar Overlapping Bottom Cover -->
        <div class="absolute -bottom-5 left-5 z-10 flex items-end gap-3">
          <div
            class="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] border-3 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl shrink-0 overflow-hidden group-hover:scale-105 transition-transform"
          >
            <i class="mdi mdi-storefront"></i>
          </div>
        </div>
      </div>

      <!-- CARD BODY CONTENT -->
      <div class="pt-7 px-6 pb-4 space-y-3">
        <!-- Category Pill & Status -->
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="shop.categoryName"
            class="inline-flex items-center gap-1 text-[11px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-3 py-1 rounded-full border border-[#D96C2C]/20"
          >
            <i class="mdi mdi-tag-outline text-xs text-[#D96C2C]"></i>
            {{ shop.categoryName }}
          </span>
          <span v-else class="inline-flex items-center gap-1 text-[11px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-3 py-1 rounded-full border border-[#D96C2C]/20">
            ร้านค้าชุมชน
          </span>

          <span class="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300">
            <span class="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            เปิดบริการ
          </span>
        </div>

        <!-- Shop Title -->
        <div class="flex items-center gap-1.5">
          <h3
            class="font-black text-[#332820] text-lg sm:text-xl group-hover:text-[#D96C2C] transition-colors leading-snug truncate"
          >
            {{ shop.shopName }}
          </h3>
          <i class="mdi mdi-check-decagram text-[#D96C2C] text-lg shrink-0" title="ร้านค้าได้รับการยืนยัน"></i>
        </div>

        <!-- Description -->
        <p class="text-xs text-[#786B62] line-clamp-2 leading-relaxed font-semibold">
          {{ shop.description || 'ร้านค้าและผู้ประกอบการชุมชนในจังหวัดกาญจนบุรี พร้อมให้บริการด้วยใจมิตรภาพ' }}
        </p>

        <!-- Location & Contact Stats Bar -->
        <div class="pt-2.5 flex items-center justify-between text-xs text-[#786B62] font-extrabold border-t border-[#E8D9C9]">
          <span class="flex items-center gap-1.5 text-[#332820]">
            <i class="mdi mdi-map-marker-outline text-[#D96C2C] text-base"></i>
            <span>{{ [shop.subDistrictName, shop.districtName].filter(Boolean).join(' ') || 'สังขละบุรี กาญจนบุรี' }}</span>
          </span>

          <span v-if="shop.phone" class="flex items-center gap-1 text-[#332820]">
            <i class="mdi mdi-phone text-[#D96C2C]"></i>
            {{ shop.phone }}
          </span>
        </div>
      </div>
    </div>

    <!-- CARD FOOTER CTA BUTTON (SOLID ORANGE WITH CRISP WHITE TEXT) -->
    <div class="px-6 pb-6 pt-1">
      <div
        class="w-full py-3.5 rounded-2xl bg-[#D96C2C] group-hover:bg-[#BF5720] text-white font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md group-hover:shadow-xl active:scale-95 border-2 border-[#D96C2C]"
      >
        <span class="!text-white font-black text-sm tracking-wide">เข้าชมร้านค้า</span>
        <i
          class="mdi mdi-arrow-right text-lg text-white transition-transform duration-300 group-hover:translate-x-1.5"
        ></i>
      </div>
    </div>
  </RouterLink>
</template>
