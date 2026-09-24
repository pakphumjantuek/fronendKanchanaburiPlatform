<script setup lang="ts">
import type { District, ShopCategory } from '@/features/shops/api'

defineProps<{
  categories: ShopCategory[]
  districts: District[]
  activeFilterCount: number
  totalCount: number
}>()

const search = defineModel<string>('search', { default: '' })
const categoryId = defineModel<string | null>('categoryId', { default: null })
const districtId = defineModel<string | null>('districtId', { default: null })
const verifiedOnly = defineModel<boolean>('verifiedOnly', { default: false })
const topRatedOnly = defineModel<boolean>('topRatedOnly', { default: false })
const viewMode = defineModel<'shops' | 'map'>('viewMode', { default: 'map' })

const emit = defineEmits<{
  (e: 'clear-filters'): void
  (e: 'filter-change'): void
}>()
</script>

<template>
  <div class="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-md space-y-4">
    <!-- Top Row: Title & View Mode Toggle & Active Count -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
          <i class="mdi mdi-map-search-outline text-2xl text-white"></i>
        </div>
        <div>
          <h2 class="text-lg font-black text-[#2C221E] tracking-tight flex items-center gap-2">
            <span>แผนที่พิกัดร้านค้ากาญจนบุรี (Full-Width Map)</span>
            <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
              พบ {{ totalCount }} ร้านค้า
            </span>
          </h2>
          <p class="text-xs text-slate-500 font-semibold">
            สำรวจตำแหน่งร้านค้าชุมชนและแหล่งผลิตสินค้าท้องถิ่นทั่วทั้งจังหวัด
          </p>
        </div>
      </div>

      <!-- Mode Switcher Buttons & Clear Filter -->
      <div class="flex items-center gap-3 self-start sm:self-auto">
        <button
          v-if="activeFilterCount"
          type="button"
          class="text-xs font-black text-emerald-700 hover:underline cursor-pointer"
          @click="emit('clear-filters')"
        >
          ล้างตัวกรองทั้งหมด
        </button>

        <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
            :class="viewMode === 'shops' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="viewMode = 'shops'"
          >
            <i class="mdi mdi-storefront-outline text-base"></i>
            <span>ร้านค้า</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
            :class="viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="viewMode = 'map'"
          >
            <i class="mdi mdi-map-marker-radius text-base"></i>
            <span>แผนที่</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Filter Controls Moved To Top (Horizontal Bar) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
      <!-- 1. Search Box (4 Cols) -->
      <div class="lg:col-span-4 relative">
        <input
          v-model="search"
          type="text"
          placeholder="ค้นหาชื่อร้านค้า / คำสำคัญ..."
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-bold text-[#2C221E] outline-none focus:border-emerald-600 focus:bg-white transition shadow-2xs"
          @keyup.enter="emit('filter-change')"
        />
        <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-base"></i>
        <button
          v-if="search"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          @click="search = ''"
        >
          <i class="mdi mdi-close-circle text-base"></i>
        </button>
      </div>

      <!-- 2. Category Select (3 Cols) -->
      <div class="lg:col-span-3">
        <select
          v-model="categoryId"
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-black text-[#2C221E] outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer shadow-2xs"
          @change="emit('filter-change')"
        >
          <option :value="null">หมวดหมู่ทั้งหมด (All Categories)</option>
          <option v-for="cat in categories" :key="cat.shopCategoryId" :value="cat.shopCategoryId">
            {{ cat.categoryName }}
          </option>
        </select>
      </div>

      <!-- 3. District Select (3 Cols) -->
      <div class="lg:col-span-3">
        <select
          v-model="districtId"
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-black text-[#2C221E] outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer shadow-2xs"
          @change="emit('filter-change')"
        >
          <option :value="null">ทุกอำเภอในกาญจนบุรี (All Districts)</option>
          <option v-for="dist in districts" :key="dist.districtId" :value="dist.districtId">
            อ.{{ dist.districtName }}
          </option>
        </select>
      </div>

      <!-- 4. Quick Toggles (2 Cols) -->
      <div class="lg:col-span-2 flex items-center gap-3">
        <label class="flex items-center gap-1.5 text-xs font-bold text-[#2C221E] cursor-pointer shrink-0">
          <input v-model="verifiedOnly" type="checkbox" class="h-4 w-4 rounded accent-emerald-600" />
          <span>รับรองแล้ว</span>
        </label>

        <label class="flex items-center gap-1.5 text-xs font-bold text-[#2C221E] cursor-pointer shrink-0">
          <input v-model="topRatedOnly" type="checkbox" class="h-4 w-4 rounded accent-emerald-600" />
          <span class="flex items-center text-amber-600">
            <i class="mdi mdi-star text-sm"></i> 4.5+
          </span>
        </label>
      </div>
    </div>
  </div>
</template>
