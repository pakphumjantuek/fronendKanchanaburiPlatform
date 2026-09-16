<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { archiveSchedule, getSchedules, type Schedule } from '../api/adminScheduleApi'
import AppDataTable, { type DataTableColumn } from '@/components/common/AppDataTable.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const schedules = ref<Schedule[]>([])
const loading = ref(true)
const swal = useSwal()
const columns: DataTableColumn[] = [
  { key: 'title', label: 'กำหนดการ', class: 'font-semibold text-slate-900' },
  { key: 'contentTitle', label: 'คอนเทนต์' },
  { key: 'startDateTime', label: 'วันเริ่ม' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]
const pagination = computed(() => ({ page: 1, pageSize: Math.max(schedules.value.length, 1), totalCount: schedules.value.length, totalPages: 1 }))
async function load() {
  loading.value = true
  try { schedules.value = await getSchedules() }
  catch (error) { await swal.error('โหลดกำหนดการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง')) }
  finally { loading.value = false }
}
async function archive(schedule: Schedule) {
  const result = await swal.confirm('ปิดใช้งานกำหนดการนี้?', schedule.title)
  if (!result.isConfirmed) return
  try { await archiveSchedule(schedule.scheduleId); await swal.success('ปิดใช้งานกำหนดการแล้ว'); await load() }
  catch (error) { await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง')) }
}
function statusLabel(status: string) { return status === 'Active' ? 'เปิดใช้งาน' : status === 'Cancelled' ? 'ยกเลิกแล้ว' : 'ปิดใช้งาน' }
function statusClass(status: string) { return status === 'Active' ? 'bg-emerald-100 text-emerald-700' : status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700' }
function formatDate(value: string) { return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function asSchedule(item: object) { return item as Schedule }
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p class="font-semibold text-indigo-600">Content management</p><h1 class="mt-1 text-3xl font-bold text-slate-900">กำหนดการกิจกรรม</h1><p class="mt-2 text-slate-500">จัดการวันเวลา สถานที่ และรายละเอียดกิจกรรมของคอนเทนต์</p></div>
      <RouterLink to="/admin/schedules/new" class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">+ เพิ่มกำหนดการ</RouterLink>
    </div>
    <AppDataTable :columns="columns" :items="schedules" row-key="scheduleId" :loading="loading" :pagination="pagination" empty-message="ยังไม่มีกำหนดการ">
      <template #cell-title="{ item }"><div><p class="font-semibold text-slate-900">{{ asSchedule(item).title }}</p><p v-if="asSchedule(item).address" class="mt-1 text-xs text-slate-500"><i class="mdi mdi-map-marker-outline" /> {{ asSchedule(item).address }}</p></div></template>
      <template #cell-startDateTime="{ item }">{{ formatDate(asSchedule(item).startDateTime) }}</template>
      <template #cell-status="{ item }"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(asSchedule(item).status)">{{ statusLabel(asSchedule(item).status) }}</span></template>
      <template #cell-actions="{ item }"><RouterLink :to="`/admin/schedules/${asSchedule(item).scheduleId}/edit`" class="mr-3 font-semibold text-indigo-600">แก้ไข</RouterLink><button v-if="asSchedule(item).status === 'Active'" class="font-semibold text-rose-600" @click="archive(asSchedule(item))">ปิดใช้งาน</button></template>
    </AppDataTable>
  </main>
</template>
