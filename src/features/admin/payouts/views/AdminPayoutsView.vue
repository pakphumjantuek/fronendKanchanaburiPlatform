<script setup lang="ts">
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
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

interface AdminMerchantPayoutGroup {
  shopId: string
  shopName: string
  shopLogoUrl?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
  totalSalesAmount: number
  paidOrdersCount: number
  orders: OrderDto[]
}

interface MerchantPayoutRecord {
  payoutId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  totalAmount: number
  slipImageUrl?: string
  transactionRef?: string
  note?: string
  status: string
  createdAt: string
  ordersCount: number
  orders: OrderDto[]
}

const activeTab = ref<'pending' | 'history'>('pending')
const payouts = ref<AdminMerchantPayoutGroup[]>([])
const history = ref<MerchantPayoutRecord[]>([])
const loading = ref(true)
const copiedId = ref<string | null>(null)
const swal = useSwal()

// Payout Modal State
const selectedShopForPayout = ref<AdminMerchantPayoutGroup | null>(null)
const payoutFile = ref<File | null>(null)
const payoutPreviewUrl = ref<string>('')
const transactionRef = ref('')
const note = ref('')
const submittingPayout = ref(false)
const selectedSlipUrl = ref<string | null>(null)

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

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const historyLoading = ref(false)

async function loadData() {
  if (activeTab.value === 'history') {
    await Promise.all([loadPendingPayouts(), loadPayoutHistory()])
  } else {
    await loadPendingPayouts()
  }
}

