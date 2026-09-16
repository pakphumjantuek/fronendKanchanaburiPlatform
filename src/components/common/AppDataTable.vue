<script setup lang="ts">
import { computed, ref } from 'vue'

type TableItem = object

export interface DataTableColumn {
  key: string
  label: string
  class?: string
  headerClass?: string
  sortable?: boolean
}

export interface DataTablePagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    items?: TableItem[]
    rowKey?: string | ((item: TableItem) => string | number)
    loading?: boolean
    emptyMessage?: string
    pagination?: DataTablePagination
  }>(),
  {
    items: () => [],
    loading: false,
    emptyMessage: 'ไม่พบข้อมูล',
  },
)

const emit = defineEmits<{
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
  sortChange: [sort: { key: string; order: 'asc' | 'desc' } | null]
}>()

const sortBy = ref<Array<{ key: string; order: 'asc' | 'desc' }>>([])

const headers = computed(() => {
  return props.columns.map((col) => ({
    key: col.key,
    title: col.label,
    sortable: col.sortable !== undefined ? col.sortable : col.key !== 'actions',
    headerProps: {
      class: `font-bold text-slate-700 ${col.headerClass || ''}`,
    },
    cellProps: col.class ? { class: col.class } : undefined,
  }))
})

function itemKey(item: TableItem): string | number {
  if (!props.rowKey) return JSON.stringify(item)
  if (typeof props.rowKey === 'function') return props.rowKey(item)
  return (item as Record<string, any>)[props.rowKey]
}

const displayItems = computed(() => {
  if (!sortBy.value || sortBy.value.length === 0) {
    return props.items
  }
  const sortItem = sortBy.value[0]
  if (!sortItem) return props.items

  const { key, order } = sortItem
  return [...props.items].sort((a: any, b: any) => {
    const valA = a[key]
    const valB = b[key]
    if (valA === valB) return 0
    if (valA == null) return 1
    if (valB == null) return -1

    let cmp = 0
    if (typeof valA === 'number' && typeof valB === 'number') {
      cmp = valA - valB
    } else {
      cmp = String(valA).localeCompare(String(valB), 'th', { numeric: true })
    }
    return order === 'desc' ? -cmp : cmp
  })
})

const currentPage = computed(() => props.pagination?.page ?? 1)
const totalPages = computed(() => props.pagination?.totalPages ?? 1)
const totalCount = computed(() => props.pagination?.totalCount ?? props.items.length)
const pageSize = computed(() => props.pagination?.pageSize ?? 10)

const startItem = computed(() => {
  if (totalCount.value === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * pageSize.value
  return end > totalCount.value ? totalCount.value : end
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | string)[] = []
  pages.push(1)
  if (current > 3) {
    pages.push('...')
  }
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (current < total - 2) {
    pages.push('...')
  }
  pages.push(total)
  return pages
})

function handlePageUpdate(newPage: number) {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value) {
    emit('pageChange', newPage)
  }
}

function handlePageSizeSelect(e: Event) {
  const target = e.target as HTMLSelectElement
  const newSize = Number(target.value)
  emit('pageSizeChange', newSize)
}

function handleSortUpdate(newSort: Array<{ key: string; order: 'asc' | 'desc' }>) {
  sortBy.value = newSort
  const first = newSort[0]
  if (first) {
    emit('sortChange', first)
  } else {
    emit('sortChange', null)
  }
}
</script>

