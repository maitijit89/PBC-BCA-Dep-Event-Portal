import { NextResponse } from 'next/server';
import { razorpayInstance, getRazorpayKeyId } from '@/lib/razorpay';
import { calculateEventFee } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { CreateOrderRequest, Semester } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`order_${clientIp}`, 15, 60 * 1000); // 15 orders per min per IP
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many order requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body: CreateOrderRequest = await req.json();
    const { name, email, phone, age, semester } = body;

    // Strict Validation
    if (!name || !email || !phone || !age || !semester) {
      return NextResponse.json(
        { success: false, message: 'All fields (Name, Email, Phone, Age, Semester) are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/[\s\-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const numAge = parseInt(String(age), 10);
    if (isNaN(numAge) || numAge < 15 || numAge > 65) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid age between 15 and 65.' },
        { status: 400 }
      );
    }

    const VALID_SEMESTERS: Semester[] = [
      '1st Semester',
      '2nd Semester',
      '3rd Semester',
      '4th Semester',
      '5th Semester',
      '6th Semester',
      '7th Semester',
      '8th Semester',
    ];

    if (!VALID_SEMESTERS.includes(semester as Semester)) {
      return NextResponse.json(
        { success: false, message: 'Invalid semester selected.' },
        { status: 400 }
      );
    }

    // Dynamic Pricing calculation on the server
    const { amountInINR, amountInPaise } = calculateEventFee(semester as Semester);
    const keyId = getRazorpayKeyId();

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay API keys are not configured in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration error. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bca_rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        student_name: name,
        student_email: email,
        student_phone: phone,
        student_age: String(age),
        student_semester: semester,
        event_name: 'PBC BCA Event 2026',
      },
    };

    const order = await razorpayInstance.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      amountFormatted: amountInINR,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error: unknown) {
    console.error('❌ Error creating Razorpay order:', error);
    const msg = error instanceof Error ? error.message : 'Failed to initialize order.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
