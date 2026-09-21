<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24 font-sans">
    <!-- Top Breadcrumb Bar -->
    <div class="border-b-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 text-xs font-semibold text-[#786B62]"
      >
        <nav class="flex items-center gap-1.5 flex-wrap">
          <RouterLink to="/" class="hover:text-[#D96C2C] transition">หน้าแรก</RouterLink>
          <i class="mdi mdi-chevron-right text-slate-400"></i>
          <span>บัญชีของฉัน</span>
          <i class="mdi mdi-chevron-right text-slate-400"></i>
          <span class="font-black text-[#D96C2C]">{{ getTabBreadcrumbTitle(currentTab) }}</span>
        </nav>

        <span
          class="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-3 py-1 rounded-full border border-[#D96C2C]/20"
        >
          <i class="mdi mdi-shield-check"></i>
          ระบบจัดการบัญชีสมาชิก
        </span>
      </div>
    </div>

    <!-- MAIN TWO-COLUMN CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid gap-8 lg:grid-cols-12">
        <div
          class="lg:col-span-4 h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        />
        <div
          class="lg:col-span-8 h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        />
      </div>

      <!-- Content Grid -->
      <div v-else class="grid items-start gap-8 lg:grid-cols-12">
        <!-- LEFT COLUMN: SIDEBAR NAVIGATION -->
        <div class="lg:col-span-4 lg:sticky lg:top-20">
          <ProfileSidebar
            v-model:current-tab="currentTab"
            :profile="profile"
            :content-count="myContents.length"
            :favorite-count="favorites.length"
            :history-count="history.length"
            :order-count="orders.length"
            :shop="shop"
            @logout="handleLogout"
          />
        </div>

        <!-- RIGHT COLUMN: DYNAMIC TAB CONTENT -->
        <div class="lg:col-span-8 min-w-0">
          <!-- 1. ข้อมูลส่วนตัว / แก้ไขโปรไฟล์ -->
          <ProfileInfoForm
            v-if="currentTab === 'profile'"
            :profile="profile"
            :saving="saving"
            @save="save"
          />

          <!-- 2. สมุดที่อยู่จัดส่ง -->
          <ProfileAddressList
            v-else-if="currentTab === 'addresses'"
            :addresses="addresses"
            @changed="loadAddresses"
          />

          <!-- 3. กิจกรรมและคอนเทนต์ของคุณ -->
          <ProfileMyContents
            v-else-if="currentTab === 'contents'"
            :contents="myContents"
            @delete-content="deleteContent"
          />

          <!-- 4. รายการโปรดที่บันทึกไว้ -->
          <ProfileFavoritesList v-else-if="currentTab === 'favorites'" :favorites="favorites" />

          <!-- 5. ประวัติการดู -->
          <ProfileHistoryList v-else-if="currentTab === 'history'" :history="history" />

          <!-- 6. การซื้อของฉัน (เปิดใน Sidebar ได้ทันที) -->
          <ProfileOrdersList v-else-if="currentTab === 'orders'" :orders="orders" />

          <!-- 7. ร้านค้าของฉัน (เปิดใน Sidebar ได้ทันที) -->
          <ProfileMyShop v-else-if="currentTab === 'shop'" :shop="shop" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Public storefront - Orange + Cream Profile Dashboard (Sidebar Navigation Pattern)
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/shared/api/http'
import {
  getContentViewHistory,
  getFavoriteContents,
  getProfile,
  updateProfile,
  type ContentViewHistory,
  type FavoriteContent,
} from '../api/profileApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { useAuthStore } from '@/features/auth/stores/auth'
import {
  archiveMyContent,
  getMyContents,
  type UserContent,
} from '@/features/contents/user/api/userContentApi'
import { getUserAddresses, type UserAddress } from '@/features/cart/api/userAddressApi'

import ProfileSidebar, { type ProfileTab } from '../components/ProfileSidebar.vue'
import ProfileInfoForm from '../components/ProfileInfoForm.vue'
import ProfileMyContents from '../components/ProfileMyContents.vue'
import ProfileHistoryList from '../components/ProfileHistoryList.vue'
import ProfileFavoritesList from '../components/ProfileFavoritesList.vue'
import ProfileAddressList from '../components/ProfileAddressList.vue'
import ProfileOrdersList, { type RichOrder } from '../components/ProfileOrdersList.vue'
import ProfileMyShop from '../components/ProfileMyShop.vue'
import { getMyShop, type Shop } from '@/features/shops/api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const swal = useSwal()

