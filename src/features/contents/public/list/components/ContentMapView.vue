<script setup lang="ts">
import { youtubeThumbnail } from '@/shared/utils/youtube'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PublicContent } from '../../api/contentApi'

interface Props {
  contents: PublicContent[]
  loading?: boolean
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement | null>(null)
const selectedContentId = ref<string | null>(null)
let map: L.Map | null = null
let markerGroup: L.LayerGroup | null = null
const markersMap = new Map<string, L.Marker>()

// Kanchanaburi Province Geographic Bounding Box
const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
  [13.70, 98.00], // South-West Boundary
  [15.85, 100.00], // North-East Boundary
]



function initMap() {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value, {
    zoomControl: false,
    minZoom: 9,
    maxZoom: 18,
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,
  }).setView([14.0227, 99.5328], 10)

  L.control.zoom({ position: 'topright' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    bounds: KANCHANABURI_BOUNDS,
    keepBuffer: 8,
    updateWhenIdle: false,
    updateWhenZooming: false,
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)
  renderMarkers()
}

function createMarkerIcon(isSelected: boolean) {
  const bgClass = isSelected
    ? 'bg-[#D96C2C] ring-4 ring-[#F2A65A]/60 scale-125 z-50'
    : 'bg-[#332820] hover:bg-[#D96C2C] hover:scale-110'

  return L.divIcon({
    className: 'custom-content-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="h-10 w-10 rounded-2xl ${bgClass} border-2 border-white shadow-xl flex items-center justify-center text-white transition-all duration-300 cursor-pointer">
          <i class="mdi mdi-play-circle text-lg text-white"></i>
        </div>
        <div class="absolute -bottom-1 h-2 w-2 bg-[#D96C2C] rotate-45 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36],
  })
}

function renderMarkers() {
  if (!map || !markerGroup) return
  markerGroup.clearLayers()
  markersMap.clear()

  const validContents = props.contents.filter((c) => c.latitude && c.longitude)
  const bounds = L.latLngBounds([])

  validContents.forEach((cnt) => {
    const lat = cnt.latitude!
    const lng = cnt.longitude!
    bounds.extend([lat, lng])

    const isSelected = selectedContentId.value === cnt.contentId
    const icon = createMarkerIcon(isSelected)
    const coverUrl = youtubeThumbnail(cnt.youtubeUrl)

    const popupHtml = `
      <div class="p-1 w-[240px] text-[#332820] space-y-2.5 font-sans">
        <div class="relative h-32 w-full rounded-2xl overflow-hidden bg-[#171412] shadow-xs">
          <img src="${coverUrl || 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=400&q=80'}" alt="${cnt.title}" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#171412]/80 via-transparent to-transparent"></div>
          <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D96C2C] text-white shadow-md">
            ${cnt.contentCategoryName || 'คอนเทนต์'}
          </span>
        </div>
        <div class="space-y-1">
          <h4 class="font-black text-[#332820] text-sm leading-tight line-clamp-1">${cnt.title}</h4>
          <p class="text-[11px] font-semibold text-[#786B62] flex items-center gap-1">
            <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
            อ.${cnt.districtName || 'สังขละบุรี'} ${cnt.subDistrictName ? 'ต.' + cnt.subDistrictName : ''}
          </p>
        </div>
        <a
          href="/contents/${cnt.contentId}"
          style="color: #ffffff !important;"
          class="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] !text-white text-xs font-black transition-all shadow-md active:scale-95 text-decoration-none border border-[#D96C2C]"
        >
          <span style="color: #ffffff !important;">ดูคอนเทนต์นี้</span>
          <i class="mdi mdi-arrow-right text-xs text-white"></i>
        </a>
      </div>
    `

    const marker = L.marker([lat, lng], { icon }).bindPopup(popupHtml, {
      maxWidth: 270,
      minWidth: 260,
      className: 'custom-leaflet-popup',
    })

    marker.on('click', () => {
      selectedContentId.value = cnt.contentId
    })

    if (markerGroup) {
      markerGroup.addLayer(marker)
      markersMap.set(cnt.contentId, marker)
    }
  })

  if (validContents.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
  }
}

function selectContent(cnt: PublicContent) {
  selectedContentId.value = cnt.contentId
  if (cnt.latitude && cnt.longitude && map) {
    map.flyTo([cnt.latitude, cnt.longitude], 14, { duration: 1.2 })
    const marker = markersMap.get(cnt.contentId)
    if (marker) {
      marker.openPopup()
    }
  }
}

watch(
  () => props.contents,
  () => {
    void nextTick(() => {
      renderMarkers()
    })
  },
  { deep: true },
)

