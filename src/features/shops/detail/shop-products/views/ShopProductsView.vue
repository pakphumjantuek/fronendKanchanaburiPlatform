<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center gap-2 overflow-x-auto scrollbar-none font-bold"
      >
        <RouterLink to="/" class="hover:text-amber-700 transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/shops" class="hover:text-amber-700 transition">ร้านค้าทั้งหมด</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink
          v-if="shop"
          :to="`/shops/${shop.shopId}`"
          class="hover:text-amber-700 line-clamp-1 transition"
          >{{ shop.shopName }}</RouterLink
        >
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-black">สินค้าทั้งหมด</span>
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
                สินค้าทั้งหมดของ {{ shop.shopName }}
              </h1>
              <p class="text-xs sm:text-sm text-[#786B62] font-semibold">
                มีสินค้าพร้อมจำหน่ายทั้งหมด
                <span class="text-amber-700 font-black">{{ products.length }}</span> รายการ
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

    <!-- MAIN PRODUCTS CATALOG CONTAINER -->
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
              placeholder="ค้นหาสินค้าในร้านนี้..."
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
            <span class="text-xs font-black text-[#786B62] shrink-0">จัดเรียงตาม:</span>
            <select
              v-model="sortBy"
              class="rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2 text-xs font-black text-[#332820] outline-none focus:border-emerald-600 transition cursor-pointer"
            >
              <option value="default">รายการแนะนำ</option>
              <option value="price-asc">ราคา: น้อยไปมาก</option>
              <option value="price-desc">ราคา: มากไปน้อย</option>
              <option value="name">ชื่อสินค้า (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Category Pills Bar -->
        <div
          v-if="productCategories.length > 1"
          class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t-2 border-[#E8D9C9]"
        >
          <button
            v-for="cat in productCategories"
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
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <div
          v-for="i in 8"
          :key="i"
          class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!filteredProducts.length"
        class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-20 px-6 text-center shadow-sm space-y-3"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mx-auto border border-emerald-200"
        >
          <i class="mdi mdi-package-variant-remove text-4xl"></i>
        </div>
        <h3 class="text-xl font-black text-[#332820]">ไม่พบสินค้าในรายการนี้</h3>
        <p class="text-xs sm:text-sm text-[#786B62] font-semibold max-w-md mx-auto">
          ลองเปลี่ยนคำค้นหา หรือเลือกสลับหมวดหมู่อื่นเพื่อดูสินค้าของร้านนี้
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

      <!-- PRODUCTS GRID -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        <RouterLink
          v-for="(prod, idx) in filteredProducts"
          :key="prod.productId"
          :to="`/products/${prod.productId}`"
          class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-4 shadow-2xs hover:shadow-xl hover:border-amber-500 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
        >
          <div>
            <!-- Image Frame -->
            <div class="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#171412] mb-3">
              <img
                :src="getProductImage(prod, idx)"
                :alt="prod.productName"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
              />
              <span
                class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-md"
              >
                พร้อมส่ง
              </span>
            </div>

            <span
              class="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1"
            >
              {{ productCategoryName(prod.productCategoryId) }}
            </span>
            <h3
              class="font-black text-[#332820] text-sm sm:text-base group-hover:text-amber-700 transition line-clamp-1"
            >
              {{ prod.productName }}
            </h3>
            <p
              v-if="prod.description"
              class="text-xs text-[#786B62] mt-1 line-clamp-2 font-medium leading-relaxed"
            >
              {{ prod.description }}
            </p>
          </div>

          <div class="flex items-center justify-between mt-4 pt-3 border-t-2 border-[#E8D9C9]">
            <div>
              <span class="block text-[10px] text-[#786B62] font-black uppercase">ราคา</span>
              <span class="font-black text-amber-700 text-base sm:text-lg">{{
                formatPrice(prod.price)
              }}</span>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition shadow-md cursor-pointer border border-amber-600"
            >
              <i class="mdi mdi-cart-plus text-lg text-white"></i>
            </button>
          </div>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProductCategories,
  getShop,
  getShopProducts,
  type Product,
  type ProductCategory,
  type Shop,
} from '@/features/shops/api'
import { push } from 'notivue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

const route = useRoute()
const router = useRouter()

const shop = ref<Shop | null>(null)
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const loading = ref(true)

const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const sortBy = ref<'default' | 'price-asc' | 'price-desc' | 'name'>('default')

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getProductImage(product: Product, index: number): string {
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  ]
  const resolved = imageUrl(product.imageUrl)
  return (resolved || defaults[index % defaults.length])!
}

const shopArea = computed(() => {
  const subDistrict = shop.value?.subDistrictName
  const district = shop.value?.districtName
  return [subDistrict ? `ต.${subDistrict}` : null, district ? `อ.${district}` : null, 'จ.กาญจนบุรี']
    .filter(Boolean)
    .join(' ')
})

const productCategories = computed(() => [
  { id: null, name: 'ทั้งหมด', count: products.value.length },
  ...categories.value
    .filter((category) =>
      products.value.some((product) => product.productCategoryId === category.productCategoryId),
    )
    .map((category) => ({
      id: category.productCategoryId,
      name: category.categoryName,
      count: products.value.filter((p) => p.productCategoryId === category.productCategoryId)
        .length,
    })),
])

function productCategoryName(productCategoryId: string) {
  return (
    categories.value.find((category) => category.productCategoryId === productCategoryId)
      ?.categoryName ?? 'สินค้า'
  )
}

const filteredProducts = computed(() => {
  let list = [...products.value]
  if (selectedCategory.value) {
    list = list.filter((p) => p.productCategoryId === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    )
  }

  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.productName.localeCompare(b.productName, 'th'))
  }

  return list
})

onMounted(async () => {
  loading.value = true
  try {
    const shopId = String(route.params.id)
    const [shopData, productsRes, catData] = await Promise.all([
      getShop(shopId),
      getShopProducts(shopId),
      getProductCategories(),
    ])
    shop.value = shopData
    products.value = productsRes || []
    categories.value = catData || []
  } catch (error) {
    push.error({
      title: 'ไม่พบร้านค้า',
      message: getApiErrorMessage(error, 'ร้านค้านี้อาจถูกปิดการใช้งาน'),
    })
    await router.replace('/shops')
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
