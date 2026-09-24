<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProductReviews,
  getPublicProduct,
  getPublicProducts,
  getShop,
  type Product,
  type ProductReviews,
  type Shop,
} from '@/features/shops/api'
import { push } from 'notivue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/features/auth/stores/auth'

// Sub-components
import ProductGallery from '../components/ProductGallery.vue'
import ProductInfoPanel from '../components/ProductInfoPanel.vue'
import ProductSellerCard from '../components/ProductSellerCard.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const shop = ref<Shop | null>(null)
const otherShopProducts = ref<Product[]>([])
const recommendedProducts = ref<Product[]>([])
const reviewData = ref<ProductReviews>({ totalCount: 0, averageRating: 0, reviews: [] })

const selectedImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref<'details' | 'reviews'>('details')
const isFavorite = ref(false)

const loading = ref(true)
const adding = ref(false)
const buyingNow = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const galleryImages = computed(() => {
  const list: string[] = []
  if (product.value?.imageUrl) list.push(imageUrl(product.value.imageUrl)!)
  if (product.value?.detailImages?.length) {
    product.value.detailImages.forEach((img) => {
      if (img) list.push(imageUrl(img)!)
    })
  }
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  ]
  return list.length ? list : defaults
})

const maxQuantity = computed(() => {
  if (!product.value) return 1
  const dealQuantity = product.value.activeDeal?.availableQuantity
  return dealQuantity ?? product.value.quantity
})

