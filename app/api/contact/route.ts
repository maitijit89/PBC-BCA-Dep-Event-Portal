import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { ContactFormData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`contact_${clientIp}`, 5, 60 * 1000); // 5 messages per min per IP
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many messages sent. Please wait a minute before sending another inquiry.' },
        { status: 429 }
      );
    }

    const body: ContactFormData = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Please provide your name, email, and message.' },
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

    const result = await sendContactEmail({ name, email, message });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to send message.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been submitted to the BCA Event committee.',
    });
  } catch (error: unknown) {
    console.error('❌ Error handling contact form:', error);
    const msg = error instanceof Error ? error.message : 'Server error processing your inquiry.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
