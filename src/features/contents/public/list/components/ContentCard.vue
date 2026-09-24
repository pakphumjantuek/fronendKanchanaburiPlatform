<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { PublicContent } from '../../api/contentApi'

interface Props {
  item: PublicContent
  displayMode?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  displayMode: 'grid',
})




</script>

<template>
  <!-- GRID MODE CARD -->
  <RouterLink
    v-if="displayMode === 'grid'"
    :to="`/contents/${item.contentId}`"
    class="group relative bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-[#D96C2C] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
  >
    <!-- Card Image Frame -->
    <div>
      <div class="relative aspect-[16/9] w-full overflow-hidden bg-[#171412]">
        <img
          v-if="youtubeThumbnail(item.youtubeUrl)"
          :src="youtubeThumbnail(item.youtubeUrl)"
          :alt="item.title"
          class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white"
        >
          <i
            class="mdi mdi-compass-rose text-5xl opacity-80 group-hover:scale-110 transition-transform duration-500"
          ></i>
        </div>

        <div
          class="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition duration-300"
        ></div>

        <!-- Top Left Category Badge -->
        <span
          v-if="item.contentCategoryName"
          class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#D96C2C] text-white shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1.5"
        >
          <i class="mdi mdi-folder-outline text-xs text-white"></i>
          {{ item.contentCategoryName }}
        </span>

        <!-- Top Right District Badge -->
        <span
          v-if="item.districtName"
          class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#171412]/90 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1"
        >
          <i class="mdi mdi-map-marker text-[#F2A65A] text-xs"></i>
          อ.{{ item.districtName }}
        </span>
      </div>

      <!-- Card Content Body -->
      <div class="p-5 space-y-2.5">
        <h3
          class="font-bold text-[#332820] text-lg sm:text-xl group-hover:text-[#D96C2C] transition-colors leading-snug line-clamp-2"
        >
          {{ item.title }}
        </h3>
        <p class="text-sm text-[#4A3E35] line-clamp-2 leading-relaxed font-medium">
          {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
        </p>
      </div>
    </div>

    <!-- Card Footer -->
    <div
      class="px-5 py-3.5 bg-[#F7F0E6] border-t-2 border-[#E8D9C9] flex items-center justify-between text-sm font-semibold"
    >
      <div class="flex items-center gap-3 text-[#786B62]">
        <span class="flex items-center gap-1.5">
          <i class="mdi mdi-calendar-blank-outline text-[#D96C2C] text-base"></i>
          {{ formatDate(item.publishedAt ?? item.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }, 'เรื่องราวกาญจนบุรี') }}
        </span>
        <span class="flex items-center gap-1 text-[#D96C2C] font-bold">
          <i class="mdi mdi-eye-outline text-base"></i>
          {{ (item.viewCount || 0).toLocaleString('th-TH') }}
        </span>
      </div>

      <div
        class="flex items-center gap-1 font-bold text-[#D96C2C] group-hover:text-[#BF5720] transition"
      >
        <span>อ่านรายละเอียด</span>
        <i
          class="mdi mdi-arrow-right text-base transition-transform duration-200 group-hover:translate-x-1"
        ></i>
      </div>
    </div>
  </RouterLink>

  <!-- LIST MODE CARD -->
  <RouterLink
    v-else
    :to="`/contents/${item.contentId}`"
    class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-[#D96C2C] transition-all duration-300 transform hover:-translate-y-1 flex flex-col sm:flex-row"
  >
    <div
      class="relative w-full sm:w-72 aspect-[16/9] sm:aspect-auto overflow-hidden bg-[#171412] shrink-0"
    >
      <img
        v-if="youtubeThumbnail(item.youtubeUrl)"
        :src="youtubeThumbnail(item.youtubeUrl)"
        :alt="item.title"
        class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white"
      >
        <i class="mdi mdi-compass-rose text-5xl opacity-80"></i>
      </div>
    </div>

    <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span
            v-if="item.contentCategoryName"
            class="text-xs font-semibold text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-2.5 py-0.5 rounded-full"
          >
            {{ item.contentCategoryName }}
          </span>
          <span
            v-if="item.districtName"
            class="text-xs font-semibold text-[#786B62] flex items-center gap-1"
          >
            <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
            อ.{{ item.districtName }}
          </span>
        </div>
        <h3
          class="font-bold text-[#332820] text-xl group-hover:text-[#D96C2C] transition-colors leading-snug"
        >
          {{ item.title }}
        </h3>
        <p
          class="text-sm text-[#4A3E35] line-clamp-2 mt-1.5 leading-relaxed font-medium"
        >
          {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
        </p>
      </div>

      <div
        class="flex items-center justify-between text-sm text-[#786B62] border-t-2 border-[#E8D9C9] pt-3 font-semibold"
      >
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 text-[#786B62]">
            <i class="mdi mdi-calendar-blank-outline text-[#D96C2C]"></i>
            {{ formatDate(item.publishedAt ?? item.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }, 'เรื่องราวกาญจนบุรี') }}
          </span>
          <span class="flex items-center gap-1 text-[#D96C2C] font-bold">
            <i class="mdi mdi-eye-outline text-[#D96C2C]"></i>
            {{ (item.viewCount || 0).toLocaleString('th-TH') }} เข้าชม
          </span>
        </div>
        <div
          class="flex items-center gap-1 font-bold text-[#D96C2C] group-hover:text-[#BF5720] transition"
        >
          <span>อ่านรายละเอียด</span>
          <i
            class="mdi mdi-arrow-right text-base transition-transform duration-200 group-hover:translate-x-1"
          ></i>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