function openMapDirections() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`,
      '_blank',
    )
  }
}

async function addToCart() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    push.success({
      title: 'เพิ่มลงตะกร้าเรียบร้อย',
      message: `เพิ่ม ${product.value.productName} จำนวน ${quantity.value} ชิ้น เรียบร้อยแล้ว`,
    })
  } catch (error) {
    push.error({
      title: 'เพิ่มสินค้าไม่สำเร็จ',
      message: getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'),
    })
  } finally {
    adding.value = false
  }
}

async function buyNow() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  buyingNow.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await router.push('/cart')
  } catch (error) {
    push.error({
      title: 'ไม่สามารถดำเนินการได้',
      message: getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'),
    })
  } finally {
    buyingNow.value = false
  }
}

function getRatingPercent(star: number) {
  if (!reviewData.value.totalCount || !reviewData.value.ratingCounts) return 0
  const count = reviewData.value.ratingCounts[star] || 0
  return Math.round((count / reviewData.value.totalCount) * 100)
}



onMounted(async () => {
  try {
    product.value = await getPublicProduct(String(route.params.id))
    const currentProduct = product.value
    const [currentShop, allProducts, reviews] = await Promise.all([
      getShop(currentProduct.shopId),
      getPublicProducts(),
      getProductReviews(currentProduct.productId).catch(() => ({
        totalCount: 0,
        averageRating: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: [],
      })),
    ])
    shop.value = currentShop
    reviewData.value = reviews
    const otherProducts = allProducts.filter((item) => item.productId !== currentProduct.productId)
    otherShopProducts.value = otherProducts
      .filter((item) => item.shopId === currentProduct.shopId)
      .slice(0, 4)
    recommendedProducts.value = otherProducts
      .filter((item) => item.shopId !== currentProduct.shopId)
      .slice(0, 4)
  } catch (error) {
    push.error({
      title: 'ไม่พบสินค้า',
      message: getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่ในระบบ'),
    })
    await router.replace('/shops')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="product && shop" class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-20 font-sans">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center gap-2 overflow-x-auto scrollbar-none font-bold"
      >
        <RouterLink to="/" class="hover:text-[#D96C2C] transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/shops" class="hover:text-[#D96C2C] transition">ร้านค้าทั้งหมด</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink
          :to="`/shops/${shop.shopId}`"
          class="hover:text-[#D96C2C] line-clamp-1 transition"
        >
          {{ shop.shopName }}
        </RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-black line-clamp-1">{{ product.productName }}</span>
      </div>
    </div>

    <!-- MAIN PRODUCT DISPLAY CONTAINER -->
    <section class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-8 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <!-- Left Column: Product Image Gallery Component -->
          <div class="lg:col-span-6">
            <ProductGallery
              v-model:selected-image-index="selectedImageIndex"
              v-model:is-favorite="isFavorite"
              :product="product"
              :gallery-images="galleryImages"
            />
          </div>

          <!-- Right Column: Product Details & Purchase Panel Component -->
          <div class="lg:col-span-6">
            <ProductInfoPanel
              v-model:quantity="quantity"
              :product="product"
              :shop="shop"
              :adding="adding"
              :buying-now="buyingNow"
              :max-quantity="maxQuantity"
              :image-url="imageUrl"
              :format-price="formatPrice"
              @add-to-cart="addToCart"
              @buy-now="buyNow"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- SUB-NAV TAB BAR -->
    <section class="sticky top-20 z-30 bg-[#FFF9F2] border-b-2 border-[#E8D9C9] shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="flex items-center gap-8 overflow-x-auto text-xs sm:text-sm font-black scrollbar-none"
        >
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="
              activeTab === 'details'
                ? 'border-[#D96C2C] text-[#D96C2C]'
                : 'border-transparent text-[#786B62] hover:text-[#332820]'
            "
            @click="activeTab = 'details'"
          >
            รายละเอียดสินค้า
          </button>
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="
              activeTab === 'reviews'
                ? 'border-[#D96C2C] text-[#D96C2C]'
                : 'border-transparent text-[#786B62] hover:text-[#332820]'
            "
            @click="activeTab = 'reviews'"
          >
            รีวิวสินค้า ({{ reviewData.totalCount }})
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT COLUMN: SPECS, DESCRIPTION & REVIEWS -->
        <div class="lg:col-span-8 space-y-8">
          <!-- SECTION 1: รายละเอียดสินค้า -->
          <section
            v-if="activeTab === 'details'"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center gap-2.5 border-b-2 border-[#E8D9C9] pb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
              >
                <i class="mdi mdi-clipboard-text-outline text-xl text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-black text-[#332820]">รายละเอียดสินค้าแบบเจาะลึก</h2>
                <p class="text-xs text-[#786B62]">ข้อมูลรายละเอียดวัตถุดิบและที่มาของสินค้า</p>
              </div>
            </div>

            <p
              v-if="product.description"
              class="text-sm text-[#786B62] leading-relaxed whitespace-pre-line font-semibold"
            >
              {{ product.description }}
            </p>
            <p v-else class="rounded-2xl bg-[#F7F0E6] p-8 text-center text-sm text-[#786B62]">
              ร้านค้ายังไม่ได้ระบุรายละเอียดข้อความสินค้า
            </p>

            <!-- Specs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-[#F7F0E6] border-2 border-[#E8D9C9] text-xs space-y-2">
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider"
                  >📌 ข้อมูลเฉพาะ</span
                >
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>หมวดหมู่:</strong> {{ shop.categoryName || 'สินค้าหัตถกรรม' }}</li>
                  <li><strong>ร้านผู้ผลิต:</strong> {{ shop.shopName }}</li>
                  <li>
                    <strong>แหล่งที่มา:</strong> {{ shop.districtName || 'สังขละบุรี' }} กาญจนบุรี
                  </li>
                </ul>
              </div>

              <div
                class="p-4 rounded-2xl bg-[#D96C2C]/10 border-2 border-[#D96C2C]/20 text-xs space-y-2"
              >
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider"
                  >💚 การรับประกันและดูแล</span
                >
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>รับประกันสินค้า:</strong> ของแท้จากชุมชน 100%</li>
                  <li><strong>บริการจัดส่ง:</strong> พัสดุด่วน EMS / Flash Express</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 2: รีวิวสินค้า -->
          <section
            v-if="activeTab === 'reviews'"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center gap-2.5 border-b-2 border-[#E8D9C9] pb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
              >
                <i class="mdi mdi-star-face text-xl text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-black text-[#332820]">รีวิวและคะแนนสินค้าจากผู้ซื้อจริง</h2>
                <p class="text-xs text-[#786B62]">
                  ความคิดเห็นจากลูกค้าที่สั่งซื้อสินค้าและจัดส่งสำเร็จ
                </p>
              </div>
            </div>

            <!-- Rating Summary Card -->
            <div
              class="grid grid-cols-1 sm:grid-cols-12 gap-6 rounded-2xl bg-[#F7F0E6] p-6 border-2 border-[#E8D9C9] items-center"
            >
              <!-- Left: Big Score -->
              <div
                class="sm:col-span-5 flex flex-col items-center justify-center text-center space-y-2 border-b sm:border-b-0 sm:border-r border-[#E8D9C9] pb-4 sm:pb-0 sm:pr-4"
              >
                <span class="text-4xl sm:text-5xl font-black text-[#D96C2C]">
                  {{ reviewData.averageRating > 0 ? reviewData.averageRating : '0.0' }}
                </span>
                <div class="flex items-center gap-1">
                  <i
                    v-for="star in 5"
                    :key="star"
                    :class="[
                      'mdi text-lg sm:text-xl',
                      star <= Math.round(reviewData.averageRating)
                        ? 'mdi-star text-amber-400'
                        : 'mdi-star-outline text-slate-300',
                    ]"
                  ></i>
                </div>
                <span class="text-xs font-bold text-[#786B62]">
                  จากทั้งหมด {{ reviewData.totalCount }} รีวิว
                </span>
              </div>

              <!-- Right: Rating Breakdown Bars -->
              <div class="sm:col-span-7 space-y-2 text-xs font-bold text-[#332820]">
                <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                  <span class="w-12 flex items-center gap-1 shrink-0 font-black">
                    {{ star }} <i class="mdi mdi-star text-amber-400 text-sm"></i>
                  </span>
                  <div
                    class="h-2.5 flex-1 rounded-full bg-white border border-[#E8D9C9] overflow-hidden"
                  >
                    <div
                      class="h-full rounded-full bg-[#D96C2C] transition-all duration-500"
                      :style="{ width: `${getRatingPercent(star)}%` }"
                    ></div>
                  </div>
                  <span class="w-10 text-right text-xs text-[#786B62]">
                    {{ reviewData.ratingCounts?.[star] || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Reviews List -->
            <div v-if="reviewData.reviews.length" class="space-y-4 pt-2">
              <div
                v-for="rev in reviewData.reviews"
                :key="rev.reviewId"
                class="rounded-2xl bg-white p-5 border-2 border-[#E8D9C9] space-y-3 shadow-2xs"
              >
                <!-- Reviewer Header -->
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] font-black text-sm border border-[#D96C2C]/30 uppercase"
                    >
                      {{ rev.userName ? rev.userName.charAt(0) : 'U' }}
                    </div>
                    <div>
                      <h4 class="font-black text-[#332820] text-sm">
                        {{ rev.userName }}
                      </h4>
                      <p class="text-2xs text-[#786B62] font-semibold">
                        {{ formatDate(rev.createdAt) }}
                      </p>
                    </div>
                  </div>

                  <!-- Stars -->
                  <div class="flex items-center gap-0.5">
                    <i
                      v-for="star in 5"
                      :key="star"
                      :class="[
                        'mdi text-sm',
                        star <= rev.rating
                          ? 'mdi-star text-amber-400'
                          : 'mdi-star-outline text-slate-300',
                      ]"
                    ></i>
                  </div>
                </div>

                <!-- Review Content -->
                <p class="text-xs sm:text-sm text-[#786B62] leading-relaxed font-semibold pl-1">
                  {{ rev.comment }}
                </p>

                <!-- Merchant Reply if any -->
                <div
                  v-if="rev.reply"
                  class="mt-3 rounded-xl bg-[#F7F0E6] p-3.5 border border-[#E8D9C9] text-xs space-y-1"
                >
                  <span class="font-black text-[#D96C2C] flex items-center gap-1">
                    <i class="mdi mdi-reply"></i> ตอบกลับจากร้านค้า:
                  </span>
                  <p class="text-[#332820] font-semibold">{{ rev.reply }}</p>
                </div>
              </div>
            </div>

            <!-- Empty Reviews State -->
            <div
              v-else
              class="rounded-2xl bg-white p-10 border-2 border-dashed border-[#E8D9C9] text-center space-y-3"
            >
              <i class="mdi mdi-star-face text-5xl text-[#D96C2C]/50 block"></i>
              <h3 class="font-black text-[#332820] text-base">ยังไม่มีรีวิวสำหรับสินค้านี้</h3>
              <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">
                สั่งซื้อสินค้านี้และรอรับสินค้า แล้วมาร่วมแชร์ความประทับใจของคุณได้เป็นคนแรก!
              </p>
            </div>
          </section>

          <!-- SECTION 2: สินค้าอื่นจากร้านนี้ -->
          <section
            v-if="otherShopProducts.length"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าอื่นจากร้านนี้</h2>
              <RouterLink
                :to="`/shops/${shop.shopId}`"
                class="text-xs font-black text-[#D96C2C] hover:underline"
              >
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="op in otherShopProducts"
                :key="op.productId"
                :to="`/products/${op.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      v-if="op.imageUrl"
                      :src="imageUrl(op.imageUrl)"
                      :alt="op.productName"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4
                    class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ op.productName }}
                  </h4>
                </div>
                <div
                  class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
                >
                  <span>{{ formatPrice(op.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- SECTION 3: สินค้าที่คุณอาจสนใจ -->
          <section
            v-if="recommendedProducts.length"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าที่คุณอาจสนใจ</h2>
              <RouterLink to="/shops" class="text-xs font-black text-[#D96C2C] hover:underline">
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="rp in recommendedProducts"
                :key="rp.productId"
                :to="`/products/${rp.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      v-if="rp.imageUrl"
                      :src="imageUrl(rp.imageUrl)"
                      :alt="rp.productName"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4
                    class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ rp.productName }}
                  </h4>
                </div>
                <div
                  class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
                >
                  <span>{{ formatPrice(rp.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <!-- RIGHT SIDEBAR: SELLER CARD COMPONENT -->
        <div class="lg:col-span-4">
          <ProductSellerCard
            :shop="shop"
            :image-url="imageUrl"
            @open-directions="openMapDirections"
          />
        </div>
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
