<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isMobileMenuOpen = ref(false)

function logout() {
  auth.logout()
  router.push('/login')
}

const navGroups = [
  {
    title: 'ภาพรวมระบบ',
    items: [
      { to: '/admin/dashboard', label: 'แดชบอร์ดภาพรวม (Overview)', icon: 'mdi-view-dashboard-outline' },
    ],
  },
  {
    title: 'การจัดการร้านค้า & คำสั่งซื้อ',
    items: [
      { to: '/admin/shops', label: 'จัดการร้านค้าทั้งหมด', icon: 'mdi-storefront-outline' },
      { to: '/admin/orders', label: 'ตรวจสอบสลิปชำระเงิน', icon: 'mdi-file-document-check-outline' },
      { to: '/admin/payouts', label: 'เคลียร์เงินคืนร้านค้า (Payouts)', icon: 'mdi-cash-refund' },
      { to: '/admin/categories', label: 'หมวดหมู่ร้านค้า', icon: 'mdi-shape-outline' },
      { to: '/admin/product-categories', label: 'หมวดหมู่สินค้า', icon: 'mdi-package-variant-closed' },
    ],
  },
  {
    title: 'คอนเทนต์ & กิจกรรม',
    items: [
      { to: '/admin/contents', label: 'จัดการคอนเทนต์', icon: 'mdi-text-box-multiple-outline' },
      { to: '/admin/content-categories', label: 'หมวดหมู่คอนเทนต์', icon: 'mdi-folder-multiple-outline' },
      { to: '/admin/tags', label: 'แท็กคอนเทนต์', icon: 'mdi-tag-multiple-outline' },
      { to: '/admin/schedules', label: 'กำหนดการกิจกรรม', icon: 'mdi-calendar-clock-outline' },
    ],
  },
  {
    title: 'ความปลอดภัย & รายงาน',
    items: [
      { to: '/admin/reports', label: 'รายงานความไม่เหมาะสม', icon: 'mdi-flag-variant-outline' },
    ],
  },
]
</script>

<template>
  <div class="flex min-h-screen bg-[#F7F0E6] text-[#332820]">
    
    <!-- DESKTOP SIDEBAR -->
    <aside
      class="hidden w-80 shrink-0 flex-col bg-[#171412] text-white border-r-2 border-[#D96C2C]/30 shadow-2xl lg:flex sticky top-0 h-screen overflow-y-auto scrollbar-thin"
    >
      <!-- BRAND LOGO HEADER -->
      <div class="p-6 border-b border-white/10 space-y-4">
        <RouterLink to="/admin" class="flex items-center gap-3.5 group">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D96C2C] to-[#BF5720] text-white shadow-lg group-hover:scale-105 transition shrink-0"
          >
            <i class="mdi mdi-shield-crown text-2xl text-white"></i>
          </div>
          <div>
            <span class="font-black text-xl tracking-tight text-white block leading-none">
              กาญจนบุรี <span class="text-[#F2A65A]">Admin</span>
            </span>
            <span class="text-xs font-bold text-[#F2A65A] uppercase tracking-wider block mt-1">
              Control Panel System
            </span>
          </div>
        </RouterLink>

        <!-- ADMIN USER CARD -->
        <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#D96C2C] text-white font-black text-base shadow-md shrink-0">
            {{ auth.user?.name?.charAt(0) || 'A' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-black text-sm text-white line-clamp-1">{{ auth.user?.name || 'ผู้ดูแลระบบ' }}</p>
            <p class="text-xs text-[#F2A65A] font-bold flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Level
            </p>
          </div>
        </div>
      </div>

      <!-- NAVIGATION GROUPS -->
      <nav class="p-4 space-y-6 flex-1">
        <div v-for="(group, gIdx) in navGroups" :key="gIdx" class="space-y-2">
          <h3 class="px-3 text-xs font-black uppercase tracking-wider text-[#F2A65A]">
            {{ group.title }}
          </h3>
          <div class="space-y-1.5">
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200"
              active-class="!bg-[#D96C2C] !text-white font-black shadow-lg shadow-[#D96C2C]/40 ring-1 ring-white/20"
            >
              <i class="mdi text-xl transition-transform group-hover:scale-110 text-[#F2A65A] group-[.router-link-active]:text-white shrink-0" :class="item.icon"></i>
              <span class="group-[.router-link-active]:font-black text-slate-100 group-[.router-link-active]:text-white text-sm sm:text-base leading-snug">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <!-- FOOTER ACTIONS -->
      <div class="p-4 border-t border-white/10 space-y-2 bg-[#171412]/80 backdrop-blur-md">
        <RouterLink
          to="/"
          class="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-200 hover:text-white hover:bg-white/10 transition"
        >
          <i class="mdi mdi-home-outline text-xl text-[#F2A65A] shrink-0"></i>
          <span>กลับหน้าหลักเว็บไซต์</span>
        </RouterLink>
        <button
          type="button"
          class="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition cursor-pointer"
          @click="logout"
        >
          <i class="mdi mdi-logout-variant text-xl text-rose-400 shrink-0"></i>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- MOBILE HEADER & DRAWER -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- MOBILE TOP BAR -->
      <header class="flex items-center justify-between border-b-2 border-[#E8D9C9] bg-[#171412] text-white px-5 py-4 lg:hidden shadow-md">
        <RouterLink to="/admin" class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D96C2C] text-white font-bold">
            <i class="mdi mdi-shield-crown text-xl"></i>
          </div>
          <span class="font-black text-base text-white">กาญจนบุรี <span class="text-[#F2A65A]">Admin</span></span>
        </RouterLink>

        <button
          type="button"
          class="p-2 text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <i class="mdi text-2xl" :class="isMobileMenuOpen ? 'mdi-close' : 'mdi-menu'"></i>
        </button>
      </header>

      <!-- MOBILE OVERLAY MENU -->
      <div v-if="isMobileMenuOpen" class="lg:hidden bg-[#171412] text-white border-b-2 border-[#D96C2C] p-5 space-y-4 shadow-xl">
        <div v-for="(group, gIdx) in navGroups" :key="gIdx" class="space-y-2">
          <h3 class="px-2 text-xs font-black uppercase text-[#F2A65A]">{{ group.title }}</h3>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-100"
            active-class="bg-[#D96C2C] !text-white font-black"
            @click="isMobileMenuOpen = false"
          >
            <i class="mdi text-xl" :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
        <div class="pt-3 border-t border-white/10 flex gap-3">
          <RouterLink to="/" class="flex-1 text-center py-3 rounded-xl bg-white/10 text-sm font-bold">หน้าหลัก</RouterLink>
          <button type="button" class="flex-1 text-center py-3 rounded-xl bg-rose-600/30 text-rose-300 text-sm font-bold" @click="logout">ออกจากระบบ</button>
        </div>
      </div>

      <!-- MAIN PAGE CONTENT VIEW -->
      <main class="flex-1 min-w-0">
        <RouterView />
      </main>
    </div>

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
  background: #D96C2C;
  border-radius: 9999px;
}
</style>
