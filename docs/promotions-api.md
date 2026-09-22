# ระบบโปรโมชันสินค้า (Flutter API Guide)

เอกสารสำหรับ Flutter ใช้ API ชุดเดียวกับเว็บ โดย base URL คือ `.../api` และทุกเส้นจัดการโปรโมชันต้องส่ง Bearer token ของเจ้าของร้าน

## คำเรียกที่แสดงในแอป

| ค่า API | ข้อความภาษาไทย |
| --- | --- |
| `FlashDeal` | โปรโมชันพิเศษ |
| `LocalDeal` | โปรเด็ดชุมชน |
| `Active` | กำลังใช้งาน |
| `Stopped` | หยุดดีลแล้ว |
| `Expired` | หมดเวลาแล้ว |

## ดูโปรโมชันของสินค้า (Merchant)

`GET /product-deals/products/{productId}`

ใช้เฉพาะสินค้าที่ร้านเป็นเจ้าของ ผลลัพธ์เป็นรายการดีลของสินค้านั้น

```json
[
  {
    "productDealId": "guid",
    "productId": "guid",
    "dealType": "FlashDeal",
    "discountType": "Percent",
    "discountValue": 20,
    "totalQuantity": 20,
    "usedQuantity": 3,
    "remainingQuantity": 17,
    "startsAt": "2026-09-21T14:00:00",
    "endsAt": "2026-09-22T14:00:00",
    "status": "Active"
  }
]
```

> วันเวลาจาก API ให้ Flutter ตีความเป็น UTC หากไม่มี suffix timezone แล้วแสดงผลเป็นเวลาไทย UTC+7

## สร้างโปรโมชัน (Merchant)

`POST /product-deals/products/{productId}`

```json
{
  "dealType": "FlashDeal",
  "discountType": "Percent",
  "discountValue": 20,
  "totalQuantity": 20,
  "startsAt": "2026-09-21T14:00:00Z",
  "endsAt": "2026-09-22T14:00:00Z"
}
```

- `discountType`: `Percent` หรือ `FixedAmount`
- ส่วนลดต้องมากกว่า 0; เปอร์เซ็นต์ต้องน้อยกว่า 100; ลดบาทต้องน้อยกว่าราคาสินค้า
- เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม
- สิทธิ์ดีลที่ยังเหลือรวมกับดีลอื่นของสินค้านั้น ต้องไม่เกินสต็อกสินค้าปัจจุบัน
- จำนวนสิทธิ์ทั้งหมดต้องไม่น้อยกว่าจำนวนที่ลูกค้าใช้ไปแล้ว

## แก้ไข / หยุดโปรโมชัน

- `PUT /product-deals/{dealId}` ใช้ request body แบบเดียวกับสร้าง
- `PATCH /product-deals/{dealId}/stop` หยุดดีล (ไม่มี body)

## ข้อมูลดีลใน API สินค้าสาธารณะ

`GET /products` และ `GET /products/{id}` ส่ง `activeDeal` เมื่อดีล Active, อยู่ในช่วงเวลา และสิทธิ์ยังเหลือ

```json
{
  "productId": "guid",
  "productName": "สินค้า",
  "price": 100,
  "activeDeal": {
    "dealType": "FlashDeal",
    "discountType": "Percent",
    "discountValue": 20,
    "remainingQuantity": 17,
    "availableQuantity": 12,
    "endsAt": "2026-09-22T14:00:00"
  }
}
```

ราคาดีล: `Percent` = `price * (1 - discountValue / 100)`, `FixedAmount` = `price - discountValue` ใช้เพื่อแสดงผลเท่านั้น

- `remainingQuantity` คือสิทธิ์ในดีลที่ยังไม่ได้ใช้
- `availableQuantity` คือจำนวนที่ลูกค้าซื้อด้วยดีลได้จริง: ค่าน้อยสุดระหว่างสต็อกสินค้าและ `remainingQuantity`
- Flutter ต้องใช้ `quantity` หรือ `availableQuantity` ของสินค้าเป็นจำนวนสูงสุดของตัวเลือกจำนวนสินค้า ไม่จำกัดจำนวนเลือกด้วยสิทธิ์ดีล เพราะจำนวนที่เกินสิทธิ์ยังซื้อได้ในราคาปกติ

## สินค้าโปรโมชันพิเศษบนหน้าแรก (Public)

`GET /products/deals/active?limit=12`

ไม่ต้องส่ง token ใช้แสดงส่วน “โปรโมชันพิเศษ” ของหน้าแรก หรือหน้า Discover ใน Flutter โดย `limit` เป็น optional และระบบจำกัดค่าไว้ที่ 1–24 รายการ

API คืนเฉพาะสินค้า/ร้านที่ยัง `Active`, มีสต็อก, ดีลเริ่มแล้ว, ยังไม่เกิน `endsAt` และยังซื้อด้วยสิทธิ์ดีลได้จริง ผลลัพธ์เป็น `ProductDto[]` และมี `shopName` กับ `activeDeal`

```json
[
  {
    "productId": "guid",
    "shopId": "guid",
    "shopName": "ร้านชุมชนตัวอย่าง",
    "productName": "ผ้าทอพื้นเมือง",
    "price": 500,
    "quantity": 2,
    "imageUrl": "/uploads/products/example.jpg",
    "activeDeal": {
      "productDealId": "guid",
      "dealType": "FlashDeal",
      "discountType": "Percent",
      "discountValue": 20,
      "remainingQuantity": 3,
      "availableQuantity": 2,
      "endsAt": "2026-09-22T14:00:00Z"
    }
  }
]
```

แต่ละการ์ดต้องนับถอยหลังจาก `activeDeal.endsAt` ของตัวเอง ไม่ใช้เวลาร่วมกันทั้งรายการ เมื่อเวลาเป็นศูนย์หรือ `availableQuantity` เป็นศูนย์ ให้ซ่อนเฉพาะการ์ดนั้น แล้วโหลด API ใหม่ตามความเหมาะสม

## ตะกร้าและ Checkout

รายละเอียดฟิลด์ `dealQuantity`, `normalQuantity` และการคิดราคากรณีลูกค้าซื้อเกินสิทธิ์ดีล อยู่ที่ [cart-promotion-pricing-api.md](./cart-promotion-pricing-api.md)

## Dashboard วิเคราะห์โปรโมชัน (Merchant)

`GET /shops/mine/dashboard`

ใช้ Bearer token ของเจ้าของร้าน และคืนฟิลด์ `promotionAnalytics` เพิ่มในรายงาน Dashboard เดิม

```json
{
  "promotionAnalytics": {
    "promotionRevenue": 2400,
    "totalDiscountAmount": 360,
    "usedQuantity": 12,
    "activeDealsCount": 2,
    "deals": [
      {
        "productDealId": "guid",
        "productName": "สินค้าตัวอย่าง",
        "dealType": "FlashDeal",
        "usedQuantity": 8,
        "totalQuantity": 20,
        "revenue": 1600,
        "discountAmount": 240,
        "status": "Active"
      }
    ]
  }
}
```

- `promotionRevenue`: ยอดขายที่เกิดจากรายการสินค้าซึ่งใช้โปรโมชันและชำระเงินแล้ว
- `totalDiscountAmount`: มูลค่าส่วนลดรวมจากรายการที่ชำระเงินแล้ว
- `usedQuantity`: จำนวนชิ้นที่ใช้สิทธิ์โปรโมชันแล้ว
- `activeDealsCount`: จำนวนดีลที่มีสถานะ `Active`
- `deals`: รายละเอียดแยกตามดีล ใช้ `dealType` เทียบคำแปลในตารางต้นเอกสาร
