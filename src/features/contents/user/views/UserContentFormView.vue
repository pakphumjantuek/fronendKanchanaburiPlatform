<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createMyContent,
  getContentCategories,
  getDistricts,
  getMyContent,
  getShops,
  getSubDistricts,
  updateMyContent,
  type ContentCategory,
  type District,
  type SubmissionStatus,
  type SubDistrict,
  type UserContentFormData,
} from '@/features/contents/api'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import LocationPickerMap from '@/components/common/map/LocationPickerMap.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const contentId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(contentId.value))
const loading = ref(true)
const saving = ref(false)
const categories = ref<ContentCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const shops = ref<{ shopId: string; shopName: string }[]>([])

const statusOptions = [
  { title: '🟢 เผยแพร่ทันที', value: 'Published' },
  { title: '📝 บันทึกร่าง', value: 'Draft' },
]

const form = reactive<UserContentFormData>({
  title: '',
  summary: '',
  contentCategoryId: null,
  shopId: null,
  districtId: null,
  subDistrictId: null,
  latitude: null,
  longitude: null,
  youtubeUrl: '',
  status: 'Published',
})

async function loadSubDistricts(districtId: string | null, keepValue = false) {
  if (!districtId) {
    subDistricts.value = []
    form.subDistrictId = null
    return
  }
  subDistricts.value = await getSubDistricts(districtId)
  if (!keepValue) form.subDistrictId = null
}

watch(
  () => form.districtId,
  (value, oldValue) => {
    if (value && value !== oldValue) void loadSubDistricts(value)
  },
)

