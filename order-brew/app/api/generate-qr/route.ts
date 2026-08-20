import { NextResponse } from 'next/server';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // ใส่เบอร์โทรศัพท์พร้อมเพย์ของร้านค้า (ตัด 0 ตัวแรกออก แล้วแทนด้วย 66 หรือใส่เบอร์เต็ม เช่น 0812345678)
    const phoneNumber = '0827877260'; 
    const payload = generatePayload(phoneNumber, { amount });

    const qrImage = await QRCode.toDataURL(payload);

    return NextResponse.json({ qrImage });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR Code' }, { status: 500 });
  }
}