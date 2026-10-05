<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-[#D96C2C]">Shop applications</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">คำขอสมัครร้านค้า</h1>
        <p class="mt-2 text-slate-500">ตรวจสอบข้อมูลและพิจารณาอนุมัติร้านค้าที่สมัครเข้ามา</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
          @click="load">
          รีเฟรช
        </button>
        <RouterLink to="/admin/shops"
          class="rounded-xl border border-[#D96C2C] px-4 py-2.5 font-semibold text-[#BF5720] hover:bg-[#FFF3E8]">
          จัดการร้านค้าทั้งหมด
        </RouterLink>
      </div>
    </div>

    <section class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
      <div class="flex items-center gap-3">
        <i class="mdi mdi-clock-alert-outline text-2xl"></i>
        <div>
          <p class="font-bold">มีคำขอรอพิจารณา {{ pagination.totalCount }} รายการ</p>
          <p class="mt-0.5 text-sm">
            อนุมัติแล้วร้านค้าจะเปิดใช้งานทันที หรือเลือกไม่อนุมัติเพื่อให้ผู้สมัครแก้ไขและส่งใหม่
          </p>
        </div>
      </div>
    </section>

    <section class="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <AppTextField v-model="search" placeholder="ค้นหาชื่อร้านค้า" />
    </section>

    <AppDataTable :columns="columns" :items="shops" row-key="shopId" :loading="loading"
      empty-message="ไม่มีคำขอสมัครร้านค้าที่รอพิจารณา" :pagination="pagination" @page-change="changePage">
      <template #cell-shopName="{ item }">
        <div>
          <p class="font-bold text-slate-900">{{ asShop(item).shopName }}</p>
        </div>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="updatingId === asShop(item).shopId" @click="changeStatus(asShop(item), 'Active')">
            อนุมัติ
          </button>
          <button
            class="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="updatingId === asShop(item).shopId" @click="changeStatus(asShop(item), 'Rejected')">
            ไม่อนุมัติ
          </button>
        </div>
      </template>
    </AppDataTable>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getAdminShops, updateShopStatus } from '../api/adminShopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppDataTable, {
  type DataTableColumn,
  type DataTablePagination,
} from '@/components/common/AppDataTable.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import type { PagedResult } from '@/shared/interface/PagedResult'

const shops = ref<Shop[]>([])
const search = ref('')
const loading = ref(true)
const updatingId = ref<string | null>(null)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const swal = useSwal()

const columns: DataTableColumn[] = [
  { key: 'shopName', label: 'ร้านค้า' },
  { key: 'categoryName', label: 'หมวดหมู่', class: 'text-sm text-slate-600' },
  { key: 'districtName', label: 'พื้นที่', class: 'text-sm text-slate-600' },
  { key: 'phone', label: 'โทรศัพท์', class: 'text-sm text-slate-600' },
  { key: 'actions', label: 'พิจารณา' },
]

async function load() {
  loading.value = true
  try {
    const result: PagedResult<Shop> = await getAdminShops({
      search: search.value || undefined,
      status: 'PendingApproval',
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    shops.value = result.items
    pagination.value = result
  } catch (error) {
    await swal.error('โหลดคำขอสมัครร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  pagination.value.page = page
  load()
}

async function changeStatus(shop: Shop, status: 'Active' | 'Rejected') {
  const action = status === 'Active' ? 'อนุมัติร้านค้า' : 'ไม่อนุมัติร้านค้า'
  const result = await swal.confirm(`${action}?`, shop.shopName)
  if (!result.isConfirmed) return

  updatingId.value = shop.shopId
  try {
    await updateShopStatus(shop.shopId, status)
    await swal.success(status === 'Active' ? 'อนุมัติร้านค้าแล้ว' : 'ไม่อนุมัติร้านค้าแล้ว')
    await load()
  } catch (error) {
    await swal.error('อัปเดตสถานะไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    updatingId.value = null
  }
}

function asShop(item: object): Shop {
  return item as Shop
}

watch(search, () => {
  pagination.value.page = 1
  load()
})

onMounted(load)
</script>
