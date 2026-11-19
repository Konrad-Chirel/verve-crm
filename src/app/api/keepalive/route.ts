import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function isAuthorizedCron(authHeader: string | null, expectedSecret: string): boolean {
  if (!authHeader) return false;
  const expected = Buffer.from(`Bearer ${expectedSecret}`, 'utf8');
  const provided = Buffer.from(authHeader, 'utf8');
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (!isAuthorizedCron(authHeader, cronSecret)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('verve_profiles')
      .select('id')
      .limit(1);

    return NextResponse.json(
      {
        ok: true,
        service: 'verve-crm',
        dbReachable: !error || error.code === 'PGRST116' || error.code === '42P01',
        timestamp: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, service: 'verve-crm', timestamp: new Date().toISOString() },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
