import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateUnique6DigitId, calculateEventFee } from '@/lib/utils';
import { appendRegistrationToSheet } from '@/lib/googleSheets';
import { sendInvitationEmail } from '@/lib/email';
import { VerifyPaymentRequest, SheetRowData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body: VerifyPaymentRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !userData) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification payload.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not configured in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    // Verify HMAC-SHA256 signature with constant-time comparison
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid =
      typeof razorpay_signature === 'string' &&
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );

    if (!isSignatureValid) {
      console.error('❌ Razorpay Signature Mismatch', {
        received: razorpay_signature,
        generated: generatedSignature,
      });
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    // 1. Generate Unique 6-Digit Numeric ID
    const ticketId = generateUnique6DigitId();
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    const { amountInINR } = calculateEventFee(userData.semester);

    const sheetRow: SheetRowData = {
      timestamp,
      ticketId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      age: userData.age,
      semester: userData.semester,
      amountPaid: amountInINR,
      paymentId: razorpay_payment_id,
      status: 'PAID',
    };

    // 2. Google Sheets Sync
    const sheetResult = await appendRegistrationToSheet(sheetRow);
    console.log('Google Sheets Sync Status:', sheetResult);

    // 3. Email Notification (Invitation Letter)
    // We run email sending asynchronously and non-blocking so the client gets immediate verification response
    sendInvitationEmail({
      name: userData.name,
      email: userData.email,
      semester: userData.semester,
      amountPaid: amountInINR,
      ticketId,
      paymentId: razorpay_payment_id,
    }).catch((err) => console.error('Background email error:', err));

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Payment verified and registration confirmed!',
      details: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        semester: userData.semester,
        amountPaid: amountInINR,
        paymentId: razorpay_payment_id,
        ticketId,
        timestamp,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error verifying payment:', error);
    const msg = error instanceof Error ? error.message : 'Server error during payment verification.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
