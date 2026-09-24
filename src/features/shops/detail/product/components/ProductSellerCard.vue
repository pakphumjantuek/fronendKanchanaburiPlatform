<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop } from '@/features/shops/api'

const props = defineProps<{
  shop: Shop
  imageUrl: (url?: string) => string | undefined
}>()

const emit = defineEmits<{
  (e: 'open-directions'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance) return
  if (props.shop.latitude == null || props.shop.longitude == null) return

  const lat = props.shop.latitude
  const lng = props.shop.longitude

  const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
    [13.7, 98.0],
    [15.85, 100.0],
  ]

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
    minZoom: 9,
    maxZoom: 18,
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,
  }).setView([lat, lng], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
    bounds: KANCHANABURI_BOUNDS,
    keepBuffer: 6,
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-product-shop-marker',
    html: `<div class="flex items-center justify-center h-10 w-10 rounded-full bg-[#D96C2C] text-white font-bold shadow-2xl border-2 border-white"><i class="mdi mdi-storefront text-xl text-white"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<b class="text-[#332820] font-black">${props.shop.shopName || 'ร้านค้าชุมชน'}</b>`)
}

onMounted(() => {
  setTimeout(() => initMap(), 350)
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div class="space-y-6 lg:sticky lg:top-24">
    <!-- CARD 1: ร้านผู้จำหน่าย (SELLER CARD) -->
    <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-md space-y-4">
      <h3
        class="font-black text-[#332820] text-base border-b-2 border-[#E8D9C9] pb-3 flex items-center gap-2"
      >
        <i class="mdi mdi-storefront text-[#D96C2C] text-lg"></i>
        <span>ร้านผู้จำหน่าย</span>
      </h3>

      <div class="flex items-center gap-3">
        <img
          :src="
            imageUrl(shop.coverImageUrl) ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
          "
          :alt="shop.shopName"
          class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#D96C2C]/30"
        />
        <div>
          <h4 class="font-black text-[#332820] text-sm flex items-center gap-1">
            <span>{{ shop.shopName }}</span>
            <i class="mdi mdi-check-circle text-[#D96C2C] text-xs"></i>
          </h4>
          <p class="text-[11px] text-[#786B62] font-semibold">
            {{ shop.categoryName || 'หัตถกรรม' }} • {{ shop.districtName || 'อ.สังขละบุรี' }}
          </p>
          <div class="flex items-center gap-1 text-[10px] text-[#D96C2C] font-black mt-0.5">
            <i class="mdi mdi-star"></i>
            <span>4.8 (120 รีวิว)</span>
          </div>
        </div>
      </div>

      <dl class="space-y-2 text-xs font-extrabold text-[#332820] pt-1">
        <div class="flex items-center gap-2">
          <i class="mdi mdi-phone-outline text-[#D96C2C] text-base"></i>
          <span>{{ shop.phone || '082-345-6789' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="mdi mdi-clock-outline text-[#D96C2C] text-base"></i>
          <span>เปิด จันทร์ - อาทิตย์ 08:00 - 18:00 น.</span>
        </div>
        <div class="flex items-start gap-2">
          <i class="mdi mdi-map-marker-outline text-[#D96C2C] text-base shrink-0 mt-0.5"></i>
          <span>{{
            shop.address || 'บ้านวังก์กะ หมู่ 2 ต.หนองลู อ.สังขละบุรี จ.กาญจนบุรี'
          }}</span>
        </div>
      </dl>

      <RouterLink
        :to="`/shops/${shop.shopId}`"
        class="block w-full py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-center font-black text-xs text-white shadow-md transition border border-[#D96C2C]"
      >
        เข้าชมร้านค้า >
      </RouterLink>
    </div>

    <!-- CARD 2: ตำแหน่งร้าน (SHOP LOCATION MAP CARD) -->
    <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-md space-y-3">
      <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
        <i class="mdi mdi-map-marker text-[#D96C2C] text-lg"></i>
        <span>ตำแหน่งร้านค้า</span>
      </h3>

      <div
        v-if="shop.latitude != null && shop.longitude != null"
        class="rounded-2xl overflow-hidden border-2 border-[#E8D9C9] h-48"
      >
        <div ref="mapContainer" class="w-full h-full bg-[#F7F0E6]"></div>
      </div>
      <div
        v-else
        class="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6] text-xs text-[#786B62]"
      >
        ร้านค้ายังไม่ได้ระบุตำแหน่งบนแผนที่
      </div>

      <button
        v-if="shop.latitude != null && shop.longitude != null"
        type="button"
        class="w-full py-2.5 rounded-xl border-2 border-[#E8D9C9] text-center font-black text-xs text-[#332820] hover:bg-[#F7F0E6] transition flex items-center justify-center gap-1 cursor-pointer"
        @click="emit('open-directions')"
      >
        <i class="mdi mdi-map-marker-outline text-[#D96C2C]"></i>
        <span>ดูแผนที่ขนาดใหญ่</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
:deep(.custom-product-shop-marker) {
  background: transparent;
  border: none;
}
</style>
