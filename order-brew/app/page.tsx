'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, ShoppingBag, Plus, Minus, Trash2, CheckCircle, ChefHat, User } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  sweetness: string;
  toppings: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'ชาไทยเย็น', price: 50, category: 'ชา' },
  { id: 'm2', name: 'ชาเขียวเย็น', price: 50, category: 'ชา' },
  { id: 'm3', name: 'เอสเพรสโซ่เย็น', price: 50, category: 'กาแฟ' },
  { id: 'm4', name: 'อเมริกาโน่เย็น', price: 45, category: 'กาแฟ' },
  { id: 'm5', name: 'ลาเต้เย็น', price: 55, category: 'กาแฟ' },
  { id: 'm6', name: 'โกโก้เย็น', price: 50, category: 'ทางเลือก' },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedSweetness, setSelectedSweetness] = useState<string>('100%');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState<boolean>(false);

  // เพิ่มสินค้าเข้าตะกร้า
  const addToCart = (item: MenuItem) => {
    const toppingPrice = selectedToppings.length * 10;
    const finalPrice = item.price + toppingPrice;
    
    const newItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuId: item.id,
      name: item.name,
      price: finalPrice,
      quantity: 1,
      sweetness: selectedSweetness,
      toppings: [...selectedToppings],
    };

    setCart((prev) => [...prev, newItem]);
    // รีเซ็ตตัวเลือกท็อปปิ้ง
    setSelectedToppings([]);
    setSelectedSweetness('100%');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ฟังก์ชันกดยืนยันชำระเงิน -> บันทึกลง localStorage เพื่อส่งไปหลังบ้าน
  const handleConfirmPayment = () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกรายการสินค้าในตะกร้าก่อนครับ');
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // ดึงออเดอร์เดิมจาก LocalStorage
    const savedOrdersStr = localStorage.getItem('orderbrew_orders');
    const existingOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];

    // รัน ID ออเดอร์ใหม่
    const nextOrderNum = existingOrders.length + 1;
    const newOrderId = `ORD-${String(nextOrderNum).padStart(3, '0')}`;

    const newOrder = {
      id: newOrderId,
      customerName: customerName.trim() || 'หน้าร้าน',
      date: todayStr,
      time: timeStr,
      items: cart.map((c) => ({
        name: c.name,
        sweetness: c.sweetness,
        toppings: c.toppings,
        quantity: c.quantity,
        price: c.price,
      })),
      total: totalPrice,
      status: 'pending', // ส่งไปสถานะ 'รอชง'
    };

    // บันทึกลง localStorage
    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem('orderbrew_orders', JSON.stringify(updatedOrders));

    // ส่ง Trigger แจ้งเตือน Tab อื่นๆ
    window.dispatchEvent(new Event('storage'));

    // ล้างหน้าจอหลังบันทึกเสร็จ
    setCart([]);
    setCustomerName('');
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping]
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-gray-800">
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2.5 rounded-xl text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">OrderBrew - หน้าร้าน</h1>
            <p className="text-xs text-gray-500">ระบบรับออเดอร์เครื่องดื่ม</p>
          </div>
        </div>

        <Link
          href="/kitchen"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <ChefHat className="w-4 h-4" />
          ระบบหลังบ้าน (Kitchen Queue)
        </Link>
      </header>

      {showCheckoutSuccess && (
        <div className="max-w-6xl mx-auto mb-4 bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            บันทึกและส่งออเดอร์ไปหลังบ้านเรียบร้อยแล้ว!
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* เมนูเครื่องดื่ม */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2">1. ตัวเลือกเครื่องดื่ม (ระดับความหวาน & ท็อปปิ้ง)</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="font-semibold mr-2">หวาน:</span>
                {['100%', '50%', '0%'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSweetness(s)}
                    className={`px-2.5 py-1 rounded-lg mr-1 border transition font-medium ${
                      selectedSweetness === s
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-gray-600 border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div>
                <span className="font-semibold mr-2">ท็อปปิ้ง (+10฿):</span>
                {['ไข่มุก', 'วิปครีม'].map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTopping(t)}
                    className={`px-2.5 py-1 rounded-lg mr-1 border transition font-medium ${
                      selectedToppings.includes(t)
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-50 text-gray-600 border-slate-200'
                    }`}
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-gray-800 mt-2 text-sm">{item.name}</h3>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-extrabold text-amber-600 text-sm">฿{item.price}</span>
                  <button className="bg-amber-50 text-amber-700 p-1.5 rounded-lg border border-amber-200 hover:bg-amber-600 hover:text-white transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ตะกร้าสินค้า & ชำระเงิน */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                รายการสั่งซื้อ
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {cart.length} รายการ
              </span>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> ชื่อลูกค้า (ระบุได้):
              </label>
              <input
                type="text"
                placeholder="เช่น คุณเมย์, โต๊ะ 1"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b pb-2">
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-500">
                        หวาน {item.sweetness} {item.toppings.length > 0 && `+ ${item.toppings.join(', ')}`}
                      </p>
                      <p className="font-semibold text-amber-600 mt-0.5">฿{item.price * item.quantity}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-200 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-200 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="flex justify-between items-center font-bold text-base">
              <span>ยอดรวมทั้งสิ้น:</span>
              <span className="text-amber-600 text-xl">฿{totalPrice}</span>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition shadow-sm"
            >
              ยืนยันชำระเงิน & ส่งเข้าครัว
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}