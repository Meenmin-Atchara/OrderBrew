# ☕ OrderBrew - ระบบรับออเดอร์และจัดการคิวร้านเครื่องดื่ม
> **POS & Kitchen Management System**

OrderBrew คือเว็บแอปพลิเคชันสำหรับบริหารจัดการออเดอร์ร้านเครื่องดื่มและกาแฟ ออกแบบมาเพื่อช่วยให้การรับออเดอร์หน้าร้าน การจัดคิวในครัว และการสรุปยอดขายทำได้อย่างรวดเร็ว แม่นยำ และเป็นระบบ

---

## 🚀 ฟีเจอร์หลัก (Key Features)

* **🛒ระบบรับออเดอร์หน้าร้าน (Point of Sale - POS)**
* เลือกเมนูเครื่องดื่ม ปรับแต่งระดับความหวาน (0% - 100%) และเลือกท็อปปิ้งเพิ่มเติมได้
* ระบุหมายเหตุเพิ่มเติม (เช่น แยกน้ำแข็ง, หวานน้อยพิเศษ)
* ปรับเพิ่ม/ลด จำนวนสินค้า และคำนวณราคารวมอัตโนมัติ
* ระบบตรวจสอบข้อมูล (แจ้งเตือนให้ระบุชื่อลูกค้าก่อนชำระเงิน)
* รองรับการชำระเงินผ่าน **PromptPay QR Code**

* **👨‍🍳 ระบบจัดการคิวหลังบ้าน (Kitchen Queue Display)**
* แสดงรายการออเดอร์ที่เข้ามาแบบ Real-time
* แสดงรายละเอียดการปรับแต่งของแต่ละแก้วอย่างชัดเจน
* อัปเดตสถานะออเดอร์ (กำลังปรุง /เสร็จสิ้น / ยกเลิก)

* **📊 ระบบสรุปยอดขาย (Sales Dashboard)**
* รวบรวมประวัติการสั่งซื้อและสรุปรายได้รวม
* แสดงสถิติและข้อมูลออเดอร์ที่สำเร็จแล้ว

---

## 🛠️เทคโนโลยีที่ใช้ (Tech Stack)

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State & Storage:** React State & `localStorage` (Event Driven)

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   
2. **Run Development Server**
   ```bash
   npm run dev

เปิดเบราว์เซอร์แล้วเข้าไปที่ http://localhost:3000 เพื่อทดสอบใช้งานระบบ