async function loadPendingPayouts() {
  loading.value = true
  try {
    const { data } = await http.get<AdminMerchantPayoutGroup[]>('/orders/admin/payouts')
    payouts.value = data
  } catch (error) {
    await swal.error('โหลดข้อมูลการโอนเงินไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function loadPayoutHistory() {
  historyLoading.value = true
  try {
    const { data } = await http.get<MerchantPayoutRecord[]>('/orders/admin/payouts/history')
    history.value = data
  } catch (error) {
    await swal.error('โหลดประวัติการโอนเงินไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    historyLoading.value = false
  }
}

function selectTab(tab: 'pending' | 'history') {
  activeTab.value = tab
  if (tab === 'history' && history.value.length === 0) {
    loadPayoutHistory()
  }
}

function copyToClipboard(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedId.value = id
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}

function openPayoutModal(shop: AdminMerchantPayoutGroup) {
  selectedShopForPayout.value = shop
  payoutFile.value = null
  payoutPreviewUrl.value = ''
  transactionRef.value = ''
  note.value = `โอนเงินยอดขายร้าน ${shop.shopName}`
}

function closePayoutModal() {
  selectedShopForPayout.value = null
  if (payoutPreviewUrl.value) URL.revokeObjectURL(payoutPreviewUrl.value)
  payoutFile.value = null
  payoutPreviewUrl.value = ''
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setFile(event.dataTransfer.files[0])
  }
}

function setFile(file: File) {
  if (!file.type.startsWith('image/')) {
    void swal.error('ไฟล์ไม่ถูกต้อง', 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (.jpg, .png, .jpeg)')
    return
  }
  payoutFile.value = file
  payoutPreviewUrl.value = URL.createObjectURL(file)
}

async function submitPayout() {
  if (!selectedShopForPayout.value) return
  submittingPayout.value = true

  try {
    const formData = new FormData()
    formData.append('shopId', selectedShopForPayout.value.shopId)
    formData.append('orderIds', selectedShopForPayout.value.orders.map((o) => o.orderId).join(','))
    if (transactionRef.value) formData.append('transactionRef', transactionRef.value)
    if (note.value) formData.append('note', note.value)
    if (payoutFile.value) formData.append('slipFile', payoutFile.value)

    await http.post('/orders/admin/payouts/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    await swal.success('บันทึกการโอนเงินให้ร้านค้าสำเร็จ!', 'ระบบอัปเดตสถานะการสั่งจ่ายและแจ้งเตือนร้านค้าเรียบร้อยแล้ว')
    closePayoutModal()
    await loadData()
  } catch (error) {
    await swal.error('บันทึกการโอนเงินไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    submittingPayout.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="p-6 sm:p-8 space-y-6 text-[#332820]">
    <!-- Header Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-5">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96C2C]/10 border border-[#D96C2C]/30 text-xs font-black text-[#D96C2C] mb-2">
          <i class="mdi mdi-cash-refund text-[#D96C2C]"></i> Merchant Payouts & Settlement
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#332820]">สรุปการโอนเงินเคลียร์ยอดขายให้ร้านค้า</h1>
        <p class="mt-1 text-xs sm:text-sm text-[#786B62] font-semibold">
          สั่งจ่ายเงินยอดขาย แนบหลักฐานสลิปให้ร้านค้า และดูประวัติการโอนเงินย้อนหลัง
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Tab Toggle -->
        <div class="inline-flex rounded-2xl bg-[#E8D9C9]/50 p-1 border border-[#E8D9C9]">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'pending' ? 'bg-[#D96C2C] text-white shadow-xs' : 'text-[#786B62] hover:text-[#332820]'"
            @click="selectTab('pending')"
          >
            <i class="mdi mdi-clock-outline"></i> ยอดค้างโอน ({{ payouts.length }})
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'history' ? 'bg-[#332820] text-white shadow-xs' : 'text-[#786B62] hover:text-[#332820]'"
            @click="selectTab('history')"
          >
            <i class="mdi mdi-history"></i> ประวัติการโอนแล้ว ({{ history.length }})
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#FFF9F2] hover:bg-[#F2E5D5] border-2 border-[#E8D9C9] px-4 py-2 text-xs font-black text-[#332820] shadow-xs transition active:scale-95 cursor-pointer"
          :disabled="loading"
          @click="loadData"
        >
          <i class="mdi mdi-refresh text-base text-[#D96C2C]" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <!-- TAB 1: PENDING PAYOUTS LIST -->
    <template v-else-if="activeTab === 'pending'">
      <!-- Empty State -->
      <div v-if="payouts.length === 0" class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center space-y-3">
        <div class="h-16 w-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <i class="mdi mdi-check-decagram"></i>
        </div>
        <h3 class="text-lg font-black text-[#332820]">ไม่มีรายการยอดขายที่ค้างโอนในขณะนี้</h3>
        <p class="text-xs text-[#786B62] font-semibold">ยอดขายทุกร้านค้าได้รับการอนุมัติและโอนเงินเรียบร้อยแล้ว</p>
      </div>

      <!-- Payout Groups List -->
      <div v-else class="space-y-6">
        <div
          v-for="shop in payouts"
          :key="shop.shopId"
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-md space-y-5"
        >
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D9C9] pb-4">
            <div class="flex items-center gap-3.5">
              <img
                v-if="shop.shopLogoUrl"
                :src="imageUrl(shop.shopLogoUrl)"
                :alt="shop.shopName"
                class="h-12 w-12 rounded-2xl object-cover border border-[#E8D9C9] shrink-0"
              />
              <div v-else class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white font-black text-xl shrink-0">
                <i class="mdi mdi-store"></i>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#332820]">{{ shop.shopName }}</h3>
                <p class="text-xs text-[#786B62] font-semibold">
                  ออเดอร์ที่ชำระเงินแล้ว: <strong class="text-[#332820]">{{ shop.paidOrdersCount }} รายการ</strong>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <span class="text-xs font-black text-[#786B62] uppercase tracking-wider block">ยอดรวมสะสมที่ต้องโอนให้ร้าน</span>
                <span class="text-2xl font-black text-[#D96C2C]">{{ formatCurrency(shop.totalSalesAmount) }}</span>
              </div>

              <!-- CONFIRM PAYOUT BUTTON -->
              <button
                type="button"
                class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer border border-emerald-600 flex items-center gap-2"
                @click="openPayoutModal(shop)"
              >
                <i class="mdi mdi-[#FFF] mdi-bank-transfer text-lg"></i>
                <span class="!text-white font-black">แจ้งโอนเงินให้ร้านค้า</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Merchant Bank Details Card -->
            <div class="lg:col-span-1 rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 space-y-3 shadow-2xs">
              <div class="flex items-center gap-2 border-b border-[#E8D9C9] pb-2 text-xs font-black text-[#332820]">
                <i class="mdi mdi-bank text-emerald-700 text-lg"></i>
                <span>ข้อมูลบัญชีธนาคารของร้านค้า</span>
              </div>

              <div v-if="!shop.bankName && !shop.bankAccountNumber && !shop.promptPay" class="py-4 text-xs text-amber-700 font-bold bg-amber-50 p-3 rounded-xl border border-amber-200">
                ⚠️ ร้านค้านี้ยังไม่ได้ตั้งค่าข้อมูลบัญชีธนาคารในระบบ
              </div>

              <div v-else class="space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[#786B62] font-semibold">ธนาคาร:</span>
                  <strong class="text-[#332820]">{{ shop.bankName || '-' }}</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#786B62] font-semibold">ชื่อบัญชี:</span>
                  <strong class="text-[#332820]">{{ shop.bankAccountName || '-' }}</strong>
                </div>

                <div v-if="shop.bankAccountNumber" class="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#D96C2C]/30 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-[#786B62] block font-semibold">เลขที่บัญชี:</span>
                    <span class="font-mono text-sm font-black text-[#D96C2C]">{{ shop.bankAccountNumber }}</span>
                  </div>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-[#D96C2C] hover:bg-[#BF5720] text-white text-[11px] font-black transition cursor-pointer active:scale-95 shadow-2xs"
                    @click="copyToClipboard(shop.bankAccountNumber!, shop.shopId)"
                  >
                    <i class="mdi" :class="copiedId === shop.shopId ? 'mdi-check' : 'mdi-content-copy'"></i>
                    <span>{{ copiedId === shop.shopId ? 'ก๊อปแล้ว!' : 'คัดลอก' }}</span>
                  </button>
                </div>

                <div v-if="shop.promptPay" class="flex items-center justify-between pt-1">
                  <span class="text-[#786B62] font-semibold">พร้อมเพย์ (PromptPay):</span>
                  <strong class="text-[#332820] font-mono font-bold">{{ shop.promptPay }}</strong>
                </div>
              </div>
            </div>

            <!-- Orders Included List -->
            <div class="lg:col-span-2 space-y-2">
              <h4 class="text-xs font-black uppercase text-[#786B62] tracking-wider">
                รายการออเดอร์ของร้านนี้ ({{ shop.orders.length }} รายการ)
              </h4>

              <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                <div
                  v-for="ord in shop.orders"
                  :key="ord.orderId"
                  class="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8D9C9] text-xs shadow-2xs"
                >
                  <div>
                    <span class="font-black text-[#332820]">#{{ ord.orderNumber }}</span>
                    <span class="text-[#786B62] text-[11px] block">{{ ord.items.length }} รายการสินค้า</span>
                  </div>
                  <span class="font-black text-[#D96C2C]">
                    {{ formatCurrency(ord.totalAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- TAB 2: PAYOUT HISTORY LIST -->
    <template v-else-if="activeTab === 'history'">
      <div v-if="history.length === 0" class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center space-y-3">
        <i class="mdi mdi-history text-4xl text-[#786B62]"></i>
        <h3 class="text-lg font-black text-[#332820]">ยังไม่มีประวัติการโอนเงินให้ร้านค้า</h3>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="record in history"
          :key="record.payoutId"
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3.5">
            <div class="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
              <i class="mdi mdi-[#332820] mdi-check-circle"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-base text-[#332820]">{{ record.shopName || 'ร้านค้าชุมชน' }}</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  โอนแล้ว
                </span>
              </div>
              <p class="text-xs text-[#786B62] font-semibold mt-0.5">
                โอนเมื่อ: {{ formatDate(record.createdAt) }} | {{ record.ordersCount }} ออเดอร์
                <span v-if="record.transactionRef" class="ml-2 text-[#332820]">Ref: {{ record.transactionRef }}</span>
              </p>
              <p v-if="record.note" class="text-xs text-[#D96C2C] font-semibold mt-0.5">
                หมายเหตุ: {{ record.note }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xl font-black text-[#D96C2C]">{{ formatCurrency(record.totalAmount) }}</span>
            <button
              v-if="record.slipImageUrl"
              type="button"
              class="px-3.5 py-2 rounded-xl bg-white border border-[#E8D9C9] hover:border-[#D96C2C] text-xs font-bold text-[#332820] transition cursor-pointer flex items-center gap-1"
              @click="selectedSlipUrl = imageUrl(record.slipImageUrl)"
            >
              <i class="mdi mdi-eye-outline text-base text-[#D96C2C]"></i>
              <span>ดูสลิปโอนเงิน</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- MODAL FOR CONFIRMING PAYOUT WITH SLIP -->
    <div
      v-if="selectedShopForPayout"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
      @click="closePayoutModal"
    >
      <div class="relative w-full max-w-xl bg-[#FFF9F2] border-2 border-[#E8D9C9] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6" @click.stop>
        <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              <i class="mdi mdi-bank-transfer"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-[#332820]">แจ้งโอนเงินให้ร้านค้า</h2>
              <p class="text-xs text-[#786B62] font-semibold">{{ selectedShopForPayout.shopName }}</p>
            </div>
          </div>
          <button type="button" class="text-rose-600 text-2xl font-black p-1 cursor-pointer" @click="closePayoutModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="rounded-2xl bg-[#F7F0E6] p-4 space-y-2 border border-[#E8D9C9] text-xs">
          <div class="flex justify-between font-black text-[#332820]">
            <span>ยอดขายรวมที่ต้องโอน:</span>
            <span class="text-[#D96C2C] text-base">{{ formatCurrency(selectedShopForPayout.totalSalesAmount) }}</span>
          </div>
          <div class="flex justify-between text-[#786B62]">
            <span>จำนวนคำสั่งซื้อ:</span>
            <span class="font-bold text-[#332820]">{{ selectedShopForPayout.paidOrdersCount }} รายการ</span>
          </div>
          <div v-if="selectedShopForPayout.bankAccountNumber" class="flex justify-between text-[#786B62] pt-1 border-t border-[#E8D9C9]/60">
            <span>โอนเข้าบัญชี:</span>
            <span class="font-bold text-[#332820]">{{ selectedShopForPayout.bankName }} - {{ selectedShopForPayout.bankAccountNumber }} ({{ selectedShopForPayout.bankAccountName }})</span>
          </div>
        </div>

        <!-- File Upload Drag & Drop Zone -->
        <div class="space-y-2">
          <label class="block text-xs font-black text-[#332820]">
            แนบรูปภาพสลิปการโอนเงิน (Payout Slip)
          </label>

          <div
            v-if="!payoutPreviewUrl"
            class="relative border-2 border-dashed border-[#E8D9C9] hover:border-[#D96C2C] bg-white rounded-2xl p-6 text-center cursor-pointer transition group"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              @change="handleFileChange"
            />
            <div class="space-y-2 pointer-events-none">
              <div class="h-10 w-10 rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition">
                <i class="mdi mdi-cloud-upload-outline"></i>
              </div>
              <p class="text-xs font-black text-[#332820]">คลิก หรือ ลากสลิปมาวางที่นี่</p>
              <p class="text-[10px] text-[#786B62]">รองรับไฟล์ .JPG, .PNG, .WEBP</p>
            </div>
          </div>

          <div v-else class="relative rounded-2xl border-2 border-[#D96C2C] overflow-hidden bg-black/5 p-2 space-y-2">
            <div class="relative aspect-3/4 max-h-48 mx-auto rounded-xl overflow-hidden shadow-sm bg-white">
              <img :src="payoutPreviewUrl" alt="สลิปโอนเงิน" class="w-full h-full object-contain" />
            </div>
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-black text-emerald-800 flex items-center gap-1">
                <i class="mdi mdi-check-circle"></i> แนบสลิปเรียบร้อย
              </span>
              <button type="button" class="text-xs text-rose-600 font-bold underline cursor-pointer" @click="payoutFile = null; payoutPreviewUrl = ''">
                เปลี่ยนรูป
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-black text-[#332820] mb-1">หมายเลขอ้างอิงธุรกรรม (Transaction Ref)</label>
            <input
              v-model="transactionRef"
              type="text"
              placeholder="เช่น TXN-20260906-991"
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2.5 font-bold focus:outline-none focus:border-[#D96C2C]"
            />
          </div>

          <div>
            <label class="block font-black text-[#332820] mb-1">หมายเหตุเพิ่มเติมถึงร้านค้า</label>
            <input
              v-model="note"
              type="text"
              placeholder="เช่น ยอดโอนสุทธิเคลียร์ยอดขายประจำสัปดาห์"
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2.5 font-bold focus:outline-none focus:border-[#D96C2C]"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-5 py-2.5 rounded-2xl border-2 border-[#E8D9C9] text-xs font-black text-[#786B62] hover:bg-[#F2E5D5] transition cursor-pointer"
            @click="closePayoutModal"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition active:scale-95 shadow-md border border-emerald-600 cursor-pointer flex items-center gap-2"
            :disabled="submittingPayout"
            @click="submitPayout"
          >
            <i class="mdi text-base text-white" :class="submittingPayout ? 'mdi-loading animate-spin' : 'mdi-check-circle'"></i>
            <span class="!text-white font-black">{{ submittingPayout ? 'กำลังบันทึก...' : 'ยืนยันโอนเงินและแจ้งร้านค้า' }}</span>
          </button>
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
          <span class="text-xs font-black text-[#332820]">รูปภาพสลิปการโอนเงินคืนร้านค้า</span>
          <button type="button" class="text-rose-600 font-black text-lg p-1 cursor-pointer" @click="selectedSlipUrl = null">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <img :src="selectedSlipUrl" alt="สลิปโอนเงินแบบขยาย" class="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl" />
      </div>
    </div>
  </div>
</template>
