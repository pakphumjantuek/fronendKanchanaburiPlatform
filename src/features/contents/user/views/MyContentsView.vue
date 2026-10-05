<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { onMounted, ref } from 'vue'
import { archiveMyContent, getMyContents, type UserContent } from '@/features/contents/api'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'

const contents = ref<UserContent[]>([])
const loading = ref(true)
const swal = useSwal()

function statusLabel(status: UserContent['status']) {
  return status === 'Pending' ? 'รอตรวจสอบ' : status === 'Published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง/เก็บถาวร'
}

function statusClass(status: UserContent['status']) {
  return status === 'Pending'
    ? 'bg-amber-500/15 text-amber-700 border-amber-300'
    : status === 'Published'
      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300'
      : 'bg-slate-200 text-slate-700 border-slate-300'
}


async function load() {
  loading.value = true
  try {
    contents.value = (await getMyContents({ page: 1, pageSize: 100 })).items
  } catch (error) {
    await swal.error('โหลดคอนเทนต์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function archive(content: UserContent) {
  const result = await swal.confirm('ต้องการยกเลิกคอนเทนต์นี้หรือไม่?', content.title)
  if (!result.isConfirmed) return
  try {
    await archiveMyContent(content.contentId)
    await swal.success('ยกเลิกคอนเทนต์แล้ว')
    await load()
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

onMounted(load)
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:py-12 bg-[#F7F0E6] text-[#332820]">
    <!-- HERO SECTION -->
    <section
      class="rounded-3xl border-2 border-[#E8D9C9] bg-gradient-to-br from-[#FFF9F2] via-[#F7F0E6] to-[#FFF9F2] p-6 text-[#332820] sm:p-9 shadow-xs"
    >
      <div class="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C]">
            <i class="mdi mdi-text-box-multiple-outline text-[#D96C2C]" />
            <span>Community Content</span>
          </div>
          <h1 class="mt-3 text-3xl font-black sm:text-4xl text-[#332820]">จัดการคอนเทนต์ของฉัน</h1>
          <p class="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#786B62] font-semibold">
            เผยแพร่เรื่องราว สถานที่ท่องเที่ยว วัฒนธรรม หรือประสบการณ์ในกาญจนบุรีของคุณให้ผู้คนค้นพบ
          </p>
        </div>
        <RouterLink
          to="/create"
          class="rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C] flex items-center gap-1.5"
        >
          <i class="mdi mdi-plus-circle-outline text-base" />
          <span>สร้างคอนเทนต์ใหม่</span>
        </RouterLink>
      </div>
    </section>

    <!-- CONTENT LIST SECTION -->
    <section class="mt-8">
      <!-- SKELETON LOADING -->
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="index in 6"
          :key="index"
          class="h-52 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-5 space-y-3"
        >
          <div class="h-5 w-1/3 bg-[#E8D9C9]/50 rounded-lg" />
          <div class="h-6 w-3/4 bg-[#E8D9C9]/60 rounded-xl" />
          <div class="h-4 w-full bg-[#E8D9C9]/40 rounded-lg" />
        </div>
      </div>

      <!-- EMPTY STATE -->
      <AppEmptyState
        v-else-if="!contents.length"
        icon="mdi-text-box-plus-outline"
        title="ยังไม่มีคอนเทนต์ที่คุณสร้าง"
        description="เริ่มแบ่งปันเรื่องราว สถานที่ท่องเที่ยว หรือวิดีโอเด็ดๆ ในกาญจนบุรีได้เลย"
        action-label="สร้างคอนเทนต์บทความแรก"
        @action="$router.push('/create')"
      />

      <!-- CARDS GRID -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in contents"
          :key="item.contentId"
          class="flex flex-col justify-between rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs hover:border-[#D96C2C] transition group"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <span
                class="rounded-full border px-3 py-0.5 text-xs font-black"
                :class="statusClass(item.status)"
              >
                {{ statusLabel(item.status) }}
              </span>
              <span class="text-xs font-bold text-[#786B62]">
                {{ formatDate(item.updatedAt, { dateStyle: 'medium', timeStyle: 'short' }) }}
              </span>
            </div>

            <h2 class="text-base font-black text-[#332820] line-clamp-2 group-hover:text-[#D96C2C] transition">
              {{ item.title }}
            </h2>

            <p class="text-xs text-[#786B62] line-clamp-2 font-medium leading-relaxed">
              {{ item.summary || 'ไม่มีคำอธิบายย่อ' }}
            </p>
          </div>

          <div class="mt-6 flex items-center justify-between border-t-2 border-[#E8D9C9]/60 pt-4 text-xs font-black">
            <RouterLink
              v-if="item.status !== 'Archived'"
              :to="`/my-contents/${item.contentId}/edit`"
              class="text-[#D96C2C] hover:underline flex items-center gap-1"
            >
              <i class="mdi mdi-square-edit-outline" />
              <span>แก้ไขบทความ</span>
            </RouterLink>
            <span v-else class="text-[#786B62]/60">ไม่สามารถแก้ไขได้</span>

            <button
              v-if="item.status !== 'Archived'"
              type="button"
              class="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              @click="archive(item)"
            >
              <i class="mdi mdi-delete-outline" />
              <span>ยกเลิก/เก็บถาวร</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
