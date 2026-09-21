<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Product, Shop } from '@/features/shops/api'

const props = defineProps<{
  product: Product
  shop: Shop
  adding?: boolean
  buyingNow?: boolean
  maxQuantity: number
  imageUrl: (url?: string) => string | undefined
  formatPrice: (val: number) => string
}>()

const quantity = defineModel<number>('quantity', { default: 1 })
const now = ref(Date.now())
let dealTimer: ReturnType<typeof setInterval> | undefined
function toUtcMilliseconds(value: string) {
  const isoValue = value.replace(' ', 'T')
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(isoValue) ? isoValue : `${isoValue}Z`).getTime()
}
const dealRemaining = computed(() => {
  const end = props.product.activeDeal?.endsAt
  if (!end) return ''
  const seconds = Math.max(0, Math.ceil((toUtcMilliseconds(end) - now.value) / 1000))
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
})
const isDealFinished = computed(() => !!props.product.activeDeal?.endsAt && toUtcMilliseconds(props.product.activeDeal.endsAt) <= now.value)
onMounted(() => { dealTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => { if (dealTimer) clearInterval(dealTimer) })

const emit = defineEmits<{
  (e: 'add-to-cart'): void
  (e: 'buy-now'): void
}>()

function increaseQty() {
  if (quantity.value < props.maxQuantity) {
    quantity.value++
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function validateQty() {
  if (isNaN(quantity.value) || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > props.maxQuantity) {
    quantity.value = props.maxQuantity
  }
}
function dealPrice() {
  const deal = props.product.activeDeal
  if (!deal) return props.product.price
  return deal.discountType === 'Percent' ? props.product.price * (1 - deal.discountValue / 100) : props.product.price - deal.discountValue
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-2">
      <span v-if="product.activeDeal" class="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-sm font-bold text-white"><i class="mdi mdi-lightning-bolt-outline"></i>{{ product.activeDeal.dealType === 'FlashDeal' ? 'โปรโมชันพิเศษ' : 'โปรเด็ดชุมชน' }}</span>
      <span
        class="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-sm font-semibold bg-[#D96C2C]/10 text-[#D96C2C] border border-[#D96C2C]/20"
      >
        <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
        {{ shop.categoryName || 'สินค้าชุมชน' }}
      </span>
    </div>

    <div v-if="product.activeDeal" class="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
      <span v-if="!isDealFinished"><i class="mdi mdi-clock-outline mr-1"></i>เหลือเวลา {{ dealRemaining }}</span>
      <span v-else><i class="mdi mdi-clock-remove-outline mr-1"></i>ดีลหมดเวลาแล้ว</span>
      <span v-if="!isDealFinished" class="rounded-full bg-white px-3 py-1">เหลือ {{ product.activeDeal.remainingQuantity }} สิทธิ์</span>
    </div>

    <h1 class="text-3xl sm:text-4xl font-bold text-[#332820] tracking-tight leading-tight">
      {{ product.productName }}
    </h1>

    <!-- Shop Seller Link Box -->
    <div
      class="inline-flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
    >
      <img
        :src="
          imageUrl(shop.coverImageUrl) ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'
        "
        :alt="shop.shopName"
        class="w-7 h-7 rounded-full object-cover border border-white"
      />
      <RouterLink
        :to="`/shops/${shop.shopId}`"
        class="text-sm sm:text-base font-semibold text-[#D96C2C] hover:underline flex items-center gap-1"
      >
        <span>{{ shop.shopName }}</span>
        <i class="mdi mdi-chevron-right text-xs"></i>
      </RouterLink>
    </div>

    <!-- Rating & Sales Status Bar -->
    <div
      class="flex items-center gap-4 text-xs sm:text-sm font-medium text-[#786B62] border-y-2 border-[#E8D9C9] py-2.5"
    >
      <span
        class="flex items-center gap-1.5 text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-1 rounded-lg border border-[#D96C2C]/20 font-semibold"
      >
        <i class="mdi mdi-star text-base text-[#D96C2C]"></i>
        <span>4.8 (120 รีวิว)</span>
      </span>
      <span class="text-[#E8D9C9]">•</span>
      <span class="text-[#786B62] font-medium">ขายไปแล้ว 320 ชิ้น</span>
    </div>

    <!-- Price Display Box -->
    <div
      class="rounded-2xl bg-[#D96C2C]/10 p-4 sm:p-5 border-2 border-[#D96C2C]/30 flex items-baseline justify-between"
    >
      <div>
        <span class="text-xs font-semibold text-[#786B62] block uppercase">{{ product.activeDeal ? 'ราคาดีล' : 'ราคาขาย' }}</span>
        <span v-if="product.activeDeal" class="mr-2 text-lg text-[#786B62] line-through">{{ formatPrice(product.price) }}</span>
        <span class="text-4xl sm:text-5xl font-bold text-[#D96C2C] tracking-tight">{{
          formatPrice(dealPrice())
        }}</span>
      </div>

      <!-- Stock Pill -->
      <span
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-[#D96C2C] shadow-2xs border border-[#D96C2C]/30"
      >
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
        มีสินค้าในสต็อก {{ product.quantity }} ชิ้น
      </span>
    </div>

    <!-- Quantity Selector -->
    <div class="flex items-center gap-4 py-2 text-sm sm:text-base">
      <span class="font-semibold text-[#332820] shrink-0">จำนวนที่ต้องการ</span>
      <div
        class="flex items-center rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1 shadow-2xs"
      >
        <button
          type="button"
          class="h-9 w-9 flex items-center justify-center rounded-xl bg-white font-bold text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40 cursor-pointer text-base"
          :disabled="quantity <= 1"
          @click="decreaseQty"
        >
          -
        </button>
        <input
          v-model.number="quantity"
          type="number"
          class="w-14 text-center font-bold text-[#332820] bg-transparent outline-none text-base sm:text-lg"
          @blur="validateQty"
        />
        <button
          type="button"
          class="h-9 w-9 flex items-center justify-center rounded-lg bg-white font-bold text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40 cursor-pointer text-base"
          :disabled="quantity >= maxQuantity"
          @click="increaseQty"
        >
          +
        </button>
      </div>
      <span class="text-xs sm:text-sm text-[#786B62] font-medium">(สูงสุด {{ product.quantity }} ชิ้น)</span>
    </div>

    <!-- Action CTA Buttons -->
    <div class="grid grid-cols-2 gap-3.5 pt-2">
      <button
        type="button"
        class="py-4 px-5 rounded-2xl border-2 border-[#D96C2C] text-[#D96C2C] font-bold text-sm sm:text-base hover:bg-[#D96C2C]/10 transition active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        :disabled="adding || product.quantity <= 0"
        @click="emit('add-to-cart')"
      >
        <i class="mdi mdi-cart-outline text-xl text-[#D96C2C]"></i>
        <span>เพิ่มลงตะกร้า</span>
      </button>

      <button
        type="button"
        class="py-4 px-5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-bold text-sm sm:text-base shadow-xl transition active:scale-95 flex items-center justify-center gap-2 border-2 border-[#D96C2C] cursor-pointer"
        :disabled="buyingNow || product.quantity <= 0"
        @click="emit('buy-now')"
      >
        <i class="mdi mdi-lightning-bolt text-xl text-white"></i>
        <span class="!text-white font-bold">สั่งซื้อทันที</span>
      </button>
    </div>

    <!-- Guarantee Badges -->
    <div
      class="grid grid-cols-3 gap-2.5 pt-4 border-t-2 border-[#E8D9C9] text-xs font-medium text-[#332820]"
    >
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-shield-check-outline text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820] font-semibold">ชำระเงินปลอดภัย</span>
          <span class="text-[#786B62] font-normal text-xs">ระบบชำระเงินมาตรฐาน</span>
        </div>
      </div>
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-truck-delivery-outline text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820] font-semibold">จัดส่งรวดเร็ว</span>
          <span class="text-[#786B62] font-normal text-xs">1-3 วันทำการ</span>
        </div>
      </div>
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-sync text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820] font-semibold">คืนสินค้าได้</span>
          <span class="text-[#786B62] font-normal text-xs">ภายใน 7 วัน</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
