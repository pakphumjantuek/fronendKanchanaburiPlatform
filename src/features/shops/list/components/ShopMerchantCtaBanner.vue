<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section class="rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden relative">
    <!-- Background Glow Rings -->
    <div class="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/20 filter blur-3xl pointer-events-none"></div>
    <div class="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-emerald-500/10 filter blur-2xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div class="space-y-3 text-center lg:text-left max-w-2xl">
        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm border border-amber-300">
          <i class="mdi mdi-store-plus text-xs"></i>
          สำหรับผู้ประกอบการ & ร้านค้าชุมชน
        </span>

        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          เป็นเจ้าของธุรกิจ? เปิดร้านค้ากับเราวันนี้ (ฟรี)
        </h2>

        <p class="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-medium">
          เข้าถึงลูกค้าคุณภาพในกาญจนบุรี รับเครื่องมือจัดการร้านค้าระดับมืออาชีพ ฟรีค่าธรรมเนียม พร้อมสนับสนุนตลอด 24 ชม.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-bold text-amber-200">
          <div class="flex items-center justify-center lg:justify-start gap-1.5">
            <i class="mdi mdi-check-circle text-amber-400 text-sm"></i>
            <span>ค่าธรรมเนียม 0% เดือนแรก</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-amber-400 text-sm"></i>
            <span>อนุมัติเปิดร้านใน 24 ชม.</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-1.5">
            <i class="mdi mdi-check-circle text-amber-400 text-sm"></i>
            <span>รองรับระบบชำระเงินหลากช่องทาง</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-amber-400 text-sm"></i>
            <span>เชื่อมต่อระบบขนส่งพัสดุอัตโนมัติ</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
        <RouterLink
          :to="auth.isLoggedIn ? '/register-shop' : '/login'"
          class="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition active:scale-95 border border-amber-400 cursor-pointer"
        >
          สมัครเปิดร้านค้าชุมชน (ฟรี)
        </RouterLink>

        <RouterLink
          to="/about"
          class="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition cursor-pointer"
        >
          ดูสิทธิประโยชน์ผู้ขาย
        </RouterLink>
      </div>
    </div>
  </section>
</template>
