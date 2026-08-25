import { NextResponse } from 'next/server';
import { getEventStatsFromSheet } from '@/lib/googleSheets';

// Disable static caching so it always returns real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
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
