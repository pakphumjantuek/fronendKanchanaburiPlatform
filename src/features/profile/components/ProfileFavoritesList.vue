<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { FavoriteContent } from '../api/profileApi'

interface Props {
  favorites: FavoriteContent[]
}

defineProps<Props>()




</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Header -->
    <div class="border-b-2 border-[#E8D9C9] pb-4">
      <h2 class="text-xl sm:text-2xl font-black text-[#332820]">
        รายการโปรดที่บันทึกไว้ (Favorites)
      </h2>
      <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
        รวมเรื่องราว สถานที่ท่องเที่ยว และบทความที่คุณชื่นชอบและกดบันทึกเก็บไว้
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="!favorites.length"
      class="text-center py-16 px-4 rounded-2xl bg-[#F7F0E6] border-2 border-dashed border-[#E8D9C9] space-y-3"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <i class="mdi mdi-heart-outline text-3xl"></i>
      </div>
      <h3 class="text-base font-black text-[#332820]">ยังไม่มีรายการโปรด</h3>
      <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">
        คุณสามารถกดบันทึกบทความหรือสถานที่ท่องเที่ยวที่ถูกใจ เพื่อกลับมาอ่านในภายหลังได้
      </p>
      <div class="pt-2">
        <RouterLink
          to="/contents"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96C2C] text-white font-black text-xs shadow-md transition hover:bg-[#BF5720]"
        >
          <i class="mdi mdi-compass-outline text-sm"></i>
          <span>สำรวจเรื่องราวและสถานที่</span>
        </RouterLink>
      </div>
    </div>

    <!-- Favorites Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="item in favorites"
        :key="item.contentId"
        class="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#E8D9C9] bg-white transition hover:border-[#D96C2C] hover:shadow-md"
      >
        <div class="relative h-40 w-full bg-[#171412] overflow-hidden">
          <img
            v-if="youtubeThumbnail(item.youtubeUrl)"
            :src="youtubeThumbnail(item.youtubeUrl)"
            :alt="item.title"
            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C]/30 to-[#171412] text-white"
          >
            <i class="mdi mdi-heart text-4xl text-rose-500/60"></i>
          </div>

          <span
            class="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-rose-600 shadow-md"
          >
            <i class="mdi mdi-heart text-lg"></i>
          </span>
        </div>

        <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-black text-[#332820] text-sm line-clamp-2 group-hover:text-[#D96C2C] transition">
              {{ item.title }}
            </h4>
            <p v-if="item.summary" class="text-xs text-[#786B62] font-semibold line-clamp-2 mt-1">
              {{ item.summary }}
            </p>
          </div>

          <div class="pt-3 border-t border-[#E8D9C9] flex items-center justify-between text-xs">
            <span class="text-[11px] text-[#786B62] font-semibold">
              {{ formatDate(item.createdAt, { dateStyle: 'medium', timeStyle: 'short' }) }}
            </span>

            <RouterLink
              :to="`/contents/${item.contentId}`"
              class="px-3 py-1 rounded-lg bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs transition"
            >
              อ่านต่อ
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
