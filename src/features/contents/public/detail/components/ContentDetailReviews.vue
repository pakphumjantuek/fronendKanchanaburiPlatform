<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import type { ContentReview, ContentReviews } from '../../api/contentApi'

interface Props {
  reviewData: ContentReviews
  myReview: ContentReview | null
  isLoggedIn: boolean
  reviewSaving: boolean
  comment: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:comment': [value: string]
  'save-review': []
  'remove-review': []
}>()



function getUserInitials(name?: string) {
  if (!name) return 'U'
  return name.trim().charAt(0).toUpperCase()
}
</script>

<template>
  <section class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-md">
          <i class="mdi mdi-forum-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-[#332820]">ความคิดเห็นและรีวิว</h2>
          <p class="text-sm text-[#4A3E35] font-normal">ร่วมแบ่งปันประสบการณ์จริงจากนักท่องเที่ยว</p>
        </div>
      </div>
      <span class="text-xs font-bold text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-3.5 py-1 rounded-full">
        {{ reviewData.totalCount }} ความคิดเห็น
      </span>
    </div>

    <!-- Review Submission Form -->
    <form
      v-if="isLoggedIn"
      class="rounded-2xl bg-[#F7F0E6] p-4 sm:p-5 border-2 border-[#E8D9C9] shadow-2xs space-y-3"
      @submit.prevent="emit('save-review')"
    >
      <div class="flex items-center justify-between">
        <p class="font-bold text-[#332820] text-sm sm:text-base flex items-center gap-1.5">
          <i class="mdi mdi-pencil-outline text-[#D96C2C]"></i>
          {{ myReview ? 'แก้ไขความคิดเห็นของคุณ' : 'เขียนความคิดเห็นใหม่' }}
        </p>
        <span v-if="myReview" class="text-xs font-bold text-[#D96C2C] bg-[#D96C2C]/10 px-2 py-0.5 rounded border border-[#D96C2C]/20">
          คุณเคยแสดงความคิดเห็นแล้ว
        </span>
      </div>

      <textarea
        :value="comment"
        @input="(e) => emit('update:comment', (e.target as HTMLTextAreaElement).value)"
        rows="3"
        maxlength="2000"
        class="w-full resize-y rounded-xl border-2 border-[#E8D9C9] bg-white px-3.5 py-3 text-sm sm:text-base text-[#332820] outline-none focus:border-[#D96C2C] font-normal transition placeholder:text-[#786B62]"
        placeholder="บอกเล่าความประทับใจ การเดินทาง หรือข้อแนะนำสำหรับสถานที่นี้..."
      />

      <div class="flex items-center justify-between pt-1">
        <button
          v-if="myReview"
          type="button"
          class="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          @click="emit('remove-review')"
        >
          <i class="mdi mdi-trash-can-outline"></i>
          <span>ลบรีวิว</span>
        </button>
        <div v-else></div>

        <button
          type="submit"
          class="px-5 py-2.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5 border border-[#D96C2C]"
          :disabled="reviewSaving"
        >
          <i class="mdi mdi-send text-white"></i>
          <span class="text-white">{{ reviewSaving ? 'กำลังบันทึก...' : myReview ? 'บันทึกการแก้ไข' : 'ส่งความคิดเห็น' }}</span>
        </button>
      </div>
    </form>

    <!-- Login CTA Card -->
    <div
      v-else
      class="rounded-2xl bg-[#F7F0E6] p-4 sm:p-5 border-2 border-[#E8D9C9] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#332820]"
    >
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-[#D96C2C] text-white flex items-center justify-center font-bold text-base shrink-0">
          <i class="mdi mdi-account-lock-outline text-white"></i>
        </div>
        <div>
          <h4 class="font-bold text-base text-[#332820]">ร่วมแสดงความคิดเห็น</h4>
          <p class="text-xs sm:text-sm text-[#4A3E35]">เข้าสู่ระบบเพื่อเขียนรีวิวและแบ่งปันประสบการณ์กับนักท่องเที่ยวคนอื่น</p>
        </div>
      </div>
      <RouterLink
        to="/login"
        class="px-5 py-2.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-bold text-xs sm:text-sm shadow-md transition shrink-0 border border-[#D96C2C]"
      >
        เข้าสู่ระบบเลย
      </RouterLink>
    </div>

    <!-- Reviews List -->
    <div v-if="reviewData.reviews.length" class="space-y-4 pt-2 divide-y-2 divide-[#E8D9C9]">
      <article
        v-for="rev in reviewData.reviews"
        :key="rev.reviewId"
        class="pt-4 first:pt-0 space-y-2.5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-full bg-[#D96C2C] text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white">
              {{ getUserInitials(rev.userName) }}
            </div>
            <div>
              <h4 class="font-bold text-[#332820] text-sm sm:text-base leading-tight">{{ rev.userName }}</h4>
              <p class="text-xs text-[#4A3E35] font-normal">{{ formatDate(rev.createdAt, { dateStyle: 'long' }) }}</p>
            </div>
          </div>

          <span class="text-xs font-semibold text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-0.5 rounded border border-[#D96C2C]/20">
            นักท่องเที่ยว
          </span>
        </div>

        <div class="pl-11">
          <p class="text-sm sm:text-base text-[#332820] leading-relaxed font-normal bg-[#F7F0E6] p-3.5 rounded-xl border border-[#E8D9C9]">
            {{ rev.comment }}
          </p>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center text-xs sm:text-sm text-[#4A3E35] space-y-2">
      <i class="mdi mdi-message-text-outline text-3xl text-[#D96C2C]"></i>
      <p class="font-bold">ยังไม่มีความคิดเห็นสำหรับสถานที่นี้ เป็นคนแรกที่เริ่มรีวิวได้เลย!</p>
    </div>
  </section>
</template>
