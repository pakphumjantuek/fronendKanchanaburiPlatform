<script setup lang="ts">
import { youtubeThumbnail } from '@/shared/utils/youtube'
import type { PublicContent } from '@/features/contents/api'
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  shopContents: PublicContent[]
}>()
</script>

<template>
  <section class="space-y-4">
    <!-- Header Title Bar -->
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs font-bold">
          <i class="mdi mdi-book-open-page-variant-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-[#332820]">เรื่องราวและคอนเทนต์ชุมชน</h2>
          <p class="text-xs sm:text-sm text-[#786B62]">คอนเทนต์สร้างสรรค์ ภูมิปัญญา และเรื่องราวน่าสนใจจากร้านนี้</p>
        </div>
      </div>

      <RouterLink
        :to="`/shops/${shop.shopId}/contents`"
        class="text-xs sm:text-sm font-black text-emerald-700 hover:underline flex items-center gap-1"
      >
        <span>ดูคอนเทนต์ทั้งหมด ({{ shopContents.length }})</span>
        <i class="mdi mdi-chevron-right text-base"></i>
      </RouterLink>
    </div>

    <!-- Contents Cards Grid -->
    <div v-if="shopContents.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <RouterLink
        v-for="item in shopContents.slice(0, 3)"
        :key="item.contentId"
        :to="`/contents/${item.contentId}`"
        class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-4 shadow-xs hover:shadow-xl hover:border-emerald-600 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#171412] mb-3.5">
            <img
              v-if="youtubeThumbnail(item.youtubeUrl)"
              :src="youtubeThumbnail(item.youtubeUrl)"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-[#171412] text-white"
            >
              <i class="mdi mdi-compass-rose text-5xl opacity-50"></i>
            </div>
            <span
              class="absolute top-2.5 left-2.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white shadow-md"
            >
              {{ item.contentCategoryName || 'เรื่องราวชุมชน' }}
            </span>
          </div>

          <h3
            class="font-black text-[#332820] text-base sm:text-lg group-hover:text-emerald-700 transition line-clamp-2 leading-snug"
          >
            {{ item.title }}
          </h3>
          <p
            v-if="item.summary"
            class="text-xs sm:text-sm text-[#786B62] mt-1.5 line-clamp-2 font-medium leading-relaxed"
          >
            {{ item.summary }}
          </p>
        </div>

        <div
          class="flex items-center justify-between text-xs sm:text-sm mt-4 pt-2.5 border-t border-[#E8D9C9] font-black text-emerald-700"
        >
          <span class="flex items-center gap-1">
            <i class="mdi mdi-book-open-outline"></i> อ่านเรื่องราว
          </span>
          <i class="mdi mdi-arrow-right text-base group-hover:translate-x-1 transition"></i>
        </div>
      </RouterLink>
    </div>

    <!-- Empty State for Contents -->
    <div
      v-else
      class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] p-8 text-center space-y-2"
    >
      <i class="mdi mdi-text-box-search-outline text-3xl text-[#786B62]"></i>
      <p class="text-sm font-black text-[#332820]">ยังไม่มีเรื่องราวคอนเทนต์ของร้านค้านี้ในขณะนี้</p>
    </div>
  </section>
</template>
