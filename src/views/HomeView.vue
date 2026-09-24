<script setup lang="ts">
import { youtubeThumbnail } from '@/shared/utils/youtube'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getContentCategories,
  getDistricts,
  getPublicContents,
  type ContentCategory,
  type District,
  type PublicContent,
} from '@/features/contents/public/api/contentApi'
import { getShops } from '@/features/shops/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import type { Product } from '@/features/shops/shared/types/product'
import { getActiveDealProducts, getPublicProducts } from '@/features/shops/api/productApi'
import { toUtcMilliseconds } from '@/shared/composables/useDealCountdown'
import { dealLabel, dealPrice } from '@/shared/utils/productDeal'
import heroCoverImage from '@/assets/รูปปก.png'

const router = useRouter()
const searchQuery = ref('')

const loading = ref(true)
const categories = ref<ContentCategory[]>([])
const recommendedContents = ref<PublicContent[]>([])
const communityStories = ref<PublicContent[]>([])
const districts = ref<District[]>([])
const shops = ref<Shop[]>([])
const products = ref<Product[]>([])
const activeDealProducts = ref<Product[]>([])
const scrollY = ref(0)
const currentTime = ref(Date.now())
let dealCountdownTimer: ReturnType<typeof window.setInterval> | undefined

const visibleDealProducts = computed(() => {
  return activeDealProducts.value.filter((product) => {
    const deal = product.activeDeal
    return (
      !!deal && deal.availableQuantity > 0 && toUtcMilliseconds(deal.endsAt) > currentTime.value
    )
  })
})

const quickTags = [
  '🔥 สะพานข้ามแม่น้ำแคว',
  'สังขละบุรี',
  'น้ำตกเอราวัณ',
  'ผ้าทอกะเหรี่ยง',
  'ทองผาภูมิ',
  'แพเปียก',
]

// Route-map stats shown under the hero, styled as three stations on one line.
const routeStats = [
  { value: '13', label: 'อำเภอบนเส้นทาง' },
  { value: '500+', label: 'ร้านค้าชุมชน' },
  { value: '1,000+', label: 'เรื่องราวความประทับใจ' },
]

// Value pillars shown as one editorial band
const pillars = [
  {
    icon: 'mdi-leaf',
    title: 'ภูมิปัญญา & วิถีชุมชน',
    desc: 'สัมผัสเสน่ห์เรื่องราวท้องถิ่นและประเพณีดั้งเดิมของชาวกาญจนบุรี',
  },
  {
    icon: 'mdi-store-check-outline',
    title: 'สินค้าตรงจากชาวบ้าน',
    desc: 'อุดหนุนผู้ผลิตและกลุ่มวิสาหกิจชุมชนโดยตรง ไม่ผ่านคนกลาง',
  },
  {
    icon: 'mdi-map-search-outline',
    title: 'พิกัดสถานที่อันซีน',
    desc: 'ค้นพบสถานที่ท่องเที่ยว พิกัดธรรมชาติ และร้านเด็ดรายอำเภอ',
  },
  {
    icon: 'mdi-shield-check-outline',
    title: 'การันตีคุณภาพ',
    desc: 'คัดสรรสินค้าและเรื่องราวทรงคุณค่าโดยทีมงานแพลตฟอร์ม',
  },
]

// Cycled dot colors for the "transit line" category strip.
const lineColors = ['#D96C2C', '#059669', '#D97706', '#2563EB', '#7C3AED']

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function resolveImageUrl(url?: string) {
  if (!url || !url.trim()) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

const defaultShopCovers = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
]

const defaultProductCovers = [
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
]

function getShopCover(shop: Shop, idx: number) {
  const resolved = resolveImageUrl(shop.coverImageUrl)
  if (resolved) return resolved
  return defaultShopCovers[idx % defaultShopCovers.length]
}

function getProductCover(prod: Product, idx: number) {
  const resolved = resolveImageUrl(prod.imageUrl)
  if (resolved) return resolved
  return defaultProductCovers[idx % defaultProductCovers.length]
}

