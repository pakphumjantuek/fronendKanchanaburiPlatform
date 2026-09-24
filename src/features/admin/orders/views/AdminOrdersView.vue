<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatDate'
import { onMounted, ref } from 'vue'
import http from '@/shared/api/http'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderDto {
  orderId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingMethod: string
  orderStatus: string
  paymentStatus: string
  slipImageUrl?: string
  slipUploadedAt?: string
  createdAt: string
  receiverName?: string
  receiverPhone?: string
  items: OrderItem[]
}

interface AdminPendingSlipGroup {
  slipImageUrl: string
  slipUploadedAt?: string
  totalGroupAmount: number
  buyerName?: string
  buyerPhone?: string
  orders: OrderDto[]
}

const groups = ref<AdminPendingSlipGroup[]>([])
const loading = ref(true)
const verifyingIndex = ref<number | null>(null)
const selectedSlipUrl = ref<string | null>(null)
const swal = useSwal()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return ''
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}



function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

async function loadPendingSlips() {
  loading.value = true
  try {
    const { data } = await http.get<AdminPendingSlipGroup[]>('/orders/admin/pending-slips')
    groups.value = data
  } catch (error) {
    await swal.error('โหลดสลิปที่รออนุมัติไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function handleVerify(group: AdminPendingSlipGroup, index: number, action: 'Approve' | 'Reject') {
  const orderIds = group.orders.map((o) => o.orderId)
  const actionText = action === 'Approve' ? 'อนุมัติสลิปการชำระเงิน' : 'ปฏิเสธสลิปการชำระเงิน'

  const confirm = await swal.confirm(
    `ยืนยัน${actionText}?`,
    action === 'Approve'
      ? `ระบบจะเปลี่ยนสถานะชำระเงินของ ${orderIds.length} ออเดอร์ในกลุ่มนี้เป็น "Paid" และแจ้งเตือนร้านค้าเตรียมจัดส่ง`
      : 'ระบบจะเปลี่ยนสถานะชำระเงินเป็น "Failed" (ไม่ผ่านการอนุมัติ)',
  )

  if (!confirm.isConfirmed) return

  verifyingIndex.value = index
  try {
    await http.post('/orders/admin/verify-slip', {
      orderIds,
      action,
    })
    await swal.success(
      action === 'Approve' ? 'อนุมัติชำระเงินเรียบร้อย!' : 'ปฏิเสธสลิปเรียบร้อย',
    )
    await loadPendingSlips()
  } catch (error) {
    await swal.error('ทำรายการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    verifyingIndex.value = null
  }
}

onMounted(loadPendingSlips)
</script>

<template>
  <div class="p-6 sm:p-8 space-y-6 text-[#332820]">
    <!-- Header Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-5">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C] mb-2">
          <i class="mdi mdi-file-document-check text-[#D96C2C]"></i> Admin Slip Verification
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">ตรวจสอบและอนุมัติสลิปการชำระเงิน</h1>
        <p class="mt-1 text-xs sm:text-sm text-[#786B62] font-semibold">
          ตรวจสอบสลิปโอนเงินเข้าบัญชีกลางของแพลตฟอร์มสำหรับคำสั่งซื้อรวมหลายร้านค้า
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#F2E5D5] border-2 border-[#E8D9C9] px-4 py-2.5 text-xs font-black text-[#332820] shadow-xs transition active:scale-95 cursor-pointer"
        :disabled="loading"
        @click="loadPendingSlips"
      >
        <i class="mdi mdi-refresh text-base text-[#D96C2C]" :class="{ 'animate-spin': loading }"></i>
        <span>รีเฟรชรายการ</span>
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-44 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="groups.length === 0" class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center space-y-3">
      <div class="h-16 w-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-sm">
        <i class="mdi mdi-check-all"></i>
      </div>
      <h3 class="text-lg font-black text-[#332820]">ไม่มีสลิปที่รอการอนุมัติในขณะนี้</h3>
      <p class="text-xs text-[#786B62] font-semibold">รายการสลิปทั้งหมดได้รับการตรวจสอบและอนุมัติแล้ว</p>
    </div>

    <!-- Pending Slip Cards List -->
    <div v-else class="space-y-6">
      <div
        v-for="(group, idx) in groups"
        :key="idx"
        class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-md space-y-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-2xl bg-[#D96C2C]/15 text-[#D96C2C] flex items-center justify-center text-xl font-bold shrink-0">
              <i class="mdi mdi-receipt-text-check-outline"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-[#332820]">
                  ยอดเงินในสลิป: <span class="text-[#D96C2C] text-lg font-black">{{ formatCurrency(group.totalGroupAmount) }}</span>
                </h3>
                <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <i class="mdi mdi-clock-outline"></i> รอแอนมินตรวจสอบ
                </span>
              </div>
              <p class="text-xs text-[#786B62] font-semibold mt-0.5">
                ผู้สั่งซื้อ: <strong class="text-[#332820]">{{ group.buyerName || 'ลูกค้าทั่วไป' }}</strong> ({{ group.buyerPhone || '-' }}) | โอนเมื่อ: {{ formatDate(group.slipUploadedAt, { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-600 hover:text-white border-2 border-rose-300 text-rose-700 text-xs font-black transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              :disabled="verifyingIndex === idx"
              @click="handleVerify(group, idx, 'Reject')"
            >
              <i class="mdi mdi-close-circle-outline text-base"></i>
              <span>ปฏิเสธสลิป</span>
            </button>

            <button
              type="button"
              class="px-5 py-2.5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white text-xs font-black transition active:scale-95 cursor-pointer flex items-center gap-2 shadow-md border border-[#D96C2C]"
              :disabled="verifyingIndex === idx"
              @click="handleVerify(group, idx, 'Approve')"
            >
              <i class="mdi text-base text-white" :class="verifyingIndex === idx ? 'mdi-loading animate-spin' : 'mdi-check-circle-outline'"></i>
              <span class="!text-white font-black">{{ verifyingIndex === idx ? 'กำลังบันทึก...' : 'อนุมัติสลิปชำระเงิน' }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Slip Image Preview -->
          <div class="lg:col-span-1 rounded-2xl border-2 border-[#E8D9C9] bg-white p-3 space-y-2 text-center">
            <div
              v-if="group.slipImageUrl"
              class="relative aspect-3/4 max-h-64 mx-auto rounded-xl overflow-hidden shadow-sm bg-black/5 cursor-pointer group"
              @click="selectedSlipUrl = imageUrl(group.slipImageUrl)"
            >
              <img :src="imageUrl(group.slipImageUrl)" alt="สลิปโอนเงิน" class="w-full h-full object-contain group-hover:scale-105 transition" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-black gap-1">
                <i class="mdi mdi-magnify-plus-outline text-xl"></i> คลิกเพื่อขยายรูป
              </div>
            </div>
            <div v-else class="py-10 text-xs text-[#786B62] font-semibold">
              ไม่มีรูปสลิปแนบมา
            </div>
            <p class="text-[11px] text-[#786B62] font-semibold">คลิกรูปสลิปเพื่อขยายดูรายละเอียดเต็ม</p>
          </div>

          <!-- Included Orders Breakdown -->
          <div class="lg:col-span-2 space-y-3">
            <h4 class="text-xs font-black uppercase text-[#786B62] tracking-wider flex items-center gap-1.5">
              <i class="mdi mdi-store-outline text-[#D96C2C]"></i> รายการออเดอร์ในสลิปนี้ ({{ group.orders.length }} ร้านค้า)
            </h4>

            <div class="space-y-3">
              <div
                v-for="ord in group.orders"
                :key="ord.orderId"
                class="rounded-2xl border border-[#E8D9C9] bg-white p-4 space-y-2 shadow-2xs"
              >
                <div class="flex items-center justify-between text-xs font-black border-b border-[#E8D9C9]/60 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[#332820]">#{{ ord.orderNumber }}</span>
                    <span class="px-2 py-0.5 rounded-full bg-[#D96C2C]/10 text-[#D96C2C] text-[10px] border border-[#D96C2C]/20">
                      {{ ord.shopName || 'ร้านค้าชุมชน' }}
                    </span>
                  </div>
                  <span class="text-[#D96C2C] font-black text-sm">
                    {{ formatCurrency(ord.totalAmount) }}
                  </span>
                </div>

                <!-- Order Items list -->
                <div class="space-y-1 pt-1">
                  <div
                    v-for="item in ord.items"
                    :key="item.orderItemId"
                    class="flex items-center justify-between text-xs text-[#786B62]"
                  >
                    <span>• {{ item.productName }} x{{ item.quantity }}</span>
                    <span class="font-bold text-[#332820]">{{ formatCurrency(item.totalPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Zoomed Slip Image -->
    <div
      v-if="selectedSlipUrl"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      @click="selectedSlipUrl = null"
    >
      <div class="relative max-w-2xl max-h-[90vh] bg-white p-3 rounded-3xl shadow-2xl space-y-3" @click.stop>
        <div class="flex items-center justify-between border-b pb-2 px-2">
          <span class="text-xs font-black text-[#332820]">รูปภาพสลิปชำระเงิน</span>
          <button type="button" class="text-rose-600 font-black text-lg p-1 cursor-pointer" @click="selectedSlipUrl = null">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <img :src="selectedSlipUrl" alt="สลิปแบบขยาย" class="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl" />
      </div>
    </div>
  </div>
</template>
