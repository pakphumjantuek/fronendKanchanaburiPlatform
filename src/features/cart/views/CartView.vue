<script setup lang="ts">
// Public storefront - Orange + Cream Shopping Cart View
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkout, type CartItem } from '../api/cartApi'
import { useCartStore } from '@/stores/cart'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { getUserAddresses, type UserAddress } from '../api/userAddressApi'

import CartHeroBanner from '../components/cart/CartHeroBanner.vue'
import CartEmptyState from '../components/cart/CartEmptyState.vue'
import CartItemRow from '../components/cart/CartItemRow.vue'
import CartAddressSection from '../components/cart/CartAddressSection.vue'
import CartSummaryCard from '../components/cart/CartSummaryCard.vue'

const cartStore = useCartStore()
const cart = computed(() => cartStore.cart)
const loading = computed(() => cartStore.loading)
const updating = ref<string | null>(null)
const swal = useSwal()
const router = useRouter()
const checkingOut = ref(false)
const receiverName = ref('')
const receiverPhone = ref('')
const shippingAddress = ref('')
const addresses = ref<UserAddress[]>([])
const selectedAddressId = ref<string | null>(null)

// Group cart items by Shop
const groupedItems = computed(() => {
  const groups: Record<string, { shopId: string; shopName: string; items: CartItem[] }> = {}
  for (const item of cart.value.items) {
    const sId = item.shopId || 'default'
    if (!groups[sId]) {
      groups[sId] = {
        shopId: item.shopId,
        shopName: item.shopName || 'ร้านค้าชุมชน',
        items: [],
      }
    }
    groups[sId].items.push(item)
  }
  return Object.values(groups)
})

const total = computed(() => cartStore.total)
const itemCount = computed(() => cartStore.itemCount)
const shopCount = computed(() => groupedItems.value.length)
const shippingFeePerShop = 50
const shippingFee = computed(() => shopCount.value * shippingFeePerShop)
const grandTotal = computed(() => total.value + shippingFee.value)

