<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop } from '@/features/shops/api'

const props = defineProps<{
  shop: Shop
  hasShopLocation: boolean
}>()

const emit = defineEmits<{
  (e: 'open-directions'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance) return
  if (!props.hasShopLocation || props.shop.latitude == null || props.shop.longitude == null) return

  const lat = props.shop.latitude
  const lng = props.shop.longitude

  const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
    [13.7, 98.0],
    [15.85, 100.0],
  ]

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: true,
    minZoom: 9,
    maxZoom: 18,
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,
  }).setView([lat, lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
    bounds: KANCHANABURI_BOUNDS,
    keepBuffer: 6,
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-shop-detail-marker',
    html: `<div class="flex items-center justify-center h-11 w-11 rounded-full bg-emerald-700 text-white font-bold shadow-2xl border-2 border-white ring-4 ring-emerald-600/30"><i class="mdi mdi-storefront text-2xl text-white"></i></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<b class="text-[#332820] font-black">${props.shop.shopName}</b>`)
    .openPopup()
}

onMounted(() => {
  setTimeout(() => initMap(), 300)
})

watch(
  () => props.shop,
  () => {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }
    setTimeout(() => initMap(), 300)
  },
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
      <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
        <i class="mdi mdi-map-marker-radius-outline text-emerald-700 text-lg"></i>
        <span>ตำแหน่งและแผนที่</span>
      </h3>
    </div>

    <div
      v-if="hasShopLocation"
      class="rounded-2xl overflow-hidden border-2 border-[#E8D9C9] h-52 relative z-10"
    >
      <div ref="mapContainer" class="w-full h-full bg-[#F7F0E6]"></div>
    </div>

    <div
      v-else
      class="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6]/50 px-5 text-center text-xs text-[#786B62]"
    >
      ร้านค้ายังไม่ได้ระบุพิกัดบนแผนที่
    </div>

    <div class="flex items-center justify-between pt-1 text-xs">
      <span class="font-semibold text-[#786B62] flex items-center gap-1">
        <i class="mdi mdi-compass-outline text-emerald-700"></i>
        {{
          shop.latitude != null && shop.longitude != null
            ? `${shop.latitude.toFixed(4)}°, ${shop.longitude.toFixed(4)}°`
            : 'ยังไม่ระบุตำแหน่ง'
        }}
      </span>

      <button
        v-if="hasShopLocation"
        type="button"
        class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-600"
        @click="emit('open-directions')"
      >
        <i class="mdi mdi-navigation-variant text-white"></i>
        <span class="text-white">นำทาง Google Maps</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
:deep(.custom-shop-detail-marker) {
  background: transparent;
  border: none;
}
</style>
