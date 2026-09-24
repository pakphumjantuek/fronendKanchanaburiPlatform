<script setup lang="ts">
import { youtubeThumbnail } from '@/shared/utils/youtube'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShop, type Shop } from '@/features/shops/api'
import {
  getContentCategories,
  getPublicContents,
  type ContentCategory,
  type PublicContent,
} from '@/features/contents/api'
import { push } from 'notivue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { formatDate } from '@/shared/utils/formatDate'

const route = useRoute()
const router = useRouter()

const shop = ref<Shop | null>(null)
const contents = ref<PublicContent[]>([])
const categories = ref<ContentCategory[]>([])
const loading = ref(true)

const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const sortBy = ref<'newest' | 'oldest' | 'title'>('newest')

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}



const shopArea = computed(() => {
  const subDistrict = shop.value?.subDistrictName
  const district = shop.value?.districtName
  return [subDistrict ? `ต.${subDistrict}` : null, district ? `อ.${district}` : null, 'จ.กาญจนบุรี']
    .filter(Boolean)
    .join(' ')
})

const contentCategories = computed(() => [
  { id: null, name: 'ทั้งหมด', count: contents.value.length },
  ...categories.value
    .filter((category) =>
      contents.value.some((c) => c.contentCategoryId === category.contentCategoryId),
    )
    .map((category) => ({
      id: category.contentCategoryId,
      name: category.categoryName,
      count: contents.value.filter((c) => c.contentCategoryId === category.contentCategoryId)
        .length,
    })),
])

const filteredContents = computed(() => {
  let list = [...contents.value]
  if (selectedCategory.value) {
    list = list.filter((c) => c.contentCategoryId === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || (c.summary && c.summary.toLowerCase().includes(q)),
    )
  }

  if (sortBy.value === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else if (sortBy.value === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'th'))
  }

  return list
})

