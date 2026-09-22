import type { Product } from '@/features/shops/api/productApi'

export function dealLabel(product: Product) {
  return product.activeDeal?.dealType === 'FlashDeal' ? 'โปรโมชันพิเศษ' : 'โปรเด็ดชุมชน'
}

export function dealPrice(product: Product) {
  const deal = product.activeDeal
  if (!deal) return product.price
  return deal.discountType === 'Percent'
    ? product.price * (1 - deal.discountValue / 100)
    : Math.max(0, product.price - deal.discountValue)
}
