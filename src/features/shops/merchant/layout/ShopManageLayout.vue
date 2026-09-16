<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMyShop, type Shop } from '@/features/shops/api'

const route = useRoute()
const isOpen = ref(false)
const shop = ref<Shop | null>(null)

const statusBadgeClass = computed(() => {
  if (!shop.value) return ''
  return shop.value.status === 'Active'
    ? 'bg-[#D96C2C]/20 text-[#F2A65A] border-[#D96C2C]/40'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
})

const active = (path: string) =>
  path === '/my-shop' ? route.path === path : route.path.startsWith(path)

const closeMenu = () => {
  isOpen.value = false
}

onMounted(async () => {
  try {
    shop.value = await getMyShop()
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) console.error(error)
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-[#F7F0E6] text-[#332820] font-sans antialiased">
    <!-- Floating Mobile Toggle Button -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3.5 text-base font-black text-white shadow-2xl transition-all active:scale-95 lg:hidden cursor-pointer border border-[#D96C2C]"
      @click="isOpen = true"
    >
      <i class="mdi mdi-menu text-2xl text-white"></i>
      <span class="!text-white font-black">เมนูจัดการร้านค้า</span>
    </button>

    <!-- Backdrop for Mobile Sidebar -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-[#171412]/70 backdrop-blur-xs lg:hidden"
        @click="closeMenu"
      />
    </Transition>

    <!-- Sidebar Navigation -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-[#171412] text-white border-r-2 border-[#D96C2C]/30 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0 lg:translate-x-0 shadow-2xl overflow-y-auto scrollbar-thin"
      :class="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div class="flex items-center gap-3.5">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] text-white shadow-lg shrink-0"
          >
            <i class="mdi mdi-store-cog text-2xl text-white"></i>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-[#F2A65A]">
              Merchant Center
            </p>
            <h2 class="text-lg font-black text-white leading-tight">ศูนย์จัดการร้านค้า</h2>
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
          @click="closeMenu"
        >
          <i class="mdi mdi-close text-2xl"></i>
        </button>
      </div>

      <!-- Shop Summary Banner Card -->
      <div class="p-4">
        <div
          class="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 text-white shadow-md backdrop-blur-md"
        >
          <!-- Ambient Glow Blob -->
          <div
            class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#D96C2C]/20 blur-xl"
          ></div>

          <div class="relative">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <i class="mdi mdi-storefront text-[#F2A65A] text-xl shrink-0"></i>
                <p
                  class="truncate text-base font-black text-white"
                  :title="shop?.shopName ?? 'สร้างร้านของคุณ'"
                >
                  {{ shop?.shopName ?? 'สร้างร้านของคุณ' }}
                </p>
              </div>

              <span
                v-if="shop"
                class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-black backdrop-blur-md"
                :class="statusBadgeClass"
              >
                {{ shop.status === 'Active' ? 'เปิดบริการ' : shop.status }}
              </span>
            </div>

            <p class="mt-1.5 truncate text-xs text-[#F7F0E6]/80 font-bold">
              {{ shop?.categoryName ?? 'เปิดร้านค้าท้องถิ่นบนแพลตฟอร์ม' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-2 px-4 py-3">
        <div class="px-3 pb-1 text-xs font-black uppercase tracking-wider text-[#F2A65A]">
          เมนูจัดการร้านค้า
        </div>

        <!-- Dashboard -->
        <RouterLink
          to="/my-shop"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            route.path === '/my-shop'
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-view-dashboard-outline text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="route.path === '/my-shop' ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="route.path === '/my-shop' ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >แดชบอร์ดภาพรวมร้านค้า</span
          >
        </RouterLink>

        <!-- My Shop Info -->
        <RouterLink
          to="/my-shop/info"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/info')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-store-cog-outline text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/info') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/info') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >ข้อมูลและตั้งค่าร้านค้า</span
          >
        </RouterLink>

        <!-- Product Management -->
        <RouterLink
          to="/my-shop/products"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/products')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-package-variant-closed text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/products') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/products') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >จัดการสินค้าในร้าน</span
          >
        </RouterLink>

        <!-- Customer Orders -->
        <RouterLink
          to="/my-shop/orders"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/orders')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-clipboard-text-clock-outline text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/orders') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/orders') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >ออเดอร์ลูกค้า</span
          >
        </RouterLink>

        <!-- Merchant Contents Management -->
        <RouterLink
          to="/my-shop/contents"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/contents')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-text-box-multiple-outline text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/contents') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/contents') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >จัดการคอนเทนต์ร้านค้า</span
          >
        </RouterLink>

        <!-- Merchant Payouts History -->
        <RouterLink
          to="/my-shop/payouts"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/payouts')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-cash-multiple text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/payouts') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/payouts') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >ประวัติการรับเงินยอดขาย</span
          >
        </RouterLink>

        <!-- Merchant Reports Export -->
        <RouterLink
          to="/my-shop/exports"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200"
          :class="
            active('/my-shop/exports')
              ? 'bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-file-download-outline text-2xl transition-transform group-hover:scale-110 shrink-0"
            :class="active('/my-shop/exports') ? 'text-white' : 'text-[#F2A65A]'"
          ></i>
          <span
            :class="active('/my-shop/exports') ? 'font-black text-white' : 'text-slate-100'"
            class="text-sm sm:text-base leading-snug"
            >ส่งออกรายงานร้านค้า</span
          >
        </RouterLink>
      </nav>

      <!-- Footer / Back Link -->
      <div class="border-t border-white/10 p-4 bg-[#171412]/80 backdrop-blur-md">
        <RouterLink
          to="/shops"
          class="group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
          @click="closeMenu"
        >
          <i
            class="mdi mdi-arrow-left text-xl text-[#F2A65A] transition-transform group-hover:-translate-x-1 shrink-0"
          ></i>
          <span>กลับไปหน้าร้านค้าทั้งหมด</span>
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #171412;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d96c2c;
  border-radius: 9999px;
}
</style>
