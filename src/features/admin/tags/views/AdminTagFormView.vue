<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createTag, getTag, updateTag } from '../api/adminTagApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const tagId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(tagId.value))
const loading = ref(isEdit.value)
const saving = ref(false)
const form = reactive({ tagName: '', status: 'Active' as 'Active' | 'Inactive' })
const statusOptions = [
  { value: 'Active', label: 'เปิดใช้งาน' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
]
async function load() {
  if (!isEdit.value) return
  try {
    const tag = await getTag(tagId.value)
    form.tagName = tag.tagName
    form.status = tag.status
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'ไม่พบแท็กที่ต้องการ'))
    await router.replace('/admin/tags')
  } finally {
    loading.value = false
  }
}
async function save() {
  if (!form.tagName.trim()) {
    await swal.warning('กรอกชื่อแท็ก', 'กรุณาระบุชื่อแท็ก')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) await updateTag(tagId.value, form)
    else await createTag({ tagName: form.tagName })
    await swal.success(isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มแท็กแล้ว')
    await router.push('/admin/tags')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-2xl px-6 py-10">
    <RouterLink to="/admin/tags" class="text-sm font-semibold text-indigo-600"
      >← กลับไปหน้ารายการ</RouterLink
    >
    <h1 class="mt-4 text-3xl font-bold text-slate-900">{{ isEdit ? 'แก้ไขแท็ก' : 'เพิ่มแท็ก' }}</h1>
    <form
      v-if="!loading"
      class="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      @submit.prevent="save"
    >
      <AppTextField v-model="form.tagName" label="ชื่อแท็ก *" placeholder="เช่น ธรรมชาติ" />
      <AppSelect
        v-if="isEdit"
        v-model="form.status"
        label="สถานะ"
        :items="statusOptions"
        item-title="label"
        item-value="value"
      />
      <div class="flex justify-end gap-3">
        <RouterLink
          to="/admin/tags"
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
