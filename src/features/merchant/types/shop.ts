export interface ShopFormData {
  shopName: string
  shopCategoryId: string | null
  districtId: string | null
  subDistrictId: string | null
  description: string
  phone: string
  email: string
  address: string
  openingTime: string
  closingTime: string
  latitude: number | null
  longitude: number | null
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
}

export interface MerchantDashboardReport {
  summary: {
    totalRevenue: number
    todayRevenue: number
    monthRevenue: number
    totalOrders: number
    pendingSlipOrdersCount: number
    pendingShipmentOrdersCount: number
    completedOrdersCount: number
    totalProducts: number
    lowStockProductsCount: number
    totalContents: number
  }
  recentOrders: {
    orderId: string
    orderNumber: string
    receiverName?: string
    totalAmount: number
    orderStatus: string
    paymentStatus: string
    slipImageUrl?: string
    slipUploadedAt?: string
    createdAt: string
    itemsCount: number
  }[]
  topProducts: {
    productId: string
    productName: string
    imageUrl?: string
    price: number
    stockQuantity: number
    totalUnitsSold: number
    totalRevenue: number
  }[]
  salesTrend: {
    date: string
    dailyRevenue: number
    ordersCount: number
  }[]
  lowStockProducts: {
    productId: string
    productName: string
    imageUrl?: string
    price: number
    quantity: number
  }[]
  fulfillment: {
    deliveryOrdersCount: number
    pickupOrdersCount: number
    averageOrderValue: number
  }
  reviewsSummary: {
    averageRating: number
    totalReviews: number
    recentReviews: {
      reviewId: string
      userName: string
      rating: number
      comment: string
      reply?: string | null
      createdAt: string
    }[]
  }
  promotionAnalytics: {
    promotionRevenue: number
    totalDiscountAmount: number
    usedQuantity: number
    activeDealsCount: number
    deals: {
      productDealId: string
      productName: string
      dealType: string
      usedQuantity: number
      totalQuantity: number
      revenue: number
      discountAmount: number
      status: string
    }[]
  }
}
