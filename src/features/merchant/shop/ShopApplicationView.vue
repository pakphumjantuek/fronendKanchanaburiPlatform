<script setup lang="ts">
import axios from "axios"
import { onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import {
  createShop,
  getDistricts,
  getMyShop,
  getShopCategories,
  getSubDistricts,
  updateShop,
  type District,
  type Shop,
  type ShopCategory,
  type ShopFormData,
  type SubDistrict,
} from "@/features/merchant/api/shopApi"
import AppSelect from "@/components/common/input/AppSelect.vue"
import AppTextField from "@/components/common/input/AppTextField.vue"
import AppTextarea from "@/components/common/input/AppTextarea.vue"
import LocationPickerMap from "@/components/common/map/LocationPickerMap.vue"
import { getApiErrorMessage } from "@/features/auth/api/getApiErrorMessage"
import { useSwal } from "@/plugins/sweetalert"

const router = useRouter()
const swal = useSwal()
const shop = ref<Shop | null>(null)
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const loading = ref(true)
const saving = ref(false)
const form = ref<ShopFormData>({
  shopName: "",
  shopCategoryId: null,
  districtId: null,
  subDistrictId: null,
  description: "",
  phone: "",
  email: "",
  address: "",
  openingTime: "",
  closingTime: "",
  latitude: null,
  longitude: null,
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  promptPay: "",
})

function applyShop(data: Shop) {
  shop.value = data
  form.value = {
    shopName: data.shopName,
    shopCategoryId: data.shopCategoryId,
    districtId: data.districtId,
    subDistrictId: data.subDistrictId,
    description: data.description ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    openingTime: data.openingTime ?? "",
    closingTime: data.closingTime ?? "",
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    bankName: data.bankName ?? "",
    bankAccountName: data.bankAccountName ?? "",
    bankAccountNumber: data.bankAccountNumber ?? "",
    promptPay: data.promptPay ?? "",
  }
}

async function loadSubDistricts(districtId: string | null, keepValue = false) {
  if (!districtId) {
    subDistricts.value = []
    form.value.subDistrictId = null
    return
  }
  subDistricts.value = await getSubDistricts(districtId)
  if (!keepValue) form.value.subDistrictId = null
}

function onAddressDetected(location: {
  districtName?: string
  subDistrictName?: string
  formattedAddress?: string
}) {
  if (location.districtName) {
    const foundDistrict = districts.value.find((d) => d.districtName.trim() === location.districtName?.trim())
    if (foundDistrict) {
      form.value.districtId = foundDistrict.districtId
      loadSubDistricts(foundDistrict.districtId, true).then(() => {
        if (location.subDistrictName) {
          const foundSubDistrict = subDistricts.value.find((sd) => sd.subDistrictName.trim() === location.subDistrictName?.trim())
          if (foundSubDistrict) {
            form.value.subDistrictId = foundSubDistrict.subDistrictId
          }
        }
      })
    }
  }
  if (location.formattedAddress && !form.value.address) {
    form.value.address = location.formattedAddress
  }
}

watch(
  () => form.value.districtId,
  (value, oldValue) => {
    if (value && value !== oldValue) loadSubDistricts(value)
  },
)

async function submit() {
  if (!form.value.shopName || !form.value.shopCategoryId || !form.value.districtId || !form.value.subDistrictId) {
    await swal.warning("กรอกข้อมูลไม่ครบ", "กรุณากรอกชื่อร้าน หมวดหมู่ อำเภอ และตำบลให้ครบถ้วน")
    return
  }
  saving.value = true
  try {
    if (shop.value) await updateShop(shop.value.shopId, form.value)
    else applyShop(await createShop(form.value))
    await swal.success("ส่งใบสมัครแล้ว", "แอดมินจะตรวจสอบข้อมูลร้านค้าของคุณก่อนเปิดใช้งาน")
    if (shop.value) shop.value.status = "PendingApproval"
  } catch (error) {
    await swal.error("ส่งใบสมัครไม่สำเร็จ", getApiErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    ;[categories.value, districts.value] = await Promise.all([getShopCategories(), getDistricts()])
    try {
      const myShop = await getMyShop()
      if (myShop.status === "Active") {
        await router.replace("/my-shop")
        return
      }
      applyShop(myShop)
      await loadSubDistricts(myShop.districtId, true)
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
    }
  } catch (error) {
    await swal.error("โหลดข้อมูลไม่สำเร็จ", getApiErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-50/70 py-10">
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <div v-if="loading" class="h-96 animate-pulse rounded-3xl bg-slate-200" />
      <template v-else>
        <section class="mb-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 p-7 text-white shadow-lg">
          <p class="text-xs font-bold uppercase tracking-widest text-emerald-300">Merchant application</p>
          <h1 class="mt-2 text-3xl font-extrabold">ใบสมัครเปิดร้านค้า</h1>
          <p class="mt-2 text-sm text-emerald-100/80">กรอกข้อมูลให้ครบถ้วน แล้วรอแอดมินตรวจสอบก่อนเข้าใช้งานร้านของฉัน</p>
        </section>

        <section v-if="shop?.status === 'PendingApproval'" class="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <i class="mdi mdi-clock-check-outline text-5xl text-amber-500" />
          <h2 class="mt-4 text-xl font-extrabold text-slate-900">ส่งใบสมัครเรียบร้อยแล้ว</h2>
          <p class="mt-2 text-sm text-slate-500">ร้าน “{{ shop.shopName }}” กำลังรอการอนุมัติจากแอดมิน</p>
          <p class="mt-1 text-xs text-slate-400">ระหว่างนี้ยังไม่สามารถเข้าเมนูจัดการร้าน สินค้า หรือออเดอร์ได้</p>
        </section>

        <form v-else class="space-y-6" @submit.prevent="submit">
          <div v-if="shop?.status === 'Rejected'" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <i class="mdi mdi-alert-circle-outline mr-1" /> ใบสมัครของคุณยังไม่ได้รับอนุมัติ โปรดตรวจสอบข้อมูล แก้ไข แล้วส่งให้แอดมินพิจารณาอีกครั้ง
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <i class="mdi mdi-store-outline text-emerald-600"></i> ข้อมูลร้านค้าทั่วไป
            </h2>
            <div class="mt-6 space-y-5">
              <AppTextField v-model="form.shopName" label="ชื่อร้านค้า *" placeholder="ระบุชื่อร้านค้าของคุณ" />
              <div class="grid gap-5 sm:grid-cols-2">
                <AppSelect v-model="form.shopCategoryId" label="หมวดหมู่ร้านค้า *" :items="categories" item-title="categoryName" item-value="shopCategoryId" placeholder="เลือกหมวดหมู่" clearable />
                <AppTextField v-model="form.phone" label="เบอร์โทรศัพท์" placeholder="เช่น 0812345678" />
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <AppTextField v-model="form.email" label="อีเมล" type="email" placeholder="shop@example.com" />
                <div class="grid grid-cols-2 gap-2">
                  <AppTextField v-model="form.openingTime" label="เวลาเปิด" placeholder="08:00" />
                  <AppTextField v-model="form.closingTime" label="เวลาปิด" placeholder="18:00" />
                </div>
              </div>
              <AppTextarea v-model="form.description" label="รายละเอียดร้านค้า" placeholder="อธิบายสินค้าและจุดเด่นของร้าน" />
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <i class="mdi mdi-map-marker-outline text-emerald-600"></i> ที่ตั้งและพิกัดแผนที่
            </h2>
            <div class="mt-6 space-y-5">
              <div class="grid gap-5 sm:grid-cols-2">
                <AppSelect v-model="form.districtId" label="อำเภอ *" :items="districts" item-title="districtName" item-value="districtId" placeholder="เลือกอำเภอ" clearable />
                <AppSelect v-model="form.subDistrictId" label="ตำบล *" :items="subDistricts" item-title="subDistrictName" item-value="subDistrictId" placeholder="เลือกตำบล" :disabled="!form.districtId" clearable />
              </div>
              <AppTextarea v-model="form.address" label="ที่อยู่รายละเอียด" placeholder="บ้านเลขที่ ถนน ซอย" />
              
              <div class="pt-2">
                <p class="mb-2 text-sm font-semibold text-slate-700">ปักหมุดตำแหน่งร้านค้าบนแผนที่</p>
                <LocationPickerMap
                  v-model:latitude="form.latitude"
                  v-model:longitude="form.longitude"
                  @address-detected="onAddressDetected"
                />
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <i class="mdi mdi-bank-outline text-emerald-600"></i> ข้อมูลบัญชีธนาคารสำหรับรับเงิน
            </h2>
            <p class="mt-1 text-xs text-slate-500">สำหรับรับโอนเงินค่าสินค้าและส่วนแบ่งยอดขายจากระบบ</p>
            <div class="mt-6 space-y-5">
              <div class="grid gap-5 sm:grid-cols-2">
                <AppTextField v-model="form.bankName" label="ชื่อธนาคาร" placeholder="เช่น กสิกรไทย, ไทยพาณิชย์" />
                <AppTextField v-model="form.bankAccountName" label="ชื่อบัญชีธนาคาร" placeholder="เช่น นาย สมชาย ใจดี" />
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <AppTextField v-model="form.bankAccountNumber" label="เลขที่บัญชี" placeholder="เช่น 123-4-56789-0" />
                <AppTextField v-model="form.promptPay" label="เบอร์พร้อมเพย์ (ถ้ามี)" placeholder="เช่น 0812345678" />
              </div>
            </div>
          </div>

          <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60" :disabled="saving">
            <i class="mdi mdi-send-outline" :class="{ 'animate-spin mdi-loading': saving }" />
            {{ saving ? "กำลังส่ง..." : shop?.status === 'Rejected' ? "แก้ไขและส่งใบสมัครอีกครั้ง" : "ส่งใบสมัครเปิดร้าน" }}
          </button>
        </form>
      </template>
    </div>
  </main>
</template>
