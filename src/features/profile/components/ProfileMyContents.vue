<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserContent } from '@/features/contents/user/api/userContentApi'

interface Props {
  contents: UserContent[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'delete-content': [content: UserContent]
}>()

type ContentTab = 'active' | 'archived'

const currentTab = ref<ContentTab>('active')

const activeContents = computed(() =>
  props.contents.filter((content) => content.status !== 'Archived'),
)

const archivedContents = computed(() =>
  props.contents.filter((content) => content.status === 'Archived'),
)

const visibleContents = computed(() =>
  currentTab.value === 'archived'
    ? archivedContents.value
    : activeContents.value,
)

function statusLabel(status: UserContent['status']) {
  if (status === 'Published') return 'เผยแพร่แล้ว'
  if (status === 'Draft') return 'บันทึกร่าง'
  if (status === 'Pending') return 'รอตรวจสอบ'
  return 'เก็บถาวร'
}

function statusClass(status: UserContent['status']) {
  return status === 'Published'
    ? 'bg-emerald-600 text-white shadow-xs'
    : status === 'Draft'
      ? 'bg-slate-600 text-white shadow-xs'
    : status === 'Pending'
      ? 'bg-amber-500 text-white shadow-xs'
      : 'bg-[#E8D9C9] text-[#786B62]'
}

function formatDate(value: string) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    )
  } catch {
    return value
  }
}

function youtubeThumbnail(url?: string | null) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? '')
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Header with Create CTA Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-[#332820]">
          กิจกรรมและคอนเทนต์ของคุณ
        </h2>
        <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
          เรื่องราว บทความท่องเที่ยว และกิจกรรมชุมชนที่คุณได้เขียนและแบ่งปันบนแพลตฟอร์ม
        </p>
      </div>

      <RouterLink
        v-if="currentTab === 'active'"
        to="/create"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 border border-[#D96C2C] shrink-0"
      >
        <i class="mdi mdi-plus-circle text-white"></i>
        <span class="!text-white font-black">+ เขียนคอนเทนต์ใหม่</span>
      </RouterLink>
    </div>

    <div class="flex rounded-xl border border-[#E8D9C9] bg-[#F7F0E6] p-1">
      <button
        type="button"
        class="flex-1 rounded-lg px-3 py-2 text-xs font-black transition"
        :class="currentTab === 'active' ? 'bg-white text-[#D96C2C] shadow-sm' : 'text-[#786B62]'"
        @click="currentTab = 'active'"
      >
        บันทึกร่าง / เผยแพร่ ({{ activeContents.length }})
      </button>
      <button
        type="button"
        class="flex-1 rounded-lg px-3 py-2 text-xs font-black transition"
        :class="currentTab === 'archived' ? 'bg-white text-[#D96C2C] shadow-sm' : 'text-[#786B62]'"
        @click="currentTab = 'archived'"
      >
        เก็บถาวร ({{ archivedContents.length }})
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="!visibleContents.length"
      class="text-center py-16 px-4 rounded-2xl bg-[#F7F0E6] border-2 border-dashed border-[#E8D9C9] space-y-3"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C]">
        <i class="mdi mdi-text-box-plus-outline text-3xl"></i>
      </div>
      <h3 class="text-base font-black text-[#332820]">
        {{ currentTab === 'archived' ? 'ยังไม่มีคอนเทนต์ที่เก็บถาวร' : 'คุณยังไม่มีคอนเทนต์หรือเรื่องราวที่เขียน' }}
      </h3>
      <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">
        {{ currentTab === 'archived' ? 'คอนเทนต์ที่คุณเก็บถาวรจะแสดงในแท็บนี้' : 'เริ่มต้นแบ่งปันสถานที่ท่องเที่ยว ร้านอาหาร หรือเรื่องราวดีๆ ในจังหวัดกาญจนบุรีของคุณได้เลย' }}
      </p>
      <div v-if="currentTab === 'active'" class="pt-2">
        <RouterLink
          to="/create"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96C2C] text-white font-black text-xs shadow-md transition hover:bg-[#BF5720]"
        >
          <i class="mdi mdi-plus text-sm"></i>
          <span>สร้างเรื่องราวแรกของคุณ</span>
        </RouterLink>
      </div>
    </div>

    <!-- Contents Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="item in visibleContents"
        :key="item.contentId"
        class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#E8D9C9] bg-white transition hover:border-[#D96C2C] hover:shadow-md"
      >
        <!-- Thumbnail Cover -->
        <div class="relative h-44 w-full bg-[#171412] overflow-hidden">
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
            <i class="mdi mdi-image-outline text-4xl text-[#F2A65A]/60"></i>
          </div>

          <!-- Status Badge -->
          <span
            class="absolute top-3 left-3 rounded-full px-3 py-0.5 text-[10px] font-black"
            :class="statusClass(item.status)"
          >
            {{ statusLabel(item.status) }}
          </span>
        </div>

        <!-- Details & Actions -->
        <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-black text-[#D96C2C] uppercase tracking-wider block">
              {{ item.contentCategoryName || item.districtName || 'เรื่องราวชุมชน' }}
            </span>
            <h4 class="font-black text-[#332820] text-sm line-clamp-2 mt-0.5 group-hover:text-[#D96C2C] transition">
              {{ item.title }}
            </h4>
            <p v-if="item.summary" class="text-xs text-[#786B62] font-semibold line-clamp-2 mt-1">
              {{ item.summary }}
            </p>
          </div>

          <div class="pt-3 border-t border-[#E8D9C9] flex items-center justify-between gap-2 text-xs">
            <span class="text-[11px] text-[#786B62] font-semibold">
              {{ formatDate(item.createdAt) }}
            </span>

            <div v-if="currentTab === 'active'" class="flex items-center gap-1.5">
              <RouterLink
                :to="item.status === 'Published' ? `/contents/${item.contentId}` : `/contents/${item.contentId}?preview=mine`"
                class="px-2.5 py-1 rounded-lg bg-[#F7F0E6] hover:bg-[#E8D9C9] text-[#332820] font-black text-[11px] transition"
              >
                ดูเนื้อหา
              </RouterLink>

              <RouterLink
                :to="`/my-contents/${item.contentId}/edit`"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D96C2C]/10 hover:bg-[#D96C2C]/20 text-[#D96C2C] font-black text-[11px] transition"
              >
                <i class="mdi mdi-pencil-outline text-sm"></i>
                แก้ไข
              </RouterLink>

              <button
                type="button"
                class="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="ลบคอนเทนต์"
                @click="emit('delete-content', item)"
              >
                <i class="mdi mdi-trash-can-outline text-base"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