async function onAddressDetected(data: { districtName?: string; subDistrictName?: string }) {
  if (!data.districtName) return
  const targetDistName = data.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()

  const matchedDistrict = districts.value.find((d) => {
    const dName = d.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()
    return dName.includes(targetDistName) || targetDistName.includes(dName)
  })

  if (matchedDistrict) {
    form.districtId = matchedDistrict.districtId
    await loadSubDistricts(matchedDistrict.districtId, true)

    if (data.subDistrictName) {
      const targetSubName = data.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
      const matchedSub = subDistricts.value.find((s) => {
        const sName = s.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
        return sName.includes(targetSubName) || targetSubName.includes(sName)
      })

      if (matchedSub) {
        form.subDistrictId = matchedSub.subDistrictId
      }
    }
  }
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
        (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}

function toNullableNumber(value: number | string | null) {
  if (value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

async function load() {
  try {
    ;[categories.value, districts.value, shops.value] = await Promise.all([
      getContentCategories(),
      getDistricts(),
      getShops().catch(() => []),
    ])
    if (isEdit.value) {
      const content = await getMyContent(contentId.value)
      if (content.status === 'Archived') {
        await router.replace('/profile')
        return
      }
      Object.assign(form, {
        title: content.title,
        summary: content.summary ?? '',
        contentCategoryId: content.contentCategoryId,
        shopId: content.shopId ?? null,
        districtId: content.districtId ?? null,
        subDistrictId: content.subDistrictId ?? null,
        latitude: content.latitude ?? null,
        longitude: content.longitude ?? null,
        youtubeUrl: content.youtubeUrl ?? '',
        status: (content.status === 'Draft' ? 'Draft' : 'Published') as SubmissionStatus,
      })
      await loadSubDistricts(form.districtId, true)

      // โหลดข้อมูลตารางเวลา/กิจกรรมที่มีอยู่เดิม
      const existingSchs = await getMyContentSchedules(contentId.value).catch(() => [])
      schedulesForm.value = existingSchs.map((s) => ({
        scheduleId: s.scheduleId,
        title: s.title,
        startDateTime: s.startDateTime ? new Date(s.startDateTime).toISOString().slice(0, 16) : '',
        endDateTime: s.endDateTime ? new Date(s.endDateTime).toISOString().slice(0, 16) : '',
        address: s.address || '',
      }))
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    if (isEdit.value) await router.replace('/profile')
  } finally {
    loading.value = false
  }
}

import { getCategoryRule } from '@/features/contents/constants/categoryRules'
import { getMyContentSchedules } from '@/features/contents/api'
import {
  archiveSchedule,
  createSchedule,
  updateSchedule,
} from '@/features/admin/schedules/api/adminScheduleApi'

const selectedCategoryName = computed(
  () => categories.value.find((c) => c.contentCategoryId === form.contentCategoryId)?.categoryName,
)
const selectedCategoryRule = computed(() => getCategoryRule(selectedCategoryName.value))

interface ScheduleItemForm {
  scheduleId?: string
  title: string
  startDateTime: string
  endDateTime: string
  address: string
}

const schedulesForm = ref<ScheduleItemForm[]>([])
const removedScheduleIds = ref<string[]>([])

function addScheduleRow() {
  schedulesForm.value.push({
    title: '',
    startDateTime: '',
    endDateTime: '',
    address: '',
  })
}

function removeScheduleRow(index: number) {
  const schedule = schedulesForm.value[index]

  if (schedule?.scheduleId) {
    removedScheduleIds.value.push(schedule.scheduleId)
  }

  schedulesForm.value.splice(index, 1)
}

async function save() {
  if (!form.title.trim() || !form.contentCategoryId) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อคอนเทนต์และหมวดหมู่')
    return
  }
  if (selectedCategoryRule.value.shopRequirement === 'required' && !form.shopId) {
    await swal.warning(
      'หมวดหมู่นี้จำเป็นต้องเชื่อมโยงร้านค้า',
      selectedCategoryRule.value.shopRequirementLabel,
    )
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      latitude: toNullableNumber(form.latitude),
      longitude: toNullableNumber(form.longitude),
      status: form.status || 'Published',
    }
    let targetContentId = contentId.value
    if (isEdit.value) {
      await updateMyContent(contentId.value, payload)
    } else {
      const res = await createMyContent(payload)
      targetContentId = res.contentId
    }

    // ลบรายการเดิมที่ผู้ใช้เอาออกจากฟอร์ม
    for (const scheduleId of removedScheduleIds.value) {
      await archiveSchedule(scheduleId)
    }

    // บันทึกตารางเวลา/กิจกรรมที่ยังเหลืออยู่ หรือเพิ่มรายการใหม่
    if (targetContentId && selectedCategoryRule.value.hasSchedule !== false) {
      for (const item of schedulesForm.value) {
        if (!item.title.trim() || !item.startDateTime) continue
        const schPayload = {
          contentId: targetContentId,
          title: item.title.trim(),
          startDateTime: item.startDateTime,
          endDateTime: item.endDateTime || null,
          address: item.address?.trim() || null,
          latitude: form.latitude,
          longitude: form.longitude,
          description: null,
          status: 'Active' as const,
        }
        if (item.scheduleId) {
          await updateSchedule(item.scheduleId, schPayload)
        } else {
          await createSchedule(schPayload)
        }
      }
    }

    await swal.success(
      isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'บันทึกคอนเทนต์แล้ว',
      form.status === 'Published'
        ? 'คอนเทนต์ของคุณแสดงผลต่อสาธารณะทันที'
        : 'บันทึกเป็นฉบับร่างเรียบร้อยแล้ว',
    )
    await router.push('/profile')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-20 font-sans">
    <main class="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <!-- Skeleton Loading -->
      <div v-if="loading" class="space-y-6">
        <div
          class="h-24 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
        <div
          class="h-96 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>

      <template v-else>
        <!-- Header Container with Status Select on Top Right -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-6 mb-6"
        >
          <div>
            <RouterLink
              to="/profile"
              class="inline-flex items-center gap-1 text-sm font-black text-[#D96C2C] hover:underline"
            >
              <i class="mdi mdi-arrow-left" /> กลับไปหน้าโปรไฟล์
            </RouterLink>
            <h1 class="mt-2 text-2xl sm:text-3xl font-black text-[#332820]">
              {{ isEdit ? 'แก้ไขคอนเทนต์' : 'สร้างคอนเทนต์ใหม่' }}
            </h1>
            <p class="mt-1 text-xs text-[#786B62] font-semibold">
              บอกเล่าเรื่องราว สถานที่ท่องเที่ยว วัฒนธรรม หรือประสบการณ์ในกาญจนบุรี
            </p>
          </div>

          <!-- TOP RIGHT CONTROLS: STATUS SELECT & SAVE BUTTON -->
          <div class="flex items-center gap-3">
            <div class="w-48 sm:w-56">
              <label class="block text-[10px] font-black uppercase text-[#786B62] mb-1">
                สถานะการแสดงผล
              </label>
              <AppSelect
                v-model="form.status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
              />
            </div>

            <div class="pt-4">
              <button
                type="button"
                class="rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 font-black text-xs sm:text-sm text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
                :disabled="saving"
                @click="save"
              >
                <i
                  class="mdi text-base text-white"
                  :class="saving ? 'mdi-loading animate-spin' : 'mdi-publish'"
                />
                <span class="!text-white font-black ml-1">{{
                  saving ? 'กำลังบันทึก...' : 'บันทึกคอนเทนต์'
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Container -->
        <form
          class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start"
          @submit.prevent="save"
        >
          <div class="space-y-6">
            <!-- Section 1: Details -->
            <section
              class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
            >
              <h2
                class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
              >
                <i class="mdi mdi-file-document-outline text-[#D96C2C] text-xl"></i>
                ข้อมูลเนื้อหาเรื่องราว
              </h2>
              <div class="space-y-5">
                <AppTextField
                  v-model="form.title"
                  label="ชื่อคอนเทนต์ *"
                  placeholder="เช่น มนต์เสน่ห์สังขละบุรีและวิถีชีวิตชาวมอญ"
                />

                <AppTextarea
                  v-model="form.summary"
                  label="สรุปเนื้อหาย่อ"
                  placeholder="เขียนสรุปสั้น ๆ ที่น่าสนใจเพื่อดึงดูดผู้อ่าน"
                />
                <AppTextField
                  v-model="form.youtubeUrl"
                  label="URL วิดีโอ YouTube (ถ้ามี)"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div
                  v-if="youtubeEmbedUrl(form.youtubeUrl)"
                  class="overflow-hidden rounded-2xl border-2 border-[#E8D9C9] bg-[#171412]"
                >
                  <iframe
                    :src="youtubeEmbedUrl(form.youtubeUrl)"
                    title="ตัวอย่างวิดีโอ YouTube"
                    class="aspect-video w-full"
                    allowfullscreen
                  />
                </div>
                <p v-else-if="form.youtubeUrl" class="text-xs text-rose-600 font-bold">
                  กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง
                </p>
              </div>
            </section>

            <!-- Section 2: Category, Link to Shop & Location -->
            <section
              class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
            >
              <h2
                class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
              >
                <i class="mdi mdi-storefront-outline text-[#D96C2C] text-xl"></i>
                หมวดหมู่ ร้านค้า และพิกัดสถานที่
              </h2>

              <div class="space-y-5">
                <div class="grid gap-5 sm:grid-cols-2">
                  <AppSelect
                    v-model="form.contentCategoryId"
                    label="หมวดหมู่บทความ *"
                    :items="categories"
                    item-title="categoryName"
                    item-value="contentCategoryId"
                    placeholder="เลือกหมวดหมู่"
                  />

                  <!-- LINK TO SHOP SELECT DROPDOWN -->
                  <AppSelect
                    v-model="form.shopId"
                    :label="selectedCategoryRule.shopRequirement === 'required' ? 'เชื่อมโยงกับร้านค้า * (จำเป็นสำหรับหมวดนี้)' : 'เชื่อมโยงกับร้านค้า (เลือกร้านค้า)'"
                    :items="shops"
                    item-title="shopName"
                    item-value="shopId"
                    :placeholder="selectedCategoryRule.shopRequirementLabel"
                    clearable
                  />
                </div>

                <!-- CATEGORY RULE INFO BOX -->
                <div v-if="selectedCategoryName" class="p-3.5 rounded-2xl bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs text-[#332820] space-y-1">
                  <div class="flex items-center gap-1.5 text-[#D96C2C] font-bold">
                    <i class="mdi mdi-information-outline text-sm"></i>
                    <span>เงื่อนไขการแสดงผลหมวดหมู่: {{ selectedCategoryName }}</span>
                  </div>
                  <p class="text-[#4A3E35] font-medium">- ร้านค้า: <span class="font-bold" :class="selectedCategoryRule.shopRequirement === 'required' ? 'text-rose-600' : 'text-[#332820]'">{{ selectedCategoryRule.shopRequirement === 'required' ? 'จำเป็นต้องเชื่อมโยงร้านค้าผู้ผลิต/จำหน่าย' : 'สามารถระบุเพิ่มเติมได้ (ถ้ามี)' }}</span></p>
                  <p class="text-[#4A3E35] font-medium">- ตารางเวลา/กิจกรรม: <span class="font-bold">{{ selectedCategoryRule.hasSchedule === false ? 'ซ่อนส่วนตารางเวลาสำหรับหมวดหมู่นี้' : 'เปิดแสดงส่วนตารางเวลาและกิจกรรม' }}</span></p>
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                  <AppSelect
                    v-model="form.districtId"
                    label="อำเภอ (เลือกอัตโนมัติจาก GPS)"
                    :items="districts"
                    item-title="districtName"
                    item-value="districtId"
                    placeholder="เลือกอำเภอ"
                    clearable
                  />
                  <AppSelect
                    v-model="form.subDistrictId"
                    label="ตำบล (เลือกอัตโนมัติจาก GPS)"
                    :items="subDistricts"
                    item-title="subDistrictName"
                    item-value="subDistrictId"
                    placeholder="เลือกตำบล"
                    :disabled="!form.districtId"
                    clearable
                  />
                </div>
              </div>

              <div class="mt-5">
                <LocationPickerMap
                  v-model:latitude="form.latitude"
                  v-model:longitude="form.longitude"
                  @address-detected="onAddressDetected"
                />
              </div>
            </section>

            <!-- Section 3: Schedule & Events (if applicable) -->
            <section
              v-if="selectedCategoryRule.hasSchedule !== false"
              class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
            >
              <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
                <h2 class="text-lg font-black text-[#332820] flex items-center gap-2">
                  <i class="mdi mdi-calendar-clock text-[#D96C2C] text-xl"></i>
                  ตารางเวลาและกิจกรรม (Schedule & Events)
                </h2>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D96C2C] text-white text-xs font-bold hover:bg-[#BF5720] transition cursor-pointer"
                  @click="addScheduleRow"
                >
                  <i class="mdi mdi-plus text-sm"></i>
                  เพิ่มตารางเวลา
                </button>
              </div>

              <p class="text-xs text-[#786B62]">
                ระบุวัน เวลา และสถานที่จัดงานหรือรอบกิจกรรมสำหรับคอนเทนต์นี้ (สามารถเพิ่มได้มากกว่า 1 รายการ)
              </p>

              <div v-if="schedulesForm.length === 0" class="py-6 text-center text-xs text-[#786B62] border-2 border-dashed border-[#E8D9C9] rounded-2xl">
                ยังไม่มีตารางเวลา คลิก "เพิ่มตารางเวลา" เพื่อระบุวันเวลาและสถานที่จัดงาน
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(item, idx) in schedulesForm"
                  :key="idx"
                  class="p-4 rounded-2xl border border-[#E8D9C9] bg-white space-y-3 relative"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#D96C2C]">รายการที่ {{ idx + 1 }}</span>
                    <button
                      type="button"
                      class="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      @click="removeScheduleRow(idx)"
                    >
                      <i class="mdi mdi-trash-can-outline"></i> ลบ
                    </button>
                  </div>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <AppTextField v-model="item.title" label="หัวข้อกิจกรรม / ตาราง *" placeholder="เช่น พิธีตักบาตรมอญ หรือ รอบการแสดง" />
                    <AppTextField v-model="item.address" label="สถานที่ / จุดจัดงาน" placeholder="เช่น สะพานมอญ หรือ เวทีกลาง" />
                    <AppTextField v-model="item.startDateTime" type="datetime-local" label="วัน-เวลาเริ่มต้น *" />
                    <AppTextField v-model="item.endDateTime" type="datetime-local" label="วัน-เวลาสิ้นสุด (ถ้ามี)" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar Guide -->
          <aside class="space-y-5 lg:sticky lg:top-6">
            <section
              class="rounded-3xl border-2 border-[#D96C2C]/30 bg-[#D96C2C]/10 p-5 text-xs sm:text-sm text-[#332820] space-y-2"
            >
              <div class="flex gap-3">
                <i class="mdi mdi-store-check text-xl text-[#D96C2C] shrink-0" />
                <div>
                  <h2 class="font-black text-[#D96C2C]">เชื่อมโยงเรื่องราวกับร้านค้า</h2>
                  <p class="mt-1 font-semibold leading-relaxed text-[#786B62]">
                    คุณสามารถเลือกเชื่อมบทความนี้เข้ากับร้านค้าเพื่อดึงดูดลูกค้าและแสดงบทความในหน้ารายละเอียดร้านค้านั้น
                    ๆ ได้!
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </template>
    </main>
  </div>
</template>
