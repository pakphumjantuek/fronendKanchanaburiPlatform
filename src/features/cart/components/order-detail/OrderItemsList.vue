<script setup lang="ts">
import { ref } from 'vue'
import WriteReviewModal from './WriteReviewModal.vue'

export interface OrderItem {
  orderItemId: string
  productId?: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Props {
  items: OrderItem[]
  totalItems: number
  orderId: string
  orderStatus?: string
  reviewedProductIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  orderStatus: '',
  reviewedProductIds: () => [],
})

const emit = defineEmits<{
  (e: 'review-added'): void
}>()

const activeReviewItem = ref<OrderItem | null>(null)
const isModalOpen = ref(false)

function openReviewModal(item: OrderItem) {
  activeReviewItem.value = item
  isModalOpen.value = true
}

function handleReviewSuccess() {
  emit('review-added')
}
</script>

<template>
  <div class="space-y-4">
    <h2
      class="flex items-center gap-2 text-base font-black text-[#332820] border-b-2 border-[#E8D9C9] pb-3"
    >
      <i class="mdi mdi-package-variant-closed text-[#D96C2C] text-xl"></i>
      รายการสินค้าในออเดอร์ ({{ totalItems }} ชิ้น)
    </h2>

    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.orderItemId"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#F7F0E6] p-4 border-2 border-[#E8D9C9]"
      >
        <div class="space-y-1">
          <h3 class="font-black text-[#332820] text-sm sm:text-base">
            {{ item.productName }}
          </h3>
          <p class="text-xs text-[#786B62] font-semibold">
            ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} ×
            {{ item.quantity }} ชิ้น
          </p>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-4">
          <!-- Write Review Button or Reviewed Badge -->
          <template v-if="orderStatus === 'Completed'">
            <span
              v-if="item.productId && reviewedProductIds.includes(item.productId)"
              class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-black text-emerald-900 shadow-2xs"
            >
              <i class="mdi mdi-star text-amber-500"></i>
              <span>รีวิวแล้ว</span>
            </span>

            <button
              v-else-if="item.productId"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-4 py-2 text-xs font-black text-white shadow-xs transition active:scale-95 cursor-pointer"
              @click="openReviewModal(item)"
            >
              <i class="mdi mdi-star-outline"></i>
              <span>เขียนรีวิวสินค้า</span>
            </button>
          </template>

          <div class="text-right font-black text-[#D96C2C] text-base shrink-0">
            ฿ {{ Number(item.totalPrice).toLocaleString('th-TH') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <WriteReviewModal
      v-if="activeReviewItem?.productId"
      :is-open="isModalOpen"
      :product-id="activeReviewItem.productId"
      :product-name="activeReviewItem.productName"
      :order-id="orderId"
      @close="isModalOpen = false"
      @success="handleReviewSuccess"
    />
  </div>
</template>
