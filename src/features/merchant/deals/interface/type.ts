export interface ProductDeal {
  productDealId: string
  productId: string
  dealType: string
  discountType: string
  discountValue: number
  totalQuantity: number
  usedQuantity: number
  remainingQuantity: number
  startsAt: string
  endsAt: string
  status: string
}

export interface SaveProductDeal {
  dealType: string
  discountType: string
  discountValue: number
  totalQuantity: number
  startsAt: string
  endsAt: string
}
