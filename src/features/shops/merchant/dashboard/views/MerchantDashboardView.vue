<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { getMerchantDashboardReport, type MerchantDashboardReport } from '@/features/shops/api'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

Chart.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const report = ref<MerchantDashboardReport | null>(null)
const loading = ref(true)
const chartDays = ref<7 | 30>(7)
const chartType = ref<'line' | 'bar'>('line')
const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null
const swal = useSwal()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatThaiDateShort(dateStr?: string) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  const yearStr = parts[0]
  const monthStr = parts[1]
  const dayStr = parts[2]
  if (parts.length === 3 && yearStr && monthStr && dayStr) {
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)
    const d = new Date(year, month, day)
    return d.toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }
  return dateStr
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'Paid':
    case 'Processing':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Shipped':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    case 'Cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-300'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300'
  }
}

function getOrderStatusText(status: string) {
  switch (status) {
    case 'Pending':
      return 'รอตรวจสอบ'
    case 'Paid':
      return 'ชำระแล้ว'
    case 'Processing':
      return 'กำลังเตรียมส่ง'
    case 'Shipped':
      return 'จัดส่งแล้ว'
    case 'Completed':
      return 'สำเร็จ'
    case 'Cancelled':
      return 'ยกเลิก'
    default:
      return status
  }
}

const totalFulfillmentOrders = computed(() => {
  if (!report.value?.fulfillment) return 0
  return report.value.fulfillment.deliveryOrdersCount + report.value.fulfillment.pickupOrdersCount
})

const deliveryPercent = computed(() => {
  if (totalFulfillmentOrders.value === 0) return 50
  return Math.round(
    (report.value!.fulfillment.deliveryOrdersCount / totalFulfillmentOrders.value) * 100,
  )
})

function renderChart() {
  if (!canvasRef.value || !report.value?.salesTrend) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const dataSlice = report.value.salesTrend.slice(-chartDays.value)
  const labels = dataSlice.map((x) => formatThaiDateShort(x.date))
  const revenues = dataSlice.map((x) => x.dailyRevenue)
  const orders = dataSlice.map((x) => x.ordersCount)

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const lineGradient = ctx.createLinearGradient(0, 0, 0, 320)
  lineGradient.addColorStop(0, 'rgba(217, 108, 44, 0.45)')
  lineGradient.addColorStop(0.6, 'rgba(217, 108, 44, 0.1)')
  lineGradient.addColorStop(1, 'rgba(217, 108, 44, 0.0)')

  const barGradient = ctx.createLinearGradient(0, 0, 0, 320)
  barGradient.addColorStop(0, '#D96C2C')
  barGradient.addColorStop(1, '#F2A65A')

  chartInstance = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels,
      datasets: [
        {
          label: 'ยอดขาย (บาท)',
          data: revenues,
          borderColor: '#D96C2C',
          backgroundColor: chartType.value === 'line' ? lineGradient : barGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FFF9F2',
          pointBorderColor: '#D96C2C',
          pointBorderWidth: 3,
          pointRadius: chartDays.value === 7 ? 6 : 4,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#D96C2C',
          pointHoverBorderColor: '#FFF',
          pointHoverBorderWidth: 3,
          yAxisID: 'y',
          borderRadius: chartType.value === 'bar' ? 8 : 0,
        },
        {
          type: 'line',
          label: 'จำนวนออเดอร์',
          data: orders,
          borderColor: '#786B62',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: chartDays.value === 7 ? 4 : 3,
          pointBackgroundColor: '#786B62',
          yAxisID: 'y1',
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: { family: 'sans-serif', size: 12, weight: 'bold' },
            color: '#332820',
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(23, 20, 18, 0.92)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 14,
          displayColors: true,
          callbacks: {
            label: function (context) {
              if (context.dataset.label === 'ยอดขาย (บาท)') {
                return ` 💰 ยอดขาย: ${new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.parsed.y ?? 0)}`
              }
              return ` 📋 ออเดอร์: ${context.parsed.y} รายการ`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#786B62', font: { size: 11, weight: 'bold' } },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(232, 217, 201, 0.6)' },
          ticks: {
            color: '#D96C2C',
            font: { size: 11, weight: 'bold' },
            callback: (val) => `฿${val}`,
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { display: false },
          ticks: {
            color: '#786B62',
            font: { size: 11, weight: 'bold' },
            stepSize: 1,
            precision: 0,
          },
        },
      },
    },
  })
}

