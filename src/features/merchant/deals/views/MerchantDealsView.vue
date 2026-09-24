<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createDeal, getProductDeals, stopDeal} from '../api/productDealApi'
import { getMyShop } from '@/features/merchant/api/shopApi'
import { getProducts, type Product } from '@/features/shops/api'
import AppDataTable, { type DataTableColumn } from '@/components/common/AppDataTable.vue'
import type { ProductDeal } from '../interface/type'
const deals = ref<ProductDeal[]>([])
const route = useRoute()
const products = ref<Product[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const columns: DataTableColumn[] = [
  { key: 'dealType', label: 'ประเภทดีล' },
  { key: 'discountValue', label: 'ส่วนลด' },
  { key: 'remainingQuantity', label: 'สิทธิ์คงเหลือ' },
  { key: 'period', label: 'ช่วงเวลา' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: 'จัดการ' },
]
const form = ref({
  productId: '',
  dealType: 'FlashDeal',
  discountType: 'FixedAmount',
  discountValue: 0,
  totalQuantity: 1,
  startsAt: '',
  endsAt: '',
})
const productName = computed(() => products.value[0]?.productName ?? 'สินค้า')
async function load() {
  loading.value = true
  try {
    deals.value = await getProductDeals(String(route.params.id))
  } finally {
    loading.value = false
  }
}
async function stop(id: string) {
  await stopDeal(id)
  await load()
}
async function save() {
  if (!form.value.productId || !form.value.startsAt || !form.value.endsAt) return
  saving.value = true
  try {
    await createDeal(form.value.productId, {
      ...form.value,
      startsAt: new Date(form.value.startsAt).toISOString(),
      endsAt: new Date(form.value.endsAt).toISOString(),
    })
    showForm.value = false
    await load()
  } finally {
    saving.value = false
  }
}
function label(d: ProductDeal) {
  return d.dealType === 'FlashDeal' ? 'โปรโมชันพิเศษ' : 'โปรเด็ดชุมชน'
}
function formatThaiDate(value: string) {
  const isoValue = value.replace(' ', 'T')
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(isoValue)
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(hasTimezone ? isoValue : `${isoValue}Z`),
  )
}
function statusLabel(status: string) {
  return status === 'Active'
    ? 'กำลังใช้งาน'
    : status === 'Stopped'
      ? 'หยุดดีลแล้ว'
      : status === 'Expired'
        ? 'หมดเวลาแล้ว'
        : status
}
onMounted(async () => {
  await load()
  const shop = await getMyShop()
  products.value = (await getProducts()).filter((product) => product.shopId === shop.shopId && product.productId === String(route.params.id))
  form.value.productId = String(route.params.id)
})
</script>
<template>
  <main class="mx-auto w-full max-w-[1800px] px-5 py-6 sm:px-8 lg:px-10 lg:py-9 2xl:px-12">
    <div class="mb-8 flex flex-col gap-4 border-b border-[#E8D9C9] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="font-bold text-[#D96C2C]">Promotions</p>
        <h1 class="text-3xl font-black text-[#332820]">จัดการโปรโมชันสินค้า</h1>
        <p class="mt-1 text-[#786B62]">จัดการส่วนลดและช่วงเวลาของสินค้า</p>
      </div>
      <button
        class="w-full rounded-xl bg-[#D96C2C] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#C95E20] sm:w-auto"
        @click="showForm = !showForm"
      >
        สร้างดีลใหม่
      </button>
    </div>
    <form
      v-if="showForm"
      class="mb-8 grid gap-5 rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-sm md:grid-cols-2 lg:p-6 2xl:grid-cols-3"
      @submit.prevent="save"
    >
      <div class="rounded-xl border border-[#E8D9C9] bg-[#F7F0E6] px-4 py-3 text-sm font-bold text-[#332820] md:col-span-2 2xl:col-span-3">
        <i class="mdi mdi-package-variant-closed mr-1.5 text-[#D96C2C]"></i>โปรโมชั่นสำหรับ: {{ productName }}
      </div>
      <label class="space-y-1"
        ><span class="text-sm font-bold">ประเภทดีล</span
        ><select v-model="form.dealType" class="w-full rounded-xl border p-3">
          <option value="FlashDeal">โปรโมชันพิเศษ</option>
          <option value="LocalDeal">โปรเด็ดชุมชน</option>
        </select></label
      >
      <label class="space-y-1"
        ><span class="text-sm font-bold">รูปแบบส่วนลด</span
        ><select v-model="form.discountType" class="w-full rounded-xl border p-3">
          <option value="FixedAmount">ลดเป็นบาท</option>
          <option value="Percent">ลดเปอร์เซ็นต์</option>
        </select></label
      >
      <label class="space-y-1"
        ><span class="text-sm font-bold">จำนวนส่วนลด</span
        ><input
          v-model.number="form.discountValue"
          type="number"
          min="1"
          placeholder="เช่น 50"
          required
          class="w-full rounded-xl border p-3"
      /></label>
      <label class="space-y-1"
        ><span class="text-sm font-bold">จำนวนสิทธิ์</span
        ><input
          v-model.number="form.totalQuantity"
          type="number"
          min="1"
          placeholder="เช่น 20"
          required
          class="w-full rounded-xl border p-3"
      /></label>
      <label class="space-y-1"
        ><span class="text-sm font-bold">เริ่มต้น</span
        ><input
          v-model="form.startsAt"
          type="datetime-local"
          required
          class="w-full rounded-xl border p-3"
      /></label>
      <label class="space-y-1"
        ><span class="text-sm font-bold">สิ้นสุด</span
        ><input
          v-model="form.endsAt"
          type="datetime-local"
          required
          class="w-full rounded-xl border p-3"
      /></label>
      <div class="flex md:col-span-2 md:justify-end 2xl:col-span-3">
        <button
          :disabled="saving"
          class="w-full rounded-xl bg-[#D96C2C] px-7 py-3 font-bold text-white transition hover:bg-[#C95E20] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {{ saving ? 'กำลังบันทึก...' : 'บันทึกดีล' }}
        </button>
      </div>
    </form>
    <div v-if="loading" class="p-10 text-center">กำลังโหลด...</div>
    <section v-else class="overflow-hidden rounded-2xl border border-[#E8D9C9] bg-white shadow-sm">
      <AppDataTable
        :columns="columns"
        :items="deals"
        row-key="productDealId"
        empty-message="ยังไม่มีดีล"
      >
      <template #cell-dealType="{ item }">{{ label(item as ProductDeal) }}</template
      ><template #cell-discountValue="{ item }">{{
        (item as ProductDeal).discountType === 'Percent'
          ? `${(item as ProductDeal).discountValue}%`
          : `฿${(item as ProductDeal).discountValue}`
      }}</template
      ><template #cell-remainingQuantity="{ item }"
        >{{ (item as ProductDeal).remainingQuantity }} /
        {{ (item as ProductDeal).totalQuantity }}</template
      ><template #cell-period="{ item }"
        >{{ formatThaiDate((item as ProductDeal).startsAt) }} –
        {{ formatThaiDate((item as ProductDeal).endsAt) }}</template
      ><template #cell-status="{ item }">{{ statusLabel((item as ProductDeal).status) }}</template
      ><template #cell-actions="{ item }"
        ><button
          v-if="(item as ProductDeal).status === 'Active'"
          class="font-bold text-rose-700"
          @click="stop((item as ProductDeal).productDealId)"
        >
          หยุดดีล
        </button></template
      >
      </AppDataTable>
    </section>
  </main>
</template>
