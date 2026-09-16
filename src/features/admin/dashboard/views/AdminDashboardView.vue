<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
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
import {
  getAdminDashboardReport,
  exportAdminOrders,
  exportAdminShopSales,
  exportAdminPayouts,
  exportAdminPaymentSlips,
  type AdminDashboardReport,
  type AdminExportParams,
} from '@/features/admin/api/adminDashboardApi'
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

const swal = useSwal()
const report = ref<AdminDashboardReport | null>(null)
const loading = ref(true)
const exportLoading = ref(false)

// Date Filter states
const fromDate = ref('')
const toDate = ref('')
const activePreset = ref<'all' | 'this_month' | '7_days' | '30_days' | 'this_year' | 'custom'>('all')

// Chart states
const chartType = ref<'line' | 'bar'>('line')
const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Export Modal state
const showExportModal = ref(false)
const exportType = ref<'orders' | 'shop-sales' | 'payouts' | 'payment-slips'>('orders')
const exportFormat = ref<'csv' | 'pdf'>('csv')
const exportShopId = ref('')
const exportOrderStatus = ref('')
const exportPaymentStatus = ref('')
const exportPayoutStatus = ref('')

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function formatDate(dateStr?: string) {
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
  const isoPart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const parts = isoPart ? isoPart.split('-') : []
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const d = new Date(year, month, day)
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    })
  }
  return dateStr
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'Pending':
    case 'PendingPayment':
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
    case 'PendingPayment':
      return 'รอชำระเงิน'
    case 'PendingVerification':
      return 'รอตรวจสลิป'
    case 'Paid':
      return 'ชำระแล้ว'
    case 'Processing':
      return 'กำลังเตรียมจัดส่ง'
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

// Preset helper functions
function applyPreset(preset: 'all' | 'this_month' | '7_days' | '30_days' | 'this_year') {
  activePreset.value = preset
  const today = new Date()
  const formatDateString = (d: Date): string => d.toISOString().slice(0, 10)

  if (preset === 'all') {
    fromDate.value = ''
    toDate.value = ''
  } else if (preset === '7_days') {
    const past = new Date()
    past.setDate(today.getDate() - 6)
    fromDate.value = formatDateString(past)
    toDate.value = formatDateString(today)
  } else if (preset === '30_days') {
    const past = new Date()
    past.setDate(today.getDate() - 29)
    fromDate.value = formatDateString(past)
    toDate.value = formatDateString(today)
  } else if (preset === 'this_month') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    fromDate.value = formatDateString(firstDay)
    toDate.value = formatDateString(today)
  } else if (preset === 'this_year') {
    const firstDay = new Date(today.getFullYear(), 0, 1)
    fromDate.value = formatDateString(firstDay)
    toDate.value = formatDateString(today)
  }
  loadData()
}

function renderChart() {
  if (!canvasRef.value || !report.value?.salesTrend) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const dataSlice = report.value.salesTrend
  const labels = dataSlice.map((x) => formatThaiDateShort(x.date))
  const revenues = dataSlice.map((x) => x.sales)
  const orders = dataSlice.map((x) => x.orders)

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const lineGradient = ctx.createLinearGradient(0, 0, 0, 320)
  lineGradient.addColorStop(0, 'rgba(217, 108, 44, 0.45)')
  lineGradient.addColorStop(0.6, 'rgba(217, 108, 44, 0.08)')
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
          label: 'ยอดขายรวม (บาท)',
          data: revenues,
          borderColor: '#D96C2C',
          backgroundColor: chartType.value === 'line' ? lineGradient : barGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#FFF',
          pointBorderColor: '#D96C2C',
          pointBorderWidth: 3,
          pointRadius: labels.length > 20 ? 3 : 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#D96C2C',
          pointHoverBorderColor: '#FFF',
          pointHoverBorderWidth: 3,
          yAxisID: 'y',
          borderRadius: chartType.value === 'bar' ? 6 : 0,
        },
        {
          type: 'line',
          label: 'จำนวนออเดอร์ (รายการ)',
          data: orders,
          borderColor: '#332820',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: labels.length > 20 ? 2 : 4,
          pointBackgroundColor: '#332820',
          yAxisID: 'y1',
          tension: 0.2,
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
              if (context.dataset.label?.includes('ยอดขาย')) {
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
            color: '#332820',
            font: { size: 11, weight: 'bold' },
            stepSize: 1,
            precision: 0,
          },
        },
      },
    },
  })
}

