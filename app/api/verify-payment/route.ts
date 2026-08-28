import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateUnique6DigitId, calculateEventFee } from '@/lib/utils';
import { appendRegistrationToSheet, isPaymentAlreadyRecorded, getRegistrationByPaymentId } from '@/lib/googleSheets';
import { sendInvitationEmail } from '@/lib/email';
import { razorpayInstance } from '@/lib/razorpay';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { VerifyPaymentRequest, SheetRowData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`verify_${clientIp}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many verification attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body: VerifyPaymentRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !userData) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification payload.' },
        { status: 400 }
      );
    }

    // 1. Payment Replay Prevention / Idempotency Check (VULN-02)
    const alreadyProcessed = await isPaymentAlreadyRecorded(razorpay_payment_id);
    if (alreadyProcessed) {
      const existingReg = await getRegistrationByPaymentId(razorpay_payment_id);
      if (existingReg) {
        console.log(`ℹ️ Idempotent reply: Payment ${razorpay_payment_id} was already verified.`);
        return NextResponse.json({
          success: true,
          ticketId: existingReg.ticketId,
          message: 'Payment already verified and pass previously issued.',
          details: {
            name: existingReg.name,
            email: existingReg.email,
            phone: existingReg.phone,
            semester: existingReg.semester,
            amountPaid: existingReg.amountPaid,
            paymentId: existingReg.paymentId,
            ticketId: existingReg.ticketId,
            timestamp: existingReg.timestamp,
          },
        });
      }
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not configured in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    // 2. Verify HMAC-SHA256 signature with constant-time comparison
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

    // 3. Authoritative Order & Fee Verification (VULN-01 - Anti-Tampering)
    const { amountInPaise, amountInINR } = calculateEventFee(userData.semester);

    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const order = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (order) {
          // Check that the charged order amount matches the selected semester price
          if (Number(order.amount) !== amountInPaise) {
            console.error('❌ Order amount discrepancy detected:', {
              orderAmount: order.amount,
              expectedAmount: amountInPaise,
              semester: userData.semester,
            });
            return NextResponse.json(
              {
                success: false,
                message: 'Payment verification failed: Amount paid does not match the registration tier fee.',
              },
              { status: 400 }
            );
          }

          // Check that semester recorded in order notes matches requested semester
          if (order.notes && order.notes.student_semester && order.notes.student_semester !== userData.semester) {
            console.error('❌ Order semester note discrepancy:', {
              orderSemester: order.notes.student_semester,
              userSemester: userData.semester,
            });
            return NextResponse.json(
              {
                success: false,
                message: 'Payment verification failed: Order details do not match requested registration.',
              },
              { status: 400 }
            );
          }
        }
      }
    } catch (orderErr) {
      console.warn('⚠️ Could not verify order amount via Razorpay API (running in fallback mode):', orderErr);
    }

    // 4. Generate Unique Cryptographic 6-Digit Numeric ID (VULN-03)
    const ticketId = generateUnique6DigitId();
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

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
