"use client";

import React, { useState } from "react";
import { Coffee, ShoppingBag, Utensils, Trash2, X, CheckCircle, Ban, Plus, Minus, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Topping {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  beverageId: string;
  name: string;
  sweetness: string;
  toppings: Topping[];
  note: string;
  price: number;
  quantity: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'ชาไทยเย็น', price: 45, image: '🧋' },
  { id: 'm2', name: 'ชาเขียวเย็น', price: 45, image: '🍵' },
  { id: 'm3', name: 'อเมริกาโน่เย็น', price: 50, image: '☕' },
  { id: 'm4', name: 'นมสดคาราเมล', price: 40, image: '🥛' },
  { id: 'm5', name: 'เอสเพรสโซ่เย็น', price: 50, image: '☕' },
  { id: 'm6', name: 'โกโก้เย็น', price: 50, image: '🍫' },
];

const TOPPINGS: Topping[] = [
  { id: "t1", name: "ไข่มุก", price: 10 },
  { id: "t2", name: "พุดดิ้ง", price: 10 },
  { id: "t3", name: "วิปครีม", price: 15 },
];

const SWEETNESS_LEVELS = ["100%", "75%", "50%", "25%", "0%"];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedBev, setSelectedBev] = useState<MenuItem | null>(null);

  // Customization Modal State
  const [sweetness, setSweetness] = useState("50%");
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Payment Modal & QR State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);

  // Confirm Cancel Modal State
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);

  // Custom Alert Modal State
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
  };

  const closeAlert = () => {
    setAlertMessage(null);
  };

  const openCustomizeModal = (bev: MenuItem) => {
    setSelectedBev(bev);
    setSweetness("50%");
    setSelectedToppings([]);
    setNote("");
    setQuantity(1);
  };

  const closeCustomizeModal = () => {
    setSelectedBev(null);
  };

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const addToCart = () => {
    if (!selectedBev) return;

    const toppingsCost = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = selectedBev.price + toppingsCost;

    const existingIndex = cart.findIndex(
      (item) =>
        item.beverageId === selectedBev.id &&
        item.sweetness === sweetness &&
        item.note.trim() === note.trim() &&
        JSON.stringify(item.toppings.map((t) => t.id).sort()) ===
          JSON.stringify(selectedToppings.map((t) => t.id).sort())
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        beverageId: selectedBev.id,
        name: selectedBev.name,
        sweetness,
        toppings: selectedToppings,
        note: note.trim(),
        price: unitPrice,
        quantity,
      };
      setCart([...cart, newItem]);
    }

    closeCustomizeModal();
  };

  const updateCartQuantity = (id: string, delta: number) => {
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
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      showAlert("กรุณาระบุชื่อผู้สั่ง / ลูกค้า ก่อนชำระเงิน");
      return;
    }
    if (cart.length === 0) return;

    setShowQRModal(true);
    setIsLoadingQr(true);
    setQrCodeUrl("");

    try {
      const res = await fetch("/api/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const data = await res.json();
      if (data.qrImage) {
        setQrCodeUrl(data.qrImage);
      } else {
        showAlert("เกิดข้อผิดพลาดในการสร้าง QR Code");
      }
    } catch (err) {
      console.error("Error generating QR:", err);
      showAlert("ไม่สามารถเชื่อมต่อระบบชำระเงินได้");
    } finally {
      setIsLoadingQr(false);
    }
  };

  // ส่งออเดอร์เข้าครัว และบันทึกลง localStorage พร้อมแก้ Format วันที่ส่งออก
  const handleFinishOrder = () => {
    const now = new Date();
    // จัดรูปแบบวันที่ให้อ่านง่าย ป้องกันปัญหาแสดง #### เมื่อ Export
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerName,
      items: cart,
      totalPrice,
      status: "pending",
      createdAt: formattedDate,
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // ส่ง Event แจ้งเตือนทุก Tab (รวมถึงหน้าครัว) ให้รับรู้ทันที
    window.dispatchEvent(new Event("storage"));

    setShowQRModal(false);
    setCart([]);
    setCustomerName("");
    showAlert("ส่งออเดอร์เข้าครัวเรียบร้อยแล้ว!");
  };

  const handleConfirmCancelOrder = () => {
    setShowCancelConfirmModal(false);
    setShowQRModal(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2.5 rounded-xl">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">OrderBrew</h1>
              <p className="text-xs text-neutral-500">ระบบรับออเดอร์เครื่องดื่ม</p>
            </div>
          </div>
          <Link
            href="/kitchen"
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Utensils className="w-4 h-4" />
            ระบบหลังบ้าน (Kitchen Queue)
          </Link>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Beverage List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-neutral-800">เลือกเครื่องดื่ม</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openCustomizeModal(item)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/80 hover:border-amber-500 hover:shadow-md transition flex flex-col items-center justify-center gap-3 group text-center"
                >
                  <div className="text-4xl bg-amber-50 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-105 transition">
                    {item.image.startsWith("http") || item.image.startsWith("/") ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                    ) : (
                      item.image
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">{item.name}</h3>
                    <p className="text-amber-600 font-bold text-sm mt-1">{item.price} ฿</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col justify-between h-fit min-h-[480px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-neutral-800">ตะกร้าของคุณ</h2>
              </div>

              {/* Customer Name Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  ชื่อผู้สั่ง / ลูกค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ระบุชื่อลูกค้า (จำเป็น)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
                />
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400 py-10">ไม่มีสินค้าในตะกร้า</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-neutral-800 text-sm">{item.name}</p>
                        <p className="text-neutral-500">หวาน {item.sweetness}</p>
                        {item.toppings.length > 0 && (
                          <p className="text-neutral-500">
                            + {item.toppings.map((t) => t.name).join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-amber-700 italic bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                            หมายเหตุ: {item.note}
                          </p>
                        )}
                        <p className="font-bold text-amber-600 text-xs mt-1">
                          {item.price * item.quantity} ฿
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="text-neutral-500 hover:text-amber-600 font-bold px-1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="text-neutral-500 hover:text-amber-600 font-bold px-1"
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

            {/* Total & Checkout */}
            <div className="pt-4 border-t border-neutral-100 space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-700">ราคารวมทั้งหมด:</span>
                <span className="text-lg text-amber-600">{totalPrice} ฿</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-300 text-white font-bold py-3 rounded-xl transition shadow-sm"
              >
                ชำระเงิน (PromptPay)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Customization Modal */}
      {selectedBev && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-800">{selectedBev.name}</h3>
              <button onClick={closeCustomizeModal} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sweetness */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-600">ระดับความหวาน</label>
              <div className="grid grid-cols-5 gap-1.5">
                {SWEETNESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSweetness(level)}
                    className={`py-2 rounded-xl text-xs font-semibold transition border ${
                      sweetness === level
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-amber-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-600">ท็อปปิ้ง</label>
              <div className="space-y-2">
                {TOPPINGS.map((topping) => {
                  const isSelected = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping)}
                      className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-900"
                          : "border-neutral-200 hover:border-amber-300 text-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span>{topping.name}</span>
                      </div>
                      <span className="font-bold text-neutral-500">+{topping.price} ฿</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Feature */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600">หมายเหตุถึงร้าน</label>
              <input
                type="text"
                placeholder="เช่น แยกน้ำแข็ง, หวานน้อยพิเศษ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>

            {/* Quantity */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-neutral-600">จำนวน</span>
              <div className="flex items-center gap-3 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-neutral-600 hover:text-amber-600 font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-neutral-600 hover:text-amber-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={closeCustomizeModal}
                className="py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-xs hover:bg-neutral-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={addToCart}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-sm"
              >
                ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QR Code Payment Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-neutral-900">สแกนเพื่อชำระเงิน</h3>

            {/* QR Code Image From API */}
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-500 inline-block shadow-inner min-h-[220px] min-w-[220px] flex items-center justify-center">
              {isLoadingQr ? (
                <p className="text-xs text-neutral-400 animate-pulse">กำลังเจน QR Code...</p>
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-52 h-52 object-contain" />
              ) : (
                <p className="text-xs text-red-500">ไม่สามารถโหลด QR Code ได้</p>
              )}
            </div>

            <div>
              <p className="text-2xl font-black text-amber-600">{totalPrice} ฿</p>
              <p className="text-xs text-neutral-400 mt-1">รองรับแอปพลิเคชันธนาคารทุกประเภท</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleFinishOrder}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                เสร็จสิ้นการสั่งซื้อ
              </button>

              <button
                onClick={() => setShowCancelConfirmModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 font-semibold py-2.5 rounded-xl transition border border-neutral-200 text-xs"
              >
                <Ban className="w-4 h-4" />
                ยกเลิกออเดอร์ (ลูกค้ายกเลิก)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal ยืนยันการยกเลิกออเดอร์ */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-neutral-900">ยืนยันการยกเลิก</h4>
              <p className="text-xs text-neutral-500 mt-1">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl transition text-xs"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-xs"
              >
                แน่ใจ, ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Custom Alert Notification Modal */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-neutral-800 leading-relaxed">
              {alertMessage}
            </p>

            <button
              onClick={closeAlert}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-xs"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}