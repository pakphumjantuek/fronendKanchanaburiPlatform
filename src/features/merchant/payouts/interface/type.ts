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
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export interface MerchantPayoutRecord {
  payoutId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  totalAmount: number
  slipImageUrl?: string
  transactionRef?: string
  note?: string
  status: string
  createdAt: string
  ordersCount: number
  orders: OrderDto[]
}

export interface MerchantPayoutSummary {
  pendingPayoutAmount: number
  totalPaidOutAmount: number
  history: MerchantPayoutRecord[]
}