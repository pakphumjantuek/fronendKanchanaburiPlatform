import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'
import type { District, Shop, ShopCategory, ShopReviews, SubDistrict } from '../shared/types/shop'

export type { District, Shop, ShopCategory, ShopReview, ShopReviews, SubDistrict } from '../shared/types/shop'

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
