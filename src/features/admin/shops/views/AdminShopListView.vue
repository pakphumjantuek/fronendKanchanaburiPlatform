<template>
  <main class="mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-semibold text-indigo-600">Administration</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">จัดการร้านค้า</h1>
        <p class="mt-2 text-slate-500">ตรวจสอบและจัดการสถานะร้านค้าทั้งหมด</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          to="/admin/shops/pending"
          class="inline-flex items-center gap-2 rounded-xl bg-[#D96C2C] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#BF5720]"
        >
          <i class="mdi mdi-account-clock-outline text-lg"></i>
          คำขอสมัครร้านค้า
        </RouterLink>
        <button
          class="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-600 hover:bg-white"
          @click="load"
        >
          รีเฟรช
        </button>
      </div>
    </div>
    <section class="mb-6 overflow-hidden rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8D9C9] bg-[#F7F0E6] px-5 py-3.5">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D96C2C] text-white shadow-sm">
            <i class="mdi mdi-filter-variant text-lg"></i>
          </span>
          <div>
            <h2 class="font-bold text-[#332820]">ค้นหาและกรองร้านค้า</h2>
            <p class="text-sm text-[#786B62]">ค้นหาจากชื่อร้าน หรือเลือกสถานะที่ต้องการ</p>
          </div>
        </div>
        <button
          v-if="hasFilters"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#BF5720] transition hover:bg-[#FBE8D8]"
          @click="clearFilters"
        >
          <i class="mdi mdi-filter-remove-outline text-base"></i>
          ล้างตัวกรอง
        </button>
      </div>
      <div class="grid gap-4 p-5 md:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-bold text-[#4A3E35]">ชื่อร้านค้า</label>
          <div class="shop-search-field relative">
            <i class="mdi mdi-magnify pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-[#A18979]"></i>
            <AppTextField
              v-model="search"
              placeholder="พิมพ์ชื่อร้านที่ต้องการค้นหา"
            />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-bold text-[#4A3E35]">สถานะร้านค้า</label>
          <div class="shop-status-field relative">
            <i class="mdi mdi-store-cog-outline pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-[#A18979]"></i>
            <AppSelect
              v-model="status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              placeholder="ทุกสถานะ"
              clearable
            />
          </div>
        </div>
      </div>
    </section>
    <AppDataTable
      :columns="columns"
      :items="shops"
      row-key="shopId"
      :loading="loading"
      empty-message="ไม่พบร้านค้า"
      :pagination="pagination"
      @page-change="changePage"
      ><template #cell-status="{ item }"
        ><span
          class="rounded-full px-2.5 py-1 text-xs font-bold"
          :class="
            asShop(item).status === 'Active'
              ? 'bg-emerald-100 text-emerald-700'
              : ['Rejected', 'Suspended'].includes(asShop(item).status)
                ? 'bg-red-100 text-red-700'
                : asShop(item).status === 'PendingApproval'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
          "
          >{{ statusLabel(asShop(item).status) }}</span
        ></template
      ><template #cell-actions="{ item }"
        ><div class="flex items-center gap-3">
          <RouterLink
            :to="`/admin/shops/${asShop(item).shopId}/products`"
            class="whitespace-nowrap font-semibold text-indigo-600"
            >ดูสินค้า</RouterLink
          ><AppSelect
            :model-value="asShop(item).status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            :disabled="updatingId === asShop(item).shopId"
            @update:model-value="changeStatus(asShop(item), String($event))"
          /></div></template
    ></AppDataTable>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getAdminShops, updateShopStatus } from '../api/adminShopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import AppSelect from '@/components/common/input/AppSelect.vue'
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
const status = ref<string | null>(null)
const loading = ref(true)
const updatingId = ref<string | null>(null)
const pagination = ref<DataTablePagination>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 })
const swal = useSwal()
const hasFilters = computed(() => Boolean(search.value.trim() || status.value))
const statusOptions = [
  { value: 'PendingApproval', label: 'รออนุมัติ' },
  { value: 'Active', label: 'เปิดใช้งาน' },
  { value: 'Rejected', label: 'ไม่อนุมัติ' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
  { value: 'Suspended', label: 'ระงับการใช้งาน' },
  { value: 'Closed', label: 'ปิดร้าน' },
]
const columns: DataTableColumn[] = [
  { key: 'shopName', label: 'ร้านค้า', class: 'font-semibold text-slate-900' },
  // { key: 'ownerUserId', label: 'เจ้าของ', class: 'text-sm text-slate-600' },
  { key: 'categoryName', label: 'หมวดหมู่', class: 'text-sm text-slate-600' },
  { key: 'districtName', label: 'พื้นที่', class: 'text-sm text-slate-600' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]
async function load() {
  loading.value = true
  try {
    const result: PagedResult<Shop> = await getAdminShops({
      search: search.value || undefined,
      status: status.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    shops.value = result.items
    pagination.value = result
  } catch (error) {
    await swal.error('โหลดร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  pagination.value.page = page
  load()
}

function clearFilters() {
  search.value = ''
  status.value = null
}

async function changeStatus(shop: Shop, nextStatus: string) {
  if (nextStatus === shop.status) return
  const result = await swal.confirm(`เปลี่ยนสถานะเป็น ${statusLabel(nextStatus)}?`, shop.shopName)
  if (!result.isConfirmed) return
  updatingId.value = shop.shopId
  try {
    await updateShopStatus(shop.shopId, nextStatus)
    shop.status = nextStatus
    await swal.success('อัปเดตสถานะแล้ว')
  } catch (error) {
    await swal.error('อัปเดตไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    updatingId.value = null
  }
}
function asShop(item: object): Shop {
  return item as Shop
}

function statusLabel(value: string) {
  return statusOptions.find((option) => option.value === value)?.label ?? value
}

watch([search, status], () => {
  pagination.value.page = 1
  load()
})
onMounted(load)
</script>

<style scoped>
.shop-search-field :deep(input) {
  border-color: #d8c7b5;
  background-color: #ffffff;
  padding-left: 2.75rem !important;
}

.shop-search-field :deep(input:focus) {
  border-color: #d96c2c;
  box-shadow: 0 0 0 2px rgb(217 108 44 / 20%);
}

.shop-status-field :deep(.relative > div) {
  border-color: #d8c7b5;
  background-color: #ffffff;
  padding-left: 2.75rem;
}

.shop-status-field :deep(.relative > div:focus-within) {
  border-color: #d96c2c;
}
</style>