async function load() {
  try {
    const [_, savedAddresses] = await Promise.all([cartStore.load(), getUserAddresses()])
    addresses.value = savedAddresses
    const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0]
    if (defaultAddress) selectAddress(defaultAddress)
  } catch (error) {
    await swal.error('โหลดตะกร้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

function selectAddress(address: UserAddress) {
  selectedAddressId.value = address.userAddressId
  receiverName.value = address.recipientName
  receiverPhone.value = address.recipientPhone
  shippingAddress.value = [
    address.addressLine,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ')
}

async function setQuantity(id: string, quantity: number) {
  updating.value = id
  try {
    await cartStore.setQuantity(id, quantity)
  } catch (error) {
    await swal.error('แก้ไขจำนวนไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updating.value = null
  }
}

async function remove(id: string) {
  const result = await swal.confirm('ยืนยันลบสินค้า?', 'ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่')
  if (!result.isConfirmed) return

  try {
    await cartStore.remove(id)
    await swal.success('ลบสินค้าออกจากตะกร้าแล้ว')
  } catch (error) {
    await swal.error('ลบสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function placeOrder() {
  if (!cart.value.items.length) return
  if (!receiverName.value || !receiverPhone.value || !shippingAddress.value) {
    await swal.warning('กรอกข้อมูลจัดส่งไม่ครบ', 'กรุณาระบุชื่อผู้รับ เบอร์โทร และที่อยู่จัดส่ง')
    return
  }

  checkingOut.value = true
  try {
    const res = await checkout({
      shippingFee: 50,
      receiverName: receiverName.value || undefined,
      receiverPhone: receiverPhone.value || undefined,
      shippingAddress: shippingAddress.value || undefined,
    })
    cartStore.clear()
    const orders = Array.isArray(res) ? res : [res]
    const orderIds = orders.map((o: { orderId?: string }) => o.orderId).filter(Boolean) as string[]

    await swal.success(
      'สร้างคำสั่งซื้อสำเร็จ!',
      orders.length > 1
        ? `กำลังนำคุณไปที่หน้าชำระเงินรวมสำหรับ ${orders.length} ร้านค้า...`
        : 'กำลังนำคุณไปที่หน้าชำระเงิน...',
    )

    if (orderIds.length === 1) {
      await router.push(`/orders/${orderIds[0]}/pay`)
    } else if (orderIds.length > 1) {
      await router.push({ path: '/orders/pay', query: { orderIds: orderIds.join(',') } })
    } else {
      await router.push('/orders')
    }
  } catch (error) {
    await swal.error(
      'สร้างคำสั่งซื้อไม่สำเร็จ',
      getApiErrorMessage(error, 'กรุณาตรวจสอบสินค้าและจำนวนคงเหลืออีกครั้ง'),
    )
  } finally {
    checkingOut.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- Header Banner Section -->
    <CartHeroBanner />

    <!-- Main Cart Content -->
    <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-28 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>

      <!-- Empty Cart State -->
      <CartEmptyState v-else-if="!cart.items.length" />

      <!-- Cart Items & Order Summary Grid -->
      <div v-else class="grid gap-8 lg:grid-cols-12">
        <!-- Cart Items List (Left Column) -->
        <section class="lg:col-span-8 space-y-6">
          <!-- Item Count Header -->
          <div
            class="flex items-center justify-between rounded-2xl bg-[#FFF9F2] p-4 border-2 border-[#E8D9C9] shadow-xs"
          >
            <span class="text-sm font-black text-[#332820]">
              รายการสินค้าทั้งหมด (<span class="text-[#D96C2C]">{{ itemCount }}</span> ชิ้น จาก <span class="text-[#D96C2C]">{{ shopCount }}</span> ร้านค้า)
            </span>
            <span class="text-xs font-semibold text-[#786B62]">
              สินค้าจากร้านค้าชุมชนกาญจนบุรี
            </span>
          </div>

          <!-- Grouped Cart Items by Shop -->
          <div
            v-for="group in groupedItems"
            :key="group.shopId"
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs space-y-4"
          >
            <!-- Shop Header -->
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-storefront text-xl text-[#D96C2C]"></i>
                <h3 class="font-black text-base text-[#332820]">
                  {{ group.shopName }}
                </h3>
              </div>
              <span class="text-xs font-bold text-[#786B62] bg-[#F7F0E6] px-2.5 py-1 rounded-lg border border-[#E8D9C9]">
                {{ group.items.length }} รายการ
              </span>
            </div>

            <!-- Shop Items -->
            <div class="space-y-3">
              <CartItemRow
                v-for="item in group.items"
                :key="item.cartItemId"
                :item="item"
                :updating="updating === item.cartItemId"
                @update-quantity="setQuantity(item.cartItemId, $event)"
                @remove="remove(item.cartItemId)"
              />
            </div>
          </div>
        </section>

        <!-- Order Summary Sidebar (Right Column) -->
        <aside class="lg:col-span-4">
          <div
            class="sticky top-24 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-sm space-y-6"
          >
            <h2
              class="flex items-center gap-2 text-lg font-black text-[#332820] border-b-2 border-[#E8D9C9] pb-4"
            >
              <i class="mdi mdi-receipt-text-outline text-[#D96C2C] text-xl"></i>
              สรุปคำสั่งซื้อ
            </h2>

            <!-- Shipping Address Section -->
            <CartAddressSection
              v-model:receiver-name="receiverName"
              v-model:receiver-phone="receiverPhone"
              v-model:shipping-address="shippingAddress"
              :addresses="addresses"
              :selected-address-id="selectedAddressId"
              @select-address="selectAddress"
            />

            <!-- Cost Breakdown & Checkout CTA -->
            <CartSummaryCard
              :total="total"
              :shipping-fee="shippingFee"
              :grand-total="grandTotal"
              :checking-out="checkingOut"
              @checkout="placeOrder"
            />
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
