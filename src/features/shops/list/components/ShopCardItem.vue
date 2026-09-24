<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product, Shop } from '@/features/shops/api'
import { dealLabel, dealPrice } from '@/shared/utils/productDeal'

const props = defineProps<{
  shop: Shop
  index: number
  products?: Product[]
}>()

const isFollowing = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const defaultImages = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=250&q=80',
]

const displayProducts = computed(() => {
  return props.products?.slice(0, 3) || []
})
</script>

<template>
  <div
    class="group bg-[#FFF9F2] rounded-2xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
  >
    <div>
      <!-- Cover Banner Photo Frame -->
      <div
        class="relative aspect-16/9 w-full overflow-hidden bg-slate-900 border-b border-[#E8D9C9]"
      >
        <img
          :src="
            imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
          "
          :alt="shop.shopName"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
        ></div>

        <!-- Top Left Status Badge (Distinct Contrasting Colors) -->
        <div class="absolute top-2.5 left-2.5">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs border border-white/20 text-white"
            :class="
              index % 3 === 0
                ? 'bg-emerald-700'
                : index % 3 === 1
                  ? 'bg-amber-600'
                  : 'bg-indigo-600'
            "
          >
            {{
              index % 3 === 0
                ? 'ร้านค้าผ่านการรับรอง'
                : index % 3 === 1
                  ? 'ร้านค้ายอดนิยม'
                  : 'ร้านค้าชุมชนเด่น'
            }}
          </span>
        </div>

        <!-- District Location Badge -->
        <div class="absolute top-2.5 right-2.5">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-black/65 text-amber-200 backdrop-blur-md border border-white/20"
          >
            📍 อ.{{ shop.districtName || 'กาญจนบุรี' }}
          </span>
        </div>
      </div>

      <!-- Shop Identity Body -->
      <div class="p-3.5 sm:p-5 space-y-3">
        <div class="flex items-center gap-3">
          <img
            :src="
              imageUrl(shop.coverImageUrl) ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
            "
            :alt="shop.shopName"
            class="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-emerald-500/20 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <h3
                class="font-black text-[#332820] text-base sm:text-lg group-hover:text-emerald-700 transition truncate"
              >
                {{ shop.shopName }}
              </h3>
              <i
                class="mdi mdi-check-decagram text-emerald-600 text-base shrink-0"
                title="ร้านค้าลงทะเบียนแล้ว"
              ></i>
            </div>
            <p class="text-xs text-[#786B62] font-semibold truncate mt-0.5">
              {{ shop.categoryName || 'ร้านค้าชุมชน' }} •
              {{ shop.subDistrictName ? `ต.${shop.subDistrictName}` : 'กาญจนบุรี' }}
            </p>
          </div>
        </div>

        <!-- Rating & Products Count Status Bar (Distinct Warm Container) -->
        <div
          class="flex items-center justify-between text-xs bg-[#F5E6D3] px-3 py-2 rounded-xl border border-[#E0CFBD] font-bold text-[#786B62]"
        >
          <span class="flex items-center gap-1 text-amber-700">
            <i class="mdi mdi-star text-amber-500"></i>
            <span class="font-black text-[#332820]">4.9</span>
            <span class="text-[10px] text-[#786B62] font-semibold">(เรตติ้งดี)</span>
          </span>
          <span class="text-emerald-800 text-xs font-black flex items-center gap-1">
            <i class="mdi mdi-package-variant text-emerald-700"></i> สินค้า
            {{ products?.length || 0 }} รายการ
          </span>
        </div>

        <!-- Mini Product Thumbnails Strip -->
        <div class="space-y-1.5 pt-0.5">
          <span class="text-[11px] font-bold text-[#786B62] block"> ตัวอย่างสินค้าแนะนำ: </span>
          <div v-if="displayProducts.length" class="grid grid-cols-3 gap-2">
            <RouterLink
              v-for="(prod, pIdx) in displayProducts"
              :key="prod.productId"
              :to="`/products/${prod.productId}`"
              class="rounded-xl overflow-hidden border border-[#E0CFBD] bg-white p-1 text-center space-y-1 hover:border-amber-500 transition group/prod shadow-2xs"
              :title="prod.productName"
            >
              <img
                :src="imageUrl(prod.imageUrl) || defaultImages[pIdx % defaultImages.length]"
                :alt="prod.productName"
                class="w-full aspect-square object-cover rounded-lg group-hover/prod:scale-105 transition"
              />
              <span v-if="prod.activeDeal" class="block rounded bg-rose-600 px-1 py-0.5 text-[9px] font-black text-white">{{ dealLabel(prod) }}</span>
              <span v-if="prod.activeDeal" class="block text-[10px] text-slate-400 line-through">฿{{ prod.price.toLocaleString() }}</span>
              <span class="block text-xs font-black text-amber-700 truncate">
                ฿{{ dealPrice(prod).toLocaleString() }}
              </span>
            </RouterLink>
          </div>

          <!-- Empty State if shop has no products yet -->
          <div
            v-else
            class="p-2.5 rounded-xl border border-dashed border-[#E0CFBD] bg-white/60 text-center text-xs font-semibold text-[#786B62]"
          >
            <span>สินค้ากำลังอัปเดตเร็วๆ นี้</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dual Action Buttons Footer -->
    <div class="p-3.5 sm:p-5 pt-0 grid grid-cols-12 gap-2">
      <RouterLink
        :to="`/shops/${shop.shopId}`"
        class="col-span-8 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-xs transition cursor-pointer"
      >
        <span class="!text-white font-black">เข้าชมหน้าร้าน</span>
        <i class="mdi mdi-arrow-right text-sm text-white"></i>
      </RouterLink>

      <button
        type="button"
        class="col-span-4 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border transition font-black text-xs sm:text-sm cursor-pointer active:scale-95"
        :class="
          isFollowing
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'bg-white border-[#E0CFBD] text-[#332820] hover:border-amber-500 hover:text-amber-600'
        "
        @click="isFollowing = !isFollowing"
      >
        <i :class="['mdi', isFollowing ? 'mdi-check text-emerald-400' : 'mdi-plus']"></i>
        <span>{{ isFollowing ? 'ติดตาม' : 'ติดตาม' }}</span>
      </button>
    </div>
  </div>
</template>
