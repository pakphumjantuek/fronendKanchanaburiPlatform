<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  TotalPrice: number
}

export interface OrderShipment {
  shippingProvider?: string | null
  trackingNumber?: string | null
  shippingStatus?: string
  shippedAt?: string | null
  deliveredAt?: string | null
}

export interface RichOrder {
  orderId: string
  shopId: string
  shopName?: string | null
  shopLogoUrl?: string | null
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingMethod: string
  orderStatus: string
  paymentStatus: string
  paymentExpiresAt?: string | null
  createdAt: string
  receiverName?: string | null
  receiverPhone?: string | null
  shippingAddress?: string | null
  items: OrderItem[]
  shipment?: OrderShipment | null
}

interface Props {
  orders: RichOrder[]
  loading?: boolean
}

const props = defineProps<Props>()

const selectedTab = ref<'all' | 'to_pay' | 'to_ship' | 'to_receive' | 'completed' | 'cancelled'>(
  'all',
)
const searchQuery = ref('')
const timePeriod = ref('all')
const now = ref(Date.now())
let paymentTimer: ReturnType<typeof setInterval> | undefined

function toUtcMilliseconds(value: string) {
  const isoValue = value.replace(' ', 'T')
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(isoValue) ? isoValue : `${isoValue}Z`).getTime()
}

function paymentExpiry(order: RichOrder) {
  return order.paymentExpiresAt
    ? toUtcMilliseconds(order.paymentExpiresAt)
    : toUtcMilliseconds(order.createdAt) + 30 * 60 * 1000
}

function isAwaitingPayment(order: RichOrder) {
  return order.orderStatus === 'Pending' && order.paymentStatus === 'Pending'
}

function isPaymentExpired(order: RichOrder) {
  return (
    order.orderStatus === 'Expired' ||
    order.paymentStatus === 'Expired' ||
    (isAwaitingPayment(order) && paymentExpiry(order) <= now.value)
  )
}

function paymentDeadlineText(order: RichOrder) {
  if (isPaymentExpired(order)) return 'หมดเวลาชำระเงินแล้ว กรุณาสั่งซื้อสินค้าใหม่อีกครั้ง'
  const seconds = Math.ceil((paymentExpiry(order) - now.value) / 1000)
  return `กรุณาชำระภายใน ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} นาที`
}

onMounted(() => {
  paymentTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  if (paymentTimer) clearInterval(paymentTimer)
})

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string | null) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Counts for filter pills
const counts = computed(() => {
  return {
    all: props.orders.length,
    to_pay: props.orders.filter((o) => isAwaitingPayment(o) && !isPaymentExpired(o)).length,
    to_ship: props.orders.filter(
      (o) =>
        o.paymentStatus === 'Paid' &&
        (o.orderStatus === 'Confirmed' || o.orderStatus === 'Pending'),
    ).length,
    to_receive: props.orders.filter((o) => o.orderStatus === 'Shipped').length,
    completed: props.orders.filter((o) => o.orderStatus === 'Completed').length,
    cancelled: props.orders.filter((o) => o.orderStatus === 'Cancelled').length,
  }
})

