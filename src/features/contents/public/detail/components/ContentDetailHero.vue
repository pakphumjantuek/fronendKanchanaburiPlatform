<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import type { PublicContent } from '../../api/contentApi'

interface Props {
  content: PublicContent
  isFavorite: boolean
  changingFavorite?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-favorite': []
  share: [platform?: string]
}>()

function youtubeEmbedUrl(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
          (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0`
      : ''
  } catch {
    return ''
  }
}


</script>

<template>
  <div class="space-y-5">
    <!-- 16:9 Cinema Video Player Container -->
    <div
      class="relative overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#171412] shadow-xl group aspect-[16/9] w-full"
    >
      <iframe
        v-if="youtubeEmbedUrl(content.youtubeUrl)"
        :src="youtubeEmbedUrl(content.youtubeUrl)"
        :title="content.title"
        class="h-full w-full border-0 relative z-10"
        allowfullscreen
      />
      <a
        v-else
        :href="content.youtubeUrl || '#'"
        target="_blank"
        rel="noopener"
        class="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-center text-white transition hover:brightness-105"
      >
        <div
          class="h-20 w-20 rounded-full bg-[#D96C2C] text-white flex items-center justify-center shadow-xl shadow-[#D96C2C]/40 transform group-hover:scale-110 transition duration-300 ring-4 ring-[#F2A65A]/40"
        >
          <i class="mdi mdi-play text-5xl ml-1 text-white"></i>
        </div>
        <div>
          <span class="text-lg font-black text-white block">รับชมวิดีโอแนะนำสถานที่บน YouTube</span>
          <span class="text-xs text-[#F2A65A] font-extrabold mt-1 block"
            >คลิกเพื่อเปิดเล่นวิดีโอคุณภาพสูง</span
          >
        </div>
      </a>

      <!-- Video Overlay Badge -->
      <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span
          class="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#D96C2C] text-white border border-white/20 backdrop-blur-md shadow-md flex items-center gap-1.5"
        >
          <i class="mdi mdi-compass-rose text-base text-white"></i>
          {{ content.contentCategoryName || 'ศิลปะการแสดง' }}
        </span>
      </div>
    </div>

    <!-- Video Title & Main Action Bar -->
    <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Category & Location Badge -->
        <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-[#D96C2C]">
          <span class="bg-[#D96C2C]/10 text-[#D96C2C] px-3 py-1 rounded-full flex items-center gap-1 border border-[#D96C2C]/20">
            <i class="mdi mdi-folder-outline"></i>
            {{ content.contentCategoryName || 'วัฒนธรรม' }}
          </span>
          <span class="bg-[#D96C2C]/10 text-[#D96C2C] px-3 py-1 rounded-full flex items-center gap-1 border border-[#D96C2C]/20">
            <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
            อ.{{ content.districtName || 'สังขละบุรี' }} จ.กาญจนบุรี
          </span>
        </div>

        <!-- Action Buttons: Bookmark & Share -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#E8D9C9] bg-white text-[#332820] font-bold text-xs sm:text-sm hover:border-[#D96C2C] hover:text-[#D96C2C] transition cursor-pointer active:scale-95 shadow-2xs"
            @click="emit('share')"
          >
            <i class="mdi mdi-share-variant-outline text-base text-[#D96C2C]"></i>
            <span>แชร์</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 transition font-bold text-xs sm:text-sm active:scale-95 cursor-pointer shadow-2xs"
            :class="
              isFavorite
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C]'
            "
            :disabled="changingFavorite"
            @click="emit('toggle-favorite')"
          >
            <i
              class="mdi text-base"
              :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline text-[#D96C2C]'"
            ></i>
            <span>{{ isFavorite ? 'บันทึกแล้ว' : 'บันทึก' }}</span>
          </button>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-2xl sm:text-3xl font-bold text-[#332820] leading-tight tracking-tight">
        {{ content.title }}
      </h1>

      <!-- Metadata Statistics Row -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 py-3 border-y-2 border-[#E8D9C9] text-xs sm:text-sm text-[#4A3E35] font-semibold"
      >
        <div class="flex flex-wrap items-center gap-4">
          <span class="flex items-center gap-1">
            <i class="mdi mdi-clock-outline text-[#D96C2C]"></i>
            เผยแพร่: {{ formatDate(content.publishedAt || content.createdAt, { dateStyle: 'long' }) }}
          </span>
          <span class="flex items-center gap-1 text-[#D96C2C] font-bold">
            <i class="mdi mdi-eye-outline text-[#D96C2C]"></i>
            {{ (content.viewCount || 0).toLocaleString('th-TH') }} เข้าชม
          </span>
          <span v-if="content.shopName" class="flex items-center gap-1 text-[#332820]">
            <i class="mdi mdi-account-circle-outline text-[#D96C2C]"></i>
            ผู้เผยแพร่: <strong class="text-[#D96C2C] font-bold">{{ content.shopName }}</strong>
          </span>
        </div>
      </div>

      <!-- Hashtag Pills -->
      <div v-if="content.tags.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in content.tags"
          :key="tag.tagId"
          class="px-3 py-1 rounded-lg bg-[#F7F0E6] border border-[#E8D9C9] text-xs sm:text-sm font-medium text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C] transition"
        >
          #{{ tag.tagName }}
        </span>
      </div>
      <div v-else class="flex flex-wrap gap-1.5">
        <span class="px-3 py-1 rounded-lg bg-[#F7F0E6] border border-[#E8D9C9] text-xs sm:text-sm font-medium text-[#332820]">#รำมอญ</span>
        <span class="px-3 py-1 rounded-lg bg-[#F7F0E6] border border-[#E8D9C9] text-xs sm:text-sm font-medium text-[#332820]">#วัฒนธรรมมอญ</span>
        <span class="px-3 py-1 rounded-lg bg-[#F7F0E6] border border-[#E8D9C9] text-xs sm:text-sm font-medium text-[#332820]">#สังขละบุรี</span>
        <span class="px-3 py-1 rounded-lg bg-[#F7F0E6] border border-[#E8D9C9] text-xs sm:text-sm font-medium text-[#332820]">#กาญจนบุรี</span>
      </div>
    </div>
  </div>
</template>
