<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import { computed, onMounted, ref } from 'vue'
import {
  archiveMyContent,
  getMyContents,
  getPublicContents,
  type UserContent,
} from '@/features/contents/api'
import { getMyShop, type Shop } from '@/features/merchant/api/shopApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const shop = ref<Shop | null>(null)
const contents = ref<UserContent[]>([])
const loading = ref(true)
const searchQuery = ref('')
const swal = useSwal()

const filteredContents = computed(() => {
  if (!searchQuery.value.trim()) return contents.value
  const q = searchQuery.value.toLowerCase().trim()
  return contents.value.filter(
    (c) => c.title.toLowerCase().includes(q) || (c.summary && c.summary.toLowerCase().includes(q))
  )
})

async function load() {
  loading.value = true
  try {
    const myShop = await getMyShop()
    shop.value = myShop

    // 1. Fetch contents created by the logged in merchant user (/contents/mine)
    const mineRes = await getMyContents({ page: 1, pageSize: 100 })
    const mineItems = mineRes.items || []

    // 2. Fetch public contents attached to shopId (/contents?shopId=xxx)
    const pubRes = await getPublicContents({ shopId: myShop.shopId, page: 1, pageSize: 100 })
    const pubItems = (pubRes.items || []).map((p) => ({
      contentId: p.contentId,
      shopId: p.shopId,
      contentCategoryId: p.contentCategoryId,
      contentCategoryName: p.contentCategoryName,
      title: p.title,
      summary: p.summary,
      youtubeUrl: p.youtubeUrl,
      status: (p.status || 'Published') as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt || p.createdAt,
    }))

    // 3. Merge & Deduplicate
    const itemMap = new Map<string, UserContent>()
    for (const item of [...mineItems, ...pubItems]) {
      if (item.contentId) itemMap.set(item.contentId, item)
    }
    contents.value = Array.from(itemMap.values())
  } catch (error) {
    await swal.error('โหลดข้อมูลคอนเทนต์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function removeContent(item: UserContent) {
  const result = await swal.confirm(`ลบคอนเทนต์ "${item.title}"?`, 'เรื่องราวนี้จะไม่แสดงต่อสาธารณะบนแพลตฟอร์มอีกต่อไป')
  if (!result.isConfirmed) return
  try {
    await archiveMyContent(item.contentId)
    contents.value = contents.value.filter((c) => c.contentId !== item.contentId)
    await swal.success('ลบคอนเทนต์แล้ว')
  } catch (error) {
    await swal.error('ลบไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-[1920px] space-y-6 py-4 text-[#332820]">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>
    </div>

    <template v-else-if="shop">
      <!-- Header Banner Card -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0">
            <i class="mdi mdi-text-box-multiple-outline text-2xl text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-[#332820]">จัดการคอนเทนต์ร้านค้า</h1>
              <span class="rounded-full bg-[#D96C2C]/10 px-3 py-0.5 text-xs font-black text-[#D96C2C] border border-[#D96C2C]/20">
                {{ contents.length }} บทความ
              </span>
            </div>
            <p class="text-xs text-[#786B62] font-semibold mt-0.5">แบ่งปันเรื่องราว วัฒนธรรม วิดีโอ และจุดเด่นของร้านค้าให้แก่ผู้เยี่ยมชม</p>
          </div>
        </div>

        <RouterLink
          to="/my-shop/contents/new"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
        >
          <i class="mdi mdi-plus-circle text-lg text-white"></i>
          <span class="!text-white font-black">+ เขียนเรื่องใหม่</span>
        </RouterLink>
      </div>

      <!-- Search Bar -->
      <div v-if="contents.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 shadow-xs">
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อเรื่องหรือเนื้อหา..."
            class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] transition"
          />
          <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"></i>
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
            @click="searchQuery = ''"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>

        <div class="text-xs text-[#786B62] font-black">
          แสดง {{ filteredContents.length }} จากทั้งหมด {{ contents.length }} เรื่องราว
        </div>
      </div>

      <!-- Empty State: No Contents -->
      <div
        v-if="contents.length === 0"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-16 px-6 text-center shadow-xs space-y-3"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-2 border border-[#D96C2C]/30">
          <i class="mdi mdi-text-box-plus-outline text-4xl"></i>
        </div>
        <h2 class="text-xl font-black text-[#332820]">ยังไม่มีคอนเทนต์หรือเรื่องราวของร้านค้า</h2>
        <p class="max-w-md text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
          เริ่มต้นเขียนเรื่องราว เล่าความประทับใจ หรือลงวิดีโอแนะนำร้านค้าเพื่อให้ผู้เยี่ยมชมรู้จักร้านของคุณมากยิ่งขึ้น
        </p>
        <RouterLink
          to="/my-shop/contents/new"
          class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]"
        >
          <i class="mdi mdi-plus-circle text-lg text-white"></i>
          <span class="!text-white font-black">เขียนเรื่องแรกของร้านค้า</span>
        </RouterLink>
      </div>

      <!-- No Search Match -->
      <div
        v-else-if="filteredContents.length === 0"
        class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center text-[#786B62] shadow-xs"
      >
        <i class="mdi mdi-magnify-remove text-4xl text-[#D96C2C] mb-2 block"></i>
        <p class="font-black text-[#332820]">ไม่พบเรื่องราวที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
        <button
          type="button"
          class="mt-3 text-xs font-black text-[#D96C2C] hover:underline"
          @click="searchQuery = ''"
        >
          ล้างคำค้นหา
        </button>
      </div>

      <!-- Contents Grid Cards -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in filteredContents"
          :key="item.contentId"
          class="group flex flex-col overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D96C2C] hover:shadow-xl justify-between"
        >
          <div>
            <!-- Banner Image / YouTube Thumbnail -->
            <div class="relative aspect-16/10 w-full overflow-hidden bg-[#171412]">
              <img
                v-if="youtubeThumbnail(item.youtubeUrl)"
                :src="youtubeThumbnail(item.youtubeUrl)"
                :alt="item.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white">
                <i class="mdi mdi-compass-rose text-5xl opacity-50"></i>
              </div>

              <!-- Category Badge -->
              <div class="absolute top-3 left-3">
                <span class="inline-flex items-center rounded-full bg-[#D96C2C] px-3 py-0.5 text-[10px] font-black text-white shadow-md">
                  {{ item.contentCategoryName || 'เรื่องราวร้านค้า' }}
                </span>
              </div>

              <!-- Status Badge (Published vs Pending) -->
              <div class="absolute top-3 right-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-md border"
                  :class="item.status === 'Published' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-300'"
                >
                  <i :class="['mdi', item.status === 'Published' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                  {{ item.status === 'Published' ? 'เผยแพร่แล้ว' : 'รอการตรวจสอบ' }}
                </span>
              </div>
            </div>

            <div class="p-5 space-y-2">
              <h2 class="text-base font-black text-[#332820] group-hover:text-[#D96C2C] transition line-clamp-2 leading-snug">
                {{ item.title }}
              </h2>
              <p v-if="item.summary" class="text-xs text-[#786B62] font-semibold line-clamp-2 leading-relaxed">
                {{ item.summary }}
              </p>
              <div class="text-[11px] text-[#786B62] font-bold flex items-center gap-1 pt-1">
                <i class="mdi mdi-clock-time-four-outline text-[#D96C2C]"></i>
                <span>สร้างเมื่อ: {{ formatDate(item.createdAt, undefined, '') }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="p-5 pt-0">
            <div class="flex items-center justify-between border-t-2 border-[#E8D9C9] pt-3 text-xs">
              <RouterLink
                :to="`/contents/${item.contentId}`"
                target="_blank"
                class="inline-flex items-center gap-1 font-bold text-[#786B62] hover:text-[#D96C2C] transition"
              >
                <i class="mdi mdi-eye-outline text-sm text-[#D96C2C]"></i>
                <span>ดูบทความ</span>
              </RouterLink>

              <div class="flex items-center gap-2">
                <RouterLink
                  :to="`/my-shop/contents/${item.contentId}/edit`"
                  class="inline-flex items-center gap-1 rounded-xl border border-[#D96C2C]/30 bg-[#D96C2C]/10 px-3 py-1.5 font-black text-[#D96C2C] hover:bg-[#D96C2C] hover:text-white transition shadow-2xs"
                >
                  <i class="mdi mdi-pencil-outline text-xs"></i>
                  <span>แก้ไข</span>
                </RouterLink>

                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-black text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer"
                  @click="removeContent(item)"
                >
                  <i class="mdi mdi-trash-can-outline text-xs"></i>
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
