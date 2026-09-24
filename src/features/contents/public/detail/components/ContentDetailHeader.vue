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
  <section class="bg-white border-b border-slate-200/90 py-8 shadow-xs">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <!-- Media Section (YouTube Video Player with Glassmorphic Card Frame) -->
        <section
          v-if="content.youtubeUrl"
          class="relative group rounded-3xl overflow-hidden border border-slate-900/90 bg-slate-950 shadow-xl lg:col-span-7"
        >
          <iframe
            v-if="youtubeEmbedUrl(content.youtubeUrl)"
            :src="youtubeEmbedUrl(content.youtubeUrl)"
            :title="content.title"
            class="aspect-[16/9] w-full border-0 relative z-10"
            allowfullscreen
          />
          <a
            v-else
            :href="content.youtubeUrl"
            target="_blank"
            rel="noopener"
            class="relative z-10 flex aspect-[16/9] flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0d3831] via-teal-950 to-slate-950 text-center text-sm font-bold text-white hover:brightness-110 transition"
          >
            <div
              class="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center animate-pulse"
            >
              <i class="mdi mdi-play text-4xl text-emerald-300" />
            </div>
            <span class="text-base font-extrabold text-emerald-100"
              >รับชมวิดีโอแนะนำสถานที่บน YouTube</span
            >
          </a>
        </section>

        <!-- Details Info Section -->
        <div
          class="space-y-5"
          :class="content.youtubeUrl ? 'lg:col-span-5' : 'lg:col-span-12 max-w-4xl'"
        >
          <!-- Category & District Badges -->
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#1c4d3e] text-white shadow-xs"
            >
              <i class="mdi mdi-compass-rose text-sm"></i>
              {{ content.contentCategoryName || 'สถานที่น่าเที่ยว' }}
            </span>

            <span
              v-if="content.districtName"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800"
            >
              <i class="mdi mdi-map-marker text-emerald-600"></i>
              อ.{{ content.districtName }}
            </span>
          </div>

          <!-- Title -->
          <h1
            class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight"
          >
            {{ content.title }}
          </h1>

          <!-- Location & Tags -->
          <div class="space-y-2.5">
            <p class="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <i class="mdi mdi-map-marker-radius text-[#1c4d3e] text-base"></i>
              <span>{{
                [content.subDistrictName, content.districtName].filter(Boolean).join(' ') ||
                'จังหวัดกาญจนบุรี'
              }}</span>
            </p>

            <div v-if="content.tags.length" class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="tag in content.tags"
                :key="tag.tagId"
                class="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-800 transition"
              >
                # {{ tag.tagName }}
              </span>
            </div>
          </div>

          <!-- Meta Bar (Date, Share & Favorite Actions) -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-200/80 text-xs text-slate-500"
          >
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1.5 font-medium text-slate-600"
                ><i class="mdi mdi-clock-outline text-slate-400 text-sm"></i>
                {{ formatDate(content.publishedAt || content.createdAt, { dateStyle: 'long' }) }}</span
              >
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition shadow-2xs cursor-pointer"
                @click="emit('share')"
              >
                <i class="mdi mdi-share-variant-outline text-base text-slate-600"></i>
                <span>แชร์</span>
              </button>

              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition font-extrabold active:scale-95 shadow-2xs cursor-pointer"
                :class="
                  isFavorite
                    ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                "
                :disabled="changingFavorite"
                @click="emit('toggle-favorite')"
              >
                <i
                  class="mdi text-base transition-transform"
                  :class="
                    isFavorite
                      ? 'mdi-heart text-rose-600 scale-110'
                      : 'mdi-heart-outline text-slate-400'
                  "
                ></i>
                <span>{{ isFavorite ? 'บันทึกแล้ว' : 'บันทึก' }}</span>
              </button>
            </div>
          </div>

          <!-- เรื่องย่อ (Summary Highlight Card) -->
          <div
            class="rounded-2xl border-l-4 border-[#1c4d3e] bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border-y border-r border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-2"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-xs font-extrabold text-[#1c4d3e] uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="mdi mdi-text-box-search-outline text-base"></i>
                เรื่องย่อ / บทสรุปสถานที่
              </h3>
              <i class="mdi mdi-format-quote-close text-2xl text-emerald-800/20"></i>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
              "{{ content.summary || 'ยังไม่มีรายละเอียดเรื่องย่อเพิ่มเติมสำหรับคอนเทนต์นี้' }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
