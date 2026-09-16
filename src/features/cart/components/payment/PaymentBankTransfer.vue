<script setup lang="ts">
import { ref } from 'vue'
import { useSwal } from '@/plugins/sweetalert'

interface Props {
  paying: boolean
  totalAmount: number
}

defineProps<Props>()

const emit = defineEmits<{
  submitSlip: [file: File, transferTime: string]
}>()

const swal = useSwal()

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const transferTime = ref<string>(new Date().toISOString().slice(0, 16))
const isCopied = ref(false)

const bankAccount = {
  bankName: 'ธนาคารกสิกรไทย (KBank)',
  accountName: 'บจก. กาญจนบุรี แพลตฟอร์ม ชุมชน',
  accountNumber: '123-4-56789-0',
  promptpayId: '080-000-0000',
}

function copyAccount() {
  navigator.clipboard.writeText(bankAccount.accountNumber)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  setFile(target.files[0])
}

function handleDrop(event: DragEvent) {
  if (!event.dataTransfer?.files || !event.dataTransfer.files[0]) return
  setFile(event.dataTransfer.files[0])
}

function setFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxFileSize = 5 * 1024 * 1024
  if (!allowedTypes.includes(file.type) || file.size > maxFileSize) {
    void swal.error('ไฟล์ไม่ถูกต้อง', 'รองรับไฟล์ JPG, PNG หรือ WEBP ขนาดไม่เกิน 5 MB')
    return
  }
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function clearFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = ''
}

function onSubmit() {
  if (!selectedFile.value) {
    void swal.warning('กรุณาแนบสลิป', 'กรุณาอัปโหลดรูปภาพสลิปการโอนเงินก่อนทำการยืนยัน')
    return
  }
  emit('submitSlip', selectedFile.value, transferTime.value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Bank Details Card -->
    <div class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 shadow-sm space-y-4">
      <div class="flex items-center gap-3 border-b border-[#E8D9C9] pb-3">
        <div class="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
          <i class="mdi mdi-bank"></i>
        </div>
        <div>
          <p class="text-xs text-[#786B62] font-semibold">บัญชีธนาคารสำหรับโอนเงิน</p>
          <h3 class="font-black text-[#332820] text-sm sm:text-base">{{ bankAccount.bankName }}</h3>
        </div>
      </div>

      <div class="space-y-2.5 text-xs text-[#332820] font-semibold">
        <div class="flex items-center justify-between bg-[#F7F0E6] p-3 rounded-xl border border-[#E8D9C9]">
          <span class="text-[#786B62]">ชื่อบัญชี:</span>
          <span class="font-black text-[#332820]">{{ bankAccount.accountName }}</span>
        </div>

        <div class="flex items-center justify-between bg-[#FFF9F2] p-3 rounded-xl border-2 border-[#D96C2C]/40 shadow-xs">
          <div>
            <span class="text-[11px] text-[#786B62] block">เลขที่บัญชี:</span>
            <span class="font-mono text-base font-black text-[#D96C2C] tracking-wider">{{ bankAccount.accountNumber }}</span>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg bg-[#D96C2C] hover:bg-[#BF5720] text-white text-xs font-black transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
            @click="copyAccount"
          >
            <i class="mdi" :class="isCopied ? 'mdi-check text-white' : 'mdi-content-copy text-white'"></i>
            <span>{{ isCopied ? 'คัดลอกแล้ว!' : 'คัดลอกเลขบัญชี' }}</span>
          </button>
        </div>

        <div class="flex items-center justify-between text-[#786B62] pt-1 px-1">
          <span>พร้อมเพย์ (PromptPay):</span>
          <span class="font-bold text-[#332820]">{{ bankAccount.promptpayId }}</span>
        </div>
      </div>
    </div>

    <!-- Slip Upload & Transfer Time Form -->
    <div class="space-y-4">
      <div class="space-y-1.5">
        <label class="block text-xs font-black text-[#332820]">
          แนบรูปภาพสลิปการโอนเงิน <span class="text-rose-600">*</span>
        </label>
        <p class="text-[11px] text-[#786B62] font-semibold">
          ยอดเงินสุทธิที่ต้องโอน: <span class="text-[#D96C2C] font-black text-sm">฿ {{ totalAmount.toLocaleString('th-TH') }}</span>
        </p>
      </div>

      <!-- Drag & Drop Zone / Preview -->
      <div
        v-if="!previewUrl"
        class="relative border-2 border-dashed border-[#E8D9C9] hover:border-[#D96C2C] bg-[#F7F0E6]/50 rounded-2xl p-6 text-center cursor-pointer transition group"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          @change="handleFileChange"
        />
        <div class="space-y-2 pointer-events-none">
          <div class="h-12 w-12 rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition">
            <i class="mdi mdi-cloud-upload-outline"></i>
          </div>
          <p class="text-xs font-black text-[#332820]">คลิก หรือ ลากไฟล์รูปภาพสลิปมาวางที่นี่</p>
          <p class="text-[10px] text-[#786B62] font-semibold">รองรับไฟล์ภาพ .JPG, .PNG, .WEBP ขนาดไม่เกิน 5 MB</p>
        </div>
      </div>

      <!-- Selected Image Preview -->
      <div v-else class="relative rounded-2xl border-2 border-[#D96C2C] overflow-hidden bg-black/5 p-3 space-y-3">
        <div class="relative aspect-3/4 max-h-72 mx-auto rounded-xl overflow-hidden shadow-md bg-white">
          <img :src="previewUrl" alt="รูปสลิปการโอนเงิน" class="w-full h-full object-contain" />
        </div>
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-black text-emerald-800 flex items-center gap-1">
            <i class="mdi mdi-check-circle text-emerald-600 text-sm"></i>
            แนบไฟล์สลิปเรียบร้อยแล้ว
          </span>
          <button
            type="button"
            class="text-xs font-black text-rose-600 hover:text-rose-800 underline cursor-pointer flex items-center gap-1"
            @click="clearFile"
          >
            <i class="mdi mdi-delete-outline"></i>
            <span>เปลี่ยนรูปสลิป</span>
          </button>
        </div>
      </div>

      <!-- Transfer Date & Time -->
      <div class="space-y-1.5">
        <label class="block text-xs font-black text-[#332820]" for="transfer-time">
          วันและเวลาที่โอนเงินในสลิป
        </label>
        <div class="flex items-center gap-2 bg-[#FFF9F2] rounded-2xl px-3.5 py-2.5 border-2 border-[#E8D9C9]">
          <i class="mdi mdi-clock-outline text-[#D96C2C] text-lg"></i>
          <input
            id="transfer-time"
            v-model="transferTime"
            type="datetime-local"
            class="w-full bg-transparent text-xs font-bold text-[#332820] focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      type="button"
      class="w-full py-4 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-sm shadow-xl transition active:scale-95 disabled:opacity-60 cursor-pointer border-2 border-[#D96C2C] flex items-center justify-center gap-2"
      :disabled="paying || !selectedFile"
      @click="onSubmit"
    >
      <i class="mdi text-lg text-white" :class="{ 'animate-spin mdi-loading': paying, 'mdi-file-document-check-outline': !paying }"></i>
      <span class="!text-white font-black text-base">
        {{ paying ? 'กำลังส่งหลักฐานการโอนเงิน...' : 'แจ้งชำระเงินพร้อมแนบสลิป' }}
      </span>
    </button>
  </div>
</template>