const loading = ref(true)
const saving = ref(false)
const currentTab = ref<ProfileTab>('profile')

const profile = reactive({
  id: '',
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  role: '',
})

const history = ref<ContentViewHistory[]>([])
const myContents = ref<UserContent[]>([])
const favorites = ref<FavoriteContent[]>([])
const addresses = ref<UserAddress[]>([])
const orders = ref<RichOrder[]>([])
const shop = ref<Shop | null>(null)

function getTabBreadcrumbTitle(tab: ProfileTab) {
  if (tab === 'profile') return 'ข้อมูลส่วนตัว'
  if (tab === 'addresses') return 'ที่อยู่จัดส่งของฉัน'
  if (tab === 'contents') return 'กิจกรรมและคอนเทนต์'
  if (tab === 'favorites') return 'รายการโปรดที่บันทึกไว้'
  if (tab === 'history') return 'ประวัติการเข้าชม'
  if (tab === 'orders') return 'การซื้อของฉัน'
  if (tab === 'shop') return 'ร้านค้าของฉัน'
  return 'บัญชีของฉัน'
}

async function load() {
  loading.value = true
  try {
    const [data, views, submitted, saved, savedAddresses, myOrders, myShop] = await Promise.all([
      getProfile(),
      getContentViewHistory().catch(() => []),
      getMyContents({ page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
      getFavoriteContents().catch(() => []),
      getUserAddresses().catch(() => []),
      http
        .get<RichOrder[]>('/orders/mine')
        .then((r) => r.data)
        .catch(() => []),
      getMyShop().catch(() => null),
    ])
    Object.assign(profile, data)
    history.value = views
    myContents.value = submitted.items
    favorites.value = saved
    addresses.value = savedAddresses
    orders.value = myOrders
    shop.value = myShop

    // If query ?tab=shop or others, switch to that tab
    if (
      route.query.tab &&
      ['profile', 'addresses', 'contents', 'favorites', 'history', 'orders', 'shop'].includes(
        String(route.query.tab),
      )
    ) {
      currentTab.value = route.query.tab as ProfileTab
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function loadAddresses() {
  try {
    addresses.value = await getUserAddresses()
  } catch (error) {
    await swal.error(
      'โหลดที่อยู่ไม่สำเร็จ',
      getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'),
    )
  }
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (
      newTab &&
      ['profile', 'addresses', 'contents', 'favorites', 'history', 'orders', 'shop'].includes(
        String(newTab),
      )
    ) {
      currentTab.value = newTab as ProfileTab
    }
  },
)

async function save() {
  if (!profile.firstName.trim() || !profile.lastName.trim()) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อและนามสกุล')
    return
  }
  saving.value = true
  try {
    const updated = await updateProfile(profile)
    Object.assign(profile, updated)
    if (auth.user) {
      auth.user = { ...auth.user, name: updated.name }
      localStorage.setItem('authUser', JSON.stringify(auth.user))
    }
    await swal.success(
      'บันทึกข้อมูลส่วนตัวสำเร็จ',
      'ข้อมูลส่วนตัวของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
    )
  } catch (error) {
    await swal.error('บันทึกโปรไฟล์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function deleteContent(item: UserContent) {
  const result = await swal.confirm(
    `ลบคอนเทนต์ "${item.title}"?`,
    'เรื่องราวนี้จะไม่แสดงต่อสาธารณะบนแพลตฟอร์มอีกต่อไป',
  )
  if (!result.isConfirmed) return
  try {
    await archiveMyContent(item.contentId)
    myContents.value = myContents.value.filter((c) => c.contentId !== item.contentId)
    await swal.success('ลบคอนเทนต์เรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('ลบไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function handleLogout() {
  const result = await swal.confirm(
    'ออกจากระบบหรือไม่?',
    'คุณต้องการออกจากระบบบัญชีผู้ใช้นี้ใช่หรือไม่',
  )
  if (result.isConfirmed) {
    auth.logout()
    await router.push('/')
  }
}

onMounted(load)
</script>
