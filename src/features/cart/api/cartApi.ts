import http from '@/shared/api/http'

export interface CartItem {
  cartItemId: string
  productId: string
  shopId: string
  shopName?: string
  productName: string
  imageUrl?: string
  quantity: number
  availableQuantity: number
  unitPrice: number
  originalPrice?: number
  dealQuantity: number
  normalQuantity: number
  dealUnitPrice: number
  normalUnitPrice: number
  dealType?: string | null
  dealDiscountValue?: number | null
  dealEndsAt?: string | null
  subtotal: number
}
export interface Cart {
  cartId: string
  items: CartItem[]
  total: number
}
export async function getCart() {
  const { data } = await http.get<Cart>('/cart')
  return data
}
export async function addCartItem(productId: string, quantity: number) {
  const { data } = await http.post<Cart>('/cart/items', { productId, quantity })
  return data
}
export async function updateCartItem(id: string, quantity: number) {
  await http.put(`/cart/items/${id}`, { quantity })
}
export async function removeCartItem(id: string) {
  await http.delete(`/cart/items/${id}`)
}
export interface CheckoutData {
  shopId?: string
  shippingFee: number
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
}

export async function checkout(checkoutData: CheckoutData) {
  const { data } = await http.post('/orders/checkout', checkoutData)
  return data
}