onMounted(async () => {
  loading.value = true
  try {
    const shopId = String(route.params.id)
    const [shopData, contentsRes, catData] = await Promise.all([
      getShop(shopId),
      getPublicContents({ shopId, page: 1, pageSize: 100 }),
      getContentCategories(),
    ])
    shop.value = shopData
    contents.value = contentsRes.items || []
    categories.value = catData || []
  } catch (error) {
    push.error({ title: 'ไม่พบร้านค้า', message: getApiErrorMessage(error, 'ร้านค้านี้อาจถูกปิดการใช้งาน') })
    await router.replace('/shops')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center gap-2 overflow-x-auto scrollbar-none font-bold"
      >
        <RouterLink to="/" class="hover:text-emerald-700 transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/shops" class="hover:text-emerald-700 transition">ร้านค้าทั้งหมด</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink
          v-if="shop"
          :to="`/shops/${shop.shopId}`"
          class="hover:text-emerald-700 line-clamp-1 transition"
          >{{ shop.shopName }}</RouterLink
        >
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-black">เรื่องราวทั้งหมด</span>
      </div>
    </div>

    <!-- SHOP HEADER BANNER CARD -->
    <section v-if="shop" class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-8 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <!-- Shop Logo Avatar -->
            <img
              :src="
                imageUrl(shop.coverImageUrl) ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
              "
              :alt="shop.shopName"
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white ring-4 ring-emerald-600/30 shadow-md shrink-0"
            />
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  {{ shop.categoryName || 'ร้านค้าชุมชน' }}
                </span>
                <span class="text-xs text-[#786B62] font-semibold">📍 {{ shopArea }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-[#332820] tracking-tight">
                เรื่องราวและคอนเทนต์ของ {{ shop.shopName }}
              </h1>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold">
                มีเรื่องราวและคอนเทนต์ที่เกี่ยวข้องทั้งหมด
                <span class="text-emerald-700 font-black">{{ contents.length }}</span> บทความ
              </p>
            </div>
          </div>

          <RouterLink
            :to="`/shops/${shop.shopId}`"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition border border-amber-600 shrink-0 active:scale-95 cursor-pointer"
          >
            <i class="mdi mdi-storefront text-base text-white"></i>
            <span class="!text-white font-black">ย้อนกลับไปหน้าร้านค้า</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENTS CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- TOOLBAR: SEARCH, CATEGORY PILLS & SORTING -->
      <div
        class="rounded-3xl bg-[#FFF9F2] p-5 sm:p-6 border-2 border-[#E8D9C9] shadow-xs space-y-4"
      >
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <!-- Search Input Box -->
          <div class="relative flex-1 max-w-md">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาเรื่องราว คอนเทนต์ ของร้านนี้..."
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#332820] outline-none focus:border-emerald-600 transition font-bold"
            />
            <i
              class="mdi mdi-magnify absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-lg"
            ></i>
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
              @click="searchQuery = ''"
            >
              <i class="mdi mdi-close-circle text-base"></i>
            </button>
          </div>

          <!-- Sort Select Options -->
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-xs font-black text-[#786B62] shrink-0">เรียงตาม:</span>
            <select
              v-model="sortBy"
              class="rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2 text-xs font-black text-[#332820] outline-none focus:border-emerald-600 transition cursor-pointer"
            >
              <option value="newest">เผยแพรล่าสุด</option>
              <option value="oldest">เผยแพร่เก่าสุด</option>
              <option value="title">ชื่อบทความ (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Category Pills Bar -->
        <div
          v-if="contentCategories.length > 1"
          class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t-2 border-[#E8D9C9]"
        >
          <button
            v-for="cat in contentCategories"
            :key="cat.name"
            type="button"
            class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
            :class="
              selectedCategory === cat.id
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-emerald-600'
            "
            @click="selectedCategory = cat.id"
          >
            <span>{{ cat.name }}</span>
            <span
              class="text-[10px] rounded-full px-1.5 py-0.5"
              :class="
                selectedCategory === cat.id
                  ? 'bg-white text-emerald-800 font-black'
                  : 'bg-[#F5E6D3] text-[#786B62] font-extrabold'
              "
            >
              {{ cat.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!filteredContents.length"
        class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-20 px-6 text-center shadow-sm space-y-3"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mx-auto border border-emerald-200"
        >
          <i class="mdi mdi-text-box-remove-outline text-4xl text-emerald-700"></i>
        </div>
        <h3 class="text-xl font-black text-[#332820]">ไม่พบเรื่องราวในรายการนี้</h3>
        <p class="text-xs sm:text-sm text-[#786B62] font-semibold max-w-md mx-auto">
          ยังไม่มีเรื่องราวหรือบทความที่เชื่อมกับร้านค้านี้ในขณะนี้
        </p>
        <button
          v-if="searchQuery || selectedCategory"
          type="button"
          class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 text-white font-black text-xs hover:bg-amber-700 transition border border-amber-600"
          @click="
            () => {
              searchQuery = ''
              selectedCategory = null
            }
          "
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      <!-- CONTENTS GRID -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="item in filteredContents"
          :key="item.contentId"
          :to="`/contents/${item.contentId}`"
          class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-4 shadow-2xs hover:shadow-xl hover:border-emerald-600 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
        >
          <div>
            <!-- Image / Video Banner -->
            <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#171412] mb-3.5">
              <img
                v-if="youtubeThumbnail(item.youtubeUrl)"
                :src="youtubeThumbnail(item.youtubeUrl)"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-[#171412] text-white"
              >
                <i class="mdi mdi-compass-rose text-5xl opacity-50"></i>
              </div>
              <span
                class="absolute top-2.5 left-2.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-md"
              >
                {{ item.contentCategoryName || 'เรื่องราวชุมชน' }}
              </span>
            </div>

            <h2
              class="font-black text-[#332820] text-base sm:text-lg group-hover:text-emerald-700 transition line-clamp-2 leading-snug"
            >
              {{ item.title }}
            </h2>
            <p
              v-if="item.summary"
              class="text-xs text-[#786B62] mt-2 line-clamp-3 font-semibold leading-relaxed"
            >
              {{ item.summary }}
            </p>
          </div>

          <div
            class="flex items-center justify-between mt-5 pt-3 border-t-2 border-[#E8D9C9] text-xs font-bold text-[#786B62]"
          >
            <span class="flex items-center gap-1"
              ><i class="mdi mdi-map-marker text-emerald-700"></i
              >{{ item.districtName || 'กาญจนบุรี' }}</span
            >
            <span class="text-[11px] font-semibold text-[#786B62]">{{
              formatDate(item.publishedAt || item.createdAt)
            }}</span>
          </div>
        </RouterLink>
      </div>
    </main>
  </div>
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
