import http from '@/shared/api/http'
import type { ProductDeal, SaveProductDeal } from '../interface/type'

export async function getMyDeals() {
  const { data } = await http.get<ProductDeal[]>('/product-deals/mine')
  return data
}
export async function getProductDeals(productId: string) {
  const { data } = await http.get<ProductDeal[]>(`/product-deals/products/${productId}`)
  return data
}
export async function createDeal(productId: string, body: SaveProductDeal) {
  const { data } = await http.post<ProductDeal>(`/product-deals/products/${productId}`, body)
  return data
}
export async function stopDeal(id: string) {
  await http.patch(`/product-deals/${id}/stop`)
}
