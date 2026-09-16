<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAdminProducts,
  updateAdminProductStatus,
  type PagedProducts,
} from '../api/adminProductApi'
import type { Product } from '@/features/shops/shared/types/product'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const products = ref<Product[]>([])
const route = useRoute()
const shopId = computed(() => (typeof route.params.shopId === 'string' ? route.params.shopId : ''))
const status = ref<string | null>(null)
const loading = ref(true)
const updatingId = ref<string | null>(null)
const swal = useSwal()
const statusOptions = ['Active', 'Inactive']
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const columns: DataTableColumn[] = [
  { key: 'productName', label: 'สินค้า', class: 'font-semibold text-slate-900' },
  { key: 'shopName', label: 'ร้านค้า', class: 'text-slate-600' },
  { key: 'price', label: 'ราคา' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]

async function load() {
  loading.value = true
  try {
    const result: PagedProducts = await getAdminProducts({
      shopId: shopId.value,
      status: status.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    products.value = result.items
    pagination.value = result
  } catch (error) {
    await swal.error('โหลดสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}

async function closeProduct(product: Product) {
  const result = await swal.confirm(`ปิดการขาย ${product.productName}?`, 'สินค้าจะไม่ถูกลบ')
  if (!result.isConfirmed) return
  updatingId.value = product.productId
  try {
    await updateAdminProductStatus(product.productId, 'Inactive')
    product.status = 'Inactive'
    await swal.success('ปิดการขายสินค้าแล้ว')
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    updatingId.value = null
  }
}

function changePage(page: number) {
  pagination.value.page = page
  load()
}
function asProduct(item: object): Product {
  return item as Product
}
watch(status, () => {
  pagination.value.page = 1
  load()
})
onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-10">
    <RouterLink to="/admin/shops" class="text-sm font-semibold text-indigo-600"
      >← กลับไปจัดการร้านค้า</RouterLink
    >
    <div class="mb-8 mt-4">
      <p class="font-semibold text-indigo-600">Administration</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900">สินค้าของร้าน</h1>
    </div>
    <section class="mb-6 max-w-sm">
      <AppSelect
        v-model="status"
        label="สถานะสินค้า"
        :items="statusOptions"
        placeholder="ทุกสถานะ"
        clearable
      />
    </section>
    <AppDataTable
      :columns="columns"
      :items="products"
      row-key="productId"
      :loading="loading"
      :pagination="pagination"
      empty-message="ไม่พบสินค้า"
      @page-change="changePage"
      ><template #cell-price="{ item }"
        >{{ Number(asProduct(item).price).toLocaleString('th-TH') }} บาท</template
      ><template #cell-status="{ item }"
        ><span
          class="rounded-full px-2.5 py-1 text-xs font-bold"
          :class="
            asProduct(item).status === 'Active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          "
          >{{ asProduct(item).status }}</span
        ></template
      ><template #cell-actions="{ item }"
        ><button
          v-if="asProduct(item).status === 'Active'"
          class="font-semibold text-red-600 disabled:opacity-50"
          :disabled="updatingId === asProduct(item).productId"
          @click="closeProduct(asProduct(item))"
        >
          ปิดขาย</button
        ><span v-else class="text-sm text-slate-400">ปิดขายแล้ว</span></template
      ></AppDataTable
    >
  </main>
</template>
