<script setup lang="ts">
import type { Shop, ShopReviews } from '@/features/shops/api'

defineProps<{
  shop: Shop
  reviewData: ShopReviews
  formatReviewDate: (val: string) => string
  reviewerInitial: (name: string) => string
}>()
</script>

<template>
  <section class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-8 shadow-md space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs font-bold">
          <i class="mdi mdi-message-star-outline text-xl text-white"></i>
        </div>
        <div>
          <h3 class="text-xl font-black text-[#332820]">เสียงตอบรับและรีวิวจากผู้ซื้อจริง</h3>
          <p class="text-xs text-[#786B62]">
            ความพึงพอใจจากผู้ซื้อที่ได้รับสินค้าจริงในแพลตฟอร์ม
          </p>
        </div>
      </div>

      <!-- Rating Showcase Box -->
      <div class="flex items-center gap-3 bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-200 shadow-2xs">
        <span class="text-3xl font-black text-amber-700">
          {{ reviewData.averageRating ? reviewData.averageRating.toFixed(1) : '5.0' }}
        </span>
        <div>
          <div class="flex text-amber-500 text-sm">
            <i v-for="i in Math.round(reviewData.averageRating || 5)" :key="i" class="mdi mdi-star"></i>
          </div>
          <span class="text-[11px] font-bold text-[#786B62]">
            {{ reviewData.totalCount ? `${reviewData.totalCount} รีวิวจากผู้ซื้อจริง` : 'ยังไม่มีรีวิว' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Review Cards Grid (Real Reviews from Database) -->
    <div v-if="reviewData.reviews.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="rev in reviewData.reviews"
        :key="rev.reviewId"
        class="rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 space-y-2.5 flex flex-col justify-between shadow-2xs"
      >
        <div class="space-y-2">
          <!-- Buyer Info Bar -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 font-black text-white text-xs shadow-xs"
              >
                {{ reviewerInitial(rev.userName || rev.reviewerName || 'ผู้ใช้งาน') }}
              </span>
              <div>
                <span class="font-bold text-xs text-[#332820] block">
                  {{ rev.userName || rev.reviewerName || 'ผู้ซื้อจากชุมชน' }}
                </span>
                <span class="text-[10px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                  <i class="mdi mdi-check-circle text-xs"></i> ผู้ซื้อจริงในระบบ
                </span>
              </div>
            </div>
            <span class="text-[10px] text-[#786B62] font-semibold">{{ formatReviewDate(rev.createdAt) }}</span>
          </div>

          <!-- Stars -->
          <div class="flex text-amber-500 text-xs">
            <i v-for="s in rev.rating || 5" :key="s" class="mdi mdi-star"></i>
          </div>

          <!-- Comment text -->
          <p class="text-xs text-[#786B62] leading-relaxed font-medium">
            "{{ rev.comment }}"
          </p>
        </div>

        <!-- Shop Reply Box -->
        <div
          v-if="rev.reply"
          class="rounded-xl bg-[#F5E6D3] p-2.5 text-[11px] text-[#786B62] border border-[#E0CFBD] mt-2"
        >
          <div class="font-bold text-emerald-800 mb-0.5 flex items-center gap-1 text-[10px]">
            <i class="mdi mdi-reply text-emerald-700"></i>
            <span>ร้านค้าตอบกลับ</span>
          </div>
          <p class="leading-relaxed">{{ rev.reply }}</p>
        </div>
      </div>
    </div>

    <!-- Authentic Empty State when no reviews yet -->
    <div
      v-else
      class="rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] p-10 text-center space-y-2"
    >
      <i class="mdi mdi-message-draw text-4xl text-[#786B62]/60"></i>
      <h4 class="text-sm font-black text-[#332820]">ยังไม่มีรีวิวสำหรับร้านค้านี้</h4>
      <p class="text-xs text-[#786B62] max-w-sm mx-auto">
        ร่วมสนับสนุนสินค้าชุมชนและเป็นคนแรกที่รีวิวประสบการณ์การสั่งซื้อสินค้าจากร้านนี้
      </p>
    </div>
  </section>
</template>
