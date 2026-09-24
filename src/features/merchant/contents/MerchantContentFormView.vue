<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createMyContent,
  getContentCategories,
  getDistricts,
  getMyContent,
  getSubDistricts,
  updateMyContent,
  type ContentCategory,
  type District,
  type SubmissionStatus,
  type SubDistrict,
  type UserContentFormData,
} from '@/features/contents/api'
import { getMyShop, type Shop } from '@/features/merchant/api/shopApi'
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

const shop = ref<Shop | null>(null)
const categories = ref<ContentCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])

const statusOptions = [
  { title: '🟢 เผยแพร่ทันที', value: 'Published' },
  { title: '📝 บันทึกร่าง', value: 'Draft' },
]

const form = reactive<UserContentFormData & { shopId?: string | null }>({
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

async function load() {
  try {
    const [myShop, catData, distData] = await Promise.all([
      getMyShop(),
      getContentCategories(),
      getDistricts(),
    ])
    shop.value = myShop
    categories.value = catData
    districts.value = distData
    form.shopId = myShop.shopId

    if (isEdit.value) {
      const content = await getMyContent(contentId.value)
      if (content.status === 'Archived') {
        await router.replace('/my-shop/contents')
        return
      }
      Object.assign(form, {
        title: content.title,
        summary: content.summary ?? '',
        contentCategoryId: content.contentCategoryId,
        shopId: myShop.shopId,
        districtId: content.districtId ?? myShop.districtId ?? null,
        subDistrictId: content.subDistrictId ?? myShop.subDistrictId ?? null,
        latitude: content.latitude ?? myShop.latitude ?? null,
        longitude: content.longitude ?? myShop.longitude ?? null,
        youtubeUrl: content.youtubeUrl ?? '',
        status: (content.status === 'Draft' ? 'Draft' : 'Published') as SubmissionStatus,
      })
      await loadSubDistricts(form.districtId, true)

      // โหลดข้อมูลตารางเวลา/กิจกรรมที่มีอยู่เดิม
      const existingSchs = await getContentSchedules(contentId.value).catch(() => [])
      schedulesForm.value = existingSchs.map((s) => ({
        scheduleId: s.scheduleId,
        title: s.title,
        startDateTime: s.startDateTime ? new Date(s.startDateTime).toISOString().slice(0, 16) : '',
        endDateTime: s.endDateTime ? new Date(s.endDateTime).toISOString().slice(0, 16) : '',
        address: s.address || '',
      }))
    } else {
      // Auto fill shop location defaults if available
      form.districtId = myShop.districtId ?? null
      form.subDistrictId = myShop.subDistrictId ?? null
      form.latitude = myShop.latitude ?? null
      form.longitude = myShop.longitude ?? null
      form.status = 'Published'
      if (form.districtId) await loadSubDistricts(form.districtId, true)
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    if (isEdit.value) await router.replace('/my-shop/contents')
  } finally {
    loading.value = false
  }
}

import { getCategoryRule } from '@/features/contents/constants/categoryRules'
import { getContentSchedules } from '@/features/contents/api'
import { createSchedule, updateSchedule } from '@/features/admin/schedules/api/adminScheduleApi'
import { toNullableNumber, youtubeEmbedUrl, type ScheduleItemForm } from './interface/type'

const selectedCategoryName = computed(
  () => categories.value.find((c) => c.contentCategoryId === form.contentCategoryId)?.categoryName,
)
const selectedCategoryRule = computed(() => getCategoryRule(selectedCategoryName.value))

const schedulesForm = ref<ScheduleItemForm[]>([])

function addScheduleRow() {
  schedulesForm.value.push({
    title: '',
    startDateTime: '',
    endDateTime: '',
    address: '',
  })
}

function removeScheduleRow(index: number) {
  schedulesForm.value.splice(index, 1)
}

async function save() {
  if (!form.title.trim() || !form.contentCategoryId) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อเรื่องราวและหมวดหมู่')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      shopId: shop.value?.shopId ?? null,
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

    // บันทึกตารางเวลา/กิจกรรม
    if (targetContentId && selectedCategoryRule.value.hasSchedule !== false && schedulesForm.value.length > 0) {
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
          await updateSchedule(item.scheduleId, schPayload).catch(() => undefined)
        } else {
          await createSchedule(schPayload).catch(() => undefined)
        }
      }
    }
    await swal.success(
      isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'บันทึกเรื่องราวร้านค้าแล้ว',
      form.status === 'Published'
        ? 'คอนเทนต์แสดงผลต่อสาธารณะทันที'
        : 'บันทึกเป็นฉบับร่างเรียบร้อยแล้ว',
    )
    await router.push('/my-shop/contents')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-5xl xl:max-w-6xl py-4 space-y-6 text-[#332820]">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div
        class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
      <div
        class="h-96 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
    </div>

    <template v-else>
      <!-- Page Title Header Card with Status Select on Top Right -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs"
      >
        <div>
          <RouterLink
            to="/my-shop/contents"
            class="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-[#D96C2C] hover:underline"
          >
            <i class="mdi mdi-arrow-left" /> กลับไปรายการคอนเทนต์ร้านค้า
          </RouterLink>
          <h1 class="mt-2 text-2xl sm:text-3xl font-black text-[#332820]">
            {{ isEdit ? 'แก้ไขเรื่องราวร้านค้า' : 'เขียนเรื่องราวร้านค้าใหม่' }}
          </h1>
          <p class="mt-1 text-xs text-[#786B62] font-semibold">
            สร้างคอนเทนต์ เรื่องราว วิดีโอแนะนำสินค้าและวิถีชีวิตร้านค้าของคุณ
          </p>
        </div>

        <!-- TOP RIGHT CONTROLS: STATUS SELECT & SAVE BUTTON -->
        <div class="flex items-center gap-3">
          <div class="w-52 sm:w-60">
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
                saving ? 'กำลังบันทึก...' : 'บันทึกเรื่องราว'
              }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Form Container -->
      <form
        class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start"
        @submit.prevent="save"
      >
        <div class="space-y-6">
          <!-- Section 1: Content Story Details -->
          <section
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
          >
            <h2
              class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
            >
              <i class="mdi mdi-file-document-outline text-[#D96C2C] text-xl"></i>
              เนื้อเรื่องราวและวิดีโอ
            </h2>
            <div class="space-y-5">
              <AppTextField
                v-model="form.title"
                label="ชื่อเรื่องราว / คอนเทนต์ *"
                placeholder="เช่น ความเป็นมาของร้านและสูตรลับสินค้าขึ้นชื่อ"
              />

              <AppTextarea
                v-model="form.summary"
                label="คำอธิบายย่อ"
                placeholder="เล่าเรื่องราว จุดเด่น ประวัติ หรือเนื้อหาที่เป็นประโยชน์ต่อผู้เข้าชม"
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

          <!-- Section 2: Category & Location -->
          <section
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
          >
            <h2
              class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
            >
              <i class="mdi mdi-map-marker-outline text-[#D96C2C] text-xl"></i>
              หมวดหมู่และพิกัดสถานที่
            </h2>
            <div class="grid gap-5 sm:grid-cols-2">
              <AppSelect
                v-model="form.contentCategoryId"
                label="หมวดหมู่บทความ *"
                :items="categories"
                item-title="categoryName"
                item-value="contentCategoryId"
                placeholder="เลือกหมวดหมู่"
              />
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

            <!-- CATEGORY RULE INFO BOX -->
            <div v-if="selectedCategoryName" class="p-3.5 rounded-2xl bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs text-[#332820] space-y-1">
              <div class="flex items-center gap-1.5 text-[#D96C2C] font-bold">
                <i class="mdi mdi-information-outline text-sm"></i>
                <span>เงื่อนไขการแสดงผลหมวดหมู่: {{ selectedCategoryName }}</span>
              </div>
              <p class="text-[#4A3E35] font-medium">- ร้านค้า: <span class="font-bold text-emerald-700">เชื่อมโยงกับร้านค้า {{ shop?.shopName }} อัตโนมัติ</span></p>
              <p class="text-[#4A3E35] font-medium">- ตารางเวลา/กิจกรรม: <span class="font-bold">{{ selectedCategoryRule.hasSchedule === false ? 'ซ่อนส่วนตารางเวลาสำหรับหมวดหมู่นี้' : 'เปิดแสดงส่วนตารางเวลาและกิจกรรม' }}</span></p>
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

        <!-- Sidebar Info Guide -->
        <aside class="space-y-5 lg:sticky lg:top-6">
          <section
            class="rounded-3xl border-2 border-[#D96C2C]/30 bg-[#D96C2C]/10 p-5 text-xs sm:text-sm text-[#332820] space-y-2"
          >
            <div class="flex gap-3">
              <i class="mdi mdi-storefront text-xl text-[#D96C2C] shrink-0" />
              <div>
                <h2 class="font-black text-[#D96C2C]">ผูกกับร้านค้าอัตโนมัติ</h2>
                <p class="mt-1 font-semibold leading-relaxed text-[#786B62]">
                  เรื่องราวนี้จะถูกเชื่อมกับร้านค้า
                  <strong class="text-[#332820]">{{ shop?.shopName }}</strong>
                  และแสดงผลต่อสาธารณะทันทีเมื่อเลือกสถานะเผยแพร่
                </p>
              </div>
            </div>
          </section>

          <section
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 text-xs sm:text-sm text-[#786B62] space-y-2 font-semibold"
          >
            <p class="font-black text-[#332820] text-sm">💡 เคล็ดลับการลงเรื่องราว</p>
            <ul class="space-y-2 pt-1">
              <li>
                • เลือก
                <strong>"🟢 เผยแพร่ทันที"</strong> บนขวาเพื่อให้บทความแสดงผลทันทีโดยไม่ต้องรออนุมัติ
              </li>
              <li>• เลือก <strong>"📝 บันทึกร่าง"</strong> หากต้องการบันทึกไว้แก้ไขภายหลัง</li>
              <li>• กดปุ่ม "ใช้ตำแหน่งปัจจุบัน" บนแผนที่เพื่อระบุพิกัดและเลือกอำเภอให้อัตโนมัติ</li>
            </ul>
          </section>
        </aside>
      </form>
    </template>
  </div>
</template>
