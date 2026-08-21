"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Download, ArrowLeft, DollarSign, ShoppingBag, Calendar, Filter } from "lucide-react";
import Link from "next/link";

export default function SaleReportPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"day" | "month" | "year" | "all">("day");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // YYYY-MM-DD

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(savedOrders);
    } catch (e) {
      console.error("Failed to parse orders", e);
    }
  }, []);

  // ฟังก์ชันแปลง Date string เป็น Object วัน/เดือน/ปี
  const parseOrderDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // กรอง ออเดอร์ตามประเภทการกรอง (วัน / เดือน / ปี)
  const filteredOrders = useMemo(() => {
    if (filterType === "all") return orders;

    const [targetYear, targetMonth, targetDay] = selectedDate.split("-").map(Number);

    return orders.filter((o) => {
      const orderDate = parseOrderDate(o.createdAt);
      const yearMatches = orderDate.getFullYear() === targetYear;
      const monthMatches = orderDate.getMonth() + 1 === targetMonth;
      const dayMatches = orderDate.getDate() === targetDay;

      if (filterType === "day") return yearMatches && monthMatches && dayMatches;
      if (filterType === "month") return yearMatches && monthMatches;
      if (filterType === "year") return yearMatches;
      return true;
    });
  }, [orders, filterType, selectedDate]);

  // คํานวณ สรุปภาพรวม (Dashboard Stats)
  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((sum, o) => {
      return (
        sum +
        (o.items?.reduce((iSum: number, item: any) => iSum + (Number(item.quantity) || 1), 0) || 0)
      );
    }, 0);

    return { totalSales, totalOrders, totalItems };
  }, [filteredOrders]);

  // ฟอร์แมต วันที่/เวลา สำหรับแสดงผลในตาราง
  const formatDateTime = (dateStr: string) => {
    const d = parseOrderDate(dateStr);
    const formattedDate = d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  };

  // ฟังก์ชัน Export CSV
  const exportToCSV = () => {
    const headers = ["Order ID", "Date", "Time", "Customer", "Items", "Total Price", "Status"];

    const rows = filteredOrders.map((o) => {
      const d = parseOrderDate(o.createdAt);
      const dateVal = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
      const timeVal = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

      const itemsStr = o.items
        ? o.items.map((i: any) => `${i.name}${i.sweetness ? `(${i.sweetness})` : ""} x${i.quantity || 1}`).join("; ")
        : "";

      return [
        o.id,
        `\t${dateVal}`,
        `\t${timeVal}`,
        `"${o.customerName || o.customer || "หน้าร้าน"}"`,
        `"${itemsStr}"`,
        o.totalPrice || 0,
        o.status || "completed",
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sales_report_${filterType}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">รายงานยอดขาย</h1>
            <p className="text-xs text-slate-500">สรุปรายการออเดอร์ แดชบอร์ด และการส่งออกข้อมูล</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link
              href="/kitchen"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> กลับหน้าครัว
            </Link>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ยอดขายรวม</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalSales.toLocaleString()} ฿</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">จำนวนออเดอร์</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalOrders} รายการ</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">จำนวนแก้วรวม</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalItems} แก้ว</h3>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">ตัวกรองเวลา:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterType("day")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "day" ? "bg-white text-emerald-600 shadow-sm font-bold" : "text-slate-600"
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => setFilterType("month")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "month" ? "bg-white text-emerald-600 shadow-sm font-bold" : "text-slate-600"
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => setFilterType("year")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "year" ? "bg-white text-emerald-600 shadow-sm font-bold" : "text-slate-600"
                }`}
              >
                รายปี
              </button>
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "all" ? "bg-white text-emerald-600 shadow-sm font-bold" : "text-slate-600"
                }`}
              >
                ทั้งหมด
              </button>
            </div>
          </div>

          {filterType !== "all" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">เลือกวันที่อ้างอิง:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b font-bold text-slate-800">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">วันที่/เวลา</th>
                <th className="py-3 px-2">ลูกค้า</th>
                <th className="py-3 px-2">รายการ</th>
                <th className="py-3 px-2 text-right">ราคารวม</th>
                <th className="py-3 px-2 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    ไม่พบข้อมูลออเดอร์ในช่วงเวลาที่เลือก
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-slate-50 transition">
                    <td className="py-3 px-2 font-bold text-slate-700">{o.id}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                    <td className="py-3 px-2 font-medium">{o.customerName || o.customer || "หน้าร้าน"}</td>
                    <td className="py-3 px-2">
                      {o.items
                        ?.map(
                          (i: any) =>
                            `${i.name}${i.sweetness ? ` (${i.sweetness})` : ""} x${i.quantity || 1}`
                        )
                        .join(", ")}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-600">
                      {(Number(o.totalPrice) || 0).toLocaleString()} ฿
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {o.status || "completed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}