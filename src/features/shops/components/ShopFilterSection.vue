<script setup lang="ts">
import type { District, ShopCategory, SubDistrict } from '@/features/shops/shared/types/shop'
import AppSelect from '@/components/common/input/AppSelect.vue'

interface Props {
  categories: ShopCategory[]
  districts: District[]
  subDistricts: SubDistrict[]
  sortOptions: { id: string; title: string }[]
  activeFilterCount: number
  categoryId: string | null
  districtId: string | null
  subDistrictId: string | null
  sortBy: 'latest' | 'popular' | 'title'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:categoryId': [val: string | null]
  'update:districtId': [val: string | null]
  'update:subDistrictId': [val: string | null]
  'update:sortBy': [val: 'latest' | 'popular' | 'title']
  'change-district': []
  'clear-filters': []
  'filter-change': []
}>()
</script>

<template>
  <section class="relative z-30 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-sm p-5 sm:p-6 space-y-4 text-[#332820]">
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9]/60 pb-3">
      <span class="flex items-center gap-2.5 text-base font-black text-[#D96C2C]">
        <div class="h-8 w-8 rounded-xl bg-[#D96C2C]/15 border border-[#D96C2C]/30 flex items-center justify-center text-[#D96C2C]">
          <i class="mdi mdi-tune-variant text-lg" />
        </div>
        <span>กรองค้นหาร้านค้า</span>
        <span
          v-if="activeFilterCount"
          class="bg-[#D96C2C]/20 border border-[#D96C2C]/40 px-2.5 py-0.5 text-xs text-[#D96C2C] rounded-full font-black shadow-2xs"
        >
          {{ activeFilterCount }} ตัวกรอง
        </span>
      </span>

      <button
        v-if="activeFilterCount"
        type="button"
        class="text-xs font-black text-[#D96C2C] hover:text-[#BF5720] hover:underline flex items-center gap-1 transition cursor-pointer"
        @click="emit('clear-filters')"
      >
        <i class="mdi mdi-refresh"></i>
        <span>ล้างตัวกรองทั้งหมด</span>
      </button>
    </div>

    <!-- Dropdowns Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
      <!-- District -->
      <div>
        <label class="block text-xs font-bold text-[#786B62] mb-1.5">อำเภอ</label>
        <AppSelect
          :model-value="districtId"
          @update:model-value="
            (val: any) => {
              emit('update:districtId', (val as string | null) ?? null)
              emit('change-district')
            }
          "
          :items="districts"
          item-title="districtName"
          item-value="districtId"
          placeholder="ทุกอำเภอ"
          clearable
        />
      </div>

      <!-- SubDistrict -->
      <div>
        <label class="block text-xs font-bold text-[#786B62] mb-1.5">ตำบล</label>
        <AppSelect
          :model-value="subDistrictId"
          @update:model-value="
            (val: any) => {
              emit('update:subDistrictId', (val as string | null) ?? null)
              emit('filter-change')
            }
          "
          :items="subDistricts"
          item-title="subDistrictName"
          item-value="subDistrictId"
          placeholder="ทุกตำบล"
          :disabled="!districtId"
          clearable
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-xs font-bold text-[#786B62] mb-1.5">ประเภทร้านค้า</label>
        <AppSelect
          :model-value="categoryId"
          @update:model-value="
            (val: any) => {
              emit('update:categoryId', (val as string | null) ?? null)
              emit('filter-change')
            }
          "
          :items="categories"
          item-title="categoryName"
          item-value="shopCategoryId"
          placeholder="ทุกประเภท"
          clearable
        />
      </div>

      <!-- Sort Order -->
      <div>
        <label class="block text-xs font-bold text-[#786B62] mb-1.5">เรียงตาม</label>
        <AppSelect
          :model-value="sortBy"
          @update:model-value="(val: any) => emit('update:sortBy', (val as 'latest' | 'popular' | 'title') ?? 'latest')"
          :items="sortOptions"
          item-title="title"
          item-value="id"
          placeholder="ล่าสุด"
        />
      </div>
    </div>
  </section>
</template>
