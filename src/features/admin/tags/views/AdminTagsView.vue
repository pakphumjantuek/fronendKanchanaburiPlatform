<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { deleteTag, getTags, type Tag } from '../api/adminTagApi'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const tags = ref<Tag[]>([])
const status = ref<string | null>(null)
const loading = ref(true)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const swal = useSwal()
const statusOptions = [
  { value: 'Active', label: 'เปิดใช้งาน' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
]
const columns: DataTableColumn[] = [
  { key: 'tagName', label: 'แท็ก', class: 'font-semibold text-slate-900' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]

async function load() {
  loading.value = true
  try {
    const result = await getTags({
      status: status.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    tags.value = result.items
    pagination.value = result
  } catch (error) {
    await swal.error('โหลดแท็กไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}
async function remove(tag: Tag) {
  const result = await swal.confirm('ปิดใช้งานแท็กนี้?', `#${tag.tagName}`)
  if (!result.isConfirmed) return
  try {
    await deleteTag(tag.tagId)
    await swal.success('ปิดใช้งานแท็กแล้ว')
    await load()
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}
function changePage(page: number) {
  pagination.value.page = page
  load()
}
function asTag(item: object) {
  return item as Tag
}
watch(status, () => {
  pagination.value.page = 1
  load()
})
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-indigo-600">Content management</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">แท็กคอนเทนต์</h1>
        <p class="mt-2 text-slate-500">จัดการคำสำคัญสำหรับจัดกลุ่มและค้นหาคอนเทนต์</p>
      </div>
      <RouterLink
        to="/admin/tags/new"
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >+ เพิ่มแท็ก</RouterLink
      >
    </div>
    <section class="mb-6 max-w-xs rounded-2xl border border-slate-200 bg-white p-4">
      <AppSelect
        v-model="status"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        placeholder="ทุกสถานะ"
        clearable
      />
    </section>
    <AppDataTable
      :columns="columns"
      :items="tags"
      row-key="tagId"
      :loading="loading"
      :pagination="pagination"
      empty-message="ยังไม่มีแท็ก"
      @page-change="changePage"
    >
      <template #cell-tagName="{ item }"
        ><span class="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700"
          >#{{ asTag(item).tagName }}</span
        ></template
      >
      <template #cell-status="{ item }"
        ><span
          class="rounded-full px-2.5 py-1 text-xs font-bold"
          :class="
            asTag(item).status === 'Active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          "
          >{{ asTag(item).status === 'Active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span
        ></template
      >
      <template #cell-actions="{ item }"
        ><RouterLink
          :to="`/admin/tags/${asTag(item).tagId}/edit`"
          class="mr-3 font-semibold text-indigo-600"
          >แก้ไข</RouterLink
        ><button
          v-if="asTag(item).status === 'Active'"
          class="font-semibold text-rose-600"
          @click="remove(asTag(item))"
        >
          ปิดใช้งาน
        </button></template
      >
    </AppDataTable>
  </main>
</template>
