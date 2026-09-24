<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { getMyShop } from '@/features/merchant/api/shopApi'
import { getProducts, removeProduct, type Product } from '@/features/shops/api'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { imageUrl } from '@/shared/utils/imageUrl'

const products = ref<Product[]>([])
const hasShop = ref(false)
const shopId = ref<string>('')
const loading = ref(true)
const searchQuery = ref('')
const swal = useSwal()

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(
    (p) =>
      p.productName.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
  )
})

async function load() {
  loading.value = true
  try {
    const shop = await getMyShop()
    hasShop.value = true
    shopId.value = shop.shopId
    products.value = (await getProducts()).filter((product) => product.shopId === shop.shopId)
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      await swal.error('โหลดสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    }
  } finally {
    loading.value = false
  }
}

async function closeProduct(product: Product) {
  const result = await swal.confirm(
    `ปิดการขาย ${product.productName}?`,
    'สินค้าจะไม่แสดงต่อสาธารณะบนแพลตฟอร์ม แต่ข้อมูลจะยังคงอยู่ในระบบ',
  )
  if (!result.isConfirmed) return
  try {
    await removeProduct(product.productId)
    products.value = products.value.filter((item) => item.productId !== product.productId)
    await swal.success('ปิดการขายสินค้าแล้ว')
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-[1920px] space-y-6 py-4 text-[#332820]">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div
        class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="i"
          class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>
    </div>

    <template v-else-if="hasShop">
      <!-- Header Banner Card -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0"
          >
            <i class="mdi mdi-package-variant-closed text-2xl text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-[#332820]">จัดการรายการสินค้า</h1>
              <span
                class="rounded-full bg-[#D96C2C]/10 px-3 py-0.5 text-xs font-black text-[#D96C2C] border border-[#D96C2C]/20"
              >
                {{ products.length }} รายการ
              </span>
            </div>
            <p class="text-xs text-[#786B62] font-semibold mt-0.5">
              จัดการข้อมูลสินค้า ราคาวางจำหน่าย จำนวนสต็อก และการปิด/เปิดขายสินค้า
            </p>
          </div>
        </div>

        <RouterLink
          to="/my-shop/products/new"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
        >
          <i class="mdi mdi-plus-circle text-lg text-white"></i>
          <span class="!text-white font-black">+ เพิ่มสินค้าใหม่</span>
        </RouterLink>
      </div>

      <!-- Search Filter Bar -->
      <div
        v-if="products.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 shadow-xs"
      >
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อหรือรายละเอียดสินค้า..."
            class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] transition"
          />
          <i
            class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"
          ></i>
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
            @click="searchQuery = ''"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>

        <div class="text-xs text-[#786B62] font-black">
          แสดง {{ filteredProducts.length }} จากทั้งหมด {{ products.length }} รายการ
        </div>
      </div>

      <!-- Empty State: No Products -->
      <div
        v-if="products.length === 0"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-16 px-6 text-center shadow-xs"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-4 border border-[#D96C2C]/30"
        >
          <i class="mdi mdi-package-variant text-4xl"></i>
        </div>
        <h2 class="text-xl font-black text-[#332820]">ยังไม่มีสินค้าในร้านค้าของคุณ</h2>
        <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
          เริ่มต้นเพิ่มรายการสินค้าชิ้นแรกของคุณเพื่อให้ลูกค้าสามารถเข้ามาเลือกซื้อผ่านแพลตฟอร์มได้ทันที
        </p>
        <RouterLink
          to="/my-shop/products/new"
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]"
        >
          <i class="mdi mdi-plus-circle text-lg text-white"></i>
          <span class="!text-white font-black">เพิ่มสินค้าชิ้นแรก</span>
        </RouterLink>
      </div>

      <!-- No Search Results -->
      <div
        v-else-if="filteredProducts.length === 0"
        class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center text-[#786B62] shadow-xs"
      >
        <i class="mdi mdi-magnify-remove text-4xl text-[#D96C2C] mb-2 block"></i>
        <p class="font-black text-[#332820]">ไม่พบสินค้าที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
        <button
          type="button"
          class="mt-3 text-xs font-black text-[#D96C2C] hover:underline"
          @click="searchQuery = ''"
        >
          ล้างคำค้นหา
        </button>
      </div>

      <!-- Product Grid Cards -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="product in filteredProducts"
          :key="product.productId"
          class="group flex flex-col overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D96C2C] hover:shadow-xl"
        >
          <!-- Product Image Container -->
          <div class="relative h-48 w-full overflow-hidden bg-[#171412]">
            <img
              v-if="product.imageUrl"
              :src="imageUrl(product.imageUrl)"
              :alt="product.productName"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
            <div
              v-else
              class="flex h-full w-full flex-col items-center justify-center text-[#786B62]"
            >
              <i class="mdi mdi-image-off-outline text-4xl opacity-50"></i>
              <span class="mt-1 text-xs font-bold">ไม่มีรูปภาพ</span>
            </div>

            <!-- Floating Price Badge -->
            <div class="absolute bottom-3 left-3">
              <span
                class="inline-flex items-center rounded-xl bg-[#D96C2C] px-3 py-1 text-xs font-black text-white shadow-md border border-white/20"
              >
                ฿ {{ Number(product.price).toLocaleString('th-TH') }}
              </span>
            </div>

            <!-- Floating Stock Badge -->
            <div class="absolute top-3 right-3">
              <span
                v-if="product.quantity > 0"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-black text-white shadow-md"
              >
                คลัง {{ product.quantity }} ชิ้น
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-black text-white shadow-md"
              >
                สินค้าหมด
              </span>
            </div>
          </div>

          <!-- Product Details Body -->
          <div class="flex flex-1 flex-col p-5 space-y-2">
            <h2
              class="text-base font-black text-[#332820] group-hover:text-[#D96C2C] transition line-clamp-1"
            >
              {{ product.productName }}
            </h2>

            <p class="flex-1 line-clamp-2 text-xs text-[#786B62] font-semibold leading-relaxed">
              {{ product.description || 'ไม่มีรายละเอียดสินค้า' }}
            </p>

            <!-- Action Buttons Bar -->
            <div
              class="mt-4 flex items-center justify-between border-t-2 border-[#E8D9C9] pt-3 text-xs"
            >
              <RouterLink
                :to="`/products/${product.productId}`"
                target="_blank"
                class="inline-flex items-center gap-1 font-bold text-[#786B62] hover:text-[#D96C2C] transition"
                title="ดูหน้าสินค้าลูกค้า"
              >
                <i class="mdi mdi-eye-outline text-sm text-[#D96C2C]"></i>
                <span>ดูสินค้า</span>
              </RouterLink>

              <div class="flex items-center gap-2">
                <RouterLink
                  :to="`/my-shop/products/${product.productId}/deals`"
                  class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-black text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-2xs"
                >
                  <i class="mdi mdi-lightning-bolt-outline text-xs"></i>
                  <span>โปรโมชั่น</span>
                </RouterLink>
                <RouterLink
                  :to="`/my-shop/products/${product.productId}/edit`"
                  class="inline-flex items-center gap-1 rounded-xl border border-[#D96C2C]/30 bg-[#D96C2C]/10 px-3 py-1.5 font-black text-[#D96C2C] hover:bg-[#D96C2C] hover:text-white transition shadow-2xs"
                >
                  <i class="mdi mdi-pencil-outline text-xs"></i>
                  <span>แก้ไข</span>
                </RouterLink>

                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-black text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer"
                  @click="closeProduct(product)"
                >
                  <i class="mdi mdi-close-circle-outline text-xs"></i>
                  <span>ปิดขาย</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>

    <!-- State: Merchant Has No Shop Yet -->
    <div
      v-else
      class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-16 px-6 text-center shadow-xs space-y-3"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-2 border border-amber-300"
      >
        <i class="mdi mdi-store-plus-outline text-4xl"></i>
      </div>
      <h2 class="text-xl font-black text-[#332820]">กรุณาสร้างร้านค้าก่อนจัดการสินค้า</h2>
      <p class="max-w-md text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
        คุณจำเป็นต้องตั้งค่าข้อมูลร้านค้าเบื้องต้นก่อนจึงจะสามารถลงรายการสินค้าสำหรับวางจำหน่ายได้
      </p>
      <RouterLink
        to="/my-shop"
        class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]"
      >
        <i class="mdi mdi-store-cog text-lg text-white"></i>
        <span class="!text-white font-black">ไปยังหน้าตั้งค่าร้านค้า</span>
      </RouterLink>
    </div>
  </div>
</template>
