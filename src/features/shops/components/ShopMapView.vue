<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop } from '@/features/shops/shared/types/shop'

interface Props {
  shops: Shop[]
  loading?: boolean
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement | null>(null)
const selectedShopId = ref<string | null>(null)

let map: L.Map | null = null
let markerGroup: L.LayerGroup | null = null
let hasFittedBounds = false

const markersMap = new Map<string, L.Marker>()

// ขอบเขตจังหวัดกาญจนบุรี
const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
  [13.7, 98.0],
  [15.85, 100.0],
]

// API URL
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://localhost:7289'

const apiOrigin = rawApiUrl.startsWith('http')
  ? rawApiUrl.replace(/\/api$/, '')
  : 'https://localhost:7289'

/**
 * แปลง URL รูปภาพ
 * รองรับทั้ง
 * - https://...
 * - /uploads/shops/xxx.jpg
 */
function resolveImageUrl(url?: string) {
  if (!url?.trim()) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

// รูปสำรองกรณีร้านไม่มีรูป
const defaultCovers = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=400&q=70',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=70',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=70',
]

function getCover(shop: Shop, idx: number) {
  const image = resolveImageUrl(shop.coverImageUrl)

  if (image) {
    return image
  }

  return defaultCovers[idx % defaultCovers.length]
}

/**
 * สร้าง Leaflet Map
 */
function initMap() {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value, {
    zoomControl: false,
    minZoom: 9,
    maxZoom: 18,

    // ป้องกันลากออกนอกพื้นที่กาญจนบุรีมากเกินไป
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,

    // ลด animation บางส่วน
    zoomAnimation: true,
    fadeAnimation: false,
    markerZoomAnimation: false,
  }).setView([14.0227, 99.5328], 10)

  // ปุ่ม zoom ด้านขวาบน
  L.control
    .zoom({
      position: 'topright',
    })
    .addTo(map)

  // OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',

    maxZoom: 19,

    bounds: KANCHANABURI_BOUNDS,

    // ลดจำนวน tile ที่ browser ต้องเก็บ
    keepBuffer: 4,

    // ลดการ update tile ตอนกำลัง zoom
    updateWhenIdle: true,
    updateWhenZooming: false,
  }).addTo(map)

  // Layer สำหรับ Marker
  markerGroup = L.layerGroup().addTo(map)

  renderMarkers()
}

/**
 * สร้าง icon ของ Marker
 */
function createMarkerIcon(isSelected: boolean) {
  const bgClass = isSelected
    ? 'bg-[#D96C2C] ring-4 ring-[#F2A65A]/60 scale-125 z-50'
    : 'bg-[#332820] hover:bg-[#D96C2C] hover:scale-110'

  return L.divIcon({
    className: 'custom-shop-marker',

    html: `
      <div class="relative flex items-center justify-center">
        <div
          class="
            h-10
            w-10
            rounded-2xl
            ${bgClass}
            border-2
            border-white
            shadow-xl
            flex
            items-center
            justify-center
            text-white
            transition-all
            duration-200
            cursor-pointer
          "
        >
          <i class="mdi mdi-storefront text-lg text-white"></i>
        </div>

        <div
          class="
            absolute
            -bottom-1
            h-2
            w-2
            bg-[#D96C2C]
            rotate-45
            border-r
            border-b
            border-white
          "
        ></div>
      </div>
    `,

    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36],
  })
}

/**
 * สร้าง Popup HTML
 */
