<script setup lang="ts">
import type { Product, Shop } from '@/features/shops/api'

const props = defineProps<{
  shops: Shop[]
  productsByShopId?: Map<string, Product[]>
}>()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const defaultImages = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80',
]

function getShopProducts(shopId: string): Product[] {
  const prods = props.productsByShopId?.get(shopId)
  if (prods && prods.length > 0) {
    return prods.slice(0, 3)
  }
  return []
}
</script>

<template>
  <section v-if="shops.length" class="space-y-3">
    <!-- Header Title Bar -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-sm shrink-0"
        >
          <i class="mdi mdi-trophy-variant text-base text-amber-100"></i>
        </div>
        <div class="flex items-center gap-2">
          <h2 class="text-base sm:text-lg font-bold text-[#332820] tracking-tight">
            ร้านค้าแนะนำประจำสัปดาห์
          </h2>
          <span
            class="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300"
          >
            ⭐ 3 อันดับแรก
          </span>
        </div>
      </div>

      <span class="text-xs font-medium text-[#786B62] hidden md:block">
        คัดสรรร้านค้าคุณภาพยอดนิยมที่มีเรตติ้งสูงสุด
      </span>
    </div>

    <!-- 3 Compact Featured Store Cards Grid (Sleek height, bright & tempting to click) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <RouterLink
        v-for="(shop, idx) in shops.slice(0, 3)"
        :key="shop.shopId"
        :to="`/shops/${shop.shopId}`"
        class="group relative bg-[#FFF9F2] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md hover:shadow-2xl hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between"
      >
        <!-- Compact Cover Banner Header (Height h-24 sm:h-28) -->
        <div class="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            :src="
              imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
            "
            :alt="shop.shopName"
            class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          ></div>

          <!-- Ranking Top Left Badge (Warm Gold Contrast Accent) -->
          <span
            class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-md border border-amber-200 flex items-center gap-1"
          >
            <i class="mdi mdi-star text-slate-950"></i>
            อันดับ #{{ idx + 1 }}
          </span>

          <!-- Location Badge Top Right -->
          <span
            class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/65 text-amber-200 backdrop-blur-sm border border-white/20"
          >
            📍 อ.{{ shop.districtName || 'กาญจนบุรี' }}
          </span>
        </div>

        <!-- Compact Card Body -->
        <div class="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
          <div class="flex items-center gap-2.5">
            <img
              :src="
                imageUrl(shop.coverImageUrl) ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
              "
              :alt="shop.shopName"
              class="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm ring-1 ring-amber-500/30 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <h3
                  class="font-bold text-[#2C221E] text-sm sm:text-base group-hover:text-amber-700 transition truncate"
                >
                  {{ shop.shopName }}
                </h3>
                <i class="mdi mdi-check-decagram text-emerald-600 text-sm shrink-0"></i>
              </div>
              <p class="text-xs text-[#645248] font-medium truncate">
                {{ shop.categoryName || 'ร้านค้าชุมชน' }}
              </p>
            </div>
          </div>

          <!-- Rating & Products Quick Strip -->
          <div
            class="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-medium text-[#645248]"
          >
            <span class="flex items-center gap-1 text-amber-600">
              <i class="mdi mdi-star text-amber-500"></i>
              <span class="font-bold text-[#2C221E]">4.9</span>
              <span class="text-[10px] text-slate-400 font-normal">(ยอดนิยม)</span>
            </span>
            <span class="text-emerald-700 font-semibold text-xs">
              {{ productsByShopId?.get(shop.shopId)?.length || 0 }} สินค้า
            </span>
          </div>

          <!-- Tempting CTA Button Bar (Warm Amber Accent) -->
          <div
            class="w-full py-2 px-3 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>เข้าชมร้านค้าแนะนำ</span>
            <i
              class="mdi mdi-arrow-right text-xs group-hover:translate-x-1 transition-transform"
            ></i>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
