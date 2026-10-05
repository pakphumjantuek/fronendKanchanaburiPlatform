import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export interface ShopCategory {
  shopCategoryId: string
  categoryName: string
  description?: string
  status: string
  hasImage: boolean
}

export async function getCategories(params: { page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<ShopCategory>>('/shop-categories', { params })
  return data
}
export async function getCategory(id: string) {
  const { data } = await http.get<ShopCategory>(`/shop-categories/${id}`)
  return data
}
export async function createCategory(data: { categoryName: string; description: string }) {
  const { data: result } = await http.post<ShopCategory>('/shop-categories', data)
  return result
}
export async function updateCategory(
  id: string,
  data: { categoryName: string; description: string; status: string },
) {
  await http.put(`/shop-categories/${id}`, data)
}
export async function deleteCategory(id: string) {
  await http.delete(`/shop-categories/${id}`)
}
export async function uploadCategoryImage(id: string, image: File) {
  const formData = new FormData()
  formData.append('image', image)
  await http.post(`/shop-categories/${id}/image`, formData)
}
export async function deleteCategoryImage(id: string) {
  await http.delete(`/shop-categories/${id}/image`)
}
export function categoryImageUrl(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api'
  return `${apiUrl}/shop-categories/${id}/image`
}