function createPopupHtml(shop: Shop, idx: number) {
  const coverUrl = getCover(shop, idx)

  return `
    <div
      class="
        p-1
        w-[240px]
        text-[#332820]
        space-y-2.5
        font-sans
      "
    >
      <div
        class="
          relative
          h-32
          w-full
          rounded-2xl
          overflow-hidden
          bg-[#171412]
        "
      >
        <img
          src="${coverUrl}"
          alt="${shop.shopName}"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover"
        />

        <div
          class="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#171412]/80
            via-transparent
            to-transparent
          "
        ></div>

        <span
          class="
            absolute
            top-2
            left-2
            px-2.5
            py-0.5
            rounded-full
            text-[10px]
            font-black
            bg-[#D96C2C]
            text-white
            shadow-md
          "
        >
          ${shop.categoryName || 'ร้านค้าชุมชน'}
        </span>
      </div>

      <div class="space-y-1">
        <h4
          class="
            font-black
            text-[#332820]
            text-sm
            leading-tight
            line-clamp-1
          "
        >
          ${shop.shopName}
        </h4>

        <p
          class="
            text-[11px]
            font-semibold
            text-[#786B62]
            flex
            items-center
            gap-1
          "
        >
          <i class="mdi mdi-map-marker text-[#D96C2C]"></i>

          อ.${shop.districtName || '-'}
          ${shop.subDistrictName ? `ต.${shop.subDistrictName}` : ''}
        </p>
      </div>

      <a
        href="/shops/${shop.shopId}"
        style="color: #ffffff !important;"
        class="
          flex
          items-center
          justify-center
          gap-1.5
          w-full
          py-2.5
          rounded-xl
          bg-[#D96C2C]
          hover:bg-[#BF5720]
          !text-white
          text-xs
          font-black
          transition-all
          shadow-md
          active:scale-95
          text-decoration-none
          border
          border-[#D96C2C]
        "
      >
        <span style="color:#ffffff !important;">
          เยี่ยมชมร้านค้า
        </span>

        <i
          class="
            mdi
            mdi-arrow-right
            text-xs
            text-white
          "
        ></i>
      </a>
    </div>
  `
}

/**
 * เปลี่ยน icon เฉพาะ marker เก่า + marker ใหม่
 *
 * ไม่ต้อง renderMarkers ใหม่ทั้งหมด
 */
function updateSelectedMarker(oldId: string | null, newId: string | null) {
  if (oldId && oldId !== newId) {
    const oldMarker = markersMap.get(oldId)

    oldMarker?.setIcon(createMarkerIcon(false))
  }

  if (newId) {
    const newMarker = markersMap.get(newId)

    newMarker?.setIcon(createMarkerIcon(true))
  }
}

/**
 * เลือกร้าน
 */
function selectShop(shop: Shop) {
  const oldId = selectedShopId.value

  selectedShopId.value = shop.shopId

  // เปลี่ยน icon เฉพาะ marker ที่เกี่ยวข้อง
  updateSelectedMarker(oldId, shop.shopId)

  if (shop.latitude == null || shop.longitude == null || !map) {
    return
  }

  /**
   * ถ้ากำลัง animation อยู่
   * ให้หยุดก่อน
   *
   * ช่วยแก้อาการกดหลายร้านเร็ว ๆ แล้ว map หน่วง
   */
  map.stop()

  /**
   * ใช้ flyTo แบบ animation สั้น
   *
   * เดิม 1.2 วินาที
   * ลดเหลือ 0.4
   */
  map.flyTo([shop.latitude, shop.longitude], 14, {
    duration: 0.4,
  })

  const marker = markersMap.get(shop.shopId)

  if (marker) {
    /**
     * รอให้ map เคลื่อนเล็กน้อย
     * แล้วค่อยเปิด Popup
     */
    window.setTimeout(() => {
      marker.openPopup()
    }, 150)
  }
}

/**
 * สร้าง Markers
 *
 * เรียกเฉพาะเมื่อข้อมูล shops เปลี่ยน
 */