function discountLabel(product: Product) {
  const deal = product.activeDeal

  if (!deal) {
    return ''
  }

  return deal.discountType === 'Percent'
    ? `ลด ${deal.discountValue}%`
    : `ลด ฿${Number(deal.discountValue).toLocaleString('th-TH')}`
}

function remainingDealTime(endsAt: string) {
  const seconds = Math.max(
    0,
    Math.floor((toUtcMilliseconds(endsAt) - currentTime.value) / 1000),
  )
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  const clock = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')

  return days > 0 ? `${days} วัน ${clock}` : clock
}

function handleSearch(queryText?: string) {
  const q = queryText ?? searchQuery.value
  if (q && q.trim()) {
    const cleanTag = q.replace(/^🔥\s*/, '').trim()
    router.push({ path: '/contents', query: { search: cleanTag } })
  } else {
    router.push('/contents')
  }
}



function handleScroll() {
  scrollY.value = window.scrollY
}

function scrollToContent() {
  window.scrollTo({
    top: window.innerHeight - 80,
    behavior: 'smooth',
  })
}

async function loadHomeData() {
  loading.value = true
  try {
    const [catRes, contentRes, distRes, shopRes] = await Promise.allSettled([
      getContentCategories(),
      getPublicContents({ page: 1, pageSize: 10 }),
      getDistricts(),
      getShops(),
    ])

    if (catRes.status === 'fulfilled') {
      categories.value = catRes.value || []
    }

    if (contentRes.status === 'fulfilled' && contentRes.value) {
      const items = contentRes.value.items || []
      recommendedContents.value = items.slice(0, 6)
      communityStories.value = items.slice(6, 10)
    }

    if (distRes.status === 'fulfilled') {
      districts.value = distRes.value || []
    }

    if (shopRes.status === 'fulfilled') {
      const val = shopRes.value
      const items = 'items' in val ? val.items : val
      shops.value = (items || []).slice(0, 4)
    }

    const [productResult, dealProductResult] = await Promise.allSettled([
      getPublicProducts(),
      getActiveDealProducts(12),
    ])

    products.value = productResult.status === 'fulfilled' ? productResult.value.slice(0, 4) : []
    activeDealProducts.value =
      dealProductResult.status === 'fulfilled' ? dealProductResult.value : []
  } catch {
    /* ignore */
  }
  loading.value = false
}