onMounted(() => {
  void nextTick(() => {
    initMap()
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-lg overflow-hidden">
    <!-- MAP HEADER TOOLBAR -->
    <div class="flex items-center justify-between px-6 py-4 border-b-2 border-[#E8D9C9] bg-[#FFF9F2]">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-xs border border-[#D96C2C]">
          <i class="mdi mdi-map-marker-radius text-xl"></i>
        </div>
        <div>
          <h3 class="font-black text-[#332820] text-base sm:text-lg">แผนที่พิกัดคอนเทนต์ (เฉพาะกาญจนบุรี)</h3>
          <p class="text-xs text-[#786B62] font-medium">คลิกเลือกหมุดบนแผนที่ หรือเลือกรายการด้านข้างเพื่อดูเรื่องราว</p>
        </div>
      </div>
      <span class="text-xs font-black text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-3.5 py-1.5 rounded-full shadow-2xs">
        📍 {{ contents.filter((c) => c.latitude && c.longitude).length }} หมุดในจังหวัดกาญจนบุรี
      </span>
    </div>

    <!-- MAIN INTERACTIVE SPLIT CONTAINER -->
    <div class="grid grid-cols-1 lg:grid-cols-12 h-[620px] relative">
      <!-- SIDEBAR LIST (4 COLS) WITH EQUAL CARDS -->
      <div class="lg:col-span-4 border-r-2 border-[#E8D9C9] bg-[#F7F0E6] overflow-y-auto p-4 space-y-3 h-full scrollbar-thin">
        <div class="text-xs font-black text-[#D96C2C] uppercase tracking-wider px-1">
          คอนเทนต์ทั้งหมด ({{ contents.length }})
        </div>

        <div v-if="!contents.length" class="text-center py-12 text-[#786B62] text-xs font-medium">
          ไม่พบข้อมูลคอนเทนต์ในระบบ
        </div>

        <div
          v-for="cnt in contents"
          :key="cnt.contentId"
          class="h-[96px] w-full p-3 rounded-2xl bg-[#FFF9F2] border-2 transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3.5 group shrink-0"
          :class="
            selectedContentId === cnt.contentId
              ? 'border-[#D96C2C] ring-2 ring-[#D96C2C]/20 bg-[#D96C2C]/10 shadow-md'
              : 'border-[#E8D9C9] hover:border-[#D96C2C] hover:shadow-sm'
          "
          @click="selectContent(cnt)"
        >
          <!-- Thumbnail (Fixed 56x56) -->
          <div class="h-14 w-14 rounded-xl overflow-hidden bg-[#171412] shrink-0 border border-[#E8D9C9] relative">
            <img :src="youtubeThumbnail(cnt.youtubeUrl) || 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=400&q=80'" :alt="cnt.title" class="h-full w-full object-cover group-hover:scale-110 transition duration-300" />
          </div>

          <!-- Info (Flex 1) -->
          <div class="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
            <h4 class="font-black text-[#332820] text-xs sm:text-sm truncate group-hover:text-[#D96C2C] transition leading-tight">
              {{ cnt.title }}
            </h4>
            <p class="text-[11px] text-[#786B62] font-semibold truncate flex items-center gap-1">
              <i class="mdi mdi-map-marker text-[#D96C2C] shrink-0"></i>
              <span>อ.{{ cnt.districtName || 'สังขละบุรี' }}</span>
            </p>
            <div class="pt-0.5">
              <span
                class="inline-block text-[10px] font-extrabold text-[#D96C2C] bg-[#D96C2C]/10 px-2 py-0.2 rounded-md border border-[#D96C2C]/20 truncate max-w-full"
              >
                {{ cnt.contentCategoryName || 'เรื่องราว' }}
              </span>
            </div>
          </div>

          <!-- Action Arrow -->
          <div
            class="h-8 w-8 rounded-xl bg-white group-hover:bg-[#D96C2C] group-hover:text-white text-[#786B62] border border-[#E8D9C9] flex items-center justify-center shrink-0 transition"
          >
            <i class="mdi mdi-chevron-right text-base"></i>
          </div>
        </div>
      </div>

      <!-- MAP CONTAINER (8 COLS) -->
      <div class="lg:col-span-8 h-full relative">
        <div ref="mapContainer" class="h-full w-full z-0"></div>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom Leaflet Popup Overrides */
.leaflet-popup-content-wrapper {
  padding: 0 !important;
  border-radius: 1.25rem !important;
  overflow: hidden !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  border: 2px solid #E8D9C9 !important;
}
.leaflet-popup-content {
  margin: 12px !important;
  width: 240px !important;
}
.leaflet-container a.leaflet-popup-close-button {
  top: 8px !important;
  right: 8px !important;
  color: #ffffff !important;
  background: rgba(0, 0, 0, 0.4) !important;
  border-radius: 50% !important;
  width: 22px !important;
  height: 22px !important;
  line-height: 20px !important;
  text-align: center !important;
  font-size: 14px !important;
  backdrop-filter: blur(4px) !important;
}
.leaflet-container a.leaflet-popup-close-button:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  color: #F2A65A !important;
}
</style>