function renderMarkers() {
  if (!map || !markerGroup) {
    return
  }

  // ล้าง marker เก่า
  markerGroup.clearLayers()

  markersMap.clear()

  /**
   * ใช้ Number.isFinite เพื่อป้องกัน
   * lat/lng = null
   * lat/lng = undefined
   * lat/lng = NaN
   */
  const validShops = props.shops.filter(
    (shop) => Number.isFinite(shop.latitude) && Number.isFinite(shop.longitude),
  )

  if (!validShops.length) {
    return
  }

  const bounds = L.latLngBounds([])

  validShops.forEach((shop, idx) => {
    const lat = shop.latitude!
    const lng = shop.longitude!

    bounds.extend([lat, lng])

    const isSelected = selectedShopId.value === shop.shopId

    const icon = createMarkerIcon(isSelected)

    const popupHtml = createPopupHtml(shop, idx)

    const marker = L.marker([lat, lng], {
      icon,

      /**
       * ลด redraw marker ตอน zoom
       */
      riseOnHover: true,
    })

    marker.bindPopup(popupHtml, {
      maxWidth: 270,
      minWidth: 260,
      className: 'custom-leaflet-popup',
    })

    marker.on('click', () => {
      const oldId = selectedShopId.value

      selectedShopId.value = shop.shopId

      updateSelectedMarker(oldId, shop.shopId)
    })

    markerGroup?.addLayer(marker)

    markersMap.set(shop.shopId, marker)
  })

  /**
   * fitBounds แค่ครั้งแรก
   *
   * ป้องกัน map กระโดดกลับ
   * ทุกครั้งที่ props เปลี่ยน
   */
  if (!hasFittedBounds && bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
      animate: false,
    })

    hasFittedBounds = true
  }
}

/**
 * ดูเฉพาะ reference ของ array
 *
 * ไม่ใช้ deep:true
 *
 * ถ้า parent fetch ใหม่แล้ว
 * shops.value = data
 *
 * watch นี้จะทำงานเอง
 */
watch(
  () => props.shops,
  () => {
    void nextTick(renderMarkers)
  },
)

/**
 * ตอน Component ถูก mount
 */
onMounted(() => {
  void nextTick(() => {
    initMap()
  })
})

/**
 * ตอนออกจากหน้า
 *
 * ต้อง remove map
 * เพื่อป้องกัน memory leak
 */
