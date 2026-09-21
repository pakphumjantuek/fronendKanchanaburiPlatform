<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  createUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  updateUserAddress,
  type SaveUserAddress,
  type UserAddress,
} from '@/features/cart/api/userAddressApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

interface Props {
  addresses: UserAddress[]
}

defineProps<Props>()

const emit = defineEmits<{
  changed: []
}>()

const swal = useSwal()
const saving = ref(false)
const editingAddressId = ref<string | null>(null)
const showForm = ref(false)

function emptyForm(): SaveUserAddress {
  return {
    recipientName: '',
    recipientPhone: '',
    addressLine: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: '',
    isDefault: false,
  }
}

const form = reactive<SaveUserAddress>(emptyForm())

function resetForm() {
  Object.assign(form, emptyForm())
  editingAddressId.value = null
}

function openCreateForm() {
  resetForm()
  showForm.value = true
}

function openEditForm(address: UserAddress) {
  Object.assign(form, {
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    addressLine: address.addressLine,
    subDistrict: address.subDistrict ?? '',
    district: address.district ?? '',
    province: address.province ?? '',
    postalCode: address.postalCode ?? '',
    isDefault: address.isDefault,
  })
  editingAddressId.value = address.userAddressId
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function saveAddress() {
  if (!form.recipientName.trim() || !form.recipientPhone.trim() || !form.addressLine.trim()) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อผู้รับ เบอร์โทรศัพท์ และรายละเอียดที่อยู่')
    return
  }

  saving.value = true
  try {
    const payload: SaveUserAddress = {
      ...form,
      recipientName: form.recipientName.trim(),
      recipientPhone: form.recipientPhone.trim(),
      addressLine: form.addressLine.trim(),
      subDistrict: form.subDistrict?.trim() || undefined,
      district: form.district?.trim() || undefined,
      province: form.province?.trim() || undefined,
      postalCode: form.postalCode?.trim() || undefined,
    }

    if (editingAddressId.value) {
      await updateUserAddress(editingAddressId.value, payload)
      await swal.success('แก้ไขที่อยู่เรียบร้อยแล้ว')
    } else {
      await createUserAddress(payload)
      await swal.success('เพิ่มที่อยู่เรียบร้อยแล้ว')
    }

    closeForm()
    emit('changed')
  } catch (error) {
    await swal.error('บันทึกที่อยู่ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function setDefault(address: UserAddress) {
  if (address.isDefault) return

  try {
    await setDefaultUserAddress(address.userAddressId)
    emit('changed')
    await swal.success('ตั้งเป็นที่อยู่เริ่มต้นแล้ว')
  } catch (error) {
    await swal.error('ตั้งค่าที่อยู่เริ่มต้นไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function removeAddress(address: UserAddress) {
  const confirmation = await swal.confirm(
    'ลบที่อยู่นี้หรือไม่?',
    `ที่อยู่ของ ${address.recipientName} จะถูกลบออกจากสมุดที่อยู่`,
  )
  if (!confirmation.isConfirmed) return

  try {
    await deleteUserAddress(address.userAddressId)
    emit('changed')
    await swal.success('ลบที่อยู่เรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('ลบที่อยู่ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <div class="flex flex-col gap-4 border-b-2 border-[#E8D9C9] pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-[#332820]">ที่อยู่จัดส่งของฉัน</h2>
        <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">บันทึกและเลือกใช้ที่อยู่สำหรับการสั่งซื้อสินค้า</p>
      </div>
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96C2C] px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#BF5720]" @click="openCreateForm">
        <i class="mdi mdi-plus text-base"></i>
        เพิ่มที่อยู่
      </button>
    </div>

    <form v-if="showForm" class="rounded-2xl border-2 border-[#D96C2C]/30 bg-[#FFF7EF] p-5 space-y-4" @submit.prevent="saveAddress">
      <div class="flex items-center justify-between gap-4">
        <h3 class="font-black text-[#332820]">{{ editingAddressId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่' }}</h3>
        <button type="button" class="text-[#786B62] hover:text-[#D96C2C]" aria-label="ปิดฟอร์ม" @click="closeForm"><i class="mdi mdi-close text-xl"></i></button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">ชื่อผู้รับ *</span><input v-model="form.recipientName" maxlength="150" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">เบอร์โทรศัพท์ *</span><input v-model="form.recipientPhone" maxlength="30" inputmode="tel" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
      </div>
      <label class="block space-y-1"><span class="text-xs font-bold text-[#786B62]">บ้านเลขที่ / ถนน / หมู่บ้าน *</span><textarea v-model="form.addressLine" maxlength="500" rows="2" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]"></textarea></label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">ตำบล / แขวง</span><input v-model="form.subDistrict" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">อำเภอ / เขต</span><input v-model="form.district" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">จังหวัด</span><input v-model="form.province" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
        <label class="space-y-1"><span class="text-xs font-bold text-[#786B62]">รหัสไปรษณีย์</span><input v-model="form.postalCode" maxlength="10" inputmode="numeric" class="w-full rounded-xl border border-[#E8D9C9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]" /></label>
      </div>
      <label class="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#786B62]"><input v-model="form.isDefault" type="checkbox" class="h-4 w-4 accent-[#D96C2C]" /> ตั้งเป็นที่อยู่เริ่มต้น</label>
      <div class="flex justify-end gap-3 pt-1"><button type="button" class="rounded-xl px-4 py-2.5 text-xs font-black text-[#786B62] hover:bg-[#E8D9C9]" @click="closeForm">ยกเลิก</button><button type="submit" :disabled="saving" class="rounded-xl bg-[#D96C2C] px-5 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60">{{ saving ? 'กำลังบันทึก...' : 'บันทึกที่อยู่' }}</button></div>
    </form>

    <div v-if="!addresses.length" class="text-center py-14 px-4 rounded-2xl bg-[#F7F0E6] border-2 border-dashed border-[#E8D9C9] space-y-3">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C]"><i class="mdi mdi-map-marker-plus-outline text-3xl"></i></div>
      <h3 class="text-base font-black text-[#332820]">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</h3>
      <p class="text-xs text-[#786B62] font-semibold">กด “เพิ่มที่อยู่” เพื่อบันทึกไว้ใช้ในการสั่งซื้อครั้งถัดไป</p>
    </div>

    <div v-else class="space-y-4">
      <article v-for="address in addresses" :key="address.userAddressId" class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 shadow-xs">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div class="space-y-1.5"><div class="flex flex-wrap items-center gap-2"><span class="font-black text-[#332820] text-sm sm:text-base">{{ address.recipientName }}</span><span class="text-xs text-[#786B62] font-semibold">· {{ address.recipientPhone }}</span><span v-if="address.isDefault" class="rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">ค่าเริ่มต้น</span></div><p class="text-xs text-[#786B62] font-semibold leading-relaxed">{{ [address.addressLine, address.subDistrict, address.district, address.province, address.postalCode].filter(Boolean).join(' ') }}</p></div><div class="flex flex-wrap gap-2"><button v-if="!address.isDefault" type="button" class="rounded-lg border border-[#D96C2C]/30 px-3 py-2 text-xs font-black text-[#D96C2C] hover:bg-[#D96C2C]/10" @click="setDefault(address)">ตั้งเป็นค่าเริ่มต้น</button><button type="button" class="rounded-lg border border-[#E8D9C9] px-3 py-2 text-xs font-black text-[#786B62] hover:bg-[#F7F0E6]" @click="openEditForm(address)">แก้ไข</button><button type="button" class="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50" @click="removeAddress(address)">ลบ</button></div></div>
      </article>
    </div>
  </div>
</template>
