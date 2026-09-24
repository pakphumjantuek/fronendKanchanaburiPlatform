import http from '@/shared/api/http'
import { getDistricts, getShopCategories, getSubDistricts } from '@/features/shops/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import type { MerchantDashboardReport, ShopFormData } from '../types/shop'

export type { MerchantDashboardReport, ShopFormData } from '../types/shop'
export type { District, Shop, ShopCategory, SubDistrict } from '@/features/shops/shared/types/shop'
export { getDistricts, getShopCategories, getSubDistricts }

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

export async function getMerchantDashboardReport() {
  const { data } = await http.get<MerchantDashboardReport>('/shops/mine/dashboard')
  return data
}
