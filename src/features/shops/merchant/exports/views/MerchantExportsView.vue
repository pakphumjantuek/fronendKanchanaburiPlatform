<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppDateRangeFilter, { type DatePreset } from '@/shared/components/AppDateRangeFilter.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import {
  exportMerchantReport,
  type ExportFormat,
  type MerchantExportType,
} from '../api/merchantExportApi'

interface ExportOption {
  value: MerchantExportType
  title: string
  description: string
  icon: string
}

const reportOptions: ExportOption[] = [
  {
    value: 'orders',
    title: 'รายงานออเดอร์',
    description: 'คำสั่งซื้อ สถานะการชำระ และสถานะการรับเงิน',
    icon: 'mdi-receipt-text-outline',
  },
  {
    value: 'products',
    title: 'ยอดขายรายสินค้า',
    description: 'สรุปยอดขายสินค้า เฉพาะออเดอร์ที่ชำระแล้ว',
    icon: 'mdi-package-variant-closed',
  },
  {
    value: 'payouts',
    title: 'ประวัติรับเงิน',
    description: 'รายการเงินยอดขายที่แพลตฟอร์มโอนให้ร้าน',
    icon: 'mdi-cash-multiple',
  },
]
const orderStatusOptions = [
  { title: 'ทุกสถานะออเดอร์', value: '' },
  { title: 'รอดำเนินการ', value: 'Pending' },
  { title: 'ยืนยันออเดอร์', value: 'Confirmed' },
  { title: 'กำลังเตรียมส่ง', value: 'Processing' },
  { title: 'กำลังจัดส่ง', value: 'Shipped' },
  { title: 'สำเร็จ', value: 'Completed' },
  { title: 'ยกเลิก', value: 'Cancelled' },
]
const paymentStatusOptions = [
  { title: 'ทุกสถานะชำระเงิน', value: '' },
  { title: 'รอชำระเงิน', value: 'Pending' },
  { title: 'รอตรวจสอบสลิป', value: 'PendingVerification' },
  { title: 'ชำระแล้ว', value: 'Paid' },
  { title: 'ชำระเงินไม่สำเร็จ', value: 'Failed' },
]
const payoutStatusOptions = [
  { title: 'ทุกสถานะการรับเงิน', value: '' },
  { title: 'รอโอนเงิน', value: 'Pending' },
  { title: 'โอนเงินแล้ว', value: 'Paid' },
]

const selectedType = ref<MerchantExportType>('orders')
const format = ref<ExportFormat>('csv')
const datePreset = ref<DatePreset>('30days')
const startDate = ref('')
const endDate = ref('')
const orderStatus = ref('')
const paymentStatus = ref('')
const payoutStatus = ref('')
const exporting = ref(false)
const swal = useSwal()

const selectedReport = computed<ExportOption>(
  () => reportOptions.find((option) => option.value === selectedType.value) ?? reportOptions[0]!,
)
const isOrdersReport = computed(() => selectedType.value === 'orders')

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}
function applyDatePreset(preset: DatePreset) {
  if (preset === 'all' || preset === 'custom') return
  const end = new Date()
  const start = new Date(end)
  if (preset === '7days') start.setDate(start.getDate() - 6)
  if (preset === '30days') start.setDate(start.getDate() - 29)
  startDate.value = toDateInputValue(start)
  endDate.value = toDateInputValue(end)
}
function clearDateFilter() {
  startDate.value = ''
  endDate.value = ''
}
watch(datePreset, applyDatePreset, { immediate: true })

