import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

// ==========================================
// 1. SHOP CONTRACTS & TYPES
// ==========================================
export interface Shop {
  shopId: string
  ownerUserId?: string
  shopCategoryId: string
  districtId: string
  subDistrictId: string
  shopName: string
  description?: string
  phone?: string
  email?: string
  address?: string
  coverImageUrl?: string
  backgroundImageUrl?: string
  openingTime?: string
  closingTime?: string
  latitude?: number | null
  longitude?: number | null
  status: string
  categoryName?: string
  districtName?: string
  subDistrictName?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
}

export interface ShopCategory {
  shopCategoryId: string
  categoryName: string
  status: string
  hasImage?: boolean
}

export interface District {
  districtId: string
  districtName: string
}

export interface SubDistrict {
  subDistrictId: string
  districtId: string
  subDistrictName: string
  postalCode?: string
}

export interface ShopFormData {
  shopName: string
  shopCategoryId: string | null
  districtId: string | null
  subDistrictId: string | null
  description: string
  phone: string
  email: string
  address: string
  openingTime: string
  closingTime: string
  latitude: number | null
  longitude: number | null
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
}

export interface ShopReview {
  reviewId: string
  userName?: string
  reviewerName?: string
  rating: number
  comment: string
  reply?: string | null
  createdAt: string
}

export interface ShopReviews {
  totalCount: number
  averageRating: number
  reviews: ShopReview[]
}

// ==========================================
// 2. PUBLIC SHOP APIS
// ==========================================
export async function getShops(
  params: {
    search?: string
    categoryId?: string
    districtId?: string
    subDistrictId?: string
    sortBy?: string
    page?: number
    pageSize?: number
  } = {},
) {
  const { data } = await http.get<PagedResult<Shop>>('/shops', { params })
  return data
}

export async function getShop(id: string) {
  const { data } = await http.get<Shop>(`/shops/${id}`)
  return data
}

export async function getShopReviews(shopId: string) {
  const { data } = await http.get<ShopReviews>(`/shop-reviews/${shopId}`)
  return data
}

export async function getShopCategories() {
  const { data } = await http.get<{ items: ShopCategory[] }>('/shop-categories', {
    params: { page: 1, pageSize: 100 },
  })
  return data.items.filter((item) => item.status === 'Active')
}

export async function getDistricts() {
  const { data } = await http.get<District[]>('/locations/districts')
  return data
}

export async function getSubDistricts(districtId: string) {
  const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`)
  return data
}

// ==========================================
// 3. MERCHANT SHOP APIS
// ==========================================
export async function getMyShop() {
  const { data } = await http.get<Shop>('/shops/mine')
  return data
}

export async function createShop(data: ShopFormData) {
  const response = await http.post<Shop>('/shops', data)
  return response.data
}

export async function updateShop(id: string, data: ShopFormData) {
  await http.put(`/shops/${id}`, data)
}

export async function closeShop(id: string) {
  await http.delete(`/shops/${id}`)
}

export async function updateShopStatus(id: string, status: string) {
  await http.patch(`/shops/${id}/status`, { status })
}

export async function uploadShopCoverImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<Shop>(`/shops/${id}/cover-image`, formData)
  return data
}

export async function uploadShopBackgroundImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<Shop>(`/shops/${id}/background-image`, formData)
  return data
}

export interface MerchantDashboardReport {
  summary: {
    totalRevenue: number
    todayRevenue: number
    monthRevenue: number
    totalOrders: number
    pendingSlipOrdersCount: number
    pendingShipmentOrdersCount: number
    completedOrdersCount: number
    totalProducts: number
    lowStockProductsCount: number
    totalContents: number
  }
  recentOrders: {
    orderId: string
    orderNumber: string
    receiverName?: string
    totalAmount: number
    orderStatus: string
    paymentStatus: string
    slipImageUrl?: string
    slipUploadedAt?: string
    createdAt: string
    itemsCount: number
  }[]
  topProducts: {
    productId: string
    productName: string
    imageUrl?: string
    price: number
    stockQuantity: number
    totalUnitsSold: number
    totalRevenue: number
  }[]
  salesTrend: {
    date: string
    dailyRevenue: number
    ordersCount: number
  }[]
  lowStockProducts: {
    productId: string
    productName: string
    imageUrl?: string
    price: number
    quantity: number
  }[]
  fulfillment: {
    deliveryOrdersCount: number
    pickupOrdersCount: number
    averageOrderValue: number
  }
  reviewsSummary: {
    averageRating: number
    totalReviews: number
    recentReviews: {
      reviewId: string
      userName: string
      rating: number
      comment: string
      reply?: string | null
      createdAt: string
    }[]
  }
  promotionAnalytics: {
    promotionRevenue: number
    totalDiscountAmount: number
    usedQuantity: number
    activeDealsCount: number
    deals: {
      productDealId: string
      productName: string
      dealType: string
      usedQuantity: number
      totalQuantity: number
      revenue: number
      discountAmount: number
      status: string
    }[]
  }
}

export async function getMerchantDashboardReport() {
  const { data } = await http.get<MerchantDashboardReport>('/shops/mine/dashboard')
  return data
}
