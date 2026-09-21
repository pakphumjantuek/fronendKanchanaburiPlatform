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
    "endsAt": "2026-09-22T14:00:00"
  }
}
```

ราคาดีล: `Percent` = `price * (1 - discountValue / 100)`, `FixedAmount` = `price - discountValue` ใช้เพื่อแสดงผลเท่านั้น

## ตะกร้าและ Checkout

`GET /cart` ส่งราคาที่ Backend คำนวณแล้วต่อรายการ:

- `originalPrice` ราคาปกติ
- `unitPrice` ราคาหลังลดหรือราคาปกติ
- `dealType`, `dealDiscountValue`, `dealEndsAt` เมื่อมีดีล

Flutter ต้องใช้ `unitPrice` และ `subtotal` จาก API เป็นยอดแสดงผลเสมอ ห้ามส่งราคาจากแอปไปตัดสินยอดซื้อ

เมื่อ checkout ระบบตรวจเวลา, สถานะ, สิทธิ์คงเหลือ และคำนวณราคาอีกครั้ง จากนั้นเพิ่ม `usedQuantity` ใน transaction เดียวกัน หากสิทธิ์ถูกใช้พร้อมกันจนไม่พอ API จะตอบข้อผิดพลาด ให้โหลดตะกร้าใหม่และแจ้งผู้ใช้
