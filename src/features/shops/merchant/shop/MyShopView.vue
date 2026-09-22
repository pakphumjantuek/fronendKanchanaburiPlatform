<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import {
  closeShop,
  createShop,
  getDistricts,
  getMyShop,
  getShopCategories,
  getSubDistricts,
  updateShop,
  updateShopStatus,
  uploadShopBackgroundImage,
  uploadShopCoverImage,
  type District,
  type Shop,
  type ShopCategory,
  type ShopFormData,
  type SubDistrict,
} from '@/features/shops/api'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import LocationPickerMap from '@/components/common/map/LocationPickerMap.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const shop = ref<Shop | null>(null)
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const loading = ref(true)
const saving = ref(false)
const uploadingCover = ref(false)
const uploadingBackground = ref(false)
const restoringLocation = ref(false)
const swal = useSwal()
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

const form = ref<ShopFormData>({
  shopName: '',
  shopCategoryId: null,
  districtId: null,
  subDistrictId: null,
  description: '',
  phone: '',
  email: '',
  address: '',
  openingTime: '',
  closingTime: '',
  latitude: null,
  longitude: null,
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  promptPay: '',
})

function applyShop(data: Shop) {
  shop.value = data
  form.value = {
    shopName: data.shopName,
    shopCategoryId: data.shopCategoryId,
    districtId: data.districtId,
    subDistrictId: data.subDistrictId,
    description: data.description ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
    openingTime: data.openingTime ?? '',
    closingTime: data.closingTime ?? '',
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    bankName: data.bankName ?? '',
    bankAccountName: data.bankAccountName ?? '',
    bankAccountNumber: data.bankAccountNumber ?? '',
    promptPay: data.promptPay ?? '',
  }
}

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
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

watch(
  () => form.value.districtId,
  (value, oldValue) => {
    if (!restoringLocation.value && value && value !== oldValue) void loadSubDistricts(value)
  },
)

async function onAddressDetected(data: { districtName?: string; subDistrictName?: string }) {
  if (!data.districtName) return
  const targetDistName = data.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()

  const matchedDistrict = districts.value.find((d) => {
    const dName = d.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()
    return dName.includes(targetDistName) || targetDistName.includes(dName)
  })

  if (matchedDistrict) {
    form.value.districtId = matchedDistrict.districtId
    await loadSubDistricts(matchedDistrict.districtId, true)

    if (data.subDistrictName) {
      const targetSubName = data.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
      const matchedSub = subDistricts.value.find((s) => {
        const sName = s.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
        return sName.includes(targetSubName) || targetSubName.includes(sName)
      })

      if (matchedSub) {
        form.value.subDistrictId = matchedSub.subDistrictId
      }
    }
  }
}

