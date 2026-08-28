import { NextResponse } from 'next/server';
import { getEventStatsFromSheet } from '@/lib/googleSheets';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Disable static caching so it always returns real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`tracker_${clientIp}`, 60, 60 * 1000); // 60 requests per min
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }

    const stats = await getEventStatsFromSheet();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    console.error('❌ Error fetching tracker stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch live tracker stats.',
        data: {
          totalCollected: 0,
          totalRegistrations: 0,
          targetGoal: 30000,
          lastUpdated: new Date().toLocaleTimeString(),
        },
      },
      { status: 500 }
    );
  }
}
