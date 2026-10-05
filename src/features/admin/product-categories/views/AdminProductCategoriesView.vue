<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  deleteProductCategory,
  getProductCategories,
  type PagedProductCategories,
  type ProductCategory,
} from '../api/adminProductCategoryApi'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'
const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const columns: DataTableColumn[] = [
  { key: 'categoryName', label: 'หมวดหมู่', class: 'font-semibold text-slate-900' },
  { key: 'description', label: 'รายละเอียด' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]

async function load() {
  loading.value = true
  try {
    const result: PagedProductCategories = await getProductCategories({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    categories.value = result.items
    pagination.value = result
  } finally {
    loading.value = false
  }
}

async function remove(category: ProductCategory) {
  await deleteProductCategory(category.productCategoryId)
  await load()
}

function changePage(page: number) {
  pagination.value.page = page
  load()
}

function asCategory(item: object): ProductCategory {
  return item as ProductCategory
}
onMounted(load)
</script>
<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-indigo-600">Administration</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">หมวดหมู่สินค้า</h1>
      </div>
      <RouterLink
        to="/admin/product-categories/new"
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >+ เพิ่มหมวดหมู่</RouterLink
      >
    </div>
    <AppDataTable
      :columns="columns"
      :items="categories"
      row-key="productCategoryId"
      :loading="loading"
      :pagination="pagination"
      @page-change="changePage"
      ><template #cell-status="{ item }"
        ><span
          class="rounded-full px-2.5 py-1 text-xs font-bold"
          :class="
            asCategory(item).status === 'Active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          "
          >{{ asCategory(item).status }}</span
        ></template
      ><template #cell-actions="{ item }"
        ><RouterLink
          :to="`/admin/product-categories/${asCategory(item).productCategoryId}/edit`"
          class="mr-3 font-semibold text-indigo-600"
          >แก้ไข</RouterLink
        ><button class="font-semibold text-red-600" @click="remove(asCategory(item))">
          ปิดใช้งาน
        </button></template
      ></AppDataTable
    >
  </main>
</template>