// Filtered and searched orders
const filteredOrders = computed(() => {
  let list = props.orders

  // Status Filter
  if (selectedTab.value === 'to_pay') {
    list = list.filter((o) => isAwaitingPayment(o) && !isPaymentExpired(o))
  } else if (selectedTab.value === 'to_ship') {
    list = list.filter(
      (o) =>
        o.paymentStatus === 'Paid' &&
        (o.orderStatus === 'Confirmed' || o.orderStatus === 'Pending'),
    )
  } else if (selectedTab.value === 'to_receive') {
    list = list.filter((o) => o.orderStatus === 'Shipped')
  } else if (selectedTab.value === 'completed') {
    list = list.filter((o) => o.orderStatus === 'Completed')
  } else if (selectedTab.value === 'cancelled') {
    list = list.filter((o) => o.orderStatus === 'Cancelled')
  }

  // Search Query (Order number, shop name, product name)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.shopName && o.shopName.toLowerCase().includes(q)) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q)),
    )
  }

  return list
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Header Banner of Orders (Matching Reference Image) -->
    <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4"
      >
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-[#332820]">การซื้อของฉัน</h2>
            <span
              class="rounded-full bg-[#D96C2C]/15 px-2.5 py-0.5 text-xs font-black text-[#D96C2C] border border-[#D96C2C]/30"
            >
              {{ props.orders.length }} รายการ
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
            ตรวจสอบสถานะการจัดส่ง ติดตามพัสดุ และจัดการคำสั่งซื้อทั้งหมดของคุณ
          </p>
        </div>

        <RouterLink
          to="/shops"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 border-[#E8D9C9] bg-white hover:border-[#D96C2C] hover:bg-[#F7F0E6] text-xs font-black text-[#332820] shadow-2xs transition active:scale-95 shrink-0"
        >
          <i class="mdi mdi-storefront text-sm text-[#D96C2C]"></i>
          <span>เลือกซื้อสินค้าเพิ่ม</span>
        </RouterLink>
      </div>

      <!-- Horizontal Tabs (Styled like Reference Image) -->
      <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-4 no-scrollbar">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'all'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'all'"
        >
          <span>ทั้งหมด</span>
          <span
            v-if="counts.all > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'all' ? 'bg-white/30 text-white' : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ counts.all }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'to_pay'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'to_pay'"
        >
          <span>ที่ต้องชำระ</span>
          <span
            v-if="counts.to_pay > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'to_pay' ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-900'
            "
          >
            {{ counts.to_pay }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'to_ship'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'to_ship'"
        >
          <span>ที่ต้องจัดส่ง</span>
          <span
            v-if="counts.to_ship > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'to_ship' ? 'bg-white/30 text-white' : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ counts.to_ship }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'to_receive'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'to_receive'"
        >
          <span>ที่ต้องได้รับ</span>
          <span
            v-if="counts.to_receive > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'to_receive' ? 'bg-white/30 text-white' : 'bg-sky-200 text-sky-900'
            "
          >
            {{ counts.to_receive }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'completed'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'completed'"
        >
          <span>สำเร็จแล้ว</span>
          <span
            v-if="counts.completed > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'completed'
                ? 'bg-white/30 text-white'
                : 'bg-emerald-200 text-emerald-900'
            "
          >
            {{ counts.completed }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="
            selectedTab === 'cancelled'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] hover:bg-[#E8D9C9]/60 hover:text-[#332820]'
          "
          @click="selectedTab = 'cancelled'"
        >
          <span>ยกเลิกแล้ว</span>
          <span
            v-if="counts.cancelled > 0"
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="
              selectedTab === 'cancelled' ? 'bg-white/30 text-white' : 'bg-rose-200 text-rose-900'
            "
          >
            {{ counts.cancelled }}
          </span>
        </button>
      </div>

      <!-- Search & Filter Bar (Matching Reference Image) -->
      <div class="pt-4 flex flex-col sm:flex-row items-center gap-3">
        <div class="relative w-full flex-1">
          <i
            class="mdi mdi-magnify absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white py-2.5 pl-10 pr-4 text-xs font-black text-[#332820] outline-none placeholder:font-semibold placeholder:text-slate-400 focus:border-[#D96C2C]"
            placeholder="ค้นหาด้วยชื่อร้านค้า, หมายเลขคำสั่งซื้อ หรือชื่อสินค้า..."
          />
        </div>

        <select
          v-model="timePeriod"
          class="w-full sm:w-44 rounded-2xl border-2 border-[#E8D9C9] bg-white py-2.5 px-3 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] cursor-pointer"
        >
          <option value="all">คำสั่งซื้อทั้งหมด</option>
          <option value="3m">3 เดือนล่าสุด</option>
          <option value="6m">6 เดือนล่าสุด</option>
          <option value="year">ปีนี้ (2026)</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!filteredOrders.length"
      class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] p-16 text-center shadow-xs space-y-4"
    >
      <div
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C]"
      >
        <i class="mdi mdi-receipt-text-remove-outline text-4xl"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-black text-[#332820]">ไม่พบคำสั่งซื้อในสถานะนี้</h3>
        <p class="text-xs text-[#786B62] font-semibold">
          คุณสามารถเลือกชมสินค้าชุมชนและของฝากจากร้านค้าต่างๆ ในเมืองกาญจน์ได้ตลอดเวลา
        </p>
      </div>
      <div class="pt-2">
        <RouterLink
          to="/shops"
          class="inline-flex items-center gap-2 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95"
        >
          <i class="mdi mdi-storefront text-sm text-white"></i>
          <span class="!text-white">สำรวจร้านค้าและสินค้า</span>
        </RouterLink>
      </div>
    </div>

    <!-- Order Cards List (Ecommerce Marketplace Format Like SiamMall / Shopee) -->
    <div v-else class="space-y-5">
      <article
        v-for="order in filteredOrders"
        :key="order.orderId"
        class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-xs transition hover:shadow-md hover:border-[#D96C2C]"
      >
        <!-- 1. Shop Header Bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E8D9C9] bg-white px-5 py-3.5 sm:px-6"
        >
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5 font-black text-sm text-[#332820]">
              <i class="mdi mdi-store text-base text-[#D96C2C]"></i>
              <span>{{ order.shopName || 'ร้านค้าชุมชนกาญจนบุรี' }}</span>
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white"
            >
              <i class="mdi mdi-check-decagram text-[11px]"></i>
              ร้านค้าแนะนำ
            </span>

            <RouterLink
              v-if="order.shopId"
              :to="`/shops/${order.shopId}`"
              class="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#786B62] hover:text-[#D96C2C] transition border-l pl-3 border-[#E8D9C9]"
            >
              <i class="mdi mdi-store-outline"></i>
              <span>ไปที่หน้าร้าน</span>
            </RouterLink>
          </div>

          <!-- Fulfillment & Payment Status Text -->
          <div class="flex items-center gap-2 text-xs font-black">
            <!-- Payment Badge -->
            <span
              v-if="order.paymentStatus !== 'Paid'"
              class="px-2.5 py-0.5 rounded-full border"
              :class="
                isPaymentExpired(order)
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : 'border-amber-300 bg-amber-50 text-amber-700'
              "
            >
              {{ isPaymentExpired(order) ? 'หมดเวลาชำระเงินแล้ว' : 'รอชำระเงิน' }}
            </span>

            <!-- Status Text on Far Right -->
            <div class="flex items-center gap-1 text-sm font-black">
              <template v-if="isPaymentExpired(order)">
                <i class="mdi mdi-clock-remove-outline text-slate-600 text-base"></i>
                <span class="text-slate-700">หมดเวลาชำระเงินแล้ว</span>
              </template>
              <template v-else-if="order.orderStatus === 'Shipped'">
                <i class="mdi mdi-truck-fast text-sky-600 text-base"></i>
                <span class="text-sky-700">พัสดุกำลังอยู่ระหว่างการจัดส่ง</span>
              </template>
              <template v-else-if="order.orderStatus === 'Completed'">
                <i class="mdi mdi-check-circle text-emerald-600 text-base"></i>
                <span class="text-emerald-700">จัดส่งสำเร็จแล้ว</span>
              </template>
              <template v-else-if="order.orderStatus === 'Cancelled'">
                <i class="mdi mdi-close-circle text-rose-600 text-base"></i>
                <span class="text-rose-700">ยกเลิกคำสั่งซื้อแล้ว</span>
              </template>
              <template v-else>
                <i class="mdi mdi-clock-outline text-[#D96C2C] text-base"></i>
                <span class="text-[#D96C2C]">{{
                  order.paymentStatus === 'Paid' ? 'ร้านกำลังเตรียมสินค้า' : 'รอยืนยันคำสั่งซื้อ'
                }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- 2. Shipment Tracking Bar (If Shipped / Has tracking) -->
        <div
          v-if="isAwaitingPayment(order) || isPaymentExpired(order)"
          class="border-b border-[#E8D9C9] px-5 py-3 text-sm font-bold sm:px-6"
          :class="
            isPaymentExpired(order) ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-900'
          "
        >
          <i
            :class="[
              'mdi mr-1.5 text-lg',
              isPaymentExpired(order) ? 'mdi-clock-remove-outline' : 'mdi-clock-outline',
            ]"
          ></i
          >{{ paymentDeadlineText(order) }}
        </div>
        <div
          v-if="order.shipment || order.orderStatus === 'Shipped'"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8D9C9] bg-sky-50/70 px-5 py-2.5 sm:px-6 text-xs text-sky-950 font-semibold"
        >
          <div class="flex items-center gap-2">
            <i class="mdi mdi-package-variant-closed text-sky-700 text-base"></i>
            <span>
              <strong
                >{{ order.shipment?.shippingProvider || 'ขนส่งเอกชน (Flash Express)' }}:</strong
              >
              หมายเลขพัสดุ
              <code class="font-mono font-bold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded">
                {{
                  order.shipment?.trackingNumber ||
                  `TH${order.orderNumber.replace(/\D/g, '').slice(-10)}`
                }}
              </code>
            </span>
          </div>
          <span class="text-[11px] text-sky-800">
            {{
              order.shipment?.shippedAt
                ? `จัดส่งเมื่อ: ${formatDate(order.shipment.shippedAt)}`
                : 'พัสดุเตรียมนำส่งให้ลูกค้า'
            }}
          </span>
        </div>

        <!-- 3. Product Items List -->
        <div class="divide-y divide-[#E8D9C9] px-5 sm:px-6">
          <!-- Fallback single row if items list is empty -->
          <div v-if="!order.items.length" class="flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
              <div
                class="h-16 w-16 rounded-2xl bg-[#171412] flex items-center justify-center text-slate-400"
              >
                <i class="mdi mdi-package-variant text-2xl text-[#D96C2C]"></i>
              </div>
              <div>
                <h4 class="font-black text-[#332820] text-sm">
                  คำสั่งซื้อสินค้า #{{ order.orderNumber }}
                </h4>
                <p class="text-xs text-[#786B62] font-semibold mt-0.5">
                  สินค้าจากร้านค้าชุมชนเมืองกาญจน์
                </p>
                <span class="text-xs text-[#786B62] font-semibold">จำนวน: x1</span>
              </div>
            </div>
            <span class="font-black text-sm text-[#332820]">
              ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
            </span>
          </div>

          <!-- Items loop -->
          <div
            v-for="item in order.items"
            :key="item.orderItemId"
            class="flex items-start sm:items-center justify-between gap-4 py-4"
          >
            <div class="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              <div
                class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#171412] overflow-hidden shrink-0 border border-[#E8D9C9]"
              >
                <img
                  v-if="item.imageUrl"
                  :src="imageUrl(item.imageUrl)"
                  :alt="item.productName"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-slate-400">
                  <i class="mdi mdi-shopping-outline text-2xl text-[#D96C2C]"></i>
                </div>
              </div>

              <div class="min-w-0 flex-1 space-y-1">
                <h4 class="font-black text-[#332820] text-sm line-clamp-1">
                  {{ item.productName }}
                </h4>
                <p class="text-xs text-[#786B62] font-semibold">
                  ตัวเลือก: สินค้าคุณภาพดีเมืองกาญจน์
                </p>
                <div class="text-xs text-[#786B62] font-semibold">
                  จำนวน: <span class="font-bold text-[#332820]">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="font-black text-sm sm:text-base text-[#332820] block">
                ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }}
              </span>
              <span v-if="item.quantity > 1" class="text-[11px] text-[#786B62] font-semibold">
                รวม ฿
                {{
                  Number(item.TotalPrice || item.unitPrice * item.quantity).toLocaleString('th-TH')
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Card Bottom Summary & Actions Bar -->
        <div class="border-t-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:px-6 space-y-4">
          <!-- Protection & Total Price Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-1.5 text-emerald-800 font-bold">
              <i class="mdi mdi-shield-check text-base text-emerald-600"></i>
              <span>การคุ้มครอง Kanchanaburi Protection: การันตีความปลอดภัยและคุณภาพ</span>
            </div>

            <div class="text-left sm:text-right">
              <span class="text-xs text-[#786B62] font-semibold">
                ยอดคำสั่งซื้อทั้งหมด ({{ order.items.reduce((s, i) => s + i.quantity, 0) || 1 }}
                ชิ้น):
              </span>
              <span class="text-lg sm:text-xl font-black text-[#D96C2C] ml-1.5">
                ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
              </span>
              <span class="text-[11px] text-[#786B62] block font-semibold">
                (รวมค่าจัดส่ง {{ order.shippingFee > 0 ? `฿${order.shippingFee}` : 'ฟรี' }} แล้ว)
              </span>
            </div>
          </div>

          <!-- Buttons Row (Like Reference Image) -->
          <div
            v-if="!isPaymentExpired(order)"
            class="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#E8D9C9]/60"
          >
            <!-- View Order Detail Link -->
            <RouterLink
              :to="`/orders/${order.orderId}`"
              class="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#E8D9C9] bg-white px-4 py-2 text-xs font-black text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C] hover:bg-[#F7F0E6] transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <i class="mdi mdi-receipt-text-outline text-xs"></i>
              <span>ดูรายละเอียดคำสั่งซื้อ</span>
            </RouterLink>

            <!-- Pay Now CTA (If Not Paid) -->
            <RouterLink
              v-if="order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled'"
              :to="`/orders/${order.orderId}/pay`"
              class="inline-flex items-center gap-1.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer border border-[#D96C2C]"
            >
              <i class="mdi mdi-credit-card-outline text-white"></i>
              <span class="!text-white">ชำระเงินตอนนี้</span>
            </RouterLink>

            <!-- Track Shipment CTA (If Shipped) -->
            <RouterLink
              v-else-if="order.orderStatus === 'Shipped'"
              :to="`/orders/${order.orderId}`"
              class="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              <i class="mdi mdi-truck-fast text-white"></i>
              <span class="!text-white">ติดตามสถานะพัสดุ</span>
            </RouterLink>

            <!-- Buy Again (If Completed) -->
            <RouterLink
              v-else-if="order.orderStatus === 'Completed' && order.shopId"
              :to="`/shops/${order.shopId}`"
              class="inline-flex items-center gap-1.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              <i class="mdi mdi-cart-plus text-white"></i>
              <span class="!text-white">ซื้ออีกครั้ง</span>
            </RouterLink>
          </div>
          <p
            v-else
            class="border-t border-[#E8D9C9] pt-3 text-right text-sm font-bold text-slate-600"
          >
            คำสั่งซื้อนี้หมดเวลาชำระเงินแล้ว กรุณาทำรายการสั่งซื้อใหม่
          </p>
        </div>
      </article>
    </div>
  </div>
</template>
