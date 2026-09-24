<script setup lang="ts">
import type { Shop } from '@/features/shops/shared/types/shop'

interface Props {
  shops: Shop[]
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

const defaultCovers = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
]

function getCover(shop: Shop, idx: number) {
  const resolved = resolveImageUrl(shop.coverImageUrl)
  if (resolved) return resolved
  return defaultCovers[idx % defaultCovers.length]
}
</script>

<template>
  <section v-if="shops.length" class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="h-9 w-9 rounded-xl bg-[#D96C2C]/20 border border-[#D96C2C]/40 flex items-center justify-center text-[#D96C2C] font-black">
          <i class="mdi mdi-star text-lg"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-[#D96C2C] tracking-tight">ร้านค้าชุมชนแนะนำประจำเดือน</h2>
          <p class="text-xs text-[#786B62] font-medium">คัดสรรร้านค้า OTOP และจุดเช็กอินยอดนิยมในจังหวัดกาญจนบุรี</p>
        </div>
      </div>
    </div>

    <!-- Featured Grid (2 Columns on desktop) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RouterLink
        v-for="(shop, idx) in shops.slice(0, 2)"
        :key="shop.shopId"
        :to="`/shops/${shop.shopId}`"
        class="group relative rounded-3xl overflow-hidden bg-[#171412] border-2 border-[#E8D9C9] shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-end aspect-[16/9] sm:aspect-[16/8]"
      >
        <!-- Background Image -->
        <img
          :src="getCover(shop, idx)"
          :alt="shop.shopName"
          class="absolute inset-0 h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        <!-- Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/40 to-transparent"></div>

        <!-- Badges Top Bar -->
        <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span class="px-3.5 py-1 rounded-full text-xs font-black bg-[#D96C2C] text-white shadow-md flex items-center gap-1.5 backdrop-blur-md">
            <i class="mdi mdi-crown text-amber-200 text-sm"></i>
            ร้านค้า OTOP แนะนำ
          </span>

          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-[#171412]/80 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1">
            <i class="mdi mdi-map-marker text-[#F2A65A] text-xs"></i>
            อ.{{ shop.districtName || 'สังขละบุรี' }}
          </span>
        </div>

        <!-- Content Info Bottom -->
        <div class="relative z-10 p-6 space-y-2 text-white">
          <div class="flex items-center gap-2">
            <span v-if="shop.categoryName" class="text-xs font-bold text-[#F2A65A] bg-[#D96C2C]/30 border border-[#F2A65A]/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {{ shop.categoryName }}
            </span>
            <span class="text-xs font-bold text-[#F7F0E6] flex items-center gap-1">
              <i class="mdi mdi-star text-[#F2A65A]"></i>
              4.9 (48 รีวิว)
            </span>
          </div>

          <h3 class="text-xl sm:text-2xl font-black text-white group-hover:text-[#F2A65A] transition">
            {{ shop.shopName }}
          </h3>

          <p class="text-xs text-[#F7F0E6]/90 line-clamp-1 font-medium max-w-xl">
            {{ shop.description || 'สัมผัสบรรยากาศร้านค้าท้องถิ่นคุณภาพ พร้อมของฝากและบริการประทับใจ' }}
          </p>

          <div class="pt-2 flex items-center justify-between border-t border-white/20">
            <span class="text-xs font-bold text-[#F7F0E6] flex items-center gap-1">
              <i class="mdi mdi-check-decagram text-[#F2A65A]"></i>
              ยืนยันโดยจังหวัดกาญจนบุรี
            </span>

            <div class="px-4 py-2 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs flex items-center gap-1.5 transition shadow-md">
              <span class="text-white">สำรวจร้านนี้</span>
              <i class="mdi mdi-arrow-right text-white"></i>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
