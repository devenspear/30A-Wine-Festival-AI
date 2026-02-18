import { NextResponse } from 'next/server';
import { cleanupOldAnalytics } from '@/lib/analytics';

export async function GET(req: Request) {
  try {
    // Verify the request is from the Vercel cron scheduler
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cleanedCount = await cleanupOldAnalytics(30);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old analytics entries.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/cleanup] Error during cleanup:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup failed. Check server logs for details.',
      },
      { status: 500 }
    );
  }
}