async function downloadReport() {
  if (datePreset.value === 'custom' && (!startDate.value || !endDate.value)) {
    await swal.error('กรุณาระบุช่วงวันที่', 'เลือกวันที่เริ่มต้นและวันที่สิ้นสุดก่อนส่งออกรายงาน')
    return
  }
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    await swal.error('ช่วงวันที่ไม่ถูกต้อง', 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด')
    return
  }
  exporting.value = true
  try {
    await exportMerchantReport(selectedType.value, {
      from: startDate.value || undefined,
      to: endDate.value || undefined,
      orderStatus: isOrdersReport.value ? orderStatus.value || undefined : undefined,
      paymentStatus: isOrdersReport.value ? paymentStatus.value || undefined : undefined,
      payoutStatus: isOrdersReport.value ? payoutStatus.value || undefined : undefined,
      format: format.value,
    })
    await swal.success(
      'ส่งออกรายงานสำเร็จ',
      `กำลังดาวน์โหลดไฟล์ ${format.value.toUpperCase()} ของคุณ`,
    )
  } catch (error) {
    await swal.error('ส่งออกรายงานไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1920px] space-y-6 py-4 text-[#332820] font-sans">
    <AppPageHeader
      title="ส่งออกรายงานร้านค้า"
      subtitle="ดาวน์โหลดข้อมูลออเดอร์ ยอดขาย และประวัติการรับเงินในรูปแบบ CSV หรือ PDF"
      icon="mdi-file-download-outline"
    />

    <section
      class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-7 shadow-xs space-y-6"
    >
      <div>
        <h2 class="text-base font-black">1. เลือกประเภทรายงาน</h2>
        <p class="mt-1 text-xs font-semibold text-[#786B62]">
          ข้อมูลจะถูกสร้างจากร้านค้าของคุณเท่านั้น
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="option in reportOptions"
          :key="option.value"
          type="button"
          class="rounded-2xl border-2 p-5 text-left transition cursor-pointer"
          :class="
            selectedType === option.value
              ? 'border-[#D96C2C] bg-[#D96C2C]/10 shadow-md'
              : 'border-[#E8D9C9] bg-white hover:border-[#D96C2C]/60'
          "
          @click="selectedType = option.value"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D96C2C] text-white"
            >
              <i class="mdi text-xl text-white" :class="option.icon"></i>
            </div>
            <div>
              <h3 class="text-sm font-black">{{ option.title }}</h3>
              <p class="mt-1 text-xs font-semibold leading-relaxed text-[#786B62]">
                {{ option.description }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </section>

    <section
      class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-7 shadow-xs space-y-6"
    >
      <div>
        <h2 class="text-base font-black">2. กำหนดข้อมูลในรายงาน</h2>
        <p class="mt-1 text-xs font-semibold text-[#786B62]">
          ไม่เลือกช่วงวันที่ ระบบจะใช้ช่วงเวลาเริ่มต้นจาก API
        </p>
      </div>
      <div class="rounded-2xl border border-[#E8D9C9] bg-white p-4">
        <AppDateRangeFilter
          v-model:preset="datePreset"
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          @clear="clearDateFilter"
        />
      </div>
      <div v-if="isOrdersReport" class="border-t border-[#E8D9C9] pt-5">
        <p class="mb-3 text-xs font-black uppercase tracking-wider text-[#786B62]">
          ตัวกรองออเดอร์เพิ่มเติม
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppSelect
            v-model="orderStatus"
            label="สถานะออเดอร์"
            :items="orderStatusOptions"
            item-title="title"
            item-value="value"
            :searchable="false"
          />
          <AppSelect
            v-model="paymentStatus"
            label="สถานะการชำระเงิน"
            :items="paymentStatusOptions"
            item-title="title"
            item-value="value"
            :searchable="false"
          />
          <AppSelect
            v-model="payoutStatus"
            label="สถานะการรับเงิน"
            :items="payoutStatusOptions"
            item-title="title"
            item-value="value"
            :searchable="false"
          />
        </div>
      </div>
    </section>

    <section class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-7 shadow-xs">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-base font-black">3. เลือกรูปแบบและดาวน์โหลด</h2>
          <p class="mt-1 text-xs font-semibold text-[#786B62]">
            CSV เหมาะสำหรับ Excel ส่วน PDF เหมาะสำหรับพิมพ์หรือแชร์
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl border-2 px-4 py-2 text-xs font-black transition cursor-pointer"
            :class="
              format === 'csv'
                ? 'border-[#D96C2C] bg-[#D96C2C] text-white'
                : 'border-[#E8D9C9] bg-white hover:border-[#D96C2C]'
            "
            @click="format = 'csv'"
          >
            <i class="mdi mdi-file-delimited-outline"></i> CSV
          </button>
          <button
            type="button"
            class="rounded-xl border-2 px-4 py-2 text-xs font-black transition cursor-pointer"
            :class="
              format === 'pdf'
                ? 'border-[#D96C2C] bg-[#D96C2C] text-white'
                : 'border-[#E8D9C9] bg-white hover:border-[#D96C2C]'
            "
            @click="format = 'pdf'"
          >
            <i class="mdi mdi-file-pdf-box"></i> PDF
          </button>
        </div>
      </div>
      <div
        class="mt-5 flex flex-col items-start justify-between gap-4 border-t border-[#E8D9C9] pt-5 sm:flex-row sm:items-center"
      >
        <p class="text-xs font-semibold text-[#786B62]">
          รายงานที่เลือก: <strong class="text-[#332820]">{{ selectedReport.title }}</strong>
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#BF5720] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          :disabled="exporting"
          @click="downloadReport"
        >
          <i
            class="mdi text-lg text-white"
            :class="exporting ? 'mdi-loading animate-spin' : 'mdi-download'"
          /><span>{{ exporting ? 'กำลังสร้างไฟล์...' : `ดาวน์โหลด ${format.toUpperCase()}` }}</span>
        </button>
      </div>
    </section>
  </div>
</template>
