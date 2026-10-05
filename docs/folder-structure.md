# Project Folder Structure

เอกสารนี้แสดงโครงสร้างไฟล์และโฟลเดอร์ของโปรเจกต์ ณ วันที่จัดทำ โดยไม่รวม `.git/`, `node_modules/`, `dist/` และ `.DS_Store`

## โฟลเดอร์หลัก

- `src/features/` เก็บโค้ดตาม feature เช่น `admin`, `auth`, `cart`, `contents`, `merchant`, `profile` และ `shops`
- `src/shared/` เก็บ API client, component, composable, type และ utility ที่ใช้ร่วมกัน
- `src/components/` เก็บ component กลางระดับแอป
- `src/views/` เก็บหน้าหลักของแอป เช่น home และ navigation
- `src/router/` เก็บการกำหนด route
- `src/plugins/` เก็บ plugin ที่ติดตั้งให้ Vue
- `src/stores/` เก็บ state กลางของแอป
- `src/assets/` เก็บรูปและ stylesheet
- `public/` เก็บไฟล์ static ที่เสิร์ฟตรงจากเว็บ root


## ผังไฟล์และโฟลเดอร์

```text
fronendKanchanaburiPlatform/
├── .vscode/
│   └── extensions.json
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── base.css
│   │   ├── logo.svg
│   │   ├── main.css
│   │   └── รูปปก.png
│   ├── components/
│   │   ├── common/
│   │   │   ├── input/
│   │   │   │   ├── AppFileInput.vue
│   │   │   │   ├── AppSelect.vue
│   │   │   │   ├── AppTextarea.vue
│   │   │   │   └── AppTextField.vue
│   │   │   ├── map/
│   │   │   │   └── LocationPickerMap.vue
│   │   │   ├── AppButton.vue
│   │   │   ├── AppConfirmModal.vue
│   │   │   ├── AppDataTable.vue
│   │   │   ├── AppSearch.vue
│   │   │   └── CheckoutModal.vue
│   │   ├── AdminNavMenu.vue
│   │   └── GlobalModal.vue
│   ├── features/
│   │   ├── admin/
│   │   │   ├── api/
│   │   │   │   ├── adminDashboardApi.ts
│   │   │   │   └── types.ts
│   │   │   ├── content-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminContentCategoriesView.vue
│   │   │   │       └── AdminContentCategoryFormView.vue
│   │   │   ├── content-tags/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentTagApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminContentTagsView.vue
│   │   │   ├── contents/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminContentFormView.vue
│   │   │   │       └── AdminContentsView.vue
│   │   │   ├── dashboard/
│   │   │   │   └── views/
│   │   │   │       └── AdminDashboardView.vue
│   │   │   ├── orders/
│   │   │   │   ├── interface/
│   │   │   │   │   └── types.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminOrdersView.vue
│   │   │   ├── payouts/
│   │   │   │   ├── interface/
│   │   │   │   │   └── types.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminPayoutsView.vue
│   │   │   ├── product-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminProductCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminProductCategoriesView.vue
│   │   │   │       └── AdminProductCategoryFormView.vue
│   │   │   ├── products/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminProductApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminProductListView.vue
│   │   │   ├── reports/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminReportApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminReportsView.vue
│   │   │   ├── schedules/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminScheduleApi.ts
│   │   │   │   ├── interface/
│   │   │   │   │   └── types.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminScheduleFormView.vue
│   │   │   │       └── AdminSchedulesView.vue
│   │   │   ├── shop-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminShopCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminShopCategoriesView.vue
│   │   │   │       └── AdminShopCategoryFormView.vue
│   │   │   ├── shops/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminShopApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminPendingShopApplicationsView.vue
│   │   │   │       └── AdminShopListView.vue
│   │   │   ├── tags/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminTagApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminTagFormView.vue
│   │   │   │       └── AdminTagsView.vue
│   │   │   └── views/
│   │   │       └── AdminLayout.vue
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── authApi.ts
│   │   │   │   └── getApiErrorMessage.ts
│   │   │   ├── stores/
│   │   │   │   └── auth.ts
│   │   │   └── views/
│   │   │       ├── LoginView.vue
│   │   │       └── RegisterView.vue
│   │   ├── cart/
│   │   │   ├── api/
│   │   │   │   ├── cartApi.ts
│   │   │   │   └── userAddressApi.ts
│   │   │   ├── components/
│   │   │   │   ├── cart/
│   │   │   │   │   ├── CartAddressSection.vue
│   │   │   │   │   ├── CartEmptyState.vue
│   │   │   │   │   ├── CartHeroBanner.vue
│   │   │   │   │   ├── CartItemRow.vue
│   │   │   │   │   └── CartSummaryCard.vue
│   │   │   │   ├── order-detail/
│   │   │   │   │   ├── OrderCostSummary.vue
│   │   │   │   │   ├── OrderDetailHeader.vue
│   │   │   │   │   ├── OrderItemsList.vue
│   │   │   │   │   ├── OrderProgressTimeline.vue
│   │   │   │   │   ├── OrderShippingInfo.vue
│   │   │   │   │   └── WriteReviewModal.vue
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrderCard.vue
│   │   │   │   │   ├── OrdersFilterTabs.vue
│   │   │   │   │   └── OrdersHeroBanner.vue
│   │   │   │   └── payment/
│   │   │   │       ├── PaymentBankTransfer.vue
│   │   │   │       ├── PaymentCardForm.vue
│   │   │   │       ├── PaymentMethodTabs.vue
│   │   │   │       └── PaymentPromptpayQr.vue
│   │   │   └── views/
│   │   │       ├── CartView.vue
│   │   │       ├── OrderDetailView.vue
│   │   │       ├── OrdersView.vue
│   │   │       └── PaymentView.vue
│   │   ├── contents/
│   │   │   ├── api/
│   │   │   │   ├── contentApis.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   └── categoryRules.ts
│   │   │   ├── public/
│   │   │   │   ├── api/
│   │   │   │   │   └── contentApi.ts
│   │   │   │   ├── detail/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ContentDetailHeader.vue
│   │   │   │   │   │   ├── ContentDetailHero.vue
│   │   │   │   │   │   ├── ContentDetailRelated.vue
│   │   │   │   │   │   ├── ContentDetailReviews.vue
│   │   │   │   │   │   ├── ContentDetailSidebar.vue
│   │   │   │   │   │   ├── ContentDetailTabs.vue
│   │   │   │   │   │   ├── ContentLocationMap.vue
│   │   │   │   │   │   └── ContentReportModal.vue
│   │   │   │   │   └── views/
│   │   │   │   │       └── ContentDetailView.vue
│   │   │   │   └── list/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ContentCard.vue
│   │   │   │       │   ├── ContentCategoryBar.vue
│   │   │   │       │   ├── ContentFilterSection.vue
│   │   │   │       │   ├── ContentHeroBanner.vue
│   │   │   │       │   └── ContentMapView.vue
│   │   │   │       └── views/
│   │   │   │           └── ContentListView.vue
│   │   │   └── user/
│   │   │       ├── api/
│   │   │       │   └── userContentApi.ts
│   │   │       └── views/
│   │   │           ├── MyContentsView.vue
│   │   │           └── UserContentFormView.vue
│   │   ├── merchant/
│   │   │   ├── api/
│   │   │   │   ├── productApi.ts
│   │   │   │   └── shopApi.ts
│   │   │   ├── contents/
│   │   │   │   ├── interface/
│   │   │   │   │   └── type.ts
│   │   │   │   ├── MerchantContentFormView.vue
│   │   │   │   └── MerchantContentsView.vue
│   │   │   ├── dashboard/
│   │   │   │   └── MerchantDashboardView.vue
│   │   │   ├── deals/
│   │   │   │   ├── api/
│   │   │   │   │   └── productDealApi.ts
│   │   │   │   ├── interface/
│   │   │   │   │   └── type.ts
│   │   │   │   └── views/
│   │   │   │       └── MerchantDealsView.vue
│   │   │   ├── exports/
│   │   │   │   ├── api/
│   │   │   │   │   └── merchantExportApi.ts
│   │   │   │   ├── interface/
│   │   │   │   │   └── type.ts
│   │   │   │   └── views/
│   │   │   │       └── MerchantExportsView.vue
│   │   │   ├── layout/
│   │   │   │   └── ShopManageLayout.vue
│   │   │   ├── orders/
│   │   │   │   ├── components/
│   │   │   │   │   ├── MerchantOrderCard.vue
│   │   │   │   │   └── ShipmentFulfillmentForm.vue
│   │   │   │   └── MerchantOrdersView.vue
│   │   │   ├── payouts/
│   │   │   │   ├── interface/
│   │   │   │   │   └── type.ts
│   │   │   │   └── views/
│   │   │   │       └── MerchantPayoutsView.vue
│   │   │   ├── products/
│   │   │   │   ├── ProductFormView.vue
│   │   │   │   └── ProductListView.vue
│   │   │   ├── shop/
│   │   │   │   ├── MyShopView.vue
│   │   │   │   └── ShopApplicationView.vue
│   │   │   └── types/
│   │   │       └── shop.ts
│   │   ├── profile/
│   │   │   ├── api/
│   │   │   │   └── profileApi.ts
│   │   │   ├── components/
│   │   │   │   ├── ProfileAddressList.vue
│   │   │   │   ├── ProfileFavoritesList.vue
│   │   │   │   ├── ProfileHistoryList.vue
│   │   │   │   ├── ProfileInfoForm.vue
│   │   │   │   ├── ProfileMyContents.vue
│   │   │   │   ├── ProfileMyShop.vue
│   │   │   │   ├── ProfileOrdersList.vue
│   │   │   │   └── ProfileSidebar.vue
│   │   │   └── views/
│   │   │       └── ProfileView.vue
│   │   └── shops/
│   │       ├── api/
│   │       │   ├── index.ts
│   │       │   ├── productApi.ts
│   │       │   └── shopApi.ts
│   │       ├── components/
│   │       │   ├── ShopCard.vue
│   │       │   ├── ShopCategoryBar.vue
│   │       │   ├── ShopDistrictFilterBar.vue
│   │       │   ├── ShopFeaturedSection.vue
│   │       │   ├── ShopFilterSection.vue
│   │       │   ├── ShopHeroBanner.vue
│   │       │   └── ShopMapView.vue
│   │       ├── detail/
│   │       │   ├── product/
│   │       │   │   ├── components/
│   │       │   │   │   ├── ProductGallery.vue
│   │       │   │   │   ├── ProductInfoPanel.vue
│   │       │   │   │   └── ProductSellerCard.vue
│   │       │   │   └── views/
│   │       │   │       └── ProductDetailView.vue
│   │       │   ├── shop/
│   │       │   │   ├── components/
│   │       │   │   │   ├── ShopDetailAbout.vue
│   │       │   │   │   ├── ShopDetailCampaign.vue
│   │       │   │   │   ├── ShopDetailContents.vue
│   │       │   │   │   ├── ShopDetailGuarantees.vue
│   │       │   │   │   ├── ShopDetailHeader.vue
│   │       │   │   │   ├── ShopDetailHighlights.vue
│   │       │   │   │   ├── ShopDetailInfoBar.vue
│   │       │   │   │   ├── ShopDetailMapCard.vue
│   │       │   │   │   ├── ShopDetailMobileBar.vue
│   │       │   │   │   ├── ShopDetailNearbyShops.vue
│   │       │   │   │   ├── ShopDetailProducts.vue
│   │       │   │   │   └── ShopDetailReviews.vue
│   │       │   │   └── views/
│   │       │   │       └── ShopDetailView.vue
│   │       │   ├── shop-contents/
│   │       │   │   └── views/
│   │       │   │       └── ShopContentsView.vue
│   │       │   └── shop-products/
│   │       │       └── views/
│   │       │           └── ShopProductsView.vue
│   │       ├── list/
│   │       │   ├── components/
│   │       │   │   ├── ShopCardItem.vue
│   │       │   │   ├── ShopListFeaturedSection.vue
│   │       │   │   ├── ShopListSidebarFilter.vue
│   │       │   │   ├── ShopMapTopFilter.vue
│   │       │   │   └── ShopMerchantCtaBanner.vue
│   │       │   └── views/
│   │       │       └── ShopListView.vue
│   │       └── shared/
│   │           └── types/
│   │               ├── product.ts
│   │               └── shop.ts
│   ├── plugins/
│   │   ├── confirmState.ts
│   │   ├── sweetalert.ts
│   │   └── vuetify.ts
│   ├── router/
│   │   └── index.ts
│   ├── shared/
│   │   ├── api/
│   │   │   └── http.ts
│   │   ├── components/
│   │   │   ├── AppDateRangeFilter.vue
│   │   │   ├── AppDisplayToolbar.vue
│   │   │   ├── AppEmptyState.vue
│   │   │   ├── AppPageHeader.vue
│   │   │   ├── AppPagination.vue
│   │   │   └── AppStatCard.vue
│   │   ├── composables/
│   │   │   ├── useDealCountdown.ts
│   │   │   ├── useLocations.ts
│   │   │   ├── useModal.ts
│   │   │   └── usePagination.ts
│   │   ├── interface/
│   │   │   └── PagedResult.ts
│   │   └── utils/
│   │       ├── formatDate.ts
│   │       ├── imageUrl.ts
│   │       ├── productDeal.ts
│   │       └── youtube.ts
│   ├── stores/
│   │   └── cart.ts
│   ├── types/
│   │   └── sweetalert.d.ts
│   ├── views/
│   │   ├── Footer.vue
│   │   ├── HomeView.vue
│   │   └── Navbar.vue
│   ├── App.vue
│   ├── main.ts
│   └── SKILL.md
├── .env
├── .gitignore
├── .prettierrc.json
├── env.d.ts
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
