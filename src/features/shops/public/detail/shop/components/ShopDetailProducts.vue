<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product, ProductCategory, Shop } from '@/features/shops/api'
import { dealLabel, dealPrice } from '@/shared/utils/productDeal'

const props = defineProps<{
  shop: Shop
  products: Product[]
  categories: ProductCategory[]
  filteredProducts: Product[]
  productCategoryName: (id: string) => string
  imageUrl: (url?: string) => string | undefined
  formatPrice: (value: number) => string
  getProductImage: (prod: Product, index: number) => string
}>()

const selectedCategory = defineModel<string | null>('selectedCategory', { default: null })
const productSearchInput = defineModel<string>('productSearchInput', { default: '' })
const productSearch = defineModel<string>('productSearch', { default: '' })

const sortBy = ref<'popular' | 'sales' | 'price-asc' | 'price-desc' | 'latest'>('popular')

const emit = defineEmits<{
  (e: 'add-cart-quick', product: Product): void
}>()

const productCategories = computed(() => [
  { id: null, name: 'ทั้งหมด', count: props.products.length },
  ...props.categories
    .filter((category) =>
      props.products.some((product) => product.productCategoryId === category.productCategoryId),
    )
    .map((category) => ({
      id: category.productCategoryId,
      name: category.categoryName,
      count: props.products.filter((p) => p.productCategoryId === category.productCategoryId)
        .length,
    })),
])

const sortedFilteredProducts = computed(() => {
  const list = [...props.filteredProducts]
  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  }
  return list
})

function clearSearch() {
  productSearchInput.value = ''
  productSearch.value = ''
}

function clearFilters() {
  clearSearch()
  selectedCategory.value = null
}
</script>

