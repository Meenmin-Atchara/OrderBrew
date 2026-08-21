'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coffee, ShoppingBag, Trash2, ChefHat, User, X, QrCode, CheckCircle, Plus, Minus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ToppingOption {
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  unitPrice: number; // ราคาต่อชิ้น (บวกท็อปปิ้งแล้ว)
  quantity: number;
  sweetness: string;
  toppings: string[];
}

// ใช้รูปภาพจำลองสไตล์น่ารักๆ หรือใส่ path รูปจริงได้ที่ property image
const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'ชาไทยเย็น', price: 45, image: '🧋' },
  { id: 'm2', name: 'ชาเขียวเย็น', price: 45, image: '🍵' },
  { id: 'm3', name: 'อเมริกาโน่เย็น', price: 50, image: '☕' },
  { id: 'm4', name: 'นมสดคาราเมล', price: 40, image: '🥛' },
  { id: 'm5', name: 'เอสเพรสโซ่เย็น', price: 50, image: '☕' },
  { id: 'm6', name: 'โกโก้เย็น', price: 50, image: '🍫' },
];

const TOPPING_OPTIONS: ToppingOption[] = [
  { name: 'ไข่มุก', price: 10 },
  { name: 'พุดดิ้ง', price: 10 },
  { name: 'วิปครีม', price: 15 },
];

