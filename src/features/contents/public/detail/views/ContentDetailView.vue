<template>
  <div v-if="content" class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-16">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-[#4A3E35] flex items-center gap-2 font-semibold"
      >
        <RouterLink to="/" class="hover:text-[#D96C2C] transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/contents" class="hover:text-[#D96C2C] transition"
          >สำรวจคอนเทนต์</RouterLink
        >
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#D96C2C] font-bold">{{
          content.contentCategoryName || 'ท่องเที่ยวและวัฒนธรรม'
        }}</span>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-bold line-clamp-1">{{ content.title }}</span>
      </div>
    </div>

    <!-- MAIN 2-COLUMN LAYOUT WRAPPER (8 Cols Stream + 4 Cols Sticky Sidebar) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT MAIN COLUMN -->
        <div class="lg:col-span-8 space-y-8">
          <!-- 1. Video Player & Metadata Card -->
          <ContentDetailHero
            :content="content"
            :isFavorite="isFavorite"
            :changingFavorite="changingFavorite"
            @toggle-favorite="toggleFavorite"
            @share="shareContent"
          />

          <section
            v-if="content.summary"
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-7 shadow-xs space-y-3"
          >
            <h2 class="text-2xl font-bold text-[#D96C2C]">เกี่ยวกับวิดีโอนี้</h2>
            <p class="text-base sm:text-lg leading-relaxed text-[#332820] font-normal">
              {{ content.summary }}
            </p>
          </section>

          <!-- 2.5 SPECIAL CATEGORY INFO CARD (ตามข้อกำหนด 8 หมวดหมู่) -->
          <section
            v-if="categoryRule.specialFields.length"
            class="rounded-3xl border-2 border-[#D96C2C]/30 bg-[#FFF9F2] p-6 sm:p-7 shadow-md space-y-4 relative overflow-hidden"
          >
            <div class="flex items-center gap-3 border-b-2 border-[#E8D9C9] pb-3">
              <div class="h-9 w-9 rounded-xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <i class="mdi mdi-information-outline text-xl text-white"></i>
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-bold text-[#332820]">{{ categoryRule.specialInfoTitle }}</h3>
                <p class="text-xs sm:text-sm text-[#4A3E35] font-medium">ข้อมูลไฮไลท์เฉพาะสำหรับหมวดหมู่ {{ content.contentCategoryName }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
              <div
                v-for="field in categoryRule.specialFields"
                :key="field.key"
                class="rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-3.5 space-y-1 shadow-2xs hover:border-[#D96C2C] transition"
              >
                <span class="text-xs font-bold text-[#D96C2C] flex items-center gap-1.5 uppercase tracking-wide">
                  <i class="mdi" :class="field.icon"></i>
                  {{ field.label }}
                </span>
                <p class="text-sm font-bold text-[#332820] line-clamp-2">
                  {{ getSpecialFieldValue(field.key) }}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Schedules & Events (ซ่อนเมื่อหมวดหมู่ระบุให้ซ่อน) -->
          <section
            v-if="shouldShowSchedule"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <div class="flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-md"
                >
                  <i class="mdi mdi-calendar-clock-outline text-xl text-white"></i>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-[#332820]">รอบการแสดง / กิจกรรม</h2>
                  <p class="text-sm text-[#4A3E35] font-normal">
                    รอบการแสดงสดและกิจกรรมวัฒนธรรมที่กำลังจะเกิดขึ้น
                  </p>
                </div>
              </div>
              <span
                class="text-xs font-bold text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-3.5 py-1 rounded-full shadow-2xs"
              >
                มี {{ schedules.length }} รอบการแสดง
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="sch in schedules"
                :key="sch.scheduleId"
                class="rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-4.5 space-y-2 shadow-2xs hover:border-[#D96C2C] transition"
              >
                <span class="font-bold text-[#332820] text-base block">{{ sch.title }}</span>
                <p class="text-sm text-[#4A3E35] flex items-center gap-1.5 font-medium">
                  <i class="mdi mdi-clock-outline text-[#D96C2C]"></i>
                  <span>{{ formatDate(sch.startDateTime) }}</span>
                </p>
                <p
                  v-if="sch.address"
                  class="text-sm text-[#4A3E35] flex items-center gap-1.5 font-normal"
                >
                  <i class="mdi mdi-map-marker-outline text-[#D96C2C]"></i>
                  <span>{{ sch.address }}</span>
                </p>
              </div>
            </div>
          </section>

          <!-- 4. Community Discussion & Reviews -->
          <ContentDetailReviews
            v-model:comment="reviewForm.comment"
            :reviewData="reviewData"
            :myReview="myReview"
            :isLoggedIn="auth.isLoggedIn"
            :reviewSaving="reviewSaving"
            @save-review="saveReview"
            @remove-review="removeReview"
          />
        </div>

        <!-- RIGHT STICKY SIDEBAR (4 Cols: Location Map -> Shops/Products Widget) -->
        <div class="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <ContentDetailSidebar
            :content="content"
            :shops="relatedShops"
            :products="products"
            @open-directions="openDirections"
          />
        </div>
      </div>

      <!-- BOTTOM SECTION: Recommended Related Video Cards -->
      <ContentDetailRelated :items="relatedContents" />

      <!-- FOOTER SHARE / REPORT SECTION -->
      <section
        class="flex flex-wrap items-center justify-end gap-4 border-t-2 border-[#E8D9C9] pt-6 text-sm text-[#4A3E35]"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-[#332820]">แชร์คอนเทนต์</span>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-2xs"
              @click="shareContent('fb')"
            >
              <i class="mdi mdi-facebook text-base text-white"></i>
            </button>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-2xs"
              @click="shareContent('line')"
            >
              <i class="mdi mdi-forum-outline text-base text-white"></i>
            </button>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-white text-[#332820] flex items-center justify-center hover:bg-[#F7F0E6] transition cursor-pointer border-2 border-[#E8D9C9]"
              @click="shareContent()"
            >
              <i class="mdi mdi-link-variant text-base text-[#D96C2C]"></i>
            </button>
          </div>

          <button
            type="button"
            class="text-sm font-semibold text-[#786B62] hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
            @click="openReport({ contentId: content.contentId, label: content.title })"
          >
            <i class="mdi mdi-flag-outline"></i>
            <span>รายงานเนื้อหา</span>
          </button>
        </div>
      </section>
    </main>

    <!-- REPORT MODAL -->
    <ContentReportModal
      v-model:reason="reportForm.reason"
      v-model:description="reportForm.description"
      :target="reportTarget"
      :reporting="reporting"
      @close="reportTarget = null"
      @submit="submitReport"
    />
  </div>

  <!-- SKELETON LOADING STATE -->
  <div v-else-if="loading" class="min-h-screen bg-[#F7F0E6] pb-16 animate-pulse">
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3 shadow-2xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="h-4 w-48 bg-[#E8D9C9]/50 rounded-lg"></div>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8 space-y-8">
          <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 space-y-4 shadow-xs">
            <div class="aspect-video w-full rounded-2xl bg-[#E8D9C9]/60"></div>
            <div class="h-7 w-3/4 rounded-xl bg-[#E8D9C9]/50"></div>
            <div class="h-4 w-1/3 rounded-lg bg-[#E8D9C9]/40"></div>
          </div>
          <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 space-y-3 shadow-xs">
            <div class="h-6 w-32 rounded-xl bg-[#E8D9C9]/50"></div>
            <div class="h-4 w-full rounded-lg bg-[#E8D9C9]/40"></div>
            <div class="h-4 w-2/3 rounded-lg bg-[#E8D9C9]/40"></div>
          </div>
        </div>
        <div class="lg:col-span-4 space-y-6">
          <div
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 h-80 space-y-4 shadow-xs"
          >
            <div class="h-40 rounded-2xl bg-[#E8D9C9]/50"></div>
            <div class="h-5 w-2/3 rounded-xl bg-[#E8D9C9]/50"></div>
            <div class="h-4 w-1/2 rounded-lg bg-[#E8D9C9]/40"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addContentFavorite,
  createReport,
  deleteContentReview,
  getContentSchedules,
  getContentFavoriteStatus,
  getContentReviews,
  getMyContentReview,
  getContentShopProducts,
  getMyContent,
  getPublicContent,
  getPublicContents,
  recordContentView,
  removeContentFavorite,
  saveContentReview,
  type ContentReview,
  type ContentReviews,
  type ContentSchedule,
  type ContentShopProduct,
  type PublicContent,
} from '@/features/contents/api'
import { getShop, getShops } from '@/features/shops/public/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useAuthStore } from '@/features/auth/stores/auth'

import { getCategoryRule } from '@/features/contents/constants/categoryRules'

import ContentDetailHero from '../components/ContentDetailHero.vue'
import ContentDetailReviews from '../components/ContentDetailReviews.vue'
import ContentDetailSidebar from '../components/ContentDetailSidebar.vue'
import ContentDetailRelated from '../components/ContentDetailRelated.vue'
import ContentReportModal from '../components/ContentReportModal.vue'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const auth = useAuthStore()

const content = ref<PublicContent | null>(null)
const schedules = ref<ContentSchedule[]>([])
const products = ref<ContentShopProduct[]>([])
const relatedShops = ref<Shop[]>([])
const relatedContents = ref<PublicContent[]>([])
const isFavorite = ref(false)
const changingFavorite = ref(false)

const categoryRule = computed(() => getCategoryRule(content.value?.contentCategoryName))

const shouldShowSchedule = computed(() => {
  if (categoryRule.value.hasSchedule === false) return false
  return schedules.value.length > 0
})

function getSpecialFieldValue(key: string): string {
  if (!content.value) return '-'
  const sch = schedules.value[0]

  switch (key) {
    case 'eventDate':
      return sch?.startDateTime ? formatDate(sch.startDateTime) : 'ตามช่วงเทศกาลที่กำหนด'
    case 'eventTime':
    case 'showDateTime':
    case 'openHours':
      return sch?.title || (sch?.startDateTime ? formatDate(sch.startDateTime) : 'โปรดตรวจสอบรอบจัดงาน')
    case 'location':
    case 'areaName':
      return (
        sch?.address ||
        [content.value.subDistrictName, content.value.districtName].filter(Boolean).join(' ') ||
        'สังขละบุรี กาญจนบุรี'
      )
    case 'openingHours':
      return sch?.title || 'เปิดให้บริการทุกวัน (08:30 - 16:30 น.)'
    case 'entranceFee':
      return 'เข้าชมฟรี / ตามอัตราที่ระบุ ณ จุดบริการ'
    case 'locationMap':
      return content.value.latitude && content.value.longitude
        ? `GPS: ${content.value.latitude.toFixed(4)}, ${content.value.longitude.toFixed(4)}`
        : [content.value.subDistrictName, content.value.districtName].filter(Boolean).join(' ') ||
            'กาญจนบุรี'
    case 'communityName':
      return content.value.districtName
        ? `กลุ่มวิถีชีวิต ${content.value.districtName}`
        : 'ชุมชนท้องถิ่นกาญจนบุรี'
    case 'informant':
    case 'instructor':
      return content.value.shopName
        ? `ศูนย์เรียนรู้ ${content.value.shopName}`
        : 'ปราชญ์ชาวบ้านและวิทยากรในพื้นที่'
    case 'producer':
      return content.value.shopName
        ? `กลุ่มหัตถกรรม ${content.value.shopName}`
        : 'กลุ่มช่างฝีมือและหัตถกรรมท้องถิ่น'
    case 'relatedShop':
      return (
        content.value.shopName ||
        (relatedShops.value[0]?.shopName ?? 'ร้านค้าและวิสาหกิจชุมชน')
      )
    case 'relatedProducts':
      return products.value.length
        ? `${products.value.length} รายการสินค้าแนะนำ`
        : 'สินค้าภูมิปัญญาท้องถิ่น'
    case 'openDays':
      return sch?.title || 'เปิดทำการวันจันทร์ - เสาร์'
    default:
      return '-'
  }
}

const reviewData = ref<ContentReviews>({ totalCount: 0, reviews: [] })
const myReview = ref<ContentReview | null>(null)
const reviewSaving = ref(false)
const reviewForm = reactive({ comment: '' })

const reportTarget = ref<{ contentId?: string; reviewId?: string; label: string } | null>(null)
const reporting = ref(false)
const reportForm = reactive({ reason: 'ข้อมูลไม่ถูกต้อง', description: '' })

const loading = ref(true)
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isOwnerPreview = computed(() => route.query.preview === 'mine')

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}

async function load() {
  if (!id.value) return
  loading.value = true
  try {
    content.value = isOwnerPreview.value
      ? await getMyContent(id.value) as PublicContent
      : await getPublicContent(id.value)
    const [scheduleItems, productItems, reviews, shops, relatedData] = await Promise.all([
      getContentSchedules(id.value).catch(() => []),
      getContentShopProducts(id.value).catch(() => []),
      getContentReviews(id.value).catch(() => ({ totalCount: 0, reviews: [] })),
      content.value.shopId
        ? getShop(content.value.shopId)
            .then((shop) => [shop])
            .catch(() => [])
        : getShops({ districtId: content.value.districtId, pageSize: 3 }).catch(() => ({
            items: [] as Shop[],
          })),
      getPublicContents({ categoryId: content.value.contentCategoryId, pageSize: 4 }).catch(() => ({
        items: [],
      })),
    ])
    schedules.value = scheduleItems
    products.value = productItems
    reviewData.value = reviews
    relatedShops.value = 'items' in shops ? shops.items : (shops as Shop[])
    relatedContents.value = (relatedData.items || []).filter((item) => item.contentId !== id.value)

    if (!isOwnerPreview.value) {
      void recordContentView(id.value)
    }

    if (auth.isLoggedIn && !isOwnerPreview.value) {
      void getContentFavoriteStatus(id.value)
        .then((value) => {
          isFavorite.value = value
        })
        .catch(() => undefined)
      void getMyContentReview(id.value)
        .then((review) => {
          if (review) {
            myReview.value = review
            reviewForm.comment = review.comment
          }
        })
        .catch(() => undefined)
    }
  } catch (error) {
    await swal.error('ไม่พบคอนเทนต์', getApiErrorMessage(error, 'คอนเทนต์นี้อาจยังไม่ได้เผยแพร่'))
    await router.replace('/contents')
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  changingFavorite.value = true
  try {
    if (isFavorite.value) await removeContentFavorite(id.value)
    else await addContentFavorite(id.value)
    isFavorite.value = !isFavorite.value
  } catch (error) {
    await swal.error('บันทึกรายการโปรดไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    changingFavorite.value = false
  }
}

async function saveReview() {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  if (!reviewForm.comment.trim()) {
    await swal.warning('กรอกความคิดเห็น', 'กรุณาเขียนความคิดเห็นก่อนส่ง')
    return
  }
  reviewSaving.value = true
  try {
    myReview.value = await saveContentReview(id.value, { comment: reviewForm.comment })
    reviewData.value = await getContentReviews(id.value)
    await swal.success('บันทึกรีวิวแล้ว')
  } catch (error) {
    await swal.error('บันทึกรีวิวไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    reviewSaving.value = false
  }
}

async function removeReview() {
  if (!myReview.value) return
  const result = await swal.confirm('ลบรีวิวนี้หรือไม่?', 'การดำเนินการนี้ไม่สามารถย้อนกลับได้')
  if (!result.isConfirmed) return
  try {
    await deleteContentReview(myReview.value.reviewId)
    myReview.value = null
    reviewForm.comment = ''
    reviewData.value = await getContentReviews(id.value)
    await swal.success('ลบรีวิวแล้ว')
  } catch (error) {
    await swal.error('ลบรีวิวไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

function shareContent(platform?: string) {
  const url = window.location.href
  if (platform === 'fb') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'line') {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      '_blank',
    )
  } else {
    navigator.clipboard.writeText(url)
    void swal.success('คัดลอกลิงก์แล้ว', 'นำลิงก์ไปแชร์ให้เพื่อน ๆ ได้เลย')
  }
}

async function openReport(target: { contentId?: string; reviewId?: string; label: string }) {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  reportTarget.value = target
  reportForm.reason = 'ข้อมูลไม่ถูกต้อง'
  reportForm.description = ''
}

async function submitReport() {
  if (!reportTarget.value || !reportForm.reason) return
  reporting.value = true
  try {
    await createReport({
      ...reportTarget.value,
      reason: reportForm.reason,
      description: reportForm.description || undefined,
    })
    reportTarget.value = null
    await swal.success('ส่งรายงานแล้ว', 'ทีมงานจะตรวจสอบรายการนี้ต่อไป')
  } catch (error) {
    await swal.error(
      'ส่งรายงานไม่สำเร็จ',
      getApiErrorMessage(error, 'คุณอาจเคยรายงานรายการนี้แล้ว'),
    )
  } finally {
    reporting.value = false
  }
}

function openDirections() {
  if (content.value?.latitude && content.value?.longitude) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${content.value.latitude},${content.value.longitude}`,
      '_blank',
    )
  } else {
    const query = encodeURIComponent(
      `${content.value?.title || ''} ${content.value?.districtName || 'กาญจนบุรี'}`,
    )
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      void load()
    }
  },
)

onMounted(load)
</script>
