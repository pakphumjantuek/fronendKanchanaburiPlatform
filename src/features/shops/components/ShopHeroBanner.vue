<script setup lang="ts">
import heroCoverImage from '@/assets/รูปปก.png'

interface Props {
  search: string
  viewMode: 'shops' | 'map'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:viewMode': [value: 'shops' | 'map']
  search: []
}>()

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:search', target.value)
}

function onSearchSubmit() {
  emit('search')
}
</script>

<template>
  <section class="relative isolate overflow-hidden bg-[#171412] text-white">
    <img
      :src="heroCoverImage"
      alt="สำรวจร้านค้าและผลิตภัณฑ์กาญจนบุรี"
      class="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-100 brightness-105 contrast-105"
    />
    <!-- Neutral dark gradient overlay for text legibility -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-r from-[#171412]/95 via-[#171412]/85 to-transparent"
    ></div>
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-t from-[#F7F0E6] via-transparent to-black/40"
    ></div>

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="max-w-3xl">
        <p class="text-xs font-black tracking-widest text-[#F2A65A] uppercase flex items-center gap-1.5 drop-shadow-sm">
          <i class="mdi mdi-storefront-outline text-base"></i>
          KANCHANABURI COMMUNITY MARKETPLACE
        </p>
        <div class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">
              ร้านค้าและผลิตภัณฑ์ชุมชน
            </h1>
            <p
              class="mt-3 max-w-2xl text-sm leading-relaxed text-[#F7F0E6] drop-shadow-sm sm:text-base font-semibold"
            >
              อุดหนุนสินค้าภูมิปัญญาท้องถิ่น งานหัตถกรรม อาหารพื้นเมือง และบริการจากชุมชนจังหวัดกาญจนบุรี
            </p>
          </div>
          <div
            class="inline-flex shrink-0 self-start border-2 border-white/30 bg-[#171412]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl"
            aria-label="เลือกรูปแบบการแสดงผล"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer"
              :class="
                viewMode === 'shops'
                  ? 'bg-[#D96C2C] text-white shadow-md border border-white/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'shops')"
            >
              <i class="mdi mdi-store-outline text-base text-white"></i>
              <span class="!text-white font-black">ร้านค้าทั้งหมด</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer"
              :class="
                viewMode === 'map'
                  ? 'bg-[#D96C2C] text-white shadow-md border border-white/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'map')"
            >
              <i class="mdi mdi-map-marker-radius-outline text-base text-white"></i>
              <span class="!text-white font-black">แผนที่พิกัด</span>
            </button>
          </div>
        </div>
        <form
          @submit.prevent="onSearchSubmit"
          class="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-2 shadow-2xl backdrop-blur-md"
        >
          <div class="flex flex-1 items-center gap-2 px-3">
            <i class="mdi mdi-magnify text-[#D96C2C] text-2xl"></i>
            <input
              :value="search"
              @input="onSearchInput"
              type="text"
              placeholder="ค้นหาร้านค้า เช่น ร้านของฝากสังขละบุรี, คาเฟ่กาญจนบุรี, ผ้าไหม..."
              class="w-full bg-transparent py-2 text-sm font-extrabold text-[#332820] focus:outline-none placeholder:text-[#786B62]"
              @keyup.enter="onSearchSubmit"
            />
          </div>
          <button
            type="submit"
            class="shrink-0 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3 text-xs font-black text-white transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#D96C2C]"
          >
            <i class="mdi mdi-magnify text-base text-white"></i>
            <span class="!text-white font-black text-sm">ค้นหา</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
