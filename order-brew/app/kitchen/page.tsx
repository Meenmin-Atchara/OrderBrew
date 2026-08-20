'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Clock, CheckCircle2, ShoppingBag, ArrowLeft, Calendar, BarChart3, User } from 'lucide-react';

interface OrderItem {
  name: string;
  sweetness: string;
  toppings: string[];
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  time: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed';
}

export default function KitchenPage() {
  const [todayStr, setTodayStr] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;
    setTodayStr(today);

    setFormattedDate(
      now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    );

    // ดึงข้อมูลออเดอร์ทั้งหมดจาก LocalStorage
    const savedOrders = localStorage.getItem('orderbrew_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Mock Data ตั้งต้นสำหรับทดสอบระบบ
      const initialOrders: Order[] = [
        {
          id: 'ORD-001',
          customerName: 'คุณเมย์',
          date: today,
          time: '14:20',
          total: 115,
          status: 'pending',
          items: [
            { name: 'ชาไทยเย็น', sweetness: '50%', toppings: ['ไข่มุก'], quantity: 1, price: 55 },
            { name: 'ชาเขียวเย็น', sweetness: '50%', toppings: ['วิปครีม'], quantity: 1, price: 60 },
          ],
        },
        {
          id: 'ORD-002',
          customerName: 'คุณเอ',
          date: today,
          time: '14:22',
          total: 50,
          status: 'preparing',
          items: [
            { name: 'เอสเพรสโซ่เย็น', sweetness: '100%', toppings: [], quantity: 1, price: 50 },
          ],
        },
      ];
      setOrders(initialOrders);
      localStorage.setItem('orderbrew_orders', JSON.stringify(initialOrders));
    }
  }, []);

  const updateStatus = (orderId: string, nextStatus: Order['status']) => {
    const updated = orders.map((ord) =>
      ord.id === orderId ? { ...ord, status: nextStatus } : ord
    );
    setOrders(updated);
    localStorage.setItem('orderbrew_orders', JSON.stringify(updated));
  };

  // กรองแสดงเฉพาะออเดอร์ของวันนี้
  const todayOrders = orders.filter((o) => o.date === todayStr);

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-gray-800">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2.5 rounded-xl text-white shadow-sm">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ระบบจัดการหลังบ้าน (Kitchen Queue)</h1>
            <p className="text-xs text-gray-500">จัดการคิวเครื่องดื่ม OrderBrew</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-2 rounded-xl border border-amber-200 text-xs font-bold">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>{formattedDate || 'กำลังโหลด...'}</span>
          </div>

          <Link
            href="/sales"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition border border-slate-300"
          >
            <BarChart3 className="w-4 h-4 text-slate-600" />
            รายงานยอดขาย
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition border border-amber-300"
          >
            <ArrowLeft className="w-4 h-4" />
            หน้าร้าน
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* รอชง */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-100 p-3 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4" /> รอชง (Pending)
            </span>
            <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {todayOrders.filter((o) => o.status === 'pending').length}
            </span>
          </div>

          {todayOrders.filter((o) => o.status === 'pending').map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-bold text-gray-800 mr-2">{order.id}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                    <User className="w-3 h-3" /> {order.customerName}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{order.time} น.</span>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-semibold text-gray-800">{item.name} x {item.quantity}</div>
                    <div className="text-xs text-gray-500">
                      หวาน {item.sweetness} {item.toppings.length > 0 && `+ ${item.toppings.join(', ')}`}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateStatus(order.id, 'preparing')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm transition"
              >
                เริ่มชงเครื่องดื่ม
              </button>
            </div>
          ))}
        </div>

        {/* กำลังชง */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-100 p-3 rounded-xl border border-blue-200">
            <span className="font-bold text-blue-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> กำลังชง (Preparing)
            </span>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {todayOrders.filter((o) => o.status === 'preparing').length}
            </span>
          </div>

          {todayOrders.filter((o) => o.status === 'preparing').map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-bold text-gray-800 mr-2">{order.id}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                    <User className="w-3 h-3" /> {order.customerName}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{order.time} น.</span>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-semibold text-gray-800">{item.name} x {item.quantity}</div>
                    <div className="text-xs text-gray-500">
                      หวาน {item.sweetness} {item.toppings.length > 0 && `+ ${item.toppings.join(', ')}`}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateStatus(order.id, 'completed')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition"
              >
                ชงเสร็จแล้ว (พร้อมเสิร์ฟ)
              </button>
            </div>
          ))}
        </div>

        {/* เสร็จสิ้น */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-100 p-3 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> เสร็จสิ้น (Completed)
            </span>
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {todayOrders.filter((o) => o.status === 'completed').length}
            </span>
          </div>

          {todayOrders.filter((o) => o.status === 'completed').map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-gray-700">{order.id}</span>
                <span className="text-xs text-emerald-600 font-semibold">เสิร์ฟแล้ว</span>
              </div>
              <div className="text-xs text-gray-500">
                {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}