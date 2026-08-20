'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, DollarSign, ShoppingBag, Calendar, Filter } from 'lucide-react';

interface OrderItem {
  name: string;
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

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterMode, setFilterMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);

    const savedOrders = localStorage.getItem('orderbrew_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // กรองรายการออเดอร์ตามช่วงเวลา
  const filteredOrders = orders.filter((ord) => {
    if (!selectedDate) return true;
    const [selYear, selMonth, selDay] = selectedDate.split('-');
    const [ordYear, ordMonth, ordDay] = ord.date.split('-');

    if (filterMode === 'day') {
      return ord.date === selectedDate;
    } else if (filterMode === 'month') {
      return ordYear === selYear && ordMonth === selMonth;
    } else if (filterMode === 'year') {
      return ordYear === selYear;
    }
    return true;
  });

  // คำนวณสรุปผล
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const totalItemsSold = filteredOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );

  // ฟังก์ชั่น Export CSV (รองรับ ภาษาไทย UTF-8 BOM)
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    const headers = ['Order ID', 'Date', 'Time', 'Customer', 'Items', 'Total Price', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.date,
      o.time,
      `"${o.customerName}"`,
      `"${o.items.map((i) => `${i.name}(x${i.quantity})`).join(', ')}"`,
      o.total,
      o.status,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${filterMode}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-gray-800">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">สรุปข้อมูลการขาย (Sales Analytics)</h1>
          <p className="text-xs text-gray-500">ดูยอดขาย ยอดออเดอร์ และส่งออกข้อมูล CSV</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <Link
            href="/kitchen"
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าคิว
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* ตัวกรอง วัน / เดือน / ปี */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-gray-700">รูปแบบการดูข้อมูล:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterMode('day')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  filterMode === 'day' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => setFilterMode('month')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  filterMode === 'month' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => setFilterMode('year')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  filterMode === 'year' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                รายปี
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* สรุปสถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400">ยอดขายรวม</p>
              <p className="text-2xl font-black text-amber-600">฿{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400">จำนวนออเดอร์</p>
              <p className="text-2xl font-black text-slate-800">{totalOrders} รายการ</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400">แก้วที่ขายได้รวม</p>
              <p className="text-2xl font-black text-emerald-600">{totalItemsSold} แก้ว</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ตารางแสดงออเดอร์ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-gray-800">
            รายการออเดอร์ ({filteredOrders.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">วันที่ / เวลา</th>
                  <th className="p-3.5">ลูกค้า</th>
                  <th className="p-3.5">รายการสั่งซื้อ</th>
                  <th className="p-3.5">ยอดรวม</th>
                  <th className="p-3.5">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      ไม่พบข้อมูลการขายตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-gray-800">{ord.id}</td>
                      <td className="p-3.5">{ord.date} {ord.time}</td>
                      <td className="p-3.5 font-medium text-gray-700">{ord.customerName}</td>
                      <td className="p-3.5">
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-3.5 font-bold text-amber-600">฿{ord.total}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}