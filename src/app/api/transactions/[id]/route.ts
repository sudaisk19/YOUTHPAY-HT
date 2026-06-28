import { NextRequest, NextResponse } from 'next/server';
import { getDataUserId, resolveSession } from '@/lib/auth';
import { invalidateInsightsCache } from '@/lib/insights-cache';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = resolveSession(request);
    const userId = await getDataUserId(session);
    const { id } = await params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    await invalidateInsightsCache(userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
