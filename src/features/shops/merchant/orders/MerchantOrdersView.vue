<template>
  <div class="mx-auto w-full max-w-[1920px] space-y-6 py-4 text-[#332820] font-sans">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div
        class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
      <div
        v-for="i in 3"
        :key="i"
        class="h-44 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
    </div>

    <template v-else>
      <!-- HEADER BANNER CARD -->
      <AppPageHeader
        title="จัดการออเดอร์ลูกค้า"
        subtitle="ระบบคำนวณและกรองข้อมูลจาก Backend API โดยตรง ช่วยให้ประมวลผลรวดเร็ว"
        icon="mdi-clipboard-text-clock-outline"
        :count="orders.length"
      >
        <template #actions>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer border border-[#D96C2C]"
            @click="() => void load(true)"
          >
            <i class="mdi mdi-refresh text-base text-white"></i>
            <span class="!text-white font-black">รีเฟรชออเดอร์</span>
          </button>
        </template>
      </AppPageHeader>

      <!-- MERCHANT SUMMARY STAT CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AppStatCard
          title="ออเดอร์ทั้งหมด"
          :value="allOrdersForStats.length"
          icon="mdi-package-variant"
          color-scheme="default"
          :active="selectedFilter === 'all'"
          @click="selectedFilter = 'all'"
        />

        <AppStatCard
          title="ชำระแล้ว (พร้อมจัดส่ง)"
          :value="totalPaidCount"
          icon="mdi-check-circle-outline"
          color-scheme="emerald"
          :active="selectedFilter === 'paid'"
          @click="selectedFilter = 'paid'"
        />

        <AppStatCard
          title="รอชำระเงิน"
          :value="totalPendingCount"
          icon="mdi-clock-outline"
          color-scheme="amber"
          :active="selectedFilter === 'pending_payment'"
          @click="selectedFilter = 'pending_payment'"
        />

        <AppStatCard
          title="จัดส่งแล้ว"
          :value="totalShippedCount"
          icon="mdi-truck-delivery-outline"
          color-scheme="sky"
          :active="selectedFilter === 'Shipped'"
          @click="selectedFilter = 'Shipped'"
        />
      </div>

      <!-- FILTER TOOLBAR: STATUS TABS, DATE PICKER & SEARCH -->
      <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs space-y-4">
        <!-- ROW 1: STATUS TABS & SEARCH BAR -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="
                selectedFilter === 'all'
                  ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
                  : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C]'
              "
              @click="selectedFilter = 'all'"
            >
              <span>ทั้งหมด</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="
                selectedFilter === 'paid'
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                  : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-emerald-500'
              "
              @click="selectedFilter = 'paid'"
            >
              <i class="mdi mdi-check-circle-outline"></i>
              <span>ชำระเงินแล้ว</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="
                selectedFilter === 'pending_payment'
                  ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                  : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-amber-500'
              "
              @click="selectedFilter = 'pending_payment'"
            >
              <i class="mdi mdi-clock-outline"></i>
              <span>รอชำระเงิน</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="
                selectedFilter === 'Shipped'
                  ? 'border-sky-600 bg-sky-600 text-white shadow-md'
                  : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-sky-500'
              "
              @click="selectedFilter = 'Shipped'"
            >
              <i class="mdi mdi-truck-delivery-outline"></i>
              <span>จัดส่งแล้ว</span>
            </button>
          </div>

          <!-- Order Number Search Input -->
          <div class="relative min-w-[220px]">
            <input
              v-model="searchNumber"
              type="text"
              placeholder="ค้นหาเลขคำสั่งซื้อ..."
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] transition"
            />
            <i
              class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"
            ></i>
            <button
              v-if="searchNumber"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
              @click="searchNumber = ''"
            >
              <i class="mdi mdi-close-circle text-base"></i>
            </button>
          </div>
        </div>

        <!-- ROW 2: DATE RANGE PICKER FILTER BAR -->
        <div class="pt-3 border-t-2 border-[#E8D9C9]">
          <AppDateRangeFilter
            v-model:preset="datePreset"
            v-model:start-date="startDate"
            v-model:end-date="endDate"
            @clear="clearDateFilter"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="allOrdersForStats.length === 0"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-16 px-6 text-center shadow-xs"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-4 border border-[#D96C2C]/30"
        >
          <i class="mdi mdi-clipboard-text-off-outline text-4xl"></i>
        </div>
        <h2 class="text-xl font-black text-[#332820]">ยังไม่มีรายการคำสั่งซื้อเข้ามาในร้าน</h2>
        <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
          เมื่อมีลูกค้าสั่งซื้อสินค้าจากร้านค้าของคุณ รายการคำสั่งซื้อจะปรากฏที่หน้านี้โดยอัตโนมัติ
        </p>
      </div>

      <!-- Empty Search/Filter Match -->
      <div
        v-else-if="orders.length === 0"
        class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center text-[#786B62] font-semibold shadow-xs"
      >
        <i class="mdi mdi-text-box-search-outline text-4xl text-[#D96C2C] mb-2 block"></i>
        <p class="font-black text-[#332820]">ไม่พบรายการออเดอร์ในเงื่อนไขและช่วงเวลานี้</p>
        <button
          type="button"
          class="mt-3 text-xs font-black text-[#D96C2C] hover:underline"
          @click="
            () => {
              selectedFilter = 'all'
              searchNumber = ''
              clearDateFilter()
            }
          "
        >
          ล้างตัวกรองและค้นหาใหม่
        </button>
      </div>

      <!-- ORDERS LIST CARDS -->
      <div v-else class="space-y-5">
        <MerchantOrderCard
          v-for="order in orders"
          :key="order.orderId"
          :order="order"
          :order-status-options="orderStatusOptions"
          :updating-id="updatingId"
          @update-status="handleUpdateStatus"
          @ship-order="handleShipOrder"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import http from '@/shared/api/http'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import AppStatCard from '@/shared/components/AppStatCard.vue'
import AppDateRangeFilter, { type DatePreset } from '@/shared/components/AppDateRangeFilter.vue'
import MerchantOrderCard, { type OrderItem } from './components/MerchantOrderCard.vue'

const orderStatusOptions = [
  { title: 'ยืนยันออเดอร์', value: 'Confirmed' },
  { title: 'สำเร็จ', value: 'Completed' },
  { title: 'ยกเลิก', value: 'Cancelled' },
]

const orders = ref<OrderItem[]>([])
const allOrdersForStats = ref<OrderItem[]>([])
const loading = ref(true)
const fetching = ref(false)
const updatingId = ref<string | null>(null)
const selectedFilter = ref<string>('all')
const searchNumber = ref<string>('')

// Date Filter States
const datePreset = ref<DatePreset>('all')
const startDate = ref<string>('')
const endDate = ref<string>('')

const swal = useSwal()

// Load API with Backend Filtering
async function load(isInitial = false) {
  if (isInitial) {
    loading.value = true
  } else {
    fetching.value = true
  }
  try {
    const params: Record<string, any> = {}

    if (selectedFilter.value !== 'all') {
      params.status = selectedFilter.value
    }
    if (searchNumber.value.trim()) {
      params.search = searchNumber.value.trim()
    }

    // Date filter params passed directly to Backend C# API
    if (datePreset.value === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      params.startDate = todayStr
      params.endDate = todayStr
    } else if (datePreset.value === '7days') {
      const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      params.startDate = past7
    } else if (datePreset.value === '30days') {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      params.startDate = past30
    } else if (datePreset.value === 'custom') {
      if (startDate.value) params.startDate = startDate.value
      if (endDate.value) params.endDate = endDate.value
    }

    const { data } = await http.get<OrderItem[]>('/orders/shop/mine', { params })
    orders.value = data
    if (isInitial || !allOrdersForStats.value.length) {
      allOrdersForStats.value = data
    }
  } catch (error) {
    await swal.error('โหลดออเดอร์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
    fetching.value = false
  }
}

// Refetch from Backend API smoothly
watch([selectedFilter, searchNumber, datePreset, startDate, endDate], () => {
  void load(false)
})

const totalPaidCount = computed(
  () => allOrdersForStats.value.filter((o) => o.paymentStatus === 'Paid').length,
)
const totalPendingCount = computed(
  () => allOrdersForStats.value.filter((o) => o.paymentStatus !== 'Paid').length,
)
const totalShippedCount = computed(
  () =>
    allOrdersForStats.value.filter(
      (o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Completed',
    ).length,
)

function clearDateFilter() {
  datePreset.value = 'all'
  startDate.value = ''
  endDate.value = ''
}

async function handleUpdateStatus({ order, status }: { order: OrderItem; status: string }) {
  updatingId.value = order.orderId
  try {
    await http.patch(`/orders/${order.orderId}/status`, { status })
    order.orderStatus = status
    const statusTitle = orderStatusOptions.find((opt) => opt.value === status)?.title || status
    await swal.success('อัปเดตสถานะออเดอร์แล้ว', `เปลี่ยนสถานะเป็น "${statusTitle}" เรียบร้อยแล้ว`)
  } catch (error) {
    await swal.error('อัปเดตไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updatingId.value = null
  }
}

async function handleShipOrder({
  order,
  provider,
  trackingNumber,
}: {
  order: OrderItem
  provider: string
  trackingNumber: string
}) {
  if (!provider || !trackingNumber) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุบริษัทขนส่งและเลขพัสดุ')
    return
  }

  updatingId.value = order.orderId
  try {
    await http.put(`/orders/${order.orderId}/shipment`, {
      shippingProvider: provider,
      trackingNumber: trackingNumber,
    })
    order.orderStatus = 'Shipped'
    await swal.success('บันทึกการจัดส่งแล้ว', 'ระบบอัปเดตเลขพัสดุและแจ้งลูกค้าเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('บันทึกการจัดส่งไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updatingId.value = null
  }
}

onMounted(() => void load(true))
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
