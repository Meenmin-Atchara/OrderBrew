'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Trash2, Coffee, CheckCircle2 } from 'lucide-react';

interface Menu {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

const MENU_ITEMS: Menu[] = [
  { id: '1', name: 'ชาไทยเย็น', price: 45, category: 'ชา', image: '🧋' },
  { id: '2', name: 'ชาเขียวเย็น', price: 45, category: 'ชา', image: '🍵' },
  { id: '3', name: 'เอสเพรสโซ่เย็น', price: 50, category: 'กาแฟ', image: '☕' },
  { id: '4', name: 'อเมริกาโน่เย็น', price: 50, category: 'กาแฟ', image: '☕' },
  { id: '5', name: 'นมสดคาราเมล', price: 40, category: 'นม', image: '🥛' },
];

const SWEETNESS_LEVELS = ['100%', '75%', '50%', '25%', '0%'];
const TOPPINGS = [
  { name: 'ไข่มุก', price: 10 },
  { name: 'พุดดิ้ง', price: 10 },
  { name: 'วิปครีม', price: 15 },
];

export default function Home() {
  const { items, addToCart, removeFromCart, clearCart, getTotalPrice } = useCartStore();

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [sweetness, setSweetness] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const handleOpenModal = (menu: Menu) => {
    setSelectedMenu(menu);
    setSweetness('100%');
    setSelectedToppings([]);
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;
    
    const toppingPrice = selectedToppings.reduce((sum, tName) => {
      const found = TOPPINGS.find((t) => t.name === tName);
      return sum + (found ? found.price : 0);
    }, 0);

    addToCart({
      name: selectedMenu.name,
      price: selectedMenu.price + toppingPrice,
      sweetness,
      toppings: selectedToppings,
      quantity: 1,
    });

    setSelectedMenu(null);
  };

  const handleGenerateQR = async () => {
    const total = getTotalPrice();
    if (total <= 0) return;

    setLoadingQr(true);
    try {
      const res = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();
      if (data.qrImage) {
        setQrCode(data.qrImage);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง QR Code');
    } finally {
      setLoadingQr(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/50 p-6 font-sans text-gray-800">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Coffee className="w-8 h-8 text-amber-600" />
          <h1 className="text-2xl font-bold text-amber-900">OrderBrew</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* รายการเมนู */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">เลือกเครื่องดื่ม</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenModal(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-2">{item.image}</div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-amber-600 font-bold mt-1">{item.price} ฿</div>
              </div>
            ))}
          </div>
        </div>

        {/* ตะกร้าสินค้า */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 h-fit">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold">ตะกร้าของคุณ</h2>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-8">ยังไม่มีรายการในตะกร้า</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b pb-3 text-sm">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      หวาน {item.sweetness}
                      {item.toppings.length > 0 && ` + ${item.toppings.join(', ')}`}
                    </div>
                    <div className="text-amber-600 font-semibold mt-1">
                      {item.price} ฿ x {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t font-bold text-lg flex justify-between">
                <span>ราคารวมทั้งหมด:</span>
                <span className="text-amber-600">{getTotalPrice()} ฿</span>
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={loadingQr}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition disabled:bg-gray-300"
              >
                {loadingQr ? 'กำลังสร้าง QR Code...' : 'ชำระเงิน (PromptPay)'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal เลือกระดับความหวาน + ท็อปปิ้ง */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-lg border-b pb-2">{selectedMenu.name}</h3>
            
            <div>
              <label className="text-sm font-semibold block mb-2">ระดับความหวาน</label>
              <div className="grid grid-cols-5 gap-1">
                {SWEETNESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSweetness(level)}
                    className={`py-1 text-xs rounded-lg border ${
                      sweetness === level
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-gray-200 hover:bg-amber-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">ท็อปปิ้ง</label>
              <div className="space-y-2">
                {TOPPINGS.map((topping) => (
                  <label key={topping.name} className="flex items-center justify-between text-sm cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedToppings.includes(topping.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedToppings([...selectedToppings, topping.name]);
                          } else {
                            setSelectedToppings(selectedToppings.filter((t) => t !== topping.name));
                          }
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>{topping.name}</span>
                    </div>
                    <span className="text-gray-500">+{topping.price} ฿</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setSelectedMenu(null)}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm"
              >
                ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code ชำระเงิน */}
      {qrCode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">สแกนเพื่อชำระเงิน</h3>
            <div className="bg-white p-2 inline-block border rounded-xl shadow-inner">
              <img src={qrCode} alt="PromptPay QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{getTotalPrice()} ฿</div>
            <p className="text-xs text-gray-400">รองรับแอปพลิเคชันธนาคารทุกประเภท</p>
            <button
              onClick={() => {
                setQrCode(null);
                clearCart();
                alert('ชำระเงินสำเร็จ! ขอบคุณครับ');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              เสร็จสิ้นการสั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}