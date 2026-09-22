<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createProduct,
  getMyShop,
  getProduct,
  getProductCategories,
  updateProduct,
  uploadCoverImage,
  uploadDetailImages,
  type ProductCategory,
  type ProductFormData,
} from '@/features/shops/api'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppFileInput from '@/components/common/input/AppFileInput.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const saving = ref(false)
const swal = useSwal()
const id = route.params.id as string | undefined

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const form = ref<ProductFormData>({
  shopId: '',
  productCategoryId: null,
  productName: '',
  description: '',
  price: null,
  quantity: 0,
  imageUrl: '',
  status: 'Active',
})
const coverFile = ref<File | null>(null)
const detailFiles = ref<File[]>([])

const existingCoverUrl = ref<string | null>(null)
const existingDetailImages = ref<string[]>([])

async function submit() {
  if (
    !form.value.productName ||
    !form.value.productCategoryId ||
    form.value.price === null ||
    form.value.price < 0
  ) {
    await swal.warning('กรอกข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อสินค้า หมวดหมู่ และราคาให้ถูกต้อง')
    return
  }
  saving.value = true
  try {
    const payload = { ...form.value, price: Number(form.value.price) }
    const productId = id ?? (await createProduct(payload)).productId
    if (id) await updateProduct(id, payload)
    if (coverFile.value) await uploadCoverImage(productId, coverFile.value)
    if (detailFiles.value.length) await uploadDetailImages(productId, detailFiles.value)
    await swal.success(id ? 'อัปเดตข้อมูลสินค้าเรียบร้อย' : 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว')
    await router.push('/my-shop/products')
  } catch (error) {
    await swal.error('บันทึกสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const shop = await getMyShop()
    categories.value = await getProductCategories()
    form.value.shopId = shop.shopId
    if (id) {
      const product = await getProduct(id)
      if (product.shopId !== shop.shopId) {
        await router.replace('/my-shop/products')
        return
      }
      form.value = {
        shopId: product.shopId,
        productCategoryId: product.productCategoryId,
        productName: product.productName,
        description: product.description ?? '',
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl ?? '',
        status: product.status,
      }
      existingCoverUrl.value = product.imageUrl ?? null
      existingDetailImages.value = product.detailImages ?? []
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    await router.replace('/my-shop/products')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1800px] space-y-6 px-4 py-4 text-[#332820] sm:px-6 2xl:px-10">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div
        class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
      <div
        class="h-96 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
      ></div>
    </div>

    <form
      v-else
      class="space-y-0 overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-xs"
      @submit.prevent="submit"
    >
      <!-- Form Header -->
      <div
        class="flex flex-col gap-4 border-b-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0"
          >
            <i
              :class="[
                'mdi text-2xl text-white',
                id ? 'mdi-pencil-box-outline' : 'mdi-plus-box-outline',
              ]"
            ></i>
          </div>
          <div>
            <h1 class="text-2xl font-black text-[#332820]">
              {{ id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ลงร้านค้า' }}
            </h1>
            <p class="text-xs text-[#786B62] font-semibold mt-0.5">
              กรอกรายละเอียดสินค้า ราคา สต็อกสินค้า และอัปโหลดรูปภาพสินค้า
            </p>
          </div>
        </div>

        <RouterLink
          to="/my-shop/products"
          class="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2.5 text-xs font-black text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C] transition shadow-2xs"
        >
          <i class="mdi mdi-arrow-left text-sm text-[#D96C2C]"></i>
          <span>ย้อนกลับ</span>
        </RouterLink>
      </div>

      <!-- Form Body -->
      <div class="space-y-8 p-6 sm:p-8 xl:p-10">
        <div class="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(460px,1.15fr)] 2xl:gap-12">
          <div class="space-y-8">
            <!-- Section 1: General Specs -->
            <section class="rounded-3xl border border-[#E8D9C9] bg-white p-5 shadow-2xs sm:p-6">
              <div class="space-y-6">
                <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
                  <i class="mdi mdi-package-variant-closed text-[#D96C2C] text-xl"></i>
                  <h2 class="text-lg font-black text-[#332820]">ข้อมูลสินค้าหลัก</h2>
                </div>

                <AppTextField
                  v-model="form.productName"
                  label="ชื่อสินค้า *"
                  placeholder="ระบุชื่อสินค้าของคุณ"
                />

                <div class="grid gap-6 sm:grid-cols-2">
                  <AppSelect
                    v-model="form.productCategoryId"
                    label="หมวดหมู่สินค้า *"
                    :items="categories"
                    item-title="categoryName"
                    item-value="productCategoryId"
                    placeholder="เลือกหมวดหมู่สินค้า"
                    clearable
                  />
                  <AppTextField
                    v-model="form.price"
                    label="ราคาสินค้า (บาท) *"
                    type="number"
                    min="0"
                    placeholder="เช่น 150"
                  />
                </div>

                <AppTextField
                  v-model="form.quantity"
                  label="จำนวนสินค้าในคลังสต็อก (ชิ้น) *"
                  type="number"
                  min="0"
                  placeholder="ระบุจำนวนคงเหลือ"
                />
              </div>
            </section>

            <!-- Section 3: Description -->
            <section class="rounded-3xl border border-[#E8D9C9] bg-white p-5 shadow-2xs sm:p-6">
              <div class="space-y-6">
                <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
                  <i class="mdi mdi-text-box-search-outline text-[#D96C2C] text-xl"></i>
                  <h2 class="text-lg font-black text-[#332820]">รายละเอียดสินค้าเพิ่มเติม</h2>
                </div>

                <AppTextarea
                  v-model="form.description"
                  label="คำอธิบายรายละเอียดสินค้า"
                  placeholder="ระบุส่วนผสม ประโยชน์ วิธีใช้งาน หรือข้อมูลสำคัญของสินค้า..."
                />
              </div>
            </section>
          </div>

          <!-- Section 2: Product Images (With Existing Images Preview) -->
          <section
            class="rounded-3xl border border-[#E8D9C9] bg-white p-5 shadow-2xs sm:p-6 xl:sticky xl:top-6 xl:self-start"
          >
            <div class="space-y-6">
              <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3">
                <i class="mdi mdi-image-multiple-outline text-[#D96C2C] text-xl"></i>
                <h2 class="text-lg font-black text-[#332820]">รูปภาพประกอบสินค้า</h2>
              </div>

              <!-- Cover Image Upload & Existing Preview -->
              <div
                class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-white p-5 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wider text-[#332820]"
                    >1. รูปหน้าปกหลักของสินค้า</span
                  >
                  <span
                    v-if="existingCoverUrl"
                    class="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300"
                    >มีรูปเดิมในระบบ</span
                  >
                </div>

                <!-- Existing Cover Image Preview Display -->
                <div
                  v-if="existingCoverUrl"
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-4"
                >
                  <div
                    class="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#171412] border-2 border-[#E8D9C9] shadow-2xs"
                  >
                    <img
                      :src="imageUrl(existingCoverUrl)"
                      alt="รูปหน้าปกปัจจุบัน"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div class="space-y-1 text-xs">
                    <span class="font-black text-[#332820] flex items-center gap-1">
                      <i class="mdi mdi-image-check text-[#D96C2C] text-base"></i>
                      รูปหน้าปกปัจจุบันของสินค้า
                    </span>
                    <p class="text-[#786B62] font-semibold">
                      หากต้องการเปลี่ยน ให้เลือกไฟล์ภาพใหม่ด้านล่าง
                    </p>
                  </div>
                </div>

                <AppFileInput
                  :label="
                    existingCoverUrl
                      ? 'อัปโหลดรูปหน้าปกใหม่ (เลือกไฟล์เมื่อต้องการเปลี่ยน)'
                      : 'อัปโหลดรูปหน้าปกหลักของสินค้า'
                  "
                  @change="coverFile = $event[0] ?? null"
                />
                <p
                  v-if="coverFile"
                  class="text-xs font-black text-[#D96C2C] flex items-center gap-1"
                >
                  <i class="mdi mdi-check-circle-outline"></i>
                  เลือกไฟล์ใหม่แล้ว: {{ coverFile.name }}
                </p>
              </div>

              <!-- Detail Images Upload & Existing Preview -->
              <div
                class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-white p-5 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wider text-[#332820]"
                    >2. รูปภาพรายละเอียดสินค้าเพิ่มเติม</span
                  >
                  <span
                    v-if="existingDetailImages.length > 0"
                    class="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300"
                  >
                    มีรูปเดิม {{ existingDetailImages.length }} รูป
                  </span>
                </div>

                <!-- Existing Detail Images Grid Preview -->
                <div
                  v-if="existingDetailImages.length > 0"
                  class="space-y-2 rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-4"
                >
                  <span class="text-xs font-black text-[#332820] flex items-center gap-1 mb-2">
                    <i class="mdi mdi-images text-[#D96C2C] text-base"></i>
                    รูปรายละเอียดปัจจุบัน ({{ existingDetailImages.length }} รูป):
                  </span>

                  <div class="flex flex-wrap gap-3">
                    <div
                      v-for="(img, index) in existingDetailImages"
                      :key="index"
                      class="relative h-20 w-20 overflow-hidden rounded-2xl bg-[#171412] border-2 border-[#E8D9C9] group shadow-2xs"
                    >
                      <img
                        :src="imageUrl(img)"
                        :alt="`รูปรายละเอียด ${index + 1}`"
                        class="h-full w-full object-cover transition-transform group-hover:scale-108"
                      />
                      <span
                        class="absolute bottom-1 right-1 rounded-md bg-[#171412]/80 px-1.5 py-0.5 text-[9px] font-black text-white"
                      >
                        #{{ index + 1 }}
                      </span>
                    </div>
                  </div>
                </div>

                <AppFileInput
                  label="อัปโหลดรูปภาพรายละเอียดเพิ่มเติม (เลือกได้สูงสุด 8 รูปต่อครั้ง)"
                  multiple
                  @change="detailFiles = $event.slice(0, 8)"
                />
                <p
                  v-if="detailFiles.length"
                  class="text-xs font-black text-[#D96C2C] flex items-center gap-1"
                >
                  <i class="mdi mdi-check-circle-outline"></i>
                  เลือกไฟล์ใหม่แล้วทั้งหมด {{ detailFiles.length }} รูป
                </p>
              </div>
            </div>
          </section>
        </div>

        <!-- Action Bar Footer -->
        <div class="flex items-center justify-end gap-3 border-t-2 border-[#E8D9C9] pt-6">
          <RouterLink
            to="/my-shop/products"
            class="rounded-2xl border-2 border-[#E8D9C9] bg-white px-6 py-3 text-xs sm:text-sm font-black text-[#786B62] hover:text-[#332820] transition"
          >
            ยกเลิก
          </RouterLink>

          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-8 py-3.5 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer border border-[#D96C2C]"
            :disabled="saving"
          >
            <i
              class="mdi text-base text-white"
              :class="saving ? 'mdi-loading animate-spin' : 'mdi-content-save-outline'"
            ></i>
            <span class="!text-white font-black">{{
              saving ? 'กำลังบันทึก...' : id ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสินค้า'
            }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
