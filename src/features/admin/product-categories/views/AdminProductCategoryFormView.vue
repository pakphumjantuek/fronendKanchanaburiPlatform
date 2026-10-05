<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createProductCategory,
  getProductCategory,
  updateProductCategory,
} from '../api/adminProductCategoryApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
const route = useRoute()
const router = useRouter()
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(id.value))
const loading = ref(isEdit.value)
const saving = ref(false)

const form = reactive({ categoryName: '', description: '', status: 'Active' })

async function load() {
  if (!isEdit.value) return
  const category = await getProductCategory(id.value)
  form.categoryName = category.categoryName
  form.description = category.description ?? ''
  form.status = category.status
  loading.value = false
}

async function save() {
  if (!form.categoryName.trim()) return
  saving.value = true
  try {
    if (isEdit.value) await updateProductCategory(id.value, form)
    else await createProductCategory(form)
    router.push('/admin/product-categories')
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>
<template>
  <main class="mx-auto w-full max-w-2xl px-6 py-10">
    <RouterLink to="/admin/product-categories" class="font-semibold text-indigo-600"
      >← กลับไปหน้ารายการ</RouterLink
    >
    <h1 class="mt-4 text-3xl font-bold">
      {{ isEdit ? 'แก้ไขหมวดหมู่สินค้า' : 'เพิ่มหมวดหมู่สินค้า' }}
    </h1>
    <form
      v-if="!loading"
      class="mt-6 space-y-5 rounded-2xl border bg-white p-6"
      @submit.prevent="save"
    >
      <AppTextField v-model="form.categoryName" label="ชื่อหมวดหมู่" />
      <AppTextarea v-model="form.description" label="รายละเอียด" />
      <AppSelect
        v-if="isEdit"
        v-model="form.status"
        label="สถานะ"
        :items="['Active', 'Inactive']"
      />
      <div class="flex justify-end gap-3">
        <RouterLink to="/admin/product-categories" class="rounded-xl border px-5 py-2.5"
          >ยกเลิก</RouterLink
        >
        <button class="rounded-xl bg-indigo-600 px-5 py-2.5 text-white" :disabled="saving">
          บันทึก
        </button>
      </div>
    </form>
    <div v-else class="mt-6 h-1 animate-pulse bg-indigo-600" />
  </main>
</template>
