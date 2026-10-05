<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createSchedule, getSchedule, updateSchedule } from '../api/adminScheduleApi'
import { getContents, type Content } from '../../contents/api/adminContentApi'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import LocationPickerMap from '@/components/common/map/LocationPickerMap.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import type { ScheduleFormData } from '../interface/types'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const scheduleId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(scheduleId.value))
const loading = ref(true)
const saving = ref(false)
const contents = ref<Content[]>([])
const form = reactive<ScheduleFormData>({
  contentId: null,
  title: '',
  startDateTime: '',
  endDateTime: '',
  address: '',
  latitude: null,
  longitude: null,
  description: '',
  status: 'Active',
})
const statusOptions = [
  { value: 'Active', label: 'เปิดใช้งาน' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
  { value: 'Cancelled', label: 'ยกเลิกแล้ว' },
]
function toInputDate(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : ''
}
async function load() {
  try {
    const result = await getContents({ page: 1, pageSize: 100 })
    contents.value = result.items
    if (isEdit.value) {
      const schedule = await getSchedule(scheduleId.value)
      Object.assign(form, {
        contentId: schedule.contentId,
        title: schedule.title,
        startDateTime: toInputDate(schedule.startDateTime),
        endDateTime: toInputDate(schedule.endDateTime),
        address: schedule.address ?? '',
        latitude: schedule.latitude ?? null,
        longitude: schedule.longitude ?? null,
        description: schedule.description ?? '',
        status: schedule.status,
      })
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    await router.replace('/admin/schedules')
  } finally {
    loading.value = false
  }
}
async function save() {
  if (!form.contentId || !form.title.trim() || !form.startDateTime) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาเลือกคอนเทนต์ ระบุชื่อกิจกรรม และวันเวลาเริ่มต้น')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) await updateSchedule(scheduleId.value, form)
    else {
      const { status: _, ...data } = form
      await createSchedule(data)
    }
    await swal.success(isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มกำหนดการแล้ว')
    await router.push('/admin/schedules')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10">
    <RouterLink
      to="/admin/schedules"
      class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
      ><i class="mdi mdi-arrow-left" /> กลับไปหน้ารายการ</RouterLink
    >
    <div class="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          {{ isEdit ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ' }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          เชื่อมกิจกรรมกับคอนเทนต์ พร้อมกำหนดวันเวลาและตำแหน่ง
        </p>
      </div>
      <button
        v-if="!loading"
        type="button"
        class="hidden rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50 lg:block"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </div>
    <form
      v-if="!loading"
      class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
      @submit.prevent="save"
    >
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="mb-5 text-lg font-bold text-slate-900">ข้อมูลกิจกรรม</h2>
          <div class="space-y-5">
            <AppSelect
              v-model="form.contentId"
              label="คอนเทนต์ที่เกี่ยวข้อง *"
              :items="contents"
              item-title="title"
              item-value="contentId"
              placeholder="เลือกคอนเทนต์"
            /><AppTextField
              v-model="form.title"
              label="ชื่อกิจกรรม *"
              placeholder="เช่น งานสัปดาห์สะพานข้ามแม่น้ำแคว"
            />
            <div class="grid gap-5 sm:grid-cols-2">
              <AppTextField
                v-model="form.startDateTime"
                label="วันและเวลาเริ่ม *"
                type="datetime-local"
              /><AppTextField
                v-model="form.endDateTime"
                label="วันและเวลาสิ้นสุด"
                type="datetime-local"
              />
            </div>
            <AppTextarea
              v-model="form.description"
              label="รายละเอียดกิจกรรม"
              placeholder="รายละเอียดเพิ่มเติมสำหรับผู้เข้าชม"
            />
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="mb-5 text-lg font-bold text-slate-900">สถานที่จัดกิจกรรม</h2>
          <AppTextarea
            v-model="form.address"
            label="สถานที่ / ที่อยู่"
            placeholder="ระบุสถานที่จัดกิจกรรม"
          />
          <div class="mt-5">
            <LocationPickerMap
              v-model:latitude="form.latitude"
              v-model:longitude="form.longitude"
            />
          </div>
        </section>
      </div>
      <aside class="space-y-6 xl:sticky xl:top-6">
        <section
          v-if="isEdit"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 class="mb-4 font-bold text-slate-900">สถานะกำหนดการ</h2>
          <AppSelect
            v-model="form.status"
            label="สถานะ"
            :items="statusOptions"
            item-title="label"
            item-value="value"
          />
        </section>
        <section
          class="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-slate-600"
        >
          <i class="mdi mdi-information-outline mr-1 text-lg text-indigo-600" />
          สามารถค้นหาสถานที่จากแผนที่ หรือคลิกและลากหมุดเพื่อปรับตำแหน่งได้
        </section>
        <div class="flex gap-3">
          <RouterLink
            to="/admin/schedules"
            class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-600"
            >ยกเลิก</RouterLink
          ><button
            type="submit"
            class="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </div>
      </aside>
    </form>
    <div v-else class="mt-6 h-1 animate-pulse rounded bg-indigo-600" />
  </main>
</template>
