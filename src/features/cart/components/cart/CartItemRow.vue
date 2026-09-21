<script setup lang="ts">
import type { CartItem } from '../../api/cartApi'

interface Props {
  item: CartItem
  updating: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-quantity': [quantity: number]
  'remove': []
}>()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}
</script>

<template>
  <article
    class="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs transition hover:shadow-md hover:border-[#D96C2C]"
  >
    <!-- Product Thumbnail Image -->
    <div
      class="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#171412] border border-[#E8D9C9]"
    >
      <img
        v-if="props.item.imageUrl"
        :src="imageUrl(props.item.imageUrl)"
        :alt="props.item.productName"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-[#786B62]">
        <i class="mdi mdi-image-off-outline text-3xl"></i>
      </div>
    </div>

    <!-- Product Details -->
    <div class="min-w-0 flex-1 space-y-1">
      <h2 class="text-xl font-bold text-[#332820] line-clamp-1">
        {{ props.item.productName }}
      </h2>
      <div class="flex items-center gap-2 text-sm text-[#786B62]">
        <span v-if="props.item.dealType" class="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">{{ props.item.dealType === 'FlashDeal' ? 'โปรโมชันพิเศษ' : 'โปรเด็ดชุมชน' }}</span>
        <span v-if="props.item.dealType && props.item.originalPrice" class="text-xs text-[#786B62] line-through">฿ {{ Number(props.item.originalPrice).toLocaleString('th-TH') }}</span>
        <span
          class="font-semibold text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-0.5 rounded-md border border-[#D96C2C]/20"
        >
          ฿ {{ Number(props.item.unitPrice).toLocaleString('th-TH') }} / ชิ้น
        </span>
      </div>

      <!-- Item Total Price & Controls -->
      <div
        class="pt-3 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#E8D9C9] mt-2"
      >
        <!-- Quantity Counter -->
        <div
          class="flex items-center rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1"
        >
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#332820] font-bold shadow-xs transition hover:bg-[#E8D9C9]/50 disabled:opacity-40 cursor-pointer"
            :disabled="props.updating || props.item.quantity <= 1"
            @click="emit('update-quantity', props.item.quantity - 1)"
          >
            <i class="mdi mdi-minus text-xs"></i>
          </button>

          <span class="min-w-[40px] text-center font-bold text-[#332820] text-base">
            <i
              v-if="props.updating"
              class="mdi mdi-loading mdi-spin text-xs text-[#D96C2C]"
            ></i>
            <span v-else>{{ props.item.quantity }}</span>
          </span>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#332820] font-bold shadow-xs transition hover:bg-[#E8D9C9]/50 disabled:opacity-40 cursor-pointer"
            :disabled="props.updating"
            @click="emit('update-quantity', props.item.quantity + 1)"
          >
            <i class="mdi mdi-plus text-xs"></i>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Total Price for this item line -->
          <div class="text-right">
            <span class="text-xs text-[#786B62] block font-medium">รวม</span>
            <span class="text-xl font-bold text-[#D96C2C]">
              ฿ {{ (props.item.unitPrice * props.item.quantity).toLocaleString('th-TH') }}
            </span>
          </div>

          <!-- Remove Item Button -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] text-[#786B62] transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
            title="ลบออกจากตะกร้า"
            @click="emit('remove')"
          >
            <i class="mdi mdi-trash-can-outline text-base"></i>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
