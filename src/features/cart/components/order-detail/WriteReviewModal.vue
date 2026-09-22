<script setup lang="ts">
import { ref, computed } from 'vue'
import { createProductReview } from '@/features/shops/api/productApi'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

interface Props {
  isOpen: boolean
  productId: string
  productName: string
  orderId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', productId: string): void
}>()

const swal = useSwal()
const rating = ref(5)
const hoverRating = ref(0)
const comment = ref('')
const submitting = ref(false)

const ratingText = computed(() => {
  const current = hoverRating.value || rating.value
  switch (current) {
    case 1:
      return '1 - ควรปรับปรุง'
    case 2:
      return '2 - พอใช้'
    case 3:
      return '3 - ปานกลาง'
    case 4:
      return '4 - ดี'
    case 5:
      return '5 - ดีเยี่ยมประทับใจ!'
    default:
      return ''
  }
})

function setRating(val: number) {
  rating.value = val
}

function handleClose() {
  if (submitting.value) return
  rating.value = 5
  hoverRating.value = 0
  comment.value = ''
  emit('close')
}

async function handleSubmit() {
  if (!comment.value.trim()) {
    await swal.warning('กรุณากรอกข้อมูล', 'กรุณาระบุข้อความรีวิวสินค้าเพื่อแบ่งปันกับผู้อื่น')
    return
  }

  submitting.value = true
  try {
    await createProductReview({
      orderId: props.orderId,
      productId: props.productId,
      rating: rating.value,
      comment: comment.value.trim(),
    })

    await swal.success('ขอบคุณสำหรับรีวิว!', 'ส่งรีวิวสินค้าของคุณเรียบร้อยแล้ว')
    emit('success', props.productId)
    handleClose()
  } catch (error) {
    await swal.error('ส่งรีวิวไม่สำเร็จ', getApiErrorMessage(error, 'เกิดข้อผิดพลาดในการบันทึกรีวิว'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      @click.self="handleClose"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xl transition-all space-y-5"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between border-b-2 border-[#E8D9C9] px-6 py-4 bg-[#F7F0E6]"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D96C2C] text-white shadow-xs"
            >
              <i class="mdi mdi-star-outline text-xl"></i>
            </div>
            <div>
              <h3 class="font-black text-[#332820] text-base">เขียนรีวิวสินค้า</h3>
              <p class="text-xs font-bold text-[#786B62] line-clamp-1 max-w-xs">
                {{ productName }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#786B62] transition hover:bg-rose-50 hover:text-rose-600 border border-[#E8D9C9] cursor-pointer"
            @click="handleClose"
          >
            <i class="mdi mdi-close text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 space-y-6">
          <!-- Star Rating Picker -->
          <div
            class="flex flex-col items-center justify-center rounded-2xl bg-white p-5 border-2 border-[#E8D9C9] space-y-3"
          >
            <span class="text-xs font-black text-[#786B62] uppercase tracking-wider">
              ระดับความพึงพอใจ
            </span>

            <div class="flex items-center gap-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="p-1 transition-all duration-150 transform hover:scale-125 focus:outline-none cursor-pointer"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="setRating(star)"
              >
                <i
                  :class="[
                    'mdi text-3xl sm:text-4xl transition-colors',
                    star <= (hoverRating || rating)
                      ? 'mdi-star text-amber-400 drop-shadow-xs'
                      : 'mdi-star-outline text-slate-300',
                  ]"
                ></i>
              </button>
            </div>

            <span class="text-xs font-black text-[#D96C2C] h-4">
              {{ ratingText }}
            </span>
          </div>

          <!-- Comment Input -->
          <div class="space-y-2">
            <label class="block text-xs font-black text-[#332820]">
              ความคิดเห็นของคุณเกี่ยวกับสินค้าชิ้นนี้ <span class="text-rose-500">*</span>
            </label>
            <textarea
              v-model="comment"
              rows="4"
              placeholder="แบ่งปันประสบการณ์การใช้งาน วัตถุดิบ ความคุ้มค่า หรือความประทับใจของคุณ..."
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white p-3.5 text-sm text-[#332820] placeholder-[#786B62]/60 focus:border-[#D96C2C] focus:outline-none transition font-semibold"
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div
          class="flex items-center justify-end gap-3 border-t-2 border-[#E8D9C9] px-6 py-4 bg-[#F7F0E6]"
        >
          <button
            type="button"
            class="rounded-xl border-2 border-[#E8D9C9] bg-white px-5 py-2.5 text-xs font-black text-[#786B62] transition hover:bg-slate-100 hover:text-[#332820] cursor-pointer"
            :disabled="submitting"
            @click="handleClose"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-[#D96C2C] px-6 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#BF5720] active:scale-95 disabled:opacity-50 cursor-pointer"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <i v-if="submitting" class="mdi mdi-loading mdi-spin text-sm"></i>
            <i v-else class="mdi mdi-send text-sm"></i>
            <span>{{ submitting ? 'กำลังบันทึก...' : 'ส่งรีวิวสินค้า' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