<template>
  <section
    class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-8 shadow-md space-y-6"
  >
    <!-- Section Header & In-store Search Bar -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-5"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm font-bold"
        >
          <i class="mdi mdi-store-search-outline text-2xl text-white"></i>
        </div>
        <div>
          <h2 class="text-2xl sm:text-3xl font-black text-[#332820]">สินค้าในร้าน</h2>
          <p class="text-xs sm:text-sm text-[#786B62] font-semibold">
            แสดง {{ Math.min(sortedFilteredProducts.length, 8) }} จาก {{ products.length }} รายการ
          </p>
        </div>
      </div>

      <!-- Controls: Search Input & Sort Options -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <!-- In-store Search -->
        <div class="relative w-full sm:w-64">
          <input
            v-model="productSearchInput"
            type="text"
            placeholder="ค้นหาสินค้าในร้านนี้..."
            class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2.5 text-xs sm:text-sm font-bold outline-none focus:border-emerald-600 transition shadow-2xs"
          />
          <i
            class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 text-base"
          ></i>
          <button
            v-if="productSearchInput"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820] cursor-pointer"
            @click="clearSearch"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>

        <!-- Sort Select -->
        <select
          v-model="sortBy"
          class="rounded-2xl border-2 border-[#E8D9C9] bg-white px-3 py-2.5 text-xs sm:text-sm font-black text-[#332820] outline-none focus:border-emerald-600 transition cursor-pointer shadow-2xs"
        >
          <option value="popular">ยอดนิยม</option>
          <option value="sales">ยอดขายสูงสุด</option>
          <option value="price-asc">ราคา: ต่ำไปสูง</option>
          <option value="price-desc">ราคา: สูงไปต่ำ</option>
        </select>
      </div>
    </div>

    <!-- Category Filter Pills (Matches Reference Image 1:1) -->
    <div
      v-if="productCategories.length > 1"
      class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      <button
        v-for="cat in productCategories"
        :key="cat.name"
        type="button"
        class="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2 shadow-2xs"
        :class="
          selectedCategory === cat.id
            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
            : 'border-[#E8D9C9] bg-[#FFF9F2] text-[#332820] hover:border-emerald-600'
        "
        @click="selectedCategory = cat.id"
      >
        <span>{{ cat.name }}</span>
        <span
          class="text-xs rounded-full px-1.5 py-0.5"
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

    <!-- 4-Column Products Grid -->
    <div
      v-if="sortedFilteredProducts.length"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
    >
      <div
        v-for="(prod, idx) in sortedFilteredProducts.slice(0, 8)"
        :key="prod.productId"
        class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-3 sm:p-3.5 shadow-md hover:shadow-xl hover:border-amber-500 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <!-- Product Photo Frame with Badges -->
          <RouterLink
            :to="`/products/${prod.productId}`"
            class="block relative aspect-4/3 rounded-2xl overflow-hidden bg-[#171412] mb-3"
          >
            <img
              :src="getProductImage(prod, idx)"
              :alt="prod.productName"
              loading="lazy"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
            />

            <!-- Top Left Badge -->
            <span
              class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white shadow-md"
            >
              {{ idx === 0 ? 'ขายดีอันดับ 1' : 'พร้อมส่ง' }}
            </span>

            <!-- Top Right Heart Button -->
            <button
              type="button"
              class="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-[#332820] flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer"
              title="บันทึกในรายการโปรด"
              @click.prevent
            >
              <i class="mdi mdi-heart-outline text-sm text-amber-500"></i>
            </button>
          </RouterLink>

          <!-- Category Pill -->
          <span
            class="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1"
          >
            {{ productCategoryName(prod.productCategoryId) }}
          </span>

          <!-- Product Name Link -->
          <RouterLink
            :to="`/products/${prod.productId}`"
            class="font-black text-[#332820] text-sm sm:text-base group-hover:text-amber-700 transition line-clamp-2 leading-snug block"
          >
            {{ prod.productName }}
          </RouterLink>

          <!-- Price & Discount -->
          <div class="flex items-baseline gap-2 mt-2">
            <span v-if="prod.activeDeal" class="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white">{{ dealLabel(prod) }}</span>
            <span class="font-black text-amber-700 text-base sm:text-lg">{{
              formatPrice(dealPrice(prod))
            }}</span>
            <span v-if="prod.activeDeal" class="text-xs text-[#786B62] line-through font-semibold">
              {{ formatPrice(prod.price) }}
            </span>
          </div>

          <!-- Rating & Sold Count Strip -->
          <div
            class="flex items-center justify-between text-xs text-[#786B62] font-bold mt-2 p-2 rounded-xl bg-[#F5E6D3] border border-[#E0CFBD]"
          >
            <span class="flex items-center gap-0.5 text-amber-700">
              <i class="mdi mdi-star text-sm text-amber-500"></i>
              <span class="font-black">4.9</span>
              <span class="text-[#786B62]">(40+)</span>
            </span>
            <span>ขายแล้ว 120+ ชิ้น</span>
          </div>
        </div>

        <!-- Add to Cart CTA Button -->
        <div class="mt-3 pt-2">
          <RouterLink
            :to="`/products/${prod.productId}`"
            class="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm transition border border-amber-600 shadow-xs cursor-pointer group/btn"
          >
            <i class="mdi mdi-cart-plus text-base text-white"></i>
            <span class="text-white font-black">สั่งซื้อสินค้า</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6] p-10 text-center space-y-2"
    >
      <i class="mdi mdi-package-variant-remove text-3xl text-[#786B62]"></i>
      <p class="text-sm font-black text-[#332820]">ไม่พบสินค้าตามเงื่อนไขการค้นหา</p>
      <button
        v-if="productSearch || selectedCategory"
        type="button"
        class="text-xs sm:text-sm font-bold text-amber-700 hover:underline"
        @click="clearFilters"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>

    <!-- View All CTA -->
    <div v-if="products.length > 0" class="pt-2">
      <RouterLink
        :to="`/shops/${shop.shopId}/products`"
        class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm sm:text-base shadow-md transition duration-200 cursor-pointer border border-amber-600"
      >
        <i class="mdi mdi-grid text-xl text-white"></i>
        <span class="!text-white font-black"
          >ดูสินค้าทั้งหมดของร้านนี้ ({{ products.length }} รายการ)</span
        >
        <i class="mdi mdi-arrow-right text-lg text-white"></i>
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
