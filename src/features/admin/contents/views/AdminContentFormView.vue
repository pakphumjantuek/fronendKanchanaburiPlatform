<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createContent,
  getContent,
  getContentCategories,
  getDistricts,
  getShops,
  getSubDistricts,
  updateContent,
  type ContentFormData,
  type ContentCategory,
  type District,
  type Shop,
  type SubDistrict,
} from '../api/adminContentApi'
import { getContentTags, getTags, replaceContentTags, type TagOption } from '../../content-tags/api/adminContentTagApi'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import LocationPickerMap from '@/components/common/map/LocationPickerMap.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { toNullableNumber, youtubeEmbedUrl } from '@/shared/utils/youtube'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const contentId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(contentId.value))
const loading = ref(true)
const saving = ref(false)
const restoringLocation = ref(false)
const categories = ref<ContentCategory[]>([])
const shops = ref<Shop[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const tags = ref<TagOption[]>([])
const selectedTagIds = ref<string[]>([])
const form = reactive<ContentFormData>({
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
const statusOptions = [
  { value: 'Draft', label: 'ฉบับร่าง' },
  { value: 'Pending', label: 'รอตรวจสอบ' },
  { value: 'Published', label: 'เผยแพร่แล้ว' },
  { value: 'Archived', label: 'เก็บถาวร' },
]

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
    if (!restoringLocation.value && value && value !== oldValue) void loadSubDistricts(value)
  },
)

async function load() {
  try {
    ;[categories.value, shops.value, districts.value, tags.value] = await Promise.all([
      getContentCategories(),
      getShops(),
      getDistricts(),
      getTags(),
    ])
    if (isEdit.value) {
      const content = await getContent(contentId.value)
      // Prevent the district watcher from clearing the saved sub-district while
      // the edit form is restoring its dependent dropdown options.
      restoringLocation.value = true
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
        status: content.status,
      })
      await loadSubDistricts(form.districtId, true)
      restoringLocation.value = false
      selectedTagIds.value = (await getContentTags(contentId.value)).map((tag) => tag.tagId)
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    if (isEdit.value) await router.replace('/admin/contents')
  } finally {
    loading.value = false
  }
}
async function save() {
  if (!form.title.trim() || !form.contentCategoryId) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อคอนเทนต์และหมวดหมู่')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      latitude: toNullableNumber(form.latitude),
      longitude: toNullableNumber(form.longitude),
    }
    if (isEdit.value) {
      await updateContent(contentId.value, payload)
      await replaceContentTags(contentId.value, selectedTagIds.value)
    }
    else {
      const { status: _, ...createData } = payload
      const content = await createContent(createData)
      await replaceContentTags(content.contentId, selectedTagIds.value)
    }
    await swal.success(isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'สร้างคอนเทนต์ฉบับร่างแล้ว')
    await router.push('/admin/contents')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}


