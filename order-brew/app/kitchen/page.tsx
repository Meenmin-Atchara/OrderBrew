"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowLeft, BarChart2, CheckCircle2, Clock, Coffee } from "lucide-react";
import Link from "next/link";

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(savedOrders);
    } catch (e) {
      console.error("Failed to parse orders", e);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener("storage", loadOrders);
    return () => window.removeEventListener("storage", loadOrders);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // เช็ค Status แบบไม่สนตัวพิมพ์ใหญ่-เล็ก และรองรับสถานะที่หลากหลาย
  const pendingOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "pending" || o.status === "รอชง"
  );
  const preparingOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "preparing" || o.status === "กำลังชง"
  );
  const completedOrders = orders.filter(
    (o) =>
      o.status?.toLowerCase() === "completed" ||
      o.status?.toLowerCase() === "served" ||
      o.status === "เสร็จสิ้น" ||
      o.status === "เสิร์ฟแล้ว"
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2.5 rounded-xl">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ระบบจัดการหลังบ้าน (Kitchen Queue)</h1>
              <p className="text-xs text-slate-500">จัดการคิวเครื่องดื่ม OrderBrew</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" /> รีเฟรชข้อมูล
            </button>
            <Link
              href="/sales"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold"
            >
              <BarChart2 className="w-4 h-4" /> รายงานยอดขาย
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> หน้าร้าน
            </Link>
          </div>
        </header>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="bg-amber-100/80 border border-amber-300 p-3.5 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" /> รอชง (Pending)
              </span>
              <span className="bg-amber-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {pendingOrders.length}
              </span>
            </div>
            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-dashed">
                ไม่มีออเดอร์รอชง
              </div>
            ) : (
              pendingOrders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-2xl shadow-sm border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-400">{o.id}</span>
                    <span className="font-bold text-amber-700 text-sm">{o.customerName || o.customer || "หน้าร้าน"}</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700 border-y py-2">
                    {o.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>
                          {item.name} {item.sweetness ? `(${item.sweetness})` : ""}
                        </span>
                        <span className="font-semibold text-slate-500">x{item.quantity || 1}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(o.id, "preparing")}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    เริ่มชง
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Preparing Column */}
          <div className="space-y-4">
            <div className="bg-blue-100/80 border border-blue-300 p-3.5 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                กำลังชง (Preparing)
              </span>
              <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {preparingOrders.length}
              </span>
            </div>
            {preparingOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-dashed">
                ไม่มีออเดอร์กำลังชง
              </div>
            ) : (
              preparingOrders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-2xl shadow-sm border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-400">{o.id}</span>
                    <span className="font-bold text-blue-700 text-sm">{o.customerName || o.customer || "หน้าร้าน"}</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700 border-y py-2">
                    {o.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>
                          {item.name} {item.sweetness ? `(${item.sweetness})` : ""}
                        </span>
                        <span className="font-semibold text-slate-500">x{item.quantity || 1}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(o.id, "completed")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    ชงเสร็จแล้ว (เสิร์ฟ)
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Completed Column */}
          <div className="space-y-4">
            <div className="bg-emerald-100/80 border border-emerald-300 p-3.5 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" /> เสร็จสิ้น (Completed)
              </span>
              <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {completedOrders.length}
              </span>
            </div>
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-dashed">
                ยังไม่มีรายการที่เสร็จสิ้น
              </div>
            ) : (
              completedOrders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-2xl shadow-sm border opacity-90 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-500">{o.id}</span>
                    <span className="text-emerald-600 text-xs font-bold">เสิร์ฟแล้ว</span>
                  </div>
                  <div className="text-xs text-slate-600 pt-1 border-t">
                    {o.items
                      ?.map((i: any) => `${i.name} x${i.quantity || 1}`)
                      .join(", ")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}