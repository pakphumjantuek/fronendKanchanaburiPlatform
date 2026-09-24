<script setup lang="ts">
import type { District, ShopCategory } from '@/features/shops/api'

defineProps<{
  categories: ShopCategory[]
  districts: District[]
  activeFilterCount: number
}>()

const search = defineModel<string>('search', { default: '' })
const categoryId = defineModel<string | null>('categoryId', { default: null })
const districtId = defineModel<string | null>('districtId', { default: null })
const verifiedOnly = defineModel<boolean>('verifiedOnly', { default: false })
const topRatedOnly = defineModel<boolean>('topRatedOnly', { default: false })

const emit = defineEmits<{
  (e: 'clear-filters'): void
  (e: 'filter-change'): void
}>()
</script>

<template>
  <aside class="space-y-6">
    <!-- SIDEBAR CONTAINER CARD -->
    <div class="rounded-2xl bg-[#FFF9F2] border-2 border-[#E8D9C9] shadow-md p-5 sm:p-6 space-y-5">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h3 class="font-bold text-[#2C221E] text-lg sm:text-xl flex items-center gap-2">
          <i class="mdi mdi-tune-variant text-emerald-700 text-xl"></i>
          <span>ตัวกรองร้านค้า</span>
        </h3>
        <button
          v-if="activeFilterCount || verifiedOnly || topRatedOnly"
          type="button"
          class="text-xs sm:text-sm font-semibold text-emerald-700 hover:underline cursor-pointer"
          @click="emit('clear-filters')"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- 1. Search Box -->
      <div class="space-y-2">
        <label class="text-xs sm:text-sm font-semibold text-[#645248] block">
          ค้นหาชื่อร้านค้า / คำสำคัญ
        </label>
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="เช่น ร้านกาแฟ, หัตถกรรม..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs sm:text-sm font-medium text-[#2C221E] outline-none focus:border-emerald-600 focus:bg-white transition placeholder:text-slate-400"
            @keyup.enter="emit('filter-change')"
          />
          <i
            class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-base"
          ></i>
          <button
            v-if="search"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            @click="search = ''"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>
      </div>

      <!-- 2. Store Categories Radio Options -->
      <div class="space-y-2.5 border-t border-slate-100 pt-3.5">
        <label class="text-xs sm:text-sm font-semibold text-[#645248] block">
          หมวดหมู่ร้านค้า
        </label>
        <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          <label
            class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-emerald-500 transition cursor-pointer text-xs sm:text-sm font-medium text-[#2C221E]"
            :class="
              categoryId === null
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                : ''
            "
          >
            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="category_filter"
                :checked="categoryId === null"
                class="accent-emerald-600"
                @change="categoryId = null"
              />
              <span>หมวดหมู่ทั้งหมด</span>
            </div>
          </label>

          <label
            v-for="cat in categories"
            :key="cat.shopCategoryId"
            class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-emerald-500 transition cursor-pointer text-xs sm:text-sm font-medium text-[#2C221E]"
            :class="
              categoryId === cat.shopCategoryId
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                : ''
            "
          >
            <div class="flex items-center gap-2 truncate">
              <input
                type="radio"
                name="category_filter"
                :checked="categoryId === cat.shopCategoryId"
                class="accent-emerald-600"
                @change="categoryId = cat.shopCategoryId"
              />
              <span class="truncate">{{ cat.categoryName }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 3. Kanchanaburi Districts Filter Options -->
      <div class="space-y-2.5 border-t border-slate-100 pt-3.5">
        <label class="text-xs sm:text-sm font-semibold text-[#645248] block">
          พื้นที่อำเภอในกาญจนบุรี
        </label>
        <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <label
            class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-emerald-500 transition cursor-pointer text-xs sm:text-sm font-medium text-[#2C221E]"
            :class="
              districtId === null
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                : ''
            "
          >
            <input
              type="radio"
              name="district_filter"
              :checked="districtId === null"
              class="accent-emerald-600"
              @change="districtId = null"
            />
            <span>ทุกอำเภอ</span>
          </label>

          <label
            v-for="dist in districts"
            :key="dist.districtId"
            class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-emerald-500 transition cursor-pointer text-xs sm:text-sm font-medium text-[#2C221E]"
            :class="
              districtId === dist.districtId
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                : ''
            "
          >
            <input
              type="radio"
              name="district_filter"
              :checked="districtId === dist.districtId"
              class="accent-emerald-600"
              @change="districtId = dist.districtId"
            />
            <span>อ.{{ dist.districtName }}</span>
          </label>
        </div>
      </div>

      <!-- 4. Shop Status & Tier Filters -->
      <div class="space-y-2.5 border-t border-slate-100 pt-3.5">
        <label class="text-xs sm:text-sm font-semibold text-[#645248] block">
          มาตรฐานและสถานะร้านค้า
        </label>

        <label
          class="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2C221E] cursor-pointer"
        >
          <input
            v-model="verifiedOnly"
            type="checkbox"
            class="h-4 w-4 rounded accent-emerald-600"
          />
          <span class="flex items-center gap-1">
            <i class="mdi mdi-shield-check text-emerald-600"></i>
            ร้านค้าผ่านการรับรองแล้ว
          </span>
        </label>

        <label
          class="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2C221E] cursor-pointer"
        >
          <input
            v-model="topRatedOnly"
            type="checkbox"
            class="h-4 w-4 rounded accent-emerald-600"
          />
          <span class="flex items-center gap-1">
            <i class="mdi mdi-star text-amber-500"></i>
            คะแนน 4.5 ดาวขึ้นไป
          </span>
        </label>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
</style>