async function submit() {
  if (
    !form.value.shopName ||
    !form.value.shopCategoryId ||
    !form.value.districtId ||
    !form.value.subDistrictId
  ) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อร้าน หมวดหมู่ เขต และตำบล ให้ครบถ้วน')
    return
  }
  saving.value = true
  try {
    if (shop.value) {
      await updateShop(shop.value.shopId, form.value)
      await swal.success('บันทึกข้อมูลร้านแล้ว', 'ข้อมูลร้านค้าของคุณได้รับการอัปเดตเรียบร้อยแล้ว')
    } else {
      const createdShop = await createShop(form.value)
      restoringLocation.value = true
      applyShop(createdShop)
      await loadSubDistricts(createdShop.districtId, true)
      restoringLocation.value = false
      await swal.success('สร้างร้านสำเร็จ', 'ขอยินดีต้อนรับสู่แพลตฟอร์มร้านค้าเมืองกาญจน์!')
    }
  } catch (error) {
    await swal.error('บันทึกร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function removeShop() {
  if (!shop.value) return
  const result = await swal.confirm(
    'ยืนยันปิดบริการร้านนี้?',
    'ร้านจะไม่แสดงต่อสาธารณะบนแพลตฟอร์ม แต่ข้อมูลของคุณจะไม่ถูกลบ',
  )
  if (!result.isConfirmed) return
  try {
    await closeShop(shop.value.shopId)
    shop.value.status = 'Closed'
    await swal.success('ปิดบริการร้านค้าแล้ว')
  } catch (error) {
    await swal.error('ปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function reopenShop() {
  if (!shop.value) return
  const result = await swal.confirm(
    'เปิดบริการร้านค้าอีกครั้ง?',
    'ร้านจะแสดงต่อสาธารณะและสามารถรับคำสั่งซื้อได้อีกครั้ง',
  )
  if (!result.isConfirmed) return
  try {
    await updateShopStatus(shop.value.shopId, 'Active')
    shop.value.status = 'Active'
    await swal.success('เปิดบริการร้านค้าเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('เปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function uploadCoverImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !shop.value) return

  uploadingCover.value = true
  try {
    shop.value = await uploadShopCoverImage(shop.value.shopId, file)
    await swal.success('อัปโหลดรูปหน้าปกร้านแล้ว')
  } catch (error) {
    await swal.error(
      'อัปโหลดรูปไม่สำเร็จ',
      getApiErrorMessage(error, 'รองรับไฟล์ภาพ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB'),
    )
  } finally {
    input.value = ''
    uploadingCover.value = false
  }
}

async function uploadBackgroundImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !shop.value) return

  uploadingBackground.value = true
  try {
    shop.value = await uploadShopBackgroundImage(shop.value.shopId, file)
    await swal.success('อัปโหลดรูปพื้นหลังร้านแล้ว')
  } catch (error) {
    await swal.error(
      'อัปโหลดรูปไม่สำเร็จ',
      getApiErrorMessage(error, 'รองรับไฟล์ภาพ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB'),
    )
  } finally {
    input.value = ''
    uploadingBackground.value = false
  }
}

onMounted(async () => {
  try {
    ;[categories.value, districts.value] = await Promise.all([getShopCategories(), getDistricts()])
    try {
      const myShop = await getMyShop()
      restoringLocation.value = true
      applyShop(myShop)
      await loadSubDistricts(myShop.districtId, true)
      restoringLocation.value = false
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1800px] space-y-7 px-5 py-6 text-[#332820] sm:px-8 lg:px-10 lg:py-9 2xl:px-12">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div
        class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
      <div
        class="h-96 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
    </div>

    <template v-else>
      <!-- Page Title & Status Header Card -->
      <div
        class="flex flex-col justify-between gap-5 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs sm:flex-row sm:items-center lg:px-8 lg:py-7"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0"
          >
            <i class="mdi mdi-store-cog text-2xl text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black text-[#332820]">
              {{ shop ? 'ตั้งค่าข้อมูลร้านค้า' : 'ลงทะเบียนเปิดร้านค้าใหม่' }}
            </h1>
            <p class="text-xs text-[#786B62] font-semibold mt-0.5">
              จัดการข้อมูลทั่วไป รูปภาพร้าน พิกัดที่ตั้ง และช่องทางติดต่อบนแพลตฟอร์ม
            </p>
          </div>
        </div>

        <div v-if="shop" class="flex items-center gap-3">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black border-2"
            :class="
              shop.status === 'Active'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            "
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="shop.status === 'Active' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'"
            ></span>
            {{ shop.status === 'Active' ? 'เปิดบริการต่อสาธารณะ' : 'ปิดบริการชั่วคราว' }}
          </span>

          <RouterLink
            :to="`/shops/${shop.shopId}`"
            target="_blank"
            class="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2 text-xs font-black text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C] transition shadow-2xs"
          >
            <i class="mdi mdi-open-in-new text-sm text-[#D96C2C]"></i>
            <span>ดูหน้าร้านของคุณ</span>
          </RouterLink>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-xs">
        <form class="space-y-10 p-6 sm:p-8 lg:p-10 2xl:p-12" @submit.prevent="submit">
          <!-- General Info Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
              <i class="mdi mdi-text-box-outline text-[#D96C2C] text-xl"></i>
              <h2 class="text-lg font-black text-[#332820]">ข้อมูลทั่วไปของร้านค้า</h2>
            </div>

            <div class="grid gap-6 md:grid-cols-2 2xl:max-w-5xl">
              <AppTextField
                v-model="form.shopName"
                label="ชื่อร้านค้า *"
                placeholder="ระบุชื่อร้านค้าของคุณ"
              />
              <AppSelect
                v-model="form.shopCategoryId"
                label="หมวดหมู่ร้านค้า *"
                :items="categories"
                item-title="categoryName"
                item-value="shopCategoryId"
                placeholder="เลือกหมวดหมู่ร้าน"
                clearable
              />
            </div>

            <AppTextarea
              v-model="form.description"
              label="รายละเอียดร้านค้า"
              placeholder="อธิบายจุดเด่น สินค้าแนะนำ หรือประวัติความเป็นมาของร้านคุณ..."
            />
          </div>

          <!-- GROUPED SHOP IMAGES & BANNERS SECTION -->
          <div v-if="shop" class="space-y-6 pt-4">
            <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
              <i class="mdi mdi-image-multiple-outline text-[#D96C2C] text-xl"></i>
              <h2 class="text-lg font-black text-[#332820]">
                รูปภาพประกอบร้านค้า (Shop Images & Banners)
              </h2>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <!-- 1. Cover Image Box -->
              <div
                class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-white p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <h3 class="font-black text-[#332820] flex items-center gap-2">
                    <i class="mdi mdi-image-outline text-[#D96C2C] text-lg"></i>
                    รูปหน้าปกร้านค้า (Cover Image)
                  </h3>
                  <p class="mt-1 text-xs text-[#786B62] font-semibold leading-relaxed">
                    ภาพปกจะแสดงบนการ์ดร้านค้าในหน้ารวมร้านค้าและส่วนหัวของหน้าร้านคุณ
                  </p>
                </div>

                <div class="space-y-3">
                  <div
                    class="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-[#171412] border-2 border-[#E8D9C9] shadow-2xs"
                  >
                    <img
                      v-if="shop.coverImageUrl"
                      :src="imageUrl(shop.coverImageUrl)"
                      alt="รูปหน้าปกร้าน"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-[#786B62]"
                    >
                      <i class="mdi mdi-storefront text-4xl text-[#D96C2C]"></i>
                    </div>
                  </div>

                  <label
                    class="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] w-full py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]"
                  >
                    <i
                      class="mdi text-base text-white"
                      :class="uploadingCover ? 'mdi-loading animate-spin' : 'mdi-upload'"
                    ></i>
                    <span class="!text-white font-black">{{
                      uploadingCover ? 'กำลังอัปโหลด...' : 'เลือกและอัปโหลดรูปหน้าปก'
                    }}</span>
                    <input
                      class="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      :disabled="uploadingCover"
                      @change="uploadCoverImage"
                    />
                  </label>
                </div>
              </div>

              <!-- 2. Background Image Box -->
              <div
                class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-white p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <h3 class="font-black text-[#332820] flex items-center gap-2">
                    <i class="mdi mdi-panorama-outline text-[#D96C2C] text-lg"></i>
                    รูปพื้นหลังหน้าร้าน (Background Banner)
                  </h3>
                  <p class="mt-1 text-xs text-[#786B62] font-semibold leading-relaxed">
                    แสดงเป็นภาพพื้นหลังส่วนหัวในหน้ารายละเอียดร้านของคุณ
                  </p>
                </div>

                <div class="space-y-3">
                  <div
                    class="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-[#171412] border-2 border-[#E8D9C9] shadow-2xs"
                  >
                    <img
                      v-if="shop.backgroundImageUrl"
                      :src="imageUrl(shop.backgroundImageUrl)"
                      alt="รูปพื้นหลังร้าน"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-[#786B62]"
                    >
                      <i class="mdi mdi-panorama text-4xl text-[#D96C2C]"></i>
                    </div>
                  </div>

                  <label
                    class="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] w-full py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]"
                  >
                    <i
                      class="mdi text-base text-white"
                      :class="uploadingBackground ? 'mdi-loading animate-spin' : 'mdi-upload'"
                    ></i>
                    <span class="!text-white font-black">{{
                      uploadingBackground ? 'กำลังอัปโหลด...' : 'เลือกรูปพื้นหลัง'
                    }}</span>
                    <input
                      class="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      :disabled="uploadingBackground"
                      @change="uploadBackgroundImage"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact & Business Hours Section -->
          <div class="space-y-6 pt-4">
            <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
              <i class="mdi mdi-card-account-phone-outline text-[#D96C2C] text-xl"></i>
              <h2 class="text-lg font-black text-[#332820]">ช่องทางการติดต่อและเวลาเปิดบริการ</h2>
            </div>

            <div class="grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
              <AppTextField
                v-model="form.phone"
                label="เบอร์โทรศัพท์ติดต่อ"
                placeholder="เช่น 0812345678"
              />
              <AppTextField
                v-model="form.email"
                label="อีเมลติดต่อร้านค้า"
                type="email"
                placeholder="shop@example.com"
              />
              <AppTextField v-model="form.openingTime" label="เวลาเปิด" type="time" />
              <AppTextField v-model="form.closingTime" label="เวลาปิด" type="time" />
            </div>
          </div>

          <!-- Bank Account Info for Merchant Payouts -->
          <div class="space-y-6 pt-4">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-bank-outline text-[#D96C2C] text-xl"></i>
                <div>
                  <h2 class="text-lg font-black text-[#332820]">ข้อมูลบัญชีธนาคารสำหรับรับเงินยอดขาย</h2>
                  <p class="text-xs text-[#786B62]">ระบุข้อมูลธนาคารของคุณสำหรับให้แอดมินโอนเงินส่วนแบ่ง/ยอดขายคืนร้านค้า</p>
                </div>
              </div>
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                <i class="mdi mdi-shield-check-outline"></i> แอดมินใช้โอนเงินคืนร้านค้า
              </span>
            </div>

            <div class="grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
              <AppTextField
                v-model="form.bankName"
                label="ชื่อธนาคาร"
                placeholder="เช่น ธนาคารกสิกรไทย, ธนาคารไทยพาณิชย์"
              />
              <AppTextField
                v-model="form.bankAccountName"
                label="ชื่อบัญชีธนาคาร"
                placeholder="เช่น นาย สมชาย ใจดี"
              />
              <AppTextField
                v-model="form.bankAccountNumber"
                label="เลขที่บัญชีธนาคาร"
                placeholder="เช่น 123-4-56789-0"
              />
              <AppTextField
                v-model="form.promptPay"
                label="เบอร์พร้อมเพย์ (PromptPay)"
                placeholder="เช่น 0812345678"
              />
            </div>
          </div>

          <!-- Address & Map Section -->
          <div class="space-y-6 pt-4">
            <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
              <i class="mdi mdi-map-marker-radius-outline text-[#D96C2C] text-xl"></i>
              <h2 class="text-lg font-black text-[#332820]">
                ที่อยู่และตำแหน่งร้าน (เลือกอัตโนมัติจาก GPS)
              </h2>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <AppSelect
                v-model="form.districtId"
                label="เขต / อำเภอ *"
                :items="districts"
                item-title="districtName"
                item-value="districtId"
                placeholder="เลือกเขต / อำเภอ"
                clearable
              />
              <AppSelect
                v-model="form.subDistrictId"
                label="ตำบล / แขวง *"
                :items="subDistricts"
                item-title="subDistrictName"
                item-value="subDistrictId"
                placeholder="เลือกตำบล / แขวง"
                clearable
                :disabled="!form.districtId"
              />
            </div>

            <AppTextarea
              v-model="form.address"
              label="ที่อยู่ตั้งร้านค้าอย่างละเอียด"
              placeholder="บ้านเลขที่ อาคาร ซอย ถนน..."
            />

            <section class="space-y-3">
              <div>
                <h3 class="font-black text-[#332820]">ตำแหน่งร้านบนแผนที่</h3>
                <p class="text-xs text-[#786B62] font-semibold">
                  กดปุ่ม "ใช้ตำแหน่งปัจจุบัน" เพื่อเลือกลำดับอำเภอและตำบลให้อัตโนมัติ
                  หรือคลิกปักหมุดบนแผนที่
                </p>
              </div>
              <LocationPickerMap
                v-model:latitude="form.latitude"
                v-model:longitude="form.longitude"
                @address-detected="onAddressDetected"
              />
            </section>
          </div>

          <!-- Action Buttons Bar -->
          <div
            class="flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#E8D9C9] pt-6"
          >
            <button
              v-if="shop && shop.status !== 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-rose-600 border-2 border-rose-200 bg-rose-50 transition hover:bg-rose-600 hover:text-white cursor-pointer"
              @click="removeShop"
            >
              <i class="mdi mdi-store-off-outline text-base"></i>
              <span>ปิดบริการร้านค้าชั่วคราว</span>
            </button>

            <button
              v-if="shop?.status === 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-emerald-800 border-2 border-emerald-300 bg-emerald-100 transition hover:bg-emerald-600 hover:text-white cursor-pointer"
              @click="reopenShop"
            >
              <i class="mdi mdi-store-check-outline text-base"></i>
              <span>เปิดบริการร้านค้าอีกครั้ง</span>
            </button>

            <div class="ml-auto flex items-center gap-3">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-8 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition active:scale-95 disabled:opacity-60 cursor-pointer border border-[#D96C2C]"
                :disabled="saving || shop?.status === 'Closed'"
              >
                <i
                  class="mdi text-lg text-white"
                  :class="saving ? 'mdi-loading animate-spin' : 'mdi-content-save-outline'"
                ></i>
                <span class="!text-white font-black">{{
                  saving ? 'กำลังบันทึก...' : shop ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันสร้างร้านค้า'
                }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