const SWEETNESS_OPTIONS = ['100%', '75%', '50%', '25%', '0%'];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [nameError, setNameError] = useState<boolean>(false);

  // Modal State
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [modalSweetness, setModalSweetness] = useState<string>('50%');
  const [modalToppings, setModalToppings] = useState<string[]>([]);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // เปิด Modal เลือกตัวเลือก
  const handleOpenMenuModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setModalSweetness('50%');
    setModalToppings([]);
    setModalQuantity(1);
  };

  const toggleModalTopping = (toppingName: string) => {
    setModalToppings((prev) =>
      prev.includes(toppingName)
        ? prev.filter((t) => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  // ใส่ตะกร้าจาก Pop-up (ถ้ารายการเหมือนกันเป๊ะจะรวมจำนวนให้อัตโนมัติ)
  const handleAddToCart = () => {
    if (!selectedMenu) return;

    const extraPrice = modalToppings.reduce((sum, tName) => {
      const found = TOPPING_OPTIONS.find((t) => t.name === tName);
      return sum + (found ? found.price : 0);
    }, 0);

    const unitPrice = selectedMenu.price + extraPrice;
    const sortedToppings = [...modalToppings].sort().join(',');

    setCart((prevCart) => {
      // เช็กว่ามีรายการเมนู ความหวาน และท็อปปิ้งเหมือนกันเป๊ะอยู่แล้วหรือไม่
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.menuId === selectedMenu.id &&
          item.sweetness === modalSweetness &&
          [...item.toppings].sort().join(',') === sortedToppings
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += modalQuantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${selectedMenu.id}-${Date.now()}`,
          menuId: selectedMenu.id,
          name: selectedMenu.name,
          unitPrice: unitPrice,
          quantity: modalQuantity,
          sweetness: modalSweetness,
          toppings: [...modalToppings],
        };
        return [...prevCart, newItem];
      }
    });

    setSelectedMenu(null);
  };

  // ปรับจำนวน (+ / -) ในตะกร้า
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

  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      setNameError(true);
      return;
    }

    setNameError(false);
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const savedOrdersStr = localStorage.getItem('orderbrew_orders');
    const existingOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];

    const nextOrderNum = existingOrders.length + 1;
    const newOrderId = `ORD-${String(nextOrderNum).padStart(3, '0')}`;

    const newOrder = {
      id: newOrderId,
      customerName: customerName.trim(),
      date: todayStr,
      time: timeStr,
      items: cart.map((c) => ({
        name: c.name,
        sweetness: c.sweetness,
        toppings: c.toppings,
        quantity: c.quantity,
        price: c.unitPrice * c.quantity,
      })),
      total: totalPrice,
      status: 'pending',
    };

    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem('orderbrew_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));

    setCart([]);
    setCustomerName('');
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-gray-800">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2.5 rounded-xl text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">OrderBrew</h1>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* เลือกเครื่องดื่ม */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-gray-800">เลือกเครื่องดื่ม</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenMenuModal(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between items-center text-center space-y-3"
              >
                {/* แสดงรูปไอคอน/รูปจริง */}
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl shadow-inner">
                  {item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    item.image
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <p className="font-extrabold text-amber-600 text-sm mt-1">{item.price} ฿</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ตะกร้าของคุณ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                ตะกร้าของคุณ
              </h2>
            </div>

            {/* ช่องกรอกชื่อลูกค้า */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> ชื่อผู้สั่ง / ลูกค้า <span className="text-red-500">*</span>
                </span>
                {nameError && <span className="text-[10px] text-red-500 font-normal">กรุณาระบุชื่อก่อนสั่งซื้อ</span>}
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อลูกค้า (จำเป็น)"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (e.target.value.trim()) setNameError(false);
                }}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                  nameError
                    ? 'border-red-400 bg-red-50 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-amber-500'
                }`}
              />
            </div>

            {/* รายการสินค้าในตะกร้า */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="border-b pb-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-500">
                          หวาน {item.sweetness} {item.toppings.length > 0 && `+ ${item.toppings.join(', ')}`}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <p className="font-extrabold text-amber-600 text-xs">
                        {item.unitPrice * item.quantity} ฿
                      </p>

                      {/* ปุ่ม - / + จำนวน */}
                      <div className="flex items-center border border-amber-200 bg-amber-50/50 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-amber-100 rounded-l-lg text-amber-800 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-amber-100 rounded-r-lg text-amber-800 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="flex justify-between items-center font-bold text-base">
              <span>ราคารวมทั้งหมด:</span>
              <span className="text-amber-600 text-xl font-extrabold">{totalPrice} ฿</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={cart.length === 0}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              ชำระเงิน (PromptPay)
            </button>
          </div>
        </div>
      </main>

      {/* ----------------- Pop-up Modal 1: เลือกตัวเลือกเครื่องดื่ม ----------------- */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">{selectedMenu.name}</h3>
              <button
                onClick={() => setSelectedMenu(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ระดับความหวาน */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">ระดับความหวาน</label>
              <div className="grid grid-cols-5 gap-1.5">
                {SWEETNESS_OPTIONS.map((sw) => (
                  <button
                    key={sw}
                    onClick={() => setModalSweetness(sw)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                      modalSweetness === sw
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-gray-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>

            {/* ท็อปปิ้ง */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">ท็อปปิ้ง</label>
              <div className="space-y-2">
                {TOPPING_OPTIONS.map((top) => {
                  const isChecked = modalToppings.includes(top.name);
                  return (
                    <div
                      key={top.name}
                      onClick={() => toggleModalTopping(top.name)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-amber-600 rounded"
                        />
                        <span>{top.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">+{top.price} ฿</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ปุ่มปรับจำนวนก่อนใส่ตะกร้า */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-gray-700">จำนวน</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-slate-200 text-gray-600 font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-gray-800">{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity((q) => q + 1)}
                  className="px-3 py-1.5 hover:bg-slate-200 text-gray-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* ปุ่มใส่ตะกร้า / ยกเลิก */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedMenu(null)}
                className="flex-1 py-2.5 border border-slate-300 text-gray-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition"
              >
                ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Pop-up Modal 2: สแกนเพื่อชำระเงิน ----------------- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="font-bold text-lg text-gray-800">สแกนเพื่อชำระเงิน</h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
              <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-inner inline-block">
                <QrCode className="w-48 h-48 text-gray-800 mx-auto" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-amber-600">{totalPrice} ฿</p>
              <p className="text-xs text-gray-400 mt-1">รองรับแอปพลิเคชันธนาคารทุกประเภท</p>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle className="w-5 h-5" />
              เสร็จสิ้นการสั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}