<template>
  <div class="vuetify-data-table-wrapper rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all">
    <v-data-table-server
      v-model:sort-by="sortBy"
      theme="light"
      :headers="headers"
      :items="displayItems"
      :items-length="totalCount"
      :page="currentPage"
      :items-per-page="pageSize"
      :loading="loading"
      :item-value="itemKey"
      :no-data-text="emptyMessage"
      loading-text="กำลังโหลดข้อมูล..."
      density="comfortable"
      hover
      class="elevation-0 vuetify-custom-table bg-white text-slate-900"
      @update:sort-by="handleSortUpdate"
    >
      <!-- Dynamic Cell Slots -->
      <template
        v-for="col in columns"
        :key="col.key"
        #[`item.${col.key}`]="{ item, value }"
      >
        <slot :name="`cell-${col.key}`" :item="item" :value="value">
          <span class="text-slate-800 text-sm font-normal">{{ value ?? '-' }}</span>
        </slot>
      </template>

      <!-- Dynamic Header Slots -->
      <template
        v-for="col in columns"
        :key="`header-${col.key}`"
        #[`header.${col.key}`]="{ column }"
      >
        <slot :name="`header-${col.key}`" :column="column">
          <span class="font-bold text-slate-700 text-xs sm:text-sm tracking-wide">{{ col.label }}</span>
        </slot>
      </template>

      <!-- Bottom Pagination Footer Slot -->
      <template #bottom>
        <div
          v-if="totalCount > 0"
          class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-5 py-3.5 text-xs sm:text-sm text-slate-600 bg-slate-50/70"
        >
          <!-- Left info & page size -->
          <div class="flex items-center gap-4 flex-wrap">
            <span class="text-slate-600">
              แสดง <strong class="text-slate-900 font-semibold">{{ startItem }} - {{ endItem }}</strong> จาก <strong class="text-slate-900 font-semibold">{{ totalCount }}</strong> รายการ
            </span>

            <div class="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span class="text-xs text-slate-500">แสดงต่อหน้า:</span>
              <select
                :value="pageSize"
                class="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs transition cursor-pointer"
                @change="handlePageSizeSelect"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <!-- Right Paging controls -->
          <div class="flex items-center gap-1.5 font-medium">
            <!-- First Page -->
            <button
              type="button"
              title="หน้าแรก"
              class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              :disabled="currentPage === 1"
              @click="handlePageUpdate(1)"
            >
              «
            </button>

            <!-- Previous Page -->
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              :disabled="currentPage === 1"
              @click="handlePageUpdate(currentPage - 1)"
            >
              ‹ ก่อนหน้า
            </button>

            <!-- Page Number Buttons -->
            <div class="hidden sm:flex items-center gap-1">
              <template v-for="(p, idx) in visiblePages" :key="idx">
                <span
                  v-if="p === '...'"
                  class="px-2 text-slate-400 font-bold select-none text-xs"
                >
                  ...
                </span>
                <button
                  v-else
                  type="button"
                  class="min-w-[32px] h-8 rounded-lg border text-xs font-semibold transition cursor-pointer"
                  :class="
                    p === currentPage
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  "
                  @click="handlePageUpdate(p as number)"
                >
                  {{ p }}
                </button>
              </template>
            </div>

            <!-- Next Page -->
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              :disabled="currentPage >= totalPages"
              @click="handlePageUpdate(currentPage + 1)"
            >
              ถัดไป ›
            </button>

            <!-- Last Page -->
            <button
              type="button"
              title="หน้าสุดท้าย"
              class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              :disabled="currentPage >= totalPages"
              @click="handlePageUpdate(totalPages)"
            >
              »
            </button>
          </div>
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<style scoped>
.vuetify-custom-table,
.vuetify-custom-table :deep(.v-table),
.vuetify-custom-table :deep(.v-table__wrapper),
.vuetify-custom-table :deep(table),
.vuetify-custom-table :deep(tbody),
.vuetify-custom-table :deep(tr),
.vuetify-custom-table :deep(td) {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

.vuetify-custom-table :deep(th) {
  font-weight: 700 !important;
  color: #334155 !important;
  background-color: #f8fafc !important;
  font-size: 0.8125rem !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0 !important;
  padding-top: 0.875rem !important;
  padding-bottom: 0.875rem !important;
  white-space: nowrap;
}

.vuetify-custom-table :deep(th.v-data-table__th--sortable:hover) {
  background-color: #f1f5f9 !important;
  color: #4f46e5 !important;
  cursor: pointer;
}

.vuetify-custom-table :deep(tr:hover:not(.v-data-table__empty-row) > td) {
  background-color: #f8fafc !important;
}

.vuetify-custom-table :deep(td) {
  font-size: 0.875rem !important;
  color: #0f172a !important;
  padding-top: 0.875rem !important;
  padding-bottom: 0.875rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.vuetify-custom-table :deep(.v-data-table-header__icon) {
  color: #6366f1 !important;
  margin-left: 0.25rem;
}
</style>
