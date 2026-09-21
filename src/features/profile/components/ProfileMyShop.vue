<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

interface Props {
  shop: Shop | null
}

const props = defineProps<Props>()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string | null) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

</script>

<template>
  <div class="space-y-6">
    <!-- STATE 1: USER ALREADY HAS A SHOP -->
    <div
      v-if="props.shop"
      class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-xs overflow-hidden"
    >
      <!-- Shop Header Banner -->
      <div class="relative h-44 sm:h-52 w-full bg-[#171412] overflow-hidden">
        <img
          v-if="props.shop.backgroundImageUrl || props.shop.coverImageUrl"
          :src="imageUrl(props.shop.backgroundImageUrl || props.shop.coverImageUrl)"
          :alt="props.shop.shopName"
          class="h-full w-full object-cover opacity-90"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#171412] via-[#332820] to-[#D96C2C]/40 text-white"
        >
          <i class="mdi mdi-storefront-outline text-6xl text-white/20"></i>
        </div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
        ></div>

        <!-- Shop Avatar & Name over Banner -->
        <div
          class="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div class="flex items-end gap-4">
            <div
              class="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white p-1 shadow-xl shrink-0 border-2 border-white/80 overflow-hidden"
            >
              <img
                v-if="props.shop.coverImageUrl"
                :src="imageUrl(props.shop.coverImageUrl)"
                :alt="props.shop.shopName"
                class="h-full w-full rounded-xl object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center rounded-xl bg-[#D96C2C] text-white text-3xl font-black"
              >
                {{ props.shop.shopName?.slice(0, 1) || 'S' }}
              </div>
            </div>

            <div class="space-y-1 text-white pb-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center gap-1 rounded-md bg-[#D96C2C] px-2 py-0.5 text-[10px] font-black text-white"
                >
                  <i class="mdi mdi-check-decagram text-xs"></i>
                  ร้านค้าของฉัน
                </span>
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-black border"
                  :class="
                    props.shop.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  "
                >
                  {{ props.shop.status === 'Active' ? '● เปิดให้บริการปกติ' : 'รอการอนุมัติ' }}
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                {{ props.shop.shopName }}
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <RouterLink
              :to="`/shops/${props.shop.shopId}`"
              class="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3.5 py-2 text-xs font-black text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            >
              <i class="mdi mdi-eye-outline text-sm"></i>
              <span>ดูหน้าร้านค้าสาธารณะ</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Shop Info Details Body -->
      <div class="p-6 sm:p-8 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div class="rounded-2xl border border-[#E8D9C9] bg-white p-4 space-y-1">
            <span class="text-[#786B62] font-semibold flex items-center gap-1">
              <i class="mdi mdi-tag-outline text-[#D96C2C]"></i> หมวดหมู่ร้านค้า
            </span>
            <p class="font-black text-[#332820] text-sm">
              {{ props.shop.categoryName || 'ร้านค้าชุมชน' }}
            </p>
          </div>

          <div class="rounded-2xl border border-[#E8D9C9] bg-white p-4 space-y-1">
            <span class="text-[#786B62] font-semibold flex items-center gap-1">
              <i class="mdi mdi-map-marker-outline text-[#D96C2C]"></i> อำเภอ / ที่ตั้ง
            </span>
            <p class="font-black text-[#332820] text-sm">
              {{ props.shop.districtName || 'จังหวัดกาญจนบุรี' }}
            </p>
          </div>

          <div class="rounded-2xl border border-[#E8D9C9] bg-white p-4 space-y-1">
            <span class="text-[#786B62] font-semibold flex items-center gap-1">
              <i class="mdi mdi-clock-outline text-[#D96C2C]"></i> เวลาทำการ
            </span>
            <p class="font-black text-[#332820] text-sm">
              {{
                props.shop.openingTime && props.shop.closingTime
                  ? `${props.shop.openingTime} - ${props.shop.closingTime} น.`
                  : 'เปิดให้บริการทุกวัน'
              }}
            </p>
          </div>
        </div>

        <div
          v-if="props.shop.description"
          class="rounded-2xl border border-[#E8D9C9] bg-white p-4 space-y-1 text-xs"
        >
          <span class="text-[#786B62] font-semibold">รายละเอียดแนะนำร้าน:</span>
          <p class="font-semibold text-[#332820] leading-relaxed">{{ props.shop.description }}</p>
        </div>

        <!-- Management Action Hub Cards (Direct Links to Merchant Features) -->
        <div class="border-t-2 border-[#E8D9C9] pt-6 space-y-4">
          <h3 class="text-base font-black text-[#332820] flex items-center gap-2">
            <i class="mdi mdi-view-dashboard-outline text-[#D96C2C] text-lg"></i>
            <span>ศูนย์จัดการร้านค้า (Seller Centre)</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- 1. General Shop Settings -->
            <RouterLink
              to="/my-shop"
              class="group flex flex-col justify-between p-5 rounded-2xl border-2 border-[#E8D9C9] bg-white hover:border-[#D96C2C] hover:shadow-md transition cursor-pointer"
            >
              <div class="space-y-2">
                <div
                  class="h-10 w-10 rounded-xl bg-[#D96C2C]/10 text-[#D96C2C] flex items-center justify-center text-xl group-hover:bg-[#D96C2C] group-hover:text-white transition"
                >
                  <i class="mdi mdi-store-cog-outline"></i>
                </div>
                <h4 class="font-black text-sm text-[#332820] group-hover:text-[#D96C2C] transition">
                  ข้อมูลร้านค้า
                </h4>
                <p class="text-xs text-[#786B62] font-semibold">
                  แก้ไขโปรไฟล์ร้าน รูปภาพปก พิกัดร้าน และเวลาเปิด-ปิด
                </p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs font-black text-[#D96C2C] pt-3">
                <span>จัดการข้อมูล</span>
                <i class="mdi mdi-arrow-right text-xs"></i>
              </span>
            </RouterLink>

            <!-- 2. Products Management -->
            <RouterLink
              to="/my-shop/products"
              class="group flex flex-col justify-between p-5 rounded-2xl border-2 border-[#E8D9C9] bg-white hover:border-[#D96C2C] hover:shadow-md transition cursor-pointer"
            >
              <div class="space-y-2">
                <div
                  class="h-10 w-10 rounded-xl bg-[#D96C2C]/10 text-[#D96C2C] flex items-center justify-center text-xl group-hover:bg-[#D96C2C] group-hover:text-white transition"
                >
                  <i class="mdi mdi-package-variant-closed"></i>
                </div>
                <h4 class="font-black text-sm text-[#332820] group-hover:text-[#D96C2C] transition">
                  สินค้าและสต็อก
                </h4>
                <p class="text-xs text-[#786B62] font-semibold">
                  เพิ่มสินค้าใหม่ อัปเดตราคา สต็อกสินค้า และรูปภาพประกอบ
                </p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs font-black text-[#D96C2C] pt-3">
                <span>จัดการสินค้า</span>
                <i class="mdi mdi-arrow-right text-xs"></i>
              </span>
            </RouterLink>

            <!-- 3. Orders Management -->
            <RouterLink
              to="/my-shop/orders"
              class="group flex flex-col justify-between p-5 rounded-2xl border-2 border-[#E8D9C9] bg-white hover:border-[#D96C2C] hover:shadow-md transition cursor-pointer"
            >
              <div class="space-y-2">
                <div
                  class="h-10 w-10 rounded-xl bg-[#D96C2C]/10 text-[#D96C2C] flex items-center justify-center text-xl group-hover:bg-[#D96C2C] group-hover:text-white transition"
                >
                  <i class="mdi mdi-truck-delivery-outline"></i>
                </div>
                <h4 class="font-black text-sm text-[#332820] group-hover:text-[#D96C2C] transition">
                  คำสั่งซื้อของร้าน
                </h4>
                <p class="text-xs text-[#786B62] font-semibold">
                  ตรวจสอบออเดอร์ลูกค้า จัดส่งสินค้า และกรอกเลขพัสดุ
                </p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs font-black text-[#D96C2C] pt-3">
                <span>จัดการคำสั่งซื้อ</span>
                <i class="mdi mdi-arrow-right text-xs"></i>
              </span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- STATE 2: USER DOES NOT HAVE A SHOP YET -->
    <div
      v-else
      class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-8 sm:p-12 text-center shadow-xs space-y-6"
    >
      <div
        class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] border-2 border-[#D96C2C]/30 shadow-inner"
      >
        <i class="mdi mdi-store-plus-outline text-5xl"></i>
      </div>

      <div class="space-y-2 max-w-lg mx-auto">
        <span
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#D96C2C]/15 text-[#D96C2C] border border-[#D96C2C]/30"
        >
          <i class="mdi mdi-cash-multiple"></i>
          สร้างรายได้กับ Kanchanaburi Platform
        </span>
        <h2 class="text-2xl sm:text-3xl font-black text-[#332820]">
          เปิดร้านค้าชุมชนเมืองกาญจน์ของคุณ
        </h2>
        <p class="text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
          นำเสนอร้านอาหาร คาเฟ่ โฮมสเตย์ ของฝาก และสินค้า OTOP
          กาญจนบุรีของคุณสู่กลุ่มนักท่องเที่ยวทั่วประเทศ พร้อมระบบบริหารจัดการและชำระเงินที่ครบวงจร
        </p>
      </div>

      <!-- Feature Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
        <div class="p-4 rounded-2xl bg-white border border-[#E8D9C9] space-y-1">
          <i class="mdi mdi-storefront text-2xl text-[#D96C2C]"></i>
          <h4 class="font-black text-xs text-[#332820]">หน้าร้านค้าออนไลน์</h4>
          <p class="text-[11px] text-[#786B62] font-semibold">
            มีหน้าร้านส่วนตัว ปักหมุดแผนที่ และแบนเนอร์สวยงาม
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-[#E8D9C9] space-y-1">
          <i class="mdi mdi-cart-check text-2xl text-[#D96C2C]"></i>
          <h4 class="font-black text-xs text-[#332820]">ระบบขาย & ตะกร้าสินค้า</h4>
          <p class="text-[11px] text-[#786B62] font-semibold">
            รับคำสั่งซื้อ ตัดสต็อกอัตโนมัติ และติดตามการจัดส่ง
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-[#E8D9C9] space-y-1">
          <i class="mdi mdi-shield-check text-2xl text-emerald-600"></i>
          <h4 class="font-black text-xs text-[#332820]">ชำระเงินมาตรฐาน</h4>
          <p class="text-[11px] text-[#786B62] font-semibold">
            รองรับ PromptPay QR Code และบัตรเครดิต ปลอดภัย 100%
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-4">
        <RouterLink
          to="/shop-application"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-8 py-3.5 text-sm font-black text-white shadow-xl transition active:scale-95 border border-[#D96C2C]"
        >
          <i class="mdi mdi-plus-circle text-lg text-white"></i>
          <span class="!text-white font-black">+ สมัครเปิดร้านค้าทันที</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
