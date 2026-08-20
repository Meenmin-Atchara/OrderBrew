'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coffee, Clock, CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react';

interface OrderItem {
  name: string;
  sweetness: string;
  toppings: string[];
  quantity: number;
}

interface Order {
  id: string;
  time: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed';
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    time: '14:20',
    total: 115,
    status: 'pending',
    items: [
      { name: 'ชาไทยเย็น', sweetness: '50%', toppings: ['ไข่มุก'], quantity: 1 },
      { name: 'ชาเขียวเย็น', sweetness: '50%', toppings: ['วิปครีม'], quantity: 1 },
    ],
  },
  {
    id: 'ORD-002',
    time: '14:22',
    total: 50,
    status: 'preparing',
    items: [
      { name: 'เอสเพรสโซ่เย็น', sweetness: '100%', toppings: [], quantity: 1 },
    ],
  },
];

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const updateStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-gray-800">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-xl text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ระบบจัดการหลังบ้าน (Kitchen Queue)</h1>
            <p className="text-xs text-gray-500">จัดการคิวเครื่องดื่ม OrderBrew</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition border border-amber-200"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าร้าน
        </Link>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-100 p-3 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4" /> รอชง (Pending)
            </span>
            <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {orders.filter((o) => o.status === 'pending').length}
            </span>
          </div>

          {orders
            .filter((o) => o.status === 'pending')
            .map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-gray-800">{order.id}</span>
                  <span className="text-xs text-gray-400">{order.time} น.</span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-semibold text-gray-800">
                        {item.name} x {item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        หวาน {item.sweetness}
                        {item.toppings.length > 0 && ` + ${item.toppings.join(', ')}`}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition"
                >
                  เริ่มชงเครื่องดื่ม
                </button>
              </div>
            ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-100 p-3 rounded-xl border border-blue-200">
            <span className="font-bold text-blue-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> กำลังชง (Preparing)
            </span>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {orders.filter((o) => o.status === 'preparing').length}
            </span>
          </div>

          {orders
            .filter((o) => o.status === 'preparing')
            .map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-gray-800">{order.id}</span>
                  <span className="text-xs text-gray-400">{order.time} น.</span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-semibold text-gray-800">
                        {item.name} x {item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        หวาน {item.sweetness}
                        {item.toppings.length > 0 && ` + ${item.toppings.join(', ')}`}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition"
                >
                  ชงเสร็จแล้ว (พร้อมเสิร์ฟ)
                </button>
              </div>
            ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-100 p-3 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> เสร็จสิ้น (Completed)
            </span>
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {orders.filter((o) => o.status === 'completed').length}
            </span>
          </div>

          {orders
            .filter((o) => o.status === 'completed')
            .map((order) => (
              <div key={order.id} className="bg-white/70 p-4 rounded-xl border border-emerald-200 space-y-2 opacity-75">
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