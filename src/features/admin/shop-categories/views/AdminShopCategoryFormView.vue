<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  categoryImageUrl,
  createCategory,
  deleteCategoryImage,
  getCategory,
  updateCategory,
  uploadCategoryImage,
} from '../api/adminShopCategoryApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const categoryId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(categoryId.value))
const loading = ref(isEdit.value)
const saving = ref(false)
const statusOptions = [
  { value: 'Active', label: 'เปิดใช้งาน' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
]
const form = reactive({ categoryName: '', description: '', status: 'Active' })
const selectedImage = ref<File | null>(null)
const imagePreview = ref('')
const hasImage = ref(false)

async function load() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const category = await getCategory(categoryId.value)
    form.categoryName = category.categoryName
    form.description = category.description ?? ''
    form.status = category.status
    hasImage.value = category.hasImage
    if (category.hasImage) imagePreview.value = categoryImageUrl(categoryId.value)
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'ไม่พบหมวดหมู่ที่ต้องการ'))
    await router.replace('/admin/categories')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.categoryName.trim()) {
    await swal.warning('กรอกชื่อหมวดหมู่', 'กรุณาระบุชื่อหมวดหมู่ร้าน')
    return
  }
  saving.value = true
  try {
    const id = isEdit.value
      ? categoryId.value
      : (await createCategory({ categoryName: form.categoryName, description: form.description }))
          .shopCategoryId
    if (isEdit.value) await updateCategory(id, form)
    if (selectedImage.value) await uploadCategoryImage(id, selectedImage.value)
    await swal.success(isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มหมวดหมู่แล้ว')
    await router.push('/admin/categories')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}
async function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  ) {
    await swal.warning('ไฟล์รูปภาพไม่ถูกต้อง', 'กรุณาเลือก JPG, PNG หรือ WebP ขนาดไม่เกิน 2 MB')
    return
  }
  selectedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

async function removeImage() {
  if (!isEdit.value || !hasImage.value) {
    selectedImage.value = null
    imagePreview.value = ''
    return
  }
  try {
    await deleteCategoryImage(categoryId.value)
    hasImage.value = false
    selectedImage.value = null
    imagePreview.value = ''
    await swal.success('ลบรูปภาพแล้ว')
  } catch (error) {
    await swal.error('ลบรูปภาพไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

onMounted(load)
</script>
<template>
  <main class="mx-auto w-full max-w-2xl px-6 py-10">
    <RouterLink to="/admin/categories" class="text-sm font-semibold text-indigo-600"
      >← กลับไปหน้ารายการ</RouterLink
    >
    <h1 class="mt-4 text-3xl font-bold text-slate-900">
      {{ isEdit ? 'แก้ไขหมวดหมู่ร้าน' : 'เพิ่มหมวดหมู่ร้าน' }}
    </h1>
    <form
      v-if="!loading"
      class="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      @submit.prevent="save"
    >
      <AppTextField v-model="form.categoryName" label="ชื่อหมวดหมู่" placeholder="เช่น ร้านอาหาร" />
      <AppTextarea
        v-model="form.description"
        label="รายละเอียด"
        placeholder="รายละเอียดของหมวดหมู่"
      />
      <AppSelect
        v-if="isEdit"
        v-model="form.status"
        label="สถานะ"
        :items="statusOptions"
        item-title="label"
        item-value="value"
      />
      <section class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-bold text-slate-800">รูปภาพหมวดหมู่</p>
            <p class="mt-1 text-xs text-slate-500">
              JPG, PNG หรือ WebP ขนาดไม่เกิน 2 MB — เก็บในฐานข้อมูล
            </p>
          </div>
          <label
            class="cursor-pointer rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >เลือกไฟล์<input
              class="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="selectImage"
          /></label>
        </div>
        <div
          v-if="imagePreview"
          class="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <img
            :src="imagePreview"
            alt="ตัวอย่างรูปหมวดหมู่"
            class="h-48 w-full object-cover"
          /><button
            type="button"
            class="absolute right-3 top-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700"
            @click="removeImage"
          >
            <i class="mdi mdi-delete-outline mr-1" />ลบรูป
          </button>
        </div>
      </section>
      <div class="flex justify-end gap-3">
        <RouterLink
          to="/admin/categories"
          class="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600"
          >ยกเลิก</RouterLink
        ><button
          type="submit"
          class="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
      </div>
    </form>
    <div v-else class="mt-6 h-1 animate-pulse rounded bg-indigo-600" />
  </main>
</template>
