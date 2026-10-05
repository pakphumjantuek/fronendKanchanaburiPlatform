<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { onMounted, ref, watch } from 'vue'
import {
  getReports,
  updateReportStatus,
  type Report,
  type ReportStatus,
} from '../api/adminReportApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const reports = ref<Report[]>([])
const status = ref<ReportStatus | null>(null)
const loading = ref(true)
const updating = ref<string | null>(null)
const swal = useSwal()

const statusOptions = [
  { value: 'Pending', label: 'รอตรวจสอบ' },
  { value: 'InProgress', label: 'กำลังดำเนินการ' },
  { value: 'Resolved', label: 'ดำเนินการแล้ว' },
  { value: 'Dismissed', label: 'ไม่พบปัญหา' },
]

function label(value: string) {
  return statusOptions.find((item) => item.value === value)?.label ?? value
}

function color(value: string) {
  return value === 'Pending'
    ? 'bg-amber-100 text-amber-800'
    : value === 'InProgress'
      ? 'bg-sky-100 text-sky-800'
      : value === 'Resolved'
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-slate-200 text-slate-700'
}

async function load() {
  loading.value = true
  try {
    reports.value = await getReports(status.value)
  } catch (error) {
    await swal.error('โหลดรายงานไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}
async function changeStatus(report: Report, event: Event) {
  const value = (event.target as HTMLSelectElement).value as ReportStatus
  if (value === report.status) return
  updating.value = report.reportId
  try {
    const updated = await updateReportStatus(report.reportId, value)
    Object.assign(report, updated)
  } catch (error) {
    await swal.error('อัปเดตสถานะไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updating.value = null
  }
}
watch(status, load)
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-8 lg:px-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-rose-600">Content moderation</p>
        <h1 class="mt-1 text-3xl font-black text-slate-900">รายการรายงาน</h1>
        <p class="mt-2 text-slate-500">ตรวจสอบคอนเทนต์และรีวิวที่ผู้ใช้แจ้งเข้ามา</p>
      </div>
      <select
        v-model="status"
        class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-rose-500"
      >
        <option :value="null">ทุกสถานะ</option>
        <option v-for="item in statusOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>
    <section class="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-14 text-center text-slate-500">กำลังโหลดรายงาน...</div>
      <div v-else-if="!reports.length" class="p-16 text-center">
        <i class="mdi mdi-shield-check-outline text-5xl text-emerald-400" />
        <p class="mt-3 font-bold text-slate-700">ยังไม่มีรายการรายงาน</p>
      </div>
      <div v-else class="divide-y divide-slate-100">
        <article
          v-for="report in reports"
          :key="report.reportId"
          class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px]"
        >
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-bold"
                :class="color(report.status)"
                >{{ label(report.status) }}</span
              ><span class="text-xs text-slate-400">{{
                formatDate(report.createdAt, { dateStyle: 'medium', timeStyle: 'short' })
              }}</span>
            </div>
            <h2 class="mt-3 font-bold text-slate-900">{{ report.targetLabel }}</h2>
            <p class="mt-1 text-sm font-semibold text-rose-700">เหตุผล: {{ report.reason }}</p>
            <p
              v-if="report.description"
              class="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600"
            >
              {{ report.description }}
            </p>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500">สถานะ</label
            ><select
              :value="report.status"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-rose-500 disabled:opacity-50"
              :disabled="updating === report.reportId"
              @change="changeStatus(report, $event)"
            >
              <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
