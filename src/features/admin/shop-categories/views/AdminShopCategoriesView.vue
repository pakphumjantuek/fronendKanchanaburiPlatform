<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  categoryImageUrl,
  deleteCategory,
  getCategories,
  type ShopCategory,
} from '../api/adminShopCategoryApi'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'

const categories = ref<ShopCategory[]>([])
const loading = ref(true)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const columns: DataTableColumn[] = [
  // { key: 'image', label: 'รูป' },
  { key: 'categoryName', label: 'หมวดหมู่', class: 'font-semibold text-slate-900' },
  { key: 'description', label: 'รายละเอียด', class: 'text-slate-600' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]

async function load() {
  loading.value = true
  try {
    const result = await getCategories({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    if (Array.isArray(result)) {
      categories.value = result
      pagination.value = {
        page: 1,
        pageSize: result.length || 10,
        totalCount: result.length,
        totalPages: 1,
      }
    } else {
      categories.value = result.items
      pagination.value = result
    }
  } finally {
    loading.value = false
  }
}

async function remove(category: ShopCategory) {
  await deleteCategory(category.shopCategoryId)
  await load()
}

function changePage(page: number) {
  pagination.value.page = page
  load()
}

function asCategory(item: object): ShopCategory {
  return item as ShopCategory
}
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-indigo-600">Administration</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">จัดการหมวดหมู่ร้าน</h1>
        <p class="mt-2 text-slate-500">รายการหมวดหมู่ร้านค้าทั้งหมด</p>
      </div>
      <RouterLink
        to="/admin/categories/new"
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >+ เพิ่มหมวดหมู่</RouterLink
      >
    </div>
    <AppDataTable
      :columns="columns"
      :items="categories"
      row-key="shopCategoryId"
      :loading="loading"
      :pagination="pagination"
      empty-message="ยังไม่มีหมวดหมู่ร้าน"
      @page-change="changePage"
      ><template #cell-image="{ item }"
        ><img
          v-if="asCategory(item).hasImage"
          :src="categoryImageUrl(asCategory(item).shopCategoryId)"
          :alt="asCategory(item).categoryName"
          class="h-12 w-16 rounded-lg object-cover" /><span
          v-else
          class="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
          ><i class="mdi mdi-image-outline text-xl" /></span></template
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
          :to="`/admin/categories/${asCategory(item).shopCategoryId}/edit`"
          class="mr-3 font-semibold text-indigo-600"
          >แก้ไข</RouterLink
        ><button class="font-semibold text-red-600" @click="remove(asCategory(item))">
          ปิดใช้งาน
        </button></template
      ></AppDataTable
    >
  </main>
</template>
