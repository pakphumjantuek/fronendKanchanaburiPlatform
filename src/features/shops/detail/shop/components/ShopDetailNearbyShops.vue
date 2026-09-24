<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  nearbyShops: Shop[]
  getNearbyShopImage: (target: Shop) => string
  formatShopArea: (target: Shop) => string
}>()
</script>

<template>
  <section
    v-if="nearbyShops.length"
    class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-xs space-y-6"
  >
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-xs font-bold"
        >
          <i class="mdi mdi-store-marker-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-[#332820]">ร้านค้าใกล้เคียงในพื้นที่</h2>
          <p class="text-xs text-[#786B62]">
            ร้านค้าชุมชนอื่น ๆ ใน {{ shop.districtName ? `อ.${shop.districtName}` : 'กาญจนบุรี' }}
          </p>
        </div>
      </div>

      <RouterLink
        to="/shops"
        class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1"
      >
        <span>ดูร้านค้าทั้งหมด</span>
        <i class="mdi mdi-chevron-right text-base"></i>
      </RouterLink>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <RouterLink
        v-for="nb in nearbyShops"
        :key="nb.shopId"
        :to="`/shops/${nb.shopId}`"
        class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2.5">
            <img
              :src="getNearbyShopImage(nb)"
              :alt="nb.shopName"
              class="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>
          <span
            class="text-[9px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-2 py-0.5 rounded inline-block mb-1"
          >
            {{ nb.categoryName || 'ร้านค้า' }}
          </span>
          <h4
            class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
          >
            {{ nb.shopName }}
          </h4>
          <p class="text-[10px] text-[#786B62] mt-0.5 font-medium truncate">
            {{ formatShopArea(nb) }}
          </p>
        </div>

        <div
          class="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
        >
          <span>เข้าชมร้าน</span>
          <i class="mdi mdi-arrow-right"></i>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
