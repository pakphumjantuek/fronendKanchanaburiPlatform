<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-indigo-600">Content management</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">จัดการคอนเทนต์</h1>
        <p class="mt-2 text-slate-500">สร้าง แก้ไข และเผยแพร่ข่าวสารหรือสถานที่ในระบบ</p>
      </div>
      <RouterLink
        to="/admin/contents/new"
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >+ เพิ่มคอนเทนต์
      </RouterLink>
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
      :items="contents"
      row-key="contentId"
      :loading="loading"
      :pagination="pagination"
      empty-message="ยังไม่มีคอนเทนต์"
      @page-change="changePage"
    >
      <template #cell-title="{ item }">
        <span class="text-sm font-medium text-slate-900">{{ asContent(item).title }}</span>
      </template>
      <template #cell-status="{ item }"
        ><span
          class="rounded-full px-2.5 py-1 text-xs font-bold"
          :class="statusClass(asContent(item).status)"
          >{{ statusLabel(asContent(item).status) }}</span
        ></template
      >
      <template #cell-actions="{ item }">
        <RouterLink
          :to="`/admin/contents/${asContent(item).contentId}/edit`"
          class="mr-3 font-semibold text-indigo-600"
          >แก้ไข</RouterLink
        ><button
          v-if="asContent(item).status !== 'Archived'"
          class="font-semibold text-rose-600"
          @click="archive(asContent(item))"
        >
          เก็บถาวร
        </button>
      </template>
    </AppDataTable>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { archiveContent, getContents, type Content } from '../api/adminContentApi'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const contents = ref<Content[]>([])
const status = ref<string | null>(null)
const loading = ref(true)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const swal = useSwal()
const statusOptions = [
  { value: 'Pending', label: 'รอตรวจสอบ' },
  { value: 'Draft', label: 'ฉบับร่าง' },
  { value: 'Published', label: 'เผยแพร่แล้ว' },
  { value: 'Archived', label: 'เก็บถาวร' },
]
const columns: DataTableColumn[] = [
  { key: 'title', label: 'คอนเทนต์', class: 'text-sm font-medium text-slate-900' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]
async function load() {
  loading.value = true
  try {
    const result = await getContents({
      status: status.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    contents.value = result.items
    pagination.value = result
  } catch (error) {
    await swal.error('โหลดคอนเทนต์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}
async function archive(content: Content) {
  const result = await swal.confirm('เก็บคอนเทนต์นี้เป็นรายการถาวร?', content.title)
  if (!result.isConfirmed) return
  try {
    await archiveContent(content.contentId)
    await swal.success('เก็บคอนเทนต์แล้ว')
    await load()
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}
function statusLabel(value: string) {
  return statusOptions.find((item) => item.value === value)?.label ?? value
}
function statusClass(value: string) {
  return value === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : value === 'Archived'
      ? 'bg-slate-200 text-slate-700'
      : 'bg-amber-100 text-amber-700'
}
function changePage(page: number) {
  pagination.value.page = page
  load()
}

function asContent(item: object) {
  return item as Content
}

watch(status, () => {
  pagination.value.page = 1
  load()
})
onMounted(load)
</script>