onBeforeUnmount(() => {
  markersMap.clear()

  markerGroup?.clearLayers()

  markerGroup = null

  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-lg overflow-hidden">
    <!-- ========================= -->
    <!-- HEADER -->
    <!-- ========================= -->

    <div
      class="flex items-center justify-between px-6 py-4 border-b-2 border-[#E8D9C9] bg-[#FFF9F2]"
    >
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold border border-[#D96C2C]"
        >
          <i class="mdi mdi-map-marker-radius text-xl"></i>
        </div>

        <div>
          <h3 class="font-black text-[#332820] text-base sm:text-lg">
            แผนที่ร้านค้าชุมชนกาญจนบุรี
          </h3>

          <p class="text-xs text-[#786B62] font-medium">
            คลิกเลือกหมุดบนแผนที่ หรือเลือกร้านค้าด้านข้าง
          </p>
        </div>
      </div>

      <!-- จำนวน Marker -->

      <span
        class="hidden sm:inline-flex text-xs font-black text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-3.5 py-1.5 rounded-full"
      >
        📍
        {{
          shops.filter((shop) => Number.isFinite(shop.latitude) && Number.isFinite(shop.longitude))
            .length
        }}
        หมุด
      </span>
    </div>

    <!-- ========================= -->
    <!-- CONTENT -->
    <!-- ========================= -->

    <div class="grid grid-cols-1 lg:grid-cols-12 h-[620px] relative">
      <!-- ========================= -->
      <!-- SIDEBAR -->
      <!-- ========================= -->

      <div
        class="lg:col-span-4 border-r-2 border-[#E8D9C9] bg-[#F7F0E6] overflow-y-auto p-4 space-y-3 h-full scrollbar-thin"
      >
        <div class="text-xs font-black text-[#D96C2C] uppercase tracking-wider px-1">
          ร้านค้าทั้งหมด ({{ shops.length }})
        </div>

        <!-- Loading -->

        <div v-if="loading" class="flex items-center justify-center py-12 text-[#786B62] text-sm">
          <i class="mdi mdi-loading mdi-spin mr-2"></i>

          กำลังโหลดร้านค้า...
        </div>

        <!-- Empty -->

        <div v-else-if="!shops.length" class="text-center py-12 text-[#786B62] text-xs font-medium">
          ไม่พบข้อมูลร้านค้าในระบบ
        </div>

        <!-- Shop Card -->

        <div
          v-for="(shop, idx) in shops"
          v-else
          :key="shop.shopId"
          class="h-[96px] w-full p-3 rounded-2xl bg-[#FFF9F2] border-2 transition-all duration-150 cursor-pointer flex items-center gap-3.5 group shrink-0"
          :class="
            selectedShopId === shop.shopId
              ? `
                border-[#D96C2C]
                ring-2
                ring-[#D96C2C]/20
                bg-[#D96C2C]/10
                shadow-md
              `
              : `
                border-[#E8D9C9]
                hover:border-[#D96C2C]
                hover:shadow-sm
              `
          "
          @click="selectShop(shop)"
        >
          <!-- รูป -->

          <div
            class="h-14 w-14 rounded-xl overflow-hidden bg-[#171412] shrink-0 border border-[#E8D9C9] relative"
          >
            <img
              :src="getCover(shop, idx)"
              :alt="shop.shopName"
              loading="lazy"
              decoding="async"
              width="56"
              height="56"
              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          <!-- รายละเอียด -->

          <div class="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
            <h4
              class="font-black text-[#332820] text-xs sm:text-sm truncate group-hover:text-[#D96C2C] transition-colors leading-tight"
            >
              {{ shop.shopName }}
            </h4>

            <p class="text-[11px] text-[#786B62] font-semibold truncate flex items-center gap-1">
              <i class="mdi mdi-map-marker text-[#D96C2C] shrink-0"></i>

              <span> อ.{{ shop.districtName || '-' }} </span>
            </p>

            <div class="pt-0.5">
              <span
                class="inline-block text-[10px] font-extrabold text-[#D96C2C] bg-[#D96C2C]/10 px-2 rounded-md border border-[#D96C2C]/20 truncate max-w-full"
              >
                {{ shop.categoryName || 'ร้านค้าชุมชน' }}
              </span>
            </div>
          </div>

          <!-- Arrow -->

          <div
            class="h-8 w-8 rounded-xl bg-white group-hover:bg-[#D96C2C] group-hover:text-white text-[#786B62] border border-[#E8D9C9] flex items-center justify-center shrink-0 transition-colors"
          >
            <i class="mdi mdi-chevron-right text-base"></i>
          </div>
        </div>
      </div>

      <!-- ========================= -->
      <!-- MAP -->
      <!-- ========================= -->

      <div class="lg:col-span-8 h-full relative">
        <div ref="mapContainer" class="h-full w-full z-0"></div>
      </div>
    </div>
  </div>
</template>

<style>
/* ========================= */
/* Leaflet Popup */
/* ========================= */

.leaflet-popup-content-wrapper {
  padding: 0 !important;

  border-radius: 1.25rem !important;

  overflow: hidden !important;

  border: 2px solid #e8d9c9 !important;

  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.15),
    0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}

.leaflet-popup-content {
  margin: 12px !important;

  width: 240px !important;
}

/* ========================= */
/* Popup close button */
/* ========================= */

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

  color: #f2a65a !important;
}

/* ========================= */
/* Leaflet */
/* ========================= */

.leaflet-container {
  font-family: inherit;
}

/*
 * ป้องกัน transition ของ Tailwind
 * ไปกระทบ Leaflet marker
 */
.leaflet-marker-icon {
  will-change: transform;
}

/*
 * ช่วย browser แยก render map
 */
.leaflet-map-pane {
  contain: layout style;
}

/* ========================= */
/* Scrollbar */
/* ========================= */

.scrollbar-thin {
  scrollbar-width: thin;

  scrollbar-color: #d96c2c #f7f0e6;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f7f0e6;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d96c2c;

  border-radius: 999px;
}
</style>