async function load() {
  loading.value = true
  try {
    report.value = await getMerchantDashboardReport()
    loading.value = false
    await nextTick()
    renderChart()
  } catch (error) {
    loading.value = false
    await swal.error('โหลดข้อมูลภาพรวมไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

watch(canvasRef, (newCanvas) => {
  if (newCanvas && report.value) {
    renderChart()
  }
})

watch([chartDays, chartType], async () => {
  await nextTick()
  renderChart()
})

onMounted(load)
</script>

<template>
  <div class="space-y-7 text-[#332820] max-w-[1920px] mx-auto pb-12">
    <!-- Header Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-6">
      <div>
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C] mb-2"
        >
          <i class="mdi mdi-view-dashboard"></i> Merchant Overview
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">แดชบอร์ดภาพรวมร้านค้า</h1>
        <p class="mt-1 text-xs sm:text-sm text-[#786B62] font-semibold">
          สรุปยอดขาย ออเดอร์ล่าสุด กราฟวิเคราะห์แบบโต้ตอบ และข้อมูลสำคัญของร้านค้า
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#F2E5D5] border-2 border-[#E8D9C9] px-4 py-2.5 text-xs font-black text-[#332820] shadow-xs transition active:scale-95 cursor-pointer"
          :disabled="loading"
          @click="load"
        >
          <i
            class="mdi mdi-refresh text-base text-[#D96C2C]"
            :class="{ 'animate-spin': loading }"
          ></i>
          <span>รีเฟรชข้อมูล</span>
        </button>

        <RouterLink
          to="/my-shop/products/new"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
        >
          <i class="mdi mdi-plus text-lg text-white"></i>
          <span>เพิ่มสินค้าใหม่</span>
        </RouterLink>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="i in 4"
          :key="i"
          class="h-32 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>
      <div class="h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <template v-else-if="report">
      <!-- 1. KPI Summary Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Revenue Card -->
        <div
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                ยอดขายรวมทั้งหมด
              </p>
              <h2 class="mt-2 text-2xl font-black text-[#D96C2C]">
                {{ formatCurrency(report.summary.totalRevenue) }}
              </h2>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C]/15 text-[#D96C2C]"
            >
              <i class="mdi mdi-cash-multiple text-2xl"></i>
            </div>
          </div>
          <div
            class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold text-[#786B62]"
          >
            <span
              >วันนี้:
              <strong class="text-[#332820]">{{
                formatCurrency(report.summary.todayRevenue)
              }}</strong></span
            >
            <span
              >เดือนนี้:
              <strong class="text-[#332820]">{{
                formatCurrency(report.summary.monthRevenue)
              }}</strong></span
            >
          </div>
        </div>

        <!-- Total Orders Card -->
        <div
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                คำสั่งซื้อทั้งหมด
              </p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.totalOrders }}
                <span class="text-sm font-bold text-[#786B62]">ออเดอร์</span>
              </h2>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700"
            >
              <i class="mdi mdi-clipboard-text-clock text-2xl"></i>
            </div>
          </div>
          <div
            class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center gap-3 text-xs font-bold"
          >
            <span
              class="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
            >
              <i class="mdi mdi-clock-outline"></i> รอสลิป:
              {{ report.summary.pendingSlipOrdersCount }}
            </span>
            <span
              class="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
            >
              <i class="mdi mdi-truck-delivery-outline"></i> รอส่ง:
              {{ report.summary.pendingShipmentOrdersCount }}
            </span>
          </div>
        </div>

        <!-- Products Card -->
        <div
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">สินค้าในร้าน</p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.totalProducts }}
                <span class="text-sm font-bold text-[#786B62]">รายการ</span>
              </h2>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700"
            >
              <i class="mdi mdi-package-variant-closed text-2xl"></i>
            </div>
          </div>
          <div
            class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold"
          >
            <span
              :class="
                report.summary.lowStockProductsCount > 0
                  ? 'text-rose-600 font-bold'
                  : 'text-[#786B62]'
              "
            >
              <i class="mdi mdi-alert-circle-outline"></i> สต็อกต่ำ (≤5):
              {{ report.summary.lowStockProductsCount }} ชิ้น
            </span>
          </div>
        </div>

        <!-- Content Stories Card -->
        <div
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">
                เรื่องราว/คอนเทนต์
              </p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.totalContents }}
                <span class="text-sm font-bold text-[#786B62]">บทความ</span>
              </h2>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-700"
            >
              <i class="mdi mdi-text-box-multiple-outline text-2xl"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#E8D9C9]/60 text-xs text-[#786B62] font-semibold">
            <RouterLink
              to="/my-shop/contents/new"
              class="text-[#D96C2C] hover:underline font-bold flex items-center gap-1"
            >
              <i class="mdi mdi-plus-circle-outline"></i> เขียนเรื่องราวโปรโมตร้าน
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 2. HIGH-END CHARTJS ANALYTICS CANVAS CHART -->
      <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] text-white shadow-md">
              <i class="mdi mdi-chart-bell-curve-cumulative text-xl text-white"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-[#332820]">กราฟแนวโน้มยอดขาย & คำสั่งซื้อ</h2>
              <p class="text-xs text-[#786B62] font-semibold">
                แสดงผลเปรียบเทียบยอดขายเงินบาทและจำนวนคำสั่งซื้อรายวัน
              </p>
            </div>
          </div>

          <!-- Controls: Chart Type & Range Toggles -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Chart Type Toggle -->
            <div class="inline-flex rounded-2xl bg-[#E8D9C9]/50 p-1 border border-[#E8D9C9]">
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                :class="
                  chartType === 'line'
                    ? 'bg-[#332820] text-white shadow-xs'
                    : 'text-[#786B62] hover:text-[#332820]'
                "
                @click="chartType = 'line'"
              >
                <i class="mdi mdi-chart-line"></i> กราฟเส้น
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                :class="
                  chartType === 'bar'
                    ? 'bg-[#332820] text-white shadow-xs'
                    : 'text-[#786B62] hover:text-[#332820]'
                "
                @click="chartType = 'bar'"
              >
                <i class="mdi mdi-chart-bar"></i> กราฟแท่ง
              </button>
            </div>

            <!-- Time Range Selector Buttons -->
            <div class="inline-flex rounded-2xl bg-[#E8D9C9]/50 p-1 border border-[#E8D9C9]">
              <button
                type="button"
                class="px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                :class="
                  chartDays === 7
                    ? 'bg-[#D96C2C] text-white shadow-xs'
                    : 'text-[#786B62] hover:text-[#332820]'
                "
                @click="chartDays = 7"
              >
                7 วันล่าสุด
              </button>
              <button
                type="button"
                class="px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                :class="
                  chartDays === 30
                    ? 'bg-[#D96C2C] text-white shadow-xs'
                    : 'text-[#786B62] hover:text-[#332820]'
                "
                @click="chartDays = 30"
              >
                30 วันล่าสุด
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Container -->
        <div class="h-80 w-full relative pt-2">
          <canvas ref="canvasRef"></canvas>
        </div>
      </section>

      <!-- 3. Recent Actionable Orders & Quick Actions Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Left: Recent Orders (2 Cols) -->
        <div class="lg:col-span-2 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-clock-alert-outline text-[#D96C2C] text-2xl"></i>
              <div>
                <h2 class="text-lg font-black text-[#332820]">ออเดอร์ล่าสุดที่ต้องดำเนินการ</h2>
                <p class="text-xs text-[#786B62]">รายการคำสั่งซื้อล่าสุดที่รอตรวจสอบการชำระเงินหรือรอจัดส่ง</p>
              </div>
            </div>
            <RouterLink
              to="/my-shop/orders"
              class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <i class="mdi mdi-chevron-right"></i>
            </RouterLink>
          </div>

          <div v-if="report.recentOrders.length === 0" class="py-10 text-center text-xs text-[#786B62] font-semibold">
            ยังไม่มีรายการคำสั่งซื้อเข้ามาในขณะนี้
          </div>

          <div v-else class="divide-y divide-[#E8D9C9]">
            <div
              v-for="order in report.recentOrders"
              :key="order.orderId"
              class="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#F2E5D5]/40 px-2 rounded-xl transition"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-black text-sm text-[#332820]">{{ order.orderNumber }}</span>
                  <span
                    class="px-2.5 py-0.5 text-[10px] font-black rounded-full border"
                    :class="getOrderStatusBadge(order.orderStatus)"
                  >
                    {{ getOrderStatusText(order.orderStatus) }}
                  </span>
                  <span v-if="order.slipImageUrl" class="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <i class="mdi mdi-file-image-outline"></i> แนบสลิปแล้ว
                  </span>
                </div>
                <p class="text-xs text-[#786B62]">
                  ผู้ซื้อ: <strong class="text-[#332820]">{{ order.receiverName || 'ลูกค้าทั่วไป' }}</strong> | {{ order.itemsCount }} รายการ | {{ formatDate(order.createdAt) }}
                </p>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-sm font-black text-[#D96C2C]">
                  {{ formatCurrency(order.totalAmount) }}
                </span>
                <RouterLink
                  to="/my-shop/orders"
                  class="px-3 py-1.5 rounded-xl bg-[#D96C2C] text-white text-xs font-bold hover:bg-[#BF5720] transition cursor-pointer"
                >
                  จัดการออเดอร์
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Quick Actions & Low Stock Alerts -->
        <div class="space-y-6">
          <!-- Quick Menu Shortcuts -->
          <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs space-y-3">
            <h2 class="text-base font-black text-[#332820] flex items-center gap-2 border-b border-[#E8D9C9] pb-3">
              <i class="mdi mdi-lightning-bolt text-[#D96C2C]"></i> เมนูลัดจัดการร้าน
            </h2>
            <div class="grid grid-cols-2 gap-2.5">
              <RouterLink
                to="/my-shop/products/new"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8D9C9] hover:border-[#D96C2C] hover:bg-[#D96C2C]/5 transition text-center group cursor-pointer"
              >
                <i class="mdi mdi-plus-box text-2xl text-[#D96C2C] group-hover:scale-110 transition-transform"></i>
                <span class="text-xs font-black text-[#332820] mt-1">เพิ่มสินค้า</span>
              </RouterLink>
              <RouterLink
                to="/my-shop/contents/new"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8D9C9] hover:border-[#D96C2C] hover:bg-[#D96C2C]/5 transition text-center group cursor-pointer"
              >
                <i class="mdi mdi-square-edit-outline text-2xl text-[#D96C2C] group-hover:scale-110 transition-transform"></i>
                <span class="text-xs font-black text-[#332820] mt-1">เขียนบทความ</span>
              </RouterLink>
              <RouterLink
                to="/my-shop/orders"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8D9C9] hover:border-[#D96C2C] hover:bg-[#D96C2C]/5 transition text-center group cursor-pointer"
              >
                <i class="mdi mdi-format-list-checks text-2xl text-[#D96C2C] group-hover:scale-110 transition-transform"></i>
                <span class="text-xs font-black text-[#332820] mt-1">รายการคำสั่งซื้อ</span>
              </RouterLink>
              <RouterLink
                to="/my-shop/info"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8D9C9] hover:border-[#D96C2C] hover:bg-[#D96C2C]/5 transition text-center group cursor-pointer"
              >
                <i class="mdi mdi-store-cog-outline text-2xl text-[#D96C2C] group-hover:scale-110 transition-transform"></i>
                <span class="text-xs font-black text-[#332820] mt-1">ตั้งค่าร้านค้า</span>
              </RouterLink>
            </div>
          </div>

          <!-- Low Stock Alert Card -->
          <div class="rounded-3xl border-2 border-rose-200 bg-rose-50/50 p-5 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-rose-200 pb-3">
              <h2 class="text-base font-black text-rose-900 flex items-center gap-2">
                <i class="mdi mdi-alert-circle text-rose-600"></i> เตือนสินค้าสต็อกต่ำ
              </h2>
              <span class="text-xs font-bold text-rose-700">≤ 5 ชิ้น</span>
            </div>

            <div v-if="report.lowStockProducts.length === 0" class="py-4 text-center text-xs text-emerald-700 font-bold">
              ✅ สินค้าทุกรายการมีสต็อกพร้อมขาย
            </div>

            <div v-else class="space-y-2.5">
              <div
                v-for="prod in report.lowStockProducts"
                :key="prod.productId"
                class="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-rose-200 shadow-2xs"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <img
                    v-if="prod.imageUrl"
                    :src="imageUrl(prod.imageUrl)"
                    :alt="prod.productName"
                    class="h-9 w-9 rounded-xl object-cover shrink-0 border"
                  />
                  <div class="min-w-0">
                    <p class="text-xs font-black text-[#332820] truncate">{{ prod.productName }}</p>
                    <p class="text-[11px] font-semibold text-[#786B62]">{{ formatCurrency(prod.price) }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-black text-xs shrink-0">
                  เหลือ {{ prod.quantity }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. TOP PRODUCTS & REVIEWS / FULFILLMENT BELOW CHART -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Top Selling Products (1 Col) -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
            <h2 class="text-base font-black text-[#332820] flex items-center gap-2">
              <i class="mdi mdi-trophy-outline text-xl text-[#D96C2C]"></i>
              สินค้าขายดี 5 อันดับแรก
            </h2>
            <RouterLink to="/my-shop/products" class="text-xs font-black text-[#D96C2C] hover:underline">
              ทั้งหมด
            </RouterLink>
          </div>

          <div v-if="report.topProducts.length === 0" class="py-8 text-center text-xs text-[#786B62] font-semibold">
            ยังไม่มีข้อมูลสินค้าขายดีในขณะนี้
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(prod, index) in report.topProducts"
              :key="prod.productId"
              class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#E8D9C9]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs shrink-0"
                  :class="index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'"
                >
                  #{{ index + 1 }}
                </span>
                <img
                  v-if="prod.imageUrl"
                  :src="imageUrl(prod.imageUrl)"
                  :alt="prod.productName"
                  class="h-10 w-10 rounded-xl object-cover shrink-0 border"
                />
                <div class="min-w-0">
                  <p class="text-xs font-black text-[#332820] truncate">{{ prod.productName }}</p>
                  <p class="text-[11px] font-semibold text-[#786B62]">{{ formatCurrency(prod.price) }}</p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-xs font-black text-[#D96C2C]">ขายแล้ว {{ prod.totalUnitsSold }} ชิ้น</p>
                <p class="text-[11px] font-semibold text-[#786B62]">{{ formatCurrency(prod.totalRevenue) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shop Reviews & Rating (1 Col) -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
            <h2 class="text-base font-black text-[#332820] flex items-center gap-2">
              <i class="mdi mdi-star text-xl text-amber-500"></i>
              คะแนนและรีวิวล่าสุด
            </h2>
            <span class="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              ⭐ {{ report.reviewsSummary.averageRating }} / 5.0 ({{ report.reviewsSummary.totalReviews }} รีวิว)
            </span>
          </div>

          <div v-if="report.reviewsSummary.recentReviews.length === 0" class="py-8 text-center text-xs text-[#786B62] font-semibold">
            ยังไม่มีรีวิวสำหรับร้านค้าของคุณ
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="rev in report.reviewsSummary.recentReviews"
              :key="rev.reviewId"
              class="p-3 rounded-2xl bg-white border border-[#E8D9C9] space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-[#332820]">{{ rev.userName }}</span>
                <span class="text-amber-500 font-bold">
                  {{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}
                </span>
              </div>
              <p class="text-xs text-[#786B62] font-medium leading-snug">
                "{{ rev.comment }}"
              </p>
              <p class="text-[10px] text-[#786B62]/80 text-right">{{ formatDate(rev.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Fulfillment Breakdown & Merchant Growth Tips (1 Col) -->
        <div class="space-y-6">
          <!-- Fulfillment & AOV Card -->
          <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs space-y-4">
            <h2 class="text-base font-black text-[#332820] flex items-center gap-2 border-b border-[#E8D9C9] pb-3">
              <i class="mdi mdi-truck-check text-xl text-[#D96C2C]"></i>
              สัดส่วนจัดส่ง & มูลค่าออเดอร์
            </h2>

            <div class="space-y-2">
              <div class="flex justify-between text-xs font-bold text-[#332820]">
                <span>🚚 จัดส่งพัสดุ ({{ report.fulfillment.deliveryOrdersCount }})</span>
                <span>🏪 มารับที่ร้าน ({{ report.fulfillment.pickupOrdersCount }})</span>
              </div>
              <!-- Progress Bar -->
              <div class="h-3 w-full bg-amber-100 rounded-full overflow-hidden flex border border-[#E8D9C9]">
                <div class="bg-[#D96C2C] transition-all duration-500" :style="{ width: `${deliveryPercent}%` }"></div>
                <div class="bg-amber-400 flex-1"></div>
              </div>
            </div>

            <div class="pt-3 border-t border-[#E8D9C9] flex items-center justify-between text-xs">
              <span class="text-[#786B62] font-semibold">ยอดขายเฉลี่ยต่อออเดอร์ (AOV):</span>
              <strong class="font-black text-[#D96C2C] text-sm">{{ formatCurrency(report.fulfillment.averageOrderValue) }}</strong>
            </div>
          </div>

          <!-- Merchant Growth Tips Card -->
          <div class="rounded-3xl border-2 border-amber-200 bg-amber-50/60 p-5 text-xs text-[#332820] space-y-2 font-medium">
            <h3 class="font-black text-amber-900 text-sm flex items-center gap-1.5">
              <i class="mdi mdi-lightbulb-on text-amber-600 text-base"></i> เคล็ดลับเพิ่มยอดขายร้านค้า
            </h3>
            <ul class="space-y-1.5 text-[#786B62] font-semibold pt-1">
              <li>• ลงเรื่องราว/คอนเทนต์วิถีชีวิตร้านค้าเพื่อดึงดูดลูกค้าเข้าร้าน</li>
              <li>• ตรวจสอบสลิปโอนเงินและอัปเดตสถานะจัดส่งให้รวดเร็วเพื่อสร้างความประทับใจ</li>
              <li>• คอยสังเกตสินค้าสต็อกต่ำและเติมสินค้าให้พร้อมขายเสมอ</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #fff9f2;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d96c2c;
  border-radius: 9999px;
}
</style>
