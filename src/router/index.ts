import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/features/auth/stores/auth'
import http from '@/shared/api/http'

async function requireActiveShop() {
  try {
    const { data } = await http.get<{ status: string }>('/shops/mine')
    return data.status === 'Active' ? true : { name: 'shop-application' }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      return { name: 'shop-application' }
    return { name: 'home' }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return {
      top: 0,
      left: 0,
      behavior: 'smooth',
    }
  },

  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/shops',
      name: 'shops',
      component: () => import('@/features/shops/public/list/views/ShopListView.vue'),
    },
    {
      path: '/shops/:id',
      name: 'shop-detail',
      component: () => import('@/features/shops/public/detail/shop/views/ShopDetailView.vue'),
    },
    {
      path: '/shops/:id/products',
      name: 'shop-products-all',
      component: () =>
        import('@/features/shops/public/detail/shop-products/views/ShopProductsView.vue'),
    },
    {
      path: '/shops/:id/contents',
      name: 'shop-contents-all',
      component: () =>
        import('@/features/shops/public/detail/shop-contents/views/ShopContentsView.vue'),
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/features/shops/public/detail/product/views/ProductDetailView.vue'),
    },
    {
      path: '/contents',
      name: 'contents',
      component: () => import('@/features/contents/public/list/views/ContentListView.vue'),
    },
    {
      path: '/contents/:id',
      name: 'content-detail',
      component: () => import('@/features/contents/public/detail/views/ContentDetailView.vue'),
    },
    {
      path: '/create',
      name: 'content-create',
      component: () => import('@/features/contents/user/views/UserContentFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-contents',
      name: 'my-contents',
      component: () => import('@/features/contents/user/views/MyContentsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-contents/:id/edit',
      name: 'my-content-edit',
      component: () => import('@/features/contents/user/views/UserContentFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/features/shops/public/detail/product/views/ProductDetailView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/features/cart/views/CartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/features/cart/views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/features/cart/views/OrderDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/pay',
      name: 'pay-orders-batch',
      component: () => import('@/features/cart/views/PaymentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id/pay',
      name: 'pay-order',
      component: () => import('@/features/cart/views/PaymentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/features/profile/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/shop-application',
      name: 'shop-application',
      component: () => import('@/features/shops/merchant/shop/ShopApplicationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-shop',
      component: () => import('@/features/shops/merchant/layout/ShopManageLayout.vue'),
      meta: { requiresAuth: true },
      beforeEnter: requireActiveShop,
      children: [
        {
          path: '',
          name: 'my-shop-dashboard',
          component: () => import('@/features/shops/merchant/dashboard/views/MerchantDashboardView.vue'),
        },
        {
          path: 'info',
          name: 'my-shop-info',
          component: () => import('@/features/shops/merchant/shop/MyShopView.vue'),
        },
        {
          path: 'products',
          name: 'my-shop-products',
          component: () => import('@/features/shops/merchant/products/ProductListView.vue'),
        },
        {
          path: 'products/new',
          name: 'my-shop-product-new',
          component: () => import('@/features/shops/merchant/products/ProductFormView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'my-shop-product-edit',
          component: () => import('@/features/shops/merchant/products/ProductFormView.vue'),
        },
        {
          path: 'orders',
          name: 'my-shop-orders',
          component: () => import('@/features/shops/merchant/orders/MerchantOrdersView.vue'),
        },
        {
          path: 'contents',
          name: 'my-shop-contents',
          component: () => import('@/features/shops/merchant/contents/MerchantContentsView.vue'),
        },
        {
          path: 'contents/new',
          name: 'my-shop-content-new',
          component: () => import('@/features/shops/merchant/contents/MerchantContentFormView.vue'),
        },
        {
          path: 'contents/:id/edit',
          name: 'my-shop-content-edit',
          component: () => import('@/features/shops/merchant/contents/MerchantContentFormView.vue'),
        },
        {
          path: 'payouts',
          name: 'my-shop-payouts',
          component: () => import('@/features/shops/merchant/payouts/views/MerchantPayoutsView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/features/admin/views/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/features/admin/dashboard/views/AdminDashboardView.vue'),
        },
        {
          path: 'shops',
          name: 'admin-shops',
          component: () => import('@/features/admin/shops/views/AdminShopListView.vue'),
        },
        {
          path: 'shops/:shopId/products',
          name: 'admin-shop-products',
          component: () => import('@/features/admin/products/views/AdminProductListView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-shop-categories',
          component: () =>
            import('@/features/admin/shop-categories/views/AdminShopCategoriesView.vue'),
        },
        {
          path: 'categories/new',
          name: 'admin-shop-category-new',
          component: () =>
            import('@/features/admin/shop-categories/views/AdminShopCategoryFormView.vue'),
        },
        {
          path: 'categories/:id/edit',
          name: 'admin-shop-category-edit',
          component: () =>
            import('@/features/admin/shop-categories/views/AdminShopCategoryFormView.vue'),
        },
        {
          path: 'product-categories',
          name: 'admin-product-categories',
          component: () =>
            import('@/features/admin/product-categories/views/AdminProductCategoriesView.vue'),
        },
        {
          path: 'product-categories/new',
          name: 'admin-product-category-new',
          component: () =>
            import('@/features/admin/product-categories/views/AdminProductCategoryFormView.vue'),
        },
        {
          path: 'product-categories/:id/edit',
          name: 'admin-product-category-edit',
          component: () =>
            import('@/features/admin/product-categories/views/AdminProductCategoryFormView.vue'),
        },
        {
          path: 'content-categories',
          name: 'admin-content-categories',
          component: () =>
            import('@/features/admin/content-categories/views/AdminContentCategoriesView.vue'),
        },
        {
          path: 'content-categories/new',
          name: 'admin-content-category-new',
          component: () =>
            import('@/features/admin/content-categories/views/AdminContentCategoryFormView.vue'),
        },
        {
          path: 'content-categories/:id/edit',
          name: 'admin-content-category-edit',
          component: () =>
            import('@/features/admin/content-categories/views/AdminContentCategoryFormView.vue'),
        },
        {
          path: 'tags',
          name: 'admin-tags',
          component: () => import('@/features/admin/tags/views/AdminTagsView.vue'),
        },
        {
          path: 'tags/new',
          name: 'admin-tag-new',
          component: () => import('@/features/admin/tags/views/AdminTagFormView.vue'),
        },
        {
          path: 'tags/:id/edit',
          name: 'admin-tag-edit',
          component: () => import('@/features/admin/tags/views/AdminTagFormView.vue'),
        },
        {
          path: 'contents',
          name: 'admin-contents',
          component: () => import('@/features/admin/contents/views/AdminContentsView.vue'),
        },
        {
          path: 'contents/new',
          name: 'admin-content-new',
          component: () => import('@/features/admin/contents/views/AdminContentFormView.vue'),
        },
        {
          path: 'contents/:id/edit',
          name: 'admin-content-edit',
          component: () => import('@/features/admin/contents/views/AdminContentFormView.vue'),
        },
        {
          path: 'schedules',
          name: 'admin-schedules',
          component: () => import('@/features/admin/schedules/views/AdminSchedulesView.vue'),
        },
        {
          path: 'schedules/new',
          name: 'admin-schedule-new',
          component: () => import('@/features/admin/schedules/views/AdminScheduleFormView.vue'),
        },
        {
          path: 'schedules/:id/edit',
          name: 'admin-schedule-edit',
          component: () => import('@/features/admin/schedules/views/AdminScheduleFormView.vue'),
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('@/features/admin/reports/views/AdminReportsView.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/features/admin/orders/views/AdminOrdersView.vue'),
        },
        {
          path: 'payouts',
          name: 'admin-payouts',
          component: () => import('@/features/admin/payouts/views/AdminPayoutsView.vue'),
        },
      ],
    },
    { path: '/about', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.requiresAdmin && auth.user?.role !== 'Admin') return { name: 'home' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'home' }
})

router.onError((error) => {
  const retryKey = 'router-chunk-retry'
  const isChunkLoadError = /Failed to fetch dynamically imported module/.test(error.message)

  if (isChunkLoadError && !sessionStorage.getItem(retryKey)) {
    sessionStorage.setItem(retryKey, 'true')
    window.location.reload()
    return
  }

  sessionStorage.removeItem(retryKey)
  console.error('Route navigation failed:', error)
})

export default router