function toggleTag(tagId: string) {
  selectedTagIds.value = selectedTagIds.value.includes(tagId)
    ? selectedTagIds.value.filter((id) => id !== tagId)
    : [...selectedTagIds.value, tagId]
}
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <RouterLink to="/admin/contents" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <i class="mdi mdi-arrow-left" /> กลับไปหน้ารายการ
        </RouterLink>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {{ isEdit ? 'แก้ไขคอนเทนต์' : 'เพิ่มคอนเทนต์' }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">กรอกข้อมูลสำคัญให้ครบ แล้วบันทึกเพื่ออัปเดตคอนเทนต์</p>
      </div>
      <div v-if="!loading" class="hidden items-center gap-3 lg:flex">
        <RouterLink to="/admin/contents" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">ยกเลิก</RouterLink>
        <button type="button" class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50" :disabled="saving" @click="save">
          <i class="mdi mdi-content-save-outline mr-1" />{{ saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
        </button>
      </div>
    </div>
    <form
      v-if="!loading"
      class="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      @submit.prevent="save"
    >
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><i class="mdi mdi-text-box-outline text-xl" /></span>
            <div><h2 class="font-bold text-slate-900">ข้อมูลคอนเทนต์</h2><p class="text-xs text-slate-500">หัวข้อ คำอธิบายย่อ และวิดีโอประกอบ</p></div>
          </div>
          <div class="space-y-5">
            <AppTextField v-model="form.title" label="ชื่อคอนเทนต์ *" placeholder="ระบุหัวข้อคอนเทนต์" />
            <AppTextarea v-model="form.summary" label="คำอธิบายย่อ" placeholder="สรุปคอนเทนต์สั้น ๆ" />
            <AppTextField v-model="form.youtubeUrl" label="URL วิดีโอ YouTube" placeholder="https://www.youtube.com/watch?v=..." />
            <div v-if="youtubeEmbedUrl(form.youtubeUrl)" class="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-slate-950"><iframe :src="youtubeEmbedUrl(form.youtubeUrl)" title="ตัวอย่างวิดีโอ YouTube" class="aspect-video w-full" allowfullscreen /></div>
            <p v-else-if="form.youtubeUrl" class="text-xs text-rose-600">กรุณาใส่ลิงก์ YouTube เช่น youtube.com/watch?v=... หรือ youtu.be/...</p>
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><i class="mdi mdi-map-marker-outline text-xl" /></span>
            <div><h2 class="font-bold text-slate-900">สถานที่และพื้นที่</h2><p class="text-xs text-slate-500">เลือกพื้นที่หรือค้นหาตำแหน่งบนแผนที่</p></div>
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
          <AppSelect
            v-model="form.contentCategoryId"
            label="หมวดหมู่ *"
            :items="categories"
            item-title="categoryName"
            item-value="contentCategoryId"
            placeholder="เลือกหมวดหมู่"
          /><AppSelect
            v-model="form.shopId"
            label="ร้านค้าที่เกี่ยวข้อง"
            :items="shops"
            item-title="shopName"
            item-value="shopId"
            placeholder="ไม่ระบุร้านค้า"
            clearable
          /><AppSelect
            v-model="form.districtId"
            label="อำเภอ"
            :items="districts"
            item-title="districtName"
            item-value="districtId"
            placeholder="ไม่ระบุอำเภอ"
            clearable
          /><AppSelect
            v-model="form.subDistrictId"
            label="ตำบล"
            :items="subDistricts"
            item-title="subDistrictName"
            item-value="subDistrictId"
            placeholder="ไม่ระบุตำบล"
            :disabled="!form.districtId"
            clearable
          />
          </div>
          <div class="mt-5"><LocationPickerMap v-model:latitude="form.latitude" v-model:longitude="form.longitude" /></div>
        </section>
      </div>
      <aside class="space-y-6 xl:sticky xl:top-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-4 flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><i class="mdi mdi-tag-multiple-outline text-xl" /></span><div><h2 class="font-bold text-slate-900">แท็กคอนเทนต์</h2><p class="text-xs text-slate-500">เลือกได้มากกว่า 1 แท็ก</p></div></div>
          <div class="flex flex-wrap gap-2">
            <button v-for="tag in tags" :key="tag.tagId" type="button" class="rounded-full border px-3 py-1.5 text-sm font-semibold transition" :class="selectedTagIds.includes(tag.tagId) ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'" @click="toggleTag(tag.tagId)">
              <i class="mdi mr-1" :class="selectedTagIds.includes(tag.tagId) ? 'mdi-check' : 'mdi-tag-outline'" />#{{ tag.tagName }}
            </button>
            <span v-if="!tags.length" class="text-sm text-slate-400">ยังไม่มีแท็ก กรุณาเพิ่มแท็กก่อน</span>
          </div>
        </section>
        <section v-if="isEdit" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="mb-4 font-bold text-slate-900">สถานะการเผยแพร่</h2>
          <AppSelect v-model="form.status" label="สถานะ" :items="statusOptions" item-title="label" item-value="value" />
        </section>
        <section class="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-sm text-slate-600">
          <div class="flex gap-3"><i class="mdi mdi-lightbulb-on-outline text-xl text-indigo-600" /><p>ช่องที่มีเครื่องหมาย <strong class="text-slate-800">*</strong> จำเป็นต้องกรอกก่อนบันทึก</p></div>
        </section>
        <div class="flex gap-3 lg:hidden">
          <RouterLink to="/admin/contents" class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-600">ยกเลิก</RouterLink>
          <button type="submit" class="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50" :disabled="saving">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
        </div>
      </aside>
    </form>
    <div v-else class="mt-6 h-1 animate-pulse rounded bg-indigo-600" />
  </main>
</template>
