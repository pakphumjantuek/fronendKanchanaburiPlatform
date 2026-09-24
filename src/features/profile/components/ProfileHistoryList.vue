<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { ContentViewHistory } from '../api/profileApi'

interface Props {
  history: ContentViewHistory[]
}

defineProps<Props>()




</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Header -->
    <div class="border-b-2 border-[#E8D9C9] pb-4">
      <h2 class="text-xl sm:text-2xl font-black text-[#332820]">
        ประวัติการเข้าชม (Browsing History)
      </h2>
      <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
        รายการคอนเทนต์และสถานที่ท่องเที่ยวในกาญจนบุรีที่คุณเคยคลิกเปิดดูย้อนหลัง
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="!history.length"
      class="text-center py-16 px-4 rounded-2xl bg-[#F7F0E6] border-2 border-dashed border-[#E8D9C9] space-y-3"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C]">
        <i class="mdi mdi-history text-3xl"></i>
      </div>
      <h3 class="text-base font-black text-[#332820]">ยังไม่มีประวัติการเข้าชมคอนเทนต์</h3>
      <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">
        เมื่อคุณคลิกชมเรื่องราว สถานที่ท่องเที่ยว หรือร้านค้าต่างๆ รายการจะถูกบันทึกไว้ที่นี่
      </p>
      <div class="pt-2">
        <RouterLink
          to="/contents"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96C2C] text-white font-black text-xs shadow-md transition hover:bg-[#BF5720]"
        >
          <i class="mdi mdi-compass-outline text-sm"></i>
          <span>สำรวจเรื่องราวเมืองกาญจน์</span>
        </RouterLink>
      </div>
    </div>

    <!-- History List Items -->
    <div v-else class="space-y-3">
      <div
        v-for="item in history"
        :key="item.contentId"
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border-2 border-[#E8D9C9] bg-white transition hover:border-[#D96C2C] hover:shadow-xs"
      >
        <div class="flex items-center gap-3.5 min-w-0 flex-1">
          <!-- Small Thumbnail -->
          <div class="h-16 w-16 rounded-xl bg-[#171412] shrink-0 overflow-hidden border border-[#E8D9C9]">
            <img
              v-if="youtubeThumbnail(item.youtubeUrl)"
              :src="youtubeThumbnail(item.youtubeUrl)"
              :alt="item.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-slate-400"
            >
              <i class="mdi mdi-play-circle-outline text-2xl text-[#D96C2C]"></i>
            </div>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1 space-y-0.5">
            <h4 class="font-black text-[#332820] text-sm truncate leading-tight">
              {{ item.title }}
            </h4>
            <p v-if="item.summary" class="text-xs text-[#786B62] font-semibold line-clamp-1">
              {{ item.summary }}
            </p>
            <span class="text-[11px] text-[#786B62] font-semibold flex items-center gap-1">
              <i class="mdi mdi-clock-outline text-[#D96C2C]"></i>
              เข้าชมเมื่อ: {{ formatDate(item.viewedAt, { dateStyle: 'medium', timeStyle: 'short' }) }}
            </span>
          </div>
        </div>

        <!-- Action Button -->
        <RouterLink
          :to="`/contents/${item.contentId}`"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7F0E6] hover:bg-[#D96C2C] hover:text-white text-xs font-black text-[#332820] transition border border-[#E8D9C9] shrink-0"
        >
          <span>เปิดดูอีกครั้ง</span>
          <i class="mdi mdi-arrow-right text-xs"></i>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
