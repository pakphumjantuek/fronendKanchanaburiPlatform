import http from '@/shared/api/http'
export interface ProductDeal { productDealId:string; productId:string; dealType:string; discountType:string; discountValue:number; totalQuantity:number; usedQuantity:number; remainingQuantity:number; startsAt:string; endsAt:string; status:string }
export interface SaveProductDeal { dealType:string; discountType:string; discountValue:number; totalQuantity:number; startsAt:string; endsAt:string }
export async function getMyDeals(){ const {data}=await http.get<ProductDeal[]>('/product-deals/mine'); return data }
export async function getProductDeals(productId:string){ const {data}=await http.get<ProductDeal[]>(`/product-deals/products/${productId}`); return data }
export async function createDeal(productId:string, body:SaveProductDeal){ const {data}=await http.post<ProductDeal>(`/product-deals/products/${productId}`,body); return data }
export async function stopDeal(id:string){ await http.patch(`/product-deals/${id}/stop`) }