async function loadData() {
  loading.value = true
  try {
    report.value = await getAdminDashboardReport(fromDate.value, toDate.value)
    loading.value = false
    await nextTick()
    renderChart()
  } catch (error) {
    loading.value = false
    await swal.error('โหลดข้อมูล Admin Dashboard ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function handleExport() {
  exportLoading.value = true
  try {
    const params: AdminExportParams = {
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
      format: exportFormat.value,
      shopId: exportShopId.value || undefined,
      orderStatus: exportOrderStatus.value || undefined,
      paymentStatus: exportPaymentStatus.value || undefined,
      payoutStatus: exportPayoutStatus.value || undefined,
    }

    if (exportType.value === 'orders') {
      await exportAdminOrders(params)
    } else if (exportType.value === 'shop-sales') {
      await exportAdminShopSales(params)
    } else if (exportType.value === 'payouts') {
      await exportAdminPayouts(params)
    } else if (exportType.value === 'payment-slips') {
      await exportAdminPaymentSlips(params)
    }

    exportLoading.value = false
    showExportModal.value = false
    await swal.success('ส่งออกรายงานสำเร็จ', `ดาวน์โหลดไฟล์ ${exportFormat.value.toUpperCase()} เรียบร้อยแล้ว`)
  } catch (error) {
    exportLoading.value = false
    await swal.error('ส่งออกรายงานไม่สำเร็จ', getApiErrorMessage(error, 'เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน'))
  }
}

watch(canvasRef, (newCanvas) => {
  if (newCanvas && report.value) {
    renderChart()
  }
})

watch(chartType, async () => {
  await nextTick()
  renderChart()
})

onMounted(() => {
  applyPreset('all')
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-8 text-[#332820] max-w-7xl mx-auto pb-16">
    
    <!-- 1. HEADER & DATE FILTER CONTROLS -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C] mb-2">
          <i class="mdi mdi-shield-crown"></i> Control Panel Dashboard
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p class="mt-1 text-xs sm:text-sm text-[#786B62] font-semibold">
          สรุปภาพรวมยอดขาย ระบบคำสั่งซื้อ ร้านค้า กิจกรรม และเครื่องมือส่งออกรายงาน
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#F2E5D5] border-2 border-[#E8D9C9] px-4 py-2.5 text-xs font-black text-[#332820] shadow-xs transition active:scale-95 cursor-pointer"
          :disabled="loading"
          @click="loadData"
        >
          <i class="mdi mdi-refresh text-base text-[#D96C2C]" :class="{ 'animate-spin': loading }"></i>
          <span>รีเฟรชข้อมูล</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
          @click="showExportModal = true"
        >
          <i class="mdi mdi-file-download-outline text-lg text-white"></i>
          <span>ส่งออกรายงาน (Export)</span>
        </button>
      </div>
    </div>

    <!-- DATE PRESET BAR & CUSTOM RANGE FILTER -->
    <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-black text-[#786B62] mr-1 uppercase tracking-wider flex items-center gap-1">
          <i class="mdi mdi-calendar-range text-sm text-[#D96C2C]"></i> ช่วงเวลา:
        </span>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
          :class="activePreset === 'all' ? 'bg-[#D96C2C] text-white shadow-xs' : 'bg-white border border-[#E8D9C9] text-[#786B62] hover:text-[#332820]'"
          @click="applyPreset('all')"
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
          :class="activePreset === 'this_month' ? 'bg-[#D96C2C] text-white shadow-xs' : 'bg-white border border-[#E8D9C9] text-[#786B62] hover:text-[#332820]'"
          @click="applyPreset('this_month')"
        >
          เดือนนี้
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
          :class="activePreset === '7_days' ? 'bg-[#D96C2C] text-white shadow-xs' : 'bg-white border border-[#E8D9C9] text-[#786B62] hover:text-[#332820]'"
          @click="applyPreset('7_days')"
        >
          7 วันล่าสุด
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
          :class="activePreset === '30_days' ? 'bg-[#D96C2C] text-white shadow-xs' : 'bg-white border border-[#E8D9C9] text-[#786B62] hover:text-[#332820]'"
          @click="applyPreset('30_days')"
        >
          30 วันล่าสุด
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
          :class="activePreset === 'this_year' ? 'bg-[#D96C2C] text-white shadow-xs' : 'bg-white border border-[#E8D9C9] text-[#786B62] hover:text-[#332820]'"
          @click="applyPreset('this_year')"
        >
          ปีนี้
        </button>
      </div>

      <!-- Custom Date Inputs -->
      <div class="flex items-center gap-2 text-xs font-bold w-full sm:w-auto">
        <div class="flex items-center gap-1 bg-white border border-[#E8D9C9] px-3 py-1.5 rounded-xl">
          <span class="text-[#786B62]">จาก:</span>
          <input
            type="date"
            v-model="fromDate"
            class="bg-transparent focus:outline-none font-bold text-[#332820]"
            @change="activePreset = 'custom'; loadData()"
          />
        </div>
        <span class="text-[#786B62]">-</span>
        <div class="flex items-center gap-1 bg-white border border-[#E8D9C9] px-3 py-1.5 rounded-xl">
          <span class="text-[#786B62]">ถึง:</span>
          <input
            type="date"
            v-model="toDate"
            class="bg-transparent focus:outline-none font-bold text-[#332820]"
            @change="activePreset = 'custom'; loadData()"
          />
        </div>
      </div>
    </div>

    <!-- SKELETON LOADING -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="i in 4" :key="i" class="h-32 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>
      <div class="h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <template v-else-if="report">

      <!-- 2. ACTION ALERTS (ด่วนที่ต้องจัดการ) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Pending Slips Verification -->
        <RouterLink
          to="/admin/orders"
          class="group rounded-3xl border-2 border-blue-200 bg-blue-50/70 p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div class="space-y-1">
            <p class="text-xs font-black uppercase text-blue-800 tracking-wider">ตรวจสอบสลิปชำระเงิน</p>
            <h3 class="text-2xl font-black text-blue-950">
              {{ report.alerts.pendingSlips }}
              <span class="text-xs font-bold text-blue-800">รายการ</span>
            </h3>
            <p class="text-[11px] font-bold text-blue-700 group-hover:underline flex items-center gap-1">
              <span>ยืนยันสลิปการโอน</span> <i class="mdi mdi-arrow-right"></i>
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-700">
            <i class="mdi mdi-file-document-check-outline text-2xl"></i>
          </div>
        </RouterLink>

        <!-- Pending Payout Orders -->
        <RouterLink
          to="/admin/payouts"
          class="group rounded-3xl border-2 border-emerald-200 bg-emerald-50/70 p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div class="space-y-1">
            <p class="text-xs font-black uppercase text-emerald-800 tracking-wider">ออเดอร์รอโอนเงิน (Payouts)</p>
            <h3 class="text-2xl font-black text-emerald-950">
              {{ report.alerts.pendingPayoutOrders }}
              <span class="text-xs font-bold text-emerald-800">รายการ</span>
            </h3>
            <p class="text-[11px] font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
              <span>เคลียร์ยอด Payouts ให้ร้าน</span> <i class="mdi mdi-arrow-right"></i>
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-700">
            <i class="mdi mdi-cash-refund text-2xl"></i>
          </div>
        </RouterLink>

        <!-- Pending Shipment Orders -->
        <RouterLink
          to="/admin/orders"
          class="group rounded-3xl border-2 border-amber-200 bg-amber-50/70 p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div class="space-y-1">
            <p class="text-xs font-black uppercase text-amber-800 tracking-wider">ออเดอร์รอการจัดส่ง</p>
            <h3 class="text-2xl font-black text-amber-950">
              {{ report.alerts.pendingShipmentOrders }}
              <span class="text-xs font-bold text-amber-800">รายการ</span>
            </h3>
            <p class="text-[11px] font-bold text-amber-700 group-hover:underline flex items-center gap-1">
              <span>ตรวจสอบออเดอร์รอส่ง</span> <i class="mdi mdi-arrow-right"></i>
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700">
            <i class="mdi mdi-truck-delivery-outline text-2xl"></i>
          </div>
        </RouterLink>
      </div>

      <!-- 3. MAIN KPI STATS CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Sales Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">ยอดขายรวมทั้งระบบ</p>
              <h2 class="mt-2 text-2xl font-black text-[#D96C2C]">
                {{ formatCurrency(report.summary.totalSales) }}
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C]/15 text-[#D96C2C]">
              <i class="mdi mdi-cash-register text-2xl"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold text-[#786B62]">
            <span>ยอดรอโอนให้ร้าน: <strong class="text-emerald-700">{{ formatCurrency(report.summary.pendingPayoutAmount) }}</strong></span>
          </div>
        </div>

        <!-- Total Orders Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">คำสั่งซื้อทั้งหมด</p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.totalOrders }}
                <span class="text-sm font-bold text-[#786B62]">รายการ</span>
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
              <i class="mdi mdi-package-variant text-2xl"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold text-[#786B62]">
            <span>ชำระเงินเรียบร้อย: <strong class="text-emerald-700">{{ report.summary.paidOrders }} ออเดอร์</strong></span>
          </div>
        </div>

        <!-- Active Shops Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">ร้านค้าเปิดบริการ</p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.activeShops }}
                <span class="text-sm font-bold text-[#786B62]">ร้าน</span>
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-700">
              <i class="mdi mdi-storefront-outline text-2xl"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold text-[#786B62]">
            <RouterLink to="/admin/shops" class="text-[#D96C2C] hover:underline font-bold flex items-center gap-1">
              <span>จัดการร้านค้าทั้งหมด</span> <i class="mdi mdi-chevron-right"></i>
            </RouterLink>
          </div>
        </div>

        <!-- Users & Low Stock Products Card -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-black text-[#786B62] uppercase tracking-wider">ผู้ใช้งานในระบบ</p>
              <h2 class="mt-2 text-2xl font-black text-[#332820]">
                {{ report.summary.totalUsers }}
                <span class="text-sm font-bold text-[#786B62]">คน</span>
              </h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700">
              <i class="mdi mdi-account-group-outline text-2xl"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#E8D9C9]/60 flex items-center justify-between text-xs font-semibold text-[#786B62]">
            <span>สินค้าสต็อกต่ำ: <strong class="text-rose-600 font-bold">{{ report.summary.lowStockProducts }} รายการ</strong></span>
          </div>
        </div>
      </div>

      <!-- 4. ORDER STATUS COUNTS BREAKDOWN GRID -->
      <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
        <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-4">
          <i class="mdi mdi-chart-pie text-2xl text-[#D96C2C]"></i>
          <div>
            <h2 class="text-lg font-black text-[#332820]">สรุปสถานะคำสั่งซื้อในระบบ</h2>
            <p class="text-xs text-[#786B62] font-semibold">จำแนกตามขั้นตอนและสถานะการดำเนินงานของออเดอร์</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div class="p-3.5 rounded-2xl bg-white border border-amber-200 text-center space-y-1">
            <p class="text-xs font-bold text-amber-800">รอชำระเงิน</p>
            <p class="text-xl font-black text-amber-950">{{ report.orderStatusCounts.pendingPayment }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-blue-200 text-center space-y-1">
            <p class="text-xs font-bold text-blue-800">รอตรวจสลิป</p>
            <p class="text-xl font-black text-blue-950">{{ report.orderStatusCounts.pendingVerification }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-indigo-200 text-center space-y-1">
            <p class="text-xs font-bold text-indigo-800">กำลังเตรียมส่ง</p>
            <p class="text-xl font-black text-indigo-950">{{ report.orderStatusCounts.processing }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-purple-200 text-center space-y-1">
            <p class="text-xs font-bold text-purple-800">จัดส่งแล้ว</p>
            <p class="text-xl font-black text-purple-950">{{ report.orderStatusCounts.shipped }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center space-y-1">
            <p class="text-xs font-bold text-emerald-800">สำเร็จ</p>
            <p class="text-xl font-black text-emerald-950">{{ report.orderStatusCounts.completed }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-rose-200 text-center space-y-1">
            <p class="text-xs font-bold text-rose-800">ยกเลิก</p>
            <p class="text-xl font-black text-rose-950">{{ report.orderStatusCounts.cancelled }}</p>
          </div>
        </div>
      </section>

      <!-- 5. ANALYTICS CHARTJS SECTION -->
      <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] text-white shadow-md">
              <i class="mdi mdi-chart-bell-curve-cumulative text-xl text-white"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-[#332820]">กราฟแสดงยอดขาย & คำสั่งซื้อทั้งระบบ</h2>
              <p class="text-xs text-[#786B62] font-semibold">
                แนวโน้มรายวัน เปรียบเทียบจำนวนเงินและปริมาณคำสั่งซื้อ
              </p>
            </div>
          </div>

          <!-- Chart Controls -->
          <div class="inline-flex rounded-2xl bg-[#E8D9C9]/50 p-1 border border-[#E8D9C9]">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer"
              :class="chartType === 'line' ? 'bg-[#332820] text-white shadow-xs' : 'text-[#786B62] hover:text-[#332820]'"
              @click="chartType = 'line'"
            >
              <i class="mdi mdi-chart-line"></i> กราฟเส้น
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer"
              :class="chartType === 'bar' ? 'bg-[#332820] text-white shadow-xs' : 'text-[#786B62] hover:text-[#332820]'"
              @click="chartType = 'bar'"
            >
              <i class="mdi mdi-chart-bar"></i> กราฟแท่ง
            </button>
          </div>
        </div>

        <!-- Canvas Container -->
        <div class="h-80 w-full relative pt-2">
          <canvas ref="canvasRef"></canvas>
        </div>
      </section>

      <!-- 6. LEADERBOARD & RECENT ORDERS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Left: Recent System Orders (2 Cols) -->
        <div class="lg:col-span-2 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-clock-outline text-[#D96C2C] text-2xl"></i>
              <div>
                <h2 class="text-lg font-black text-[#332820]">คำสั่งซื้อล่าสุดในระบบ</h2>
                <p class="text-xs text-[#786B62]">ออเดอร์ใหม่จากผู้ซื้อทุกร้านค้า</p>
              </div>
            </div>
            <RouterLink to="/admin/orders" class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1">
              จัดการทั้งหมด <i class="mdi mdi-chevron-right"></i>
            </RouterLink>
          </div>

          <div v-if="!report.recentOrders || report.recentOrders.length === 0" class="py-10 text-center text-xs text-[#786B62] font-semibold">
            ไม่มีคำสั่งซื้อล่าสุดในช่วงเวลานี้
          </div>

          <div v-else class="divide-y divide-[#E8D9C9]">
            <div
              v-for="order in report.recentOrders"
              :key="order.orderId"
              class="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#F2E5D5]/40 px-2 rounded-xl transition"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-black text-sm text-[#332820]">{{ order.orderNumber }}</span>
                  <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full border" :class="getOrderStatusBadge(order.orderStatus)">
                    {{ getOrderStatusText(order.orderStatus) }}
                  </span>
                  <span v-if="order.shopName" class="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    <i class="mdi mdi-store-outline"></i> {{ order.shopName }}
                  </span>
                </div>
                <p class="text-xs text-[#786B62]">
                  สร้างเมื่อ: {{ formatDate(order.createdAt) }}
                </p>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-sm font-black text-[#D96C2C]">
                  {{ formatCurrency(order.totalAmount) }}
                </span>
                <RouterLink
                  to="/admin/orders"
                  class="px-3 py-1.5 rounded-xl bg-[#332820] text-white text-xs font-bold hover:bg-[#D96C2C] transition cursor-pointer"
                >
                  ตรวจสอบ
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Top 5 Shops Leaderboard (1 Col) -->
        <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
            <h2 class="text-base font-black text-[#332820] flex items-center gap-2">
              <i class="mdi mdi-trophy-outline text-xl text-[#D96C2C]"></i>
              5 อันดับร้านค้าขายดี
            </h2>
            <RouterLink to="/admin/shops" class="text-xs font-black text-[#D96C2C] hover:underline">
              ร้านค้าทั้งหมด
            </RouterLink>
          </div>

          <div v-if="!report.topShops || report.topShops.length === 0" class="py-8 text-center text-xs text-[#786B62] font-semibold">
            ยังไม่มีข้อมูลร้านค้าขายดี
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(shop, index) in report.topShops"
              :key="shop.shopId"
              class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#E8D9C9]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs shrink-0"
                  :class="index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'"
                >
                  #{{ index + 1 }}
                </span>
                <div class="min-w-0">
                  <p class="text-xs font-black text-[#332820] truncate">{{ shop.shopName }}</p>
                  <p class="text-[11px] font-semibold text-[#786B62]">ออเดอร์ชำระแล้ว: {{ shop.paidOrders }} รายการ</p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-xs font-black text-[#D96C2C]">{{ formatCurrency(shop.sales) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- EXPORT MODAL DIALOG -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div class="w-full max-w-lg rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white">
              <i class="mdi mdi-file-download-outline text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-[#332820]">ศูนย์ส่งออกรายงาน (Export Center)</h3>
              <p class="text-xs text-[#786B62] font-medium">เลือกประเภทรายงาน ฟอร์แมตไฟล์ และเงื่อนไขการกรอง</p>
            </div>
          </div>
          <button
            type="button"
            class="text-[#786B62] hover:text-[#332820] text-xl cursor-pointer"
            @click="showExportModal = false"
          >
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="space-y-4 text-xs font-bold">
          <!-- Report Type -->
          <div>
            <label class="block text-[#332820] mb-1.5 uppercase tracking-wider">ประเภทข้อมูลรายงาน:</label>
            <select
              v-model="exportType"
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white p-3 font-bold text-[#332820] focus:border-[#D96C2C] focus:outline-none"
            >
              <option value="orders">📋 รายการออเดอร์ทั้งหมด (Orders)</option>
              <option value="shop-sales">🏪 ยอดขายแยกร้านค้า (Shop Sales Summary)</option>
              <option value="payouts">💸 ประวัติการโอนเงินให้ร้านค้า (Payouts)</option>
              <option value="payment-slips">🧾 รายการสลิปชำระเงิน (Payment Slips)</option>
            </select>
          </div>

          <!-- Format Choice (CSV / PDF) -->
          <div>
            <label class="block text-[#332820] mb-1.5 uppercase tracking-wider">ฟอร์แมตไฟล์:</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition cursor-pointer"
                :class="exportFormat === 'csv' ? 'border-[#D96C2C] bg-[#D96C2C]/10 text-[#D96C2C]' : 'border-[#E8D9C9] bg-white text-[#786B62]'"
                @click="exportFormat = 'csv'"
              >
                <i class="mdi mdi-file-delimited-outline text-xl"></i>
                <div class="text-left">
                  <p class="font-black">CSV File</p>
                  <p class="text-[10px] opacity-80">UTF-8 BOM (Excel)</p>
                </div>
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition cursor-pointer"
                :class="exportFormat === 'pdf' ? 'border-[#D96C2C] bg-[#D96C2C]/10 text-[#D96C2C]' : 'border-[#E8D9C9] bg-white text-[#786B62]'"
                @click="exportFormat = 'pdf'"
              >
                <i class="mdi mdi-file-pdf-box text-xl text-rose-600"></i>
                <div class="text-left">
                  <p class="font-black">PDF Document</p>
                  <p class="text-[10px] opacity-80">A4 Landscape Format</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Optional Filters for Orders -->
          <div v-if="exportType === 'orders'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#786B62] mb-1">สถานะออเดอร์:</label>
              <select
                v-model="exportOrderStatus"
                class="w-full rounded-xl border border-[#E8D9C9] bg-white p-2.5 font-semibold text-[#332820]"
              >
                <option value="">ทั้งหมด</option>
                <option value="Pending">รออนุมัติ/ชำระ</option>
                <option value="Paid">ชำระแล้ว</option>
                <option value="Processing">กำลังเตรียมส่ง</option>
                <option value="Shipped">จัดส่งแล้ว</option>
                <option value="Completed">สำเร็จ</option>
                <option value="Cancelled">ยกเลิก</option>
              </select>
            </div>
            <div>
              <label class="block text-[#786B62] mb-1">สถานะการจ่ายเงิน:</label>
              <select
                v-model="exportPaymentStatus"
                class="w-full rounded-xl border border-[#E8D9C9] bg-white p-2.5 font-semibold text-[#332820]"
              >
                <option value="">ทั้งหมด</option>
                <option value="Pending">รอชำระเงิน</option>
                <option value="PendingVerification">รอตรวจสอบสลิป</option>
                <option value="Paid">ชำระเรียบร้อย</option>
                <option value="Rejected">สลิปไม่ถูกต้อง</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 pt-3 border-t border-[#E8D9C9]">
          <button
            type="button"
            class="flex-1 py-3 rounded-2xl bg-white border-2 border-[#E8D9C9] text-xs font-black text-[#786B62] hover:bg-[#F2E5D5] transition cursor-pointer"
            @click="showExportModal = false"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="flex-1 py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-xs font-black text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            :disabled="exportLoading"
            @click="handleExport"
          >
            <i class="mdi text-base" :class="exportLoading ? 'mdi-loading animate-spin' : 'mdi-download'"></i>
            <span>{{ exportLoading ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลดรายงาน' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