onMounted(() => {
  void loadHomeData()
  dealCountdownTimer = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  if (dealCountdownTimer) {
    window.clearInterval(dealCountdownTimer)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] font-body">
    <!-- 1. HERO — FULL-SCREEN IMMERSIVE BANNER WITH CLEAR PHOTO & PARALLAX MOTION -->
    <section
      class="relative bg-[#171412] text-[#FFF9F2] min-h-[90vh] lg:min-h-screen overflow-hidden flex flex-col justify-between border-b-4 border-[#D96C2C]"
    >
      <!-- Background Image (Clear, Vivid, High Contrast with Parallax Motion) -->
      <img
        :src="heroCoverImage"
        alt="สะพานข้ามแม่น้ำแคว กาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-90 brightness-105 contrast-105 pointer-events-none transition-transform duration-75 ease-out"
        :style="{
          transform: `translateY(${scrollY * 0.35}px) scale(${1.05 + scrollY * 0.0003})`,
        }"
      />

      <!-- Subtle Gradient Mask (Keeps text crisp while showing clear photo) -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/50 to-black/30 pointer-events-none"
      ></div>

      <!-- Hero Glass Content Frame with Parallax Floating Effect -->
      <div
        class="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28 pb-12 transition-all duration-75 ease-out"
        :style="{
          transform: `translateY(${scrollY * 0.15}px)`,
          opacity: Math.max(0, 1 - scrollY / 650),
        }"
      >
        <!-- Route line as the eyebrow -->
        <p
          class="font-body text-xs sm:text-sm font-bold text-amber-300 flex flex-wrap items-center gap-x-2 drop-shadow-md mb-2"
        >
          <span>กรุงเทพฯ</span>
          <span class="text-amber-400/60">—</span>
          <span>นครปฐม</span>
          <span class="text-amber-400/60">—</span>
          <span>ราชบุรี</span>
          <span class="text-amber-400/60">—</span>
          <span class="text-amber-400 font-black flex items-center gap-1">
            <i class="mdi mdi-map-marker text-amber-400"></i>
            กาญจนบุรี
          </span>
        </p>

        <h1
          class="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-[1.12] tracking-tight text-white drop-shadow-2xl max-w-4xl"
        >
          ค้นพบเรื่องราว วิถีชุมชน <br class="hidden sm:inline" />
          <span
            class="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent"
          >
            และภูมิปัญญาท้องถิ่นกาญจนบุรี
          </span>
        </h1>
        <p
          class="text-[#F7F0E6] max-w-2xl mt-4 text-base sm:text-lg font-semibold leading-relaxed drop-shadow-xl"
        >
          ศูนย์รวมเรื่องราวน่าสนใจ สถานที่อันซีน ร้านค้าชุมชน และของดีส่งตรงจากชาวบ้าน<br
            class="hidden sm:inline"
          />
          ร่วมสัมผัสเสน่ห์แท้จริงของเมืองกาญจน์ได้ที่นี่
        </p>

        <!-- Ticket card: destination stub + perforation + search stub -->
        <div class="relative mt-8 sm:mt-10 max-w-3xl">
          <div
            class="grid sm:grid-cols-[1fr_auto_0.85fr] bg-[#FFF9F2]/95 backdrop-blur-md text-[#332820] rounded-3xl border-2 border-[#E8D9C9] overflow-hidden shadow-2xl"
          >
            <div class="p-6 sm:p-7 space-y-4">
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                🔥 คำค้นยอดนิยม
              </p>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                <template v-for="(tag, i) in quickTags" :key="tag">
                  <button
                    type="button"
                    class="text-xs sm:text-sm font-black text-amber-800 underline decoration-[#E8D9C9] decoration-2 underline-offset-4 hover:decoration-[#D96C2C] hover:text-[#D96C2C] transition cursor-pointer"
                    @click="handleSearch(tag)"
                  >
                    {{ tag.replace(/^🔥\s*/, '') }}
                  </button>
                  <span v-if="i < quickTags.length - 1" class="text-[#786B62]/40">•</span>
                </template>
              </div>
            </div>

            <!-- Perforation with punch-hole notches (desktop only) -->
            <div class="relative hidden sm:block w-px">
              <div
                class="absolute inset-y-3 left-0 border-l-2 border-dashed border-[#E8D9C9]"
              ></div>
              <span
                class="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#171412]"
              ></span>
              <span
                class="absolute -bottom-3 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#171412]"
              ></span>
            </div>
            <div class="border-t-2 border-dashed border-[#E8D9C9] sm:hidden mx-6"></div>

            <form
              @submit.prevent="handleSearch()"
              class="p-6 sm:p-7 bg-[#F5E6D3] flex flex-col gap-3 justify-center"
            >
              <label class="text-xs font-black text-[#786B62]" for="home-search">ค้นหาข้อมูล</label>
              <div
                class="flex items-center gap-2 bg-[#FFF9F2] rounded-2xl px-3.5 py-2.5 border-2 border-[#E8D9C9]"
              >
                <i class="mdi mdi-magnify text-xl text-[#D96C2C] shrink-0"></i>
                <input
                  id="home-search"
                  v-model="searchQuery"
                  type="text"
                  placeholder="สถานที่ เรื่องราว อาหาร ร้านค้า..."
                  class="w-full bg-transparent text-xs sm:text-sm font-bold text-[#332820] focus:outline-none placeholder:text-[#786B62]"
                />
              </div>
              <button
                type="submit"
                class="rounded-xl bg-gradient-to-r from-[#D96C2C] to-[#BF5720] hover:from-[#BF5720] hover:to-[#a84614] text-white font-black text-xs sm:text-sm py-3 transition cursor-pointer shadow-md border border-[#D96C2C]/50 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <i class="mdi mdi-compass-outline text-base text-white"></i>
                <span>ออกเดินทางค้นหา</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Route-map stats & Interactive Scroll Indicator -->
      <div class="relative z-10 border-t border-white/15 bg-black/60 backdrop-blur-xl py-6 sm:py-8">
        <div class="mx-auto max-w-3xl px-4">
          <div class="relative flex items-center justify-between">
            <div class="absolute left-6 right-6 top-2 h-0.5 bg-amber-500/40"></div>
            <div
              v-for="stat in routeStats"
              :key="stat.label"
              class="relative z-10 flex flex-col items-center gap-1.5 bg-[#171412] px-4 text-center"
            >
              <span
                class="h-4 w-4 rounded-full bg-amber-400 ring-4 ring-[#171412] shadow-sm"
              ></span>
              <span class="font-display text-2xl sm:text-3xl font-black text-amber-300">{{
                stat.value
              }}</span>
              <span class="text-xs text-[#E8D9C9] font-bold max-w-[8rem]">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Scroll Indicator Button (Bouncing Arrow with Smooth Scroll) -->
        <button
          type="button"
          class="mt-4 mx-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-amber-300 border border-white/20 hover:border-amber-400 backdrop-blur-md transition duration-300 cursor-pointer group shadow-lg"
          @click="scrollToContent"
        >
          <span
            class="text-xs font-black tracking-wider uppercase text-amber-200 group-hover:text-amber-300"
          >
            เลื่อนเพื่อสำรวจ
          </span>
          <i
            class="mdi mdi-chevron-down text-lg text-amber-400 group-hover:translate-y-0.5 transition animate-bounce"
          ></i>
        </button>
      </div>
    </section>

    <!-- 2. CATEGORIES — TRANSIT LINE STRIP -->
    <section v-if="categories.length" class="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 -mt-6">
      <div
        class="rounded-2xl bg-[#FFF9F2] border-2 border-[#E8D9C9] shadow-xl px-5 sm:px-7 py-3.5 flex items-center gap-5 overflow-x-auto scrollbar-none"
      >
        <span class="text-xs font-black text-[#786B62] shrink-0 flex items-center gap-1">
          <i class="mdi mdi-routes text-amber-700 text-sm"></i>
          สายการท่องเที่ยว
        </span>
        <RouterLink
          v-for="(cat, i) in categories"
          :key="cat.contentCategoryId"
          :to="{ path: '/contents', query: { categoryId: String(cat.contentCategoryId) } }"
          class="shrink-0 flex items-center gap-2 group cursor-pointer"
        >
          <span
            class="h-2.5 w-2.5 rounded-full shrink-0"
            :style="{ background: lineColors[i % lineColors.length] }"
          ></span>
          <span
            class="text-xs sm:text-sm font-black text-[#332820] group-hover:text-[#D96C2C] whitespace-nowrap transition"
          >
            {{ cat.categoryName }}
          </span>
        </RouterLink>
        <RouterLink
          to="/contents"
          class="ml-auto shrink-0 text-xs font-black text-[#D96C2C] hover:underline whitespace-nowrap flex items-center gap-0.5"
        >
          <span>ดูทั้งหมด</span>
          <i class="mdi mdi-chevron-right text-base"></i>
        </RouterLink>
      </div>
    </section>

    <!-- 3. VALUE PILLARS — EDITORIAL BAND -->
    <section class="bg-[#171412] text-[#FFF9F2] border-y-2 border-amber-600/40 my-14 shadow-xl">
      <div
        class="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
      >
        <div
          v-for="pillar in pillars"
          :key="pillar.title"
          class="flex items-start gap-4 py-6 sm:py-0 sm:px-6 first:sm:pl-0"
        >
          <i :class="`mdi ${pillar.icon}`" class="text-2xl text-amber-400 shrink-0 mt-0.5"></i>
          <div>
            <h3 class="font-display font-black text-base sm:text-lg text-white">
              {{ pillar.title }}
            </h3>
            <p class="text-xs text-[#E8D9C9] font-medium mt-1.5 leading-relaxed">
              {{ pillar.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <!-- 4. ACTIVE DEALS -->
      <section v-if="visibleDealProducts.length">
        <div
          class="flex flex-col gap-3 border-b-2 border-rose-200 pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md"
            >
              <i class="mdi mdi-lightning-bolt text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="font-display text-2xl font-black text-[#332820] sm:text-3xl">
                โปรโมชันพิเศษ
              </h2>
              <p class="mt-0.5 text-xs font-semibold text-[#786B62] sm:text-sm">
                ราคาพิเศษมีเวลาจำกัด แต่ละสินค้ามีเวลาสิ้นสุดไม่เท่ากัน
              </p>
            </div>
          </div>
          <RouterLink
            to="/shops"
            class="flex shrink-0 items-center gap-1 text-xs font-black text-rose-700 hover:underline sm:text-sm"
          >
            <span>ดูสินค้าเพิ่มเติม</span>
            <i class="mdi mdi-arrow-right text-base"></i>
          </RouterLink>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <RouterLink
            v-for="(product, index) in visibleDealProducts"
            :key="product.productId"
            :to="`/products/${product.productId}`"
            class="group flex flex-col overflow-hidden rounded-3xl border-2 border-rose-200 bg-[#FFF9F2] p-3 shadow-md transition duration-300 hover:-translate-y-1 hover:border-rose-500 hover:shadow-xl"
          >
            <div class="relative mb-3 aspect-4/3 overflow-hidden rounded-2xl bg-[#171412]">
              <img
                :src="getProductCover(product, index)"
                :alt="product.productName"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div class="absolute left-2 top-2 flex flex-col gap-1.5">
                <span
                  class="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm"
                >
                  <i class="mdi mdi-lightning-bolt-outline mr-0.5"></i>
                  {{
                    dealLabel(product)
                  }}
                </span>
                <span
                  class="w-fit rounded-full bg-[#332820]/85 px-2.5 py-1 text-[10px] font-black text-white"
                >
                  {{ discountLabel(product) }}
                </span>
              </div>
            </div>

            <div class="flex flex-1 flex-col">
              <p class="line-clamp-1 text-[11px] font-bold text-[#786B62]">
                {{ product.shopName || 'ร้านค้าชุมชน' }}
              </p>
              <h3
                class="mt-1 line-clamp-2 text-sm font-black leading-snug text-[#332820] transition group-hover:text-rose-700 sm:text-base"
              >
                {{ product.productName }}
              </h3>

              <div class="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span class="text-base font-black text-rose-700 sm:text-lg">
                  ฿{{
                    Number(dealPrice(product)).toLocaleString('th-TH', { maximumFractionDigits: 2 })
                  }}
                </span>
                <span class="text-xs font-semibold text-[#786B62] line-through">
                  ฿{{ Number(product.price).toLocaleString('th-TH') }}
                </span>
              </div>

              <div
                class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-rose-800"
              >
                <div class="flex items-center justify-between gap-2 text-[11px] font-black">
                  <span class="flex items-center gap-1"
                    ><i class="mdi mdi-clock-outline"></i>เหลือเวลา</span
                  >
                  <span class="tabular-nums">{{
                    remainingDealTime(product.activeDeal!.endsAt)
                  }}</span>
                </div>
                <p class="mt-1 text-[10px] font-bold text-rose-700">
                  เหลือ {{ product.activeDeal?.availableQuantity }} สิทธิ์
                </p>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 5. RECOMMENDED STORIES -->
      <section v-if="recommendedContents.length || loading">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#E8D9C9] pb-4 mb-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs font-bold"
            >
              <i class="mdi mdi-book-open-page-variant-outline text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="font-display text-2xl sm:text-3xl font-black text-[#332820]">
                เรื่องราวและคอนเทนต์แนะนำ
              </h2>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-0.5">
                รวมเรื่องน่าสนใจ สถานที่ท่องเที่ยว และภูมิปัญญากาญจนบุรี
              </p>
            </div>
          </div>
          <RouterLink
            to="/contents"
            class="text-xs sm:text-sm font-black text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ดูเรื่องราวทั้งหมด</span>
            <i class="mdi mdi-arrow-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-3xl h-64 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div
          v-else-if="recommendedContents.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <RouterLink
            v-for="item in recommendedContents.slice(0, 6)"
            :key="item.contentId"
            :to="`/contents/${item.contentId}`"
            class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-emerald-600 hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="relative aspect-16/10 overflow-hidden bg-[#171412]">
                <img
                  v-if="youtubeThumbnail(item.youtubeUrl)"
                  :src="youtubeThumbnail(item.youtubeUrl)"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 via-teal-900 to-[#171412] text-white"
                >
                  <i class="mdi mdi-compass-rose text-5xl opacity-40"></i>
                </div>

                <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span
                    class="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white shadow-md"
                  >
                    {{ item.contentCategoryName || 'เรื่องราวชุมชน' }}
                  </span>
                </div>
              </div>

              <div class="p-4 sm:p-5 space-y-2">
                <h3
                  class="font-display font-black text-[#332820] text-base sm:text-lg group-hover:text-emerald-700 transition line-clamp-2 leading-snug"
                >
                  {{ item.title }}
                </h3>
                <p
                  class="text-xs sm:text-sm text-[#786B62] line-clamp-2 font-medium leading-relaxed"
                >
                  {{ item.summary || 'เรื่องราวและภูมิปัญญาอันทรงคุณค่าจากจังหวัดกาญจนบุรี' }}
                </p>
              </div>
            </div>

            <div
              class="px-4 sm:px-5 pb-4 pt-3 flex items-center justify-between text-xs sm:text-sm text-[#786B62] border-t border-[#E8D9C9] font-bold"
            >
              <span class="flex items-center gap-1 text-[#332820]">
                <i class="mdi mdi-map-marker text-emerald-700 text-base"></i>
                {{ item.districtName || 'กาญจนบุรี' }}
              </span>
              <span
                class="text-emerald-700 font-black flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                <span>อ่านเรื่องราว</span>
                <i class="mdi mdi-arrow-right text-base"></i>
              </span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 5. DISTRICTS — HORIZONTAL ROUTE MAP -->
      <section v-if="districts.length">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#E8D9C9] pb-4 mb-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-xs font-bold"
            >
              <i class="mdi mdi-map-marker-radius-outline text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="font-display text-2xl sm:text-3xl font-black text-[#332820]">
                สำรวจตามอำเภอและพื้นที่
              </h2>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-0.5">
                เลือกท่องเที่ยวและค้นหาเรื่องราวรายอำเภอทั่วกาญจนบุรี
              </p>
            </div>
          </div>
          <RouterLink
            to="/contents"
            class="text-xs sm:text-sm font-black text-amber-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ดูพื้นที่ทั้งหมด</span>
            <i class="mdi mdi-arrow-right text-base"></i>
          </RouterLink>
        </div>

        <div class="overflow-x-auto scrollbar-none py-2">
          <div
            class="relative flex w-full min-w-[720px] md:min-w-0 justify-between items-center px-4 py-2"
            style="height: 7.5rem"
          >
            <div
              class="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#E8D9C9] rounded-full"
            ></div>
            <RouterLink
              v-for="(dist, idx) in districts"
              :key="dist.districtId"
              :to="{ path: '/contents', query: { districtId: String(dist.districtId) } }"
              class="group relative flex-1 shrink-0 md:shrink h-full cursor-pointer"
            >
              <span
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-700 ring-4 ring-[#F7F0E6] group-hover:bg-[#D96C2C] group-hover:scale-125 transition z-10 shadow-xs"
              ></span>
              <div
                class="absolute left-1/2 -translate-x-1/2 w-full text-center px-0.5"
                :class="idx % 2 === 0 ? 'top-1' : 'bottom-1'"
              >
                <p
                  class="text-xs font-black text-[#332820] group-hover:text-[#D96C2C] transition leading-tight break-words"
                >
                  {{ dist.districtName }}
                </p>
                <span
                  class="text-[10px] text-[#786B62] font-semibold block mt-0.5 whitespace-nowrap"
                  >จ.กาญจนบุรี</span
                >
              </div>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- 6. SHOPS -->
      <section v-if="shops.length || loading">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#E8D9C9] pb-4 mb-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs font-bold"
            >
              <i class="mdi mdi-store-outline text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="font-display text-2xl sm:text-3xl font-black text-[#332820]">
                ร้านค้าชุมชนแนะนำ
              </h2>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-0.5">
                อุดหนุนสินค้าท้องถิ่น ส่งตรงจากชาวบ้านและเกษตรกรกาญจนบุรี
              </p>
            </div>
          </div>
          <RouterLink
            to="/shops"
            class="text-xs sm:text-sm font-black text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ดูร้านค้าทั้งหมด</span>
            <i class="mdi mdi-arrow-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-3xl h-52 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div v-else-if="shops.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <RouterLink
            v-for="(shop, idx) in shops"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-xl hover:border-amber-500 hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="relative aspect-4/3 overflow-hidden bg-[#171412]">
                <img
                  :src="getShopCover(shop, idx)"
                  :alt="shop.shopName"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                />
                <span
                  class="absolute top-2.5 left-2.5 px-3 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white shadow-md"
                >
                  ร้านค้าผ่านการรับรอง
                </span>
              </div>

              <div class="p-4 space-y-1.5">
                <h3
                  class="font-display font-black text-[#332820] text-base sm:text-lg group-hover:text-amber-800 transition line-clamp-1"
                >
                  {{ shop.shopName }}
                </h3>
                <p class="text-xs sm:text-sm text-[#786B62] font-semibold flex items-center gap-1">
                  <i class="mdi mdi-map-marker text-emerald-700 text-base"></i>
                  <span>อ.{{ shop.districtName || 'สังขละบุรี' }} จ.กาญจนบุรี</span>
                </p>
              </div>
            </div>

            <div class="p-4 pt-0">
              <span
                class="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm transition border border-amber-600 shadow-xs cursor-pointer"
              >
                <i class="mdi mdi-store-check-outline text-base text-white"></i>
                <span class="text-white font-black">เข้าชมร้านค้า</span>
              </span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 7. PRODUCTS — LUGGAGE-TAG PRICE BADGE -->
      <section v-if="products.length || loading">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#E8D9C9] pb-4 mb-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-xs font-bold"
            >
              <i class="mdi mdi-package-variant-closed text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="font-display text-2xl sm:text-3xl font-black text-[#332820]">
                สินค้าขึ้นชื่อแนะนำ
              </h2>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-0.5">
                ของฝาก หัตถกรรม ผลิตภัณฑ์เกษตร และของดีเมืองกาญจน์
              </p>
            </div>
          </div>
          <RouterLink
            to="/shops"
            class="text-xs sm:text-sm font-black text-amber-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ดูสินค้าทั้งหมด</span>
            <i class="mdi mdi-arrow-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-3xl h-52 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div
          v-else-if="products.length"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          <RouterLink
            v-for="(prod, idx) in products"
            :key="prod.productId"
            :to="`/products/${prod.productId}`"
            class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-3.5 shadow-md hover:shadow-xl hover:border-amber-500 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#171412] mb-3">
                <img
                  :src="getProductCover(prod, idx)"
                  :alt="prod.productName"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                />
                <span
                  class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white shadow-md"
                >
                  พร้อมส่ง
                </span>
              </div>

              <h3
                class="font-display font-black text-[#332820] text-sm sm:text-base group-hover:text-amber-800 transition line-clamp-2 leading-snug"
              >
                {{ prod.productName }}
              </h3>

              <div class="flex items-baseline gap-2 mt-2">
                <span class="font-black text-amber-700 text-base sm:text-lg">
                  ฿ {{ Number(prod.price).toLocaleString('th-TH') }}
                </span>
                <span class="text-xs text-[#786B62] line-through font-semibold">
                  ฿ {{ (Number(prod.price) * 1.25).toLocaleString('th-TH') }}
                </span>
              </div>
            </div>

            <div class="mt-3 pt-2">
              <span
                class="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm transition border border-amber-600 shadow-xs cursor-pointer"
              >
                <i class="mdi mdi-cart-plus text-base text-white"></i>
                <span class="text-white font-black">สั่งซื้อสินค้า</span>
              </span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 8. CTA — TWO TICKET STUBS SIDE BY SIDE (WITH APPS BRAND COLORS) -->
      <section class="relative rounded-3xl border-2 border-[#E8D9C9] overflow-hidden shadow-2xl">
        <div class="grid sm:grid-cols-2">
          <div
            class="relative bg-gradient-to-br from-[#171412] to-[#2d1f14] text-white p-8 sm:p-10 space-y-4"
          >
            <span
              class="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 inline-block"
            >
              สำหรับผู้ประกอบการ
            </span>
            <h2 class="font-display text-2xl sm:text-3xl font-black leading-tight text-white">
              เริ่มต้นเปิดร้านค้าชุมชนของคุณ
            </h2>
            <p class="text-xs sm:text-sm text-[#E8D9C9] font-medium leading-relaxed">
              เพิ่มโอกาสสร้างรายได้สู่ชุมชน นำเสนอสินค้าโอทอปและสินค้าเกษตรให้คนทั่วประเทศเห็น
            </p>
            <RouterLink
              to="/shops"
              class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D96C2C] to-[#BF5720] hover:from-[#BF5720] hover:to-[#a84614] text-white font-black text-xs sm:text-sm px-6 py-3 transition shadow-md border border-[#D96C2C] cursor-pointer"
            >
              <span>เริ่มต้นเปิดร้านค้า</span>
              <i class="mdi mdi-arrow-right text-base"></i>
            </RouterLink>
          </div>

          <!-- Perforation between the two stubs -->
          <div
            class="hidden sm:block absolute inset-y-4 left-1/2 border-l-2 border-dashed border-white/20 z-10"
          ></div>
          <span
            class="hidden sm:block absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-[#F7F0E6] border-2 border-[#E8D9C9] z-20"
          ></span>
          <span
            class="hidden sm:block absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-[#F7F0E6] border-2 border-[#E8D9C9] z-20"
          ></span>

          <div
            class="relative bg-gradient-to-br from-[#0d2821] to-[#171412] text-white p-8 sm:p-10 space-y-4"
          >
            <span
              class="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30 inline-block"
            >
              สำหรับนักเล่าเรื่อง
            </span>
            <h2 class="font-display text-2xl sm:text-3xl font-black leading-tight text-white">
              ร่วมแบ่งปันเรื่องราวเมืองกาญจน์
            </h2>
            <p class="text-xs sm:text-sm text-[#E8D9C9] font-medium leading-relaxed">
              ถ่ายทอดภูมิปัญญาท้องถิ่นและวิถีชุมชน เพื่อส่งต่อคุณค่าให้ผู้คนทั่วประเทศ
            </p>
            <RouterLink
              to="/contents"
              class="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-6 py-3 transition shadow-md border border-emerald-600 cursor-pointer"
            >
              <span>แบ่งปันเรื่องราว</span>
              <i class="mdi mdi-arrow-right text-base"></i>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;700;900&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');

.font-display {
  font-family: 'Noto Serif Thai', serif;
}
.font-body {
  font-family: 'IBM Plex Sans Thai', sans-serif;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>
