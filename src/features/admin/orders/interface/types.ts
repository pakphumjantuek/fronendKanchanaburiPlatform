export interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDto {
  orderId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingMethod: string
  orderStatus: string
  paymentStatus: string
  slipImageUrl?: string
  slipUploadedAt?: string
  createdAt: string
  receiverName?: string
  receiverPhone?: string
  items: OrderItem[]
}

export interface AdminPendingSlipGroup {
  slipImageUrl: string
  slipUploadedAt?: string
  totalGroupAmount: number
  buyerName?: string
  buyerPhone?: string
  orders: OrderDto[]
}