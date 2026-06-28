import { NextRequest, NextResponse } from 'next/server';
import { getDataUserId, resolveSession } from '@/lib/auth';
import { mockToTransactionRecords } from '@/lib/mock-to-records';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';
import { TransactionRecord } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = resolveSession(request);
    const dataUserId = await getDataUserId(session);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') ?? dataUserId;
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    if (!isDatabaseConfigured()) {
      const mock = mockToTransactionRecords();
      return NextResponse.json({ transactions: mock.slice(0, limit) });
    }

    try {
      const supabase = getSupabaseServer();
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('txn_date', { ascending: false })
        .limit(limit);

      if (month) {
        const [year, mon] = month.split('-');
        const start = `${year}-${mon}-01T00:00:00`;
        const endMonth = parseInt(mon, 10);
        const endYear = parseInt(year, 10);
        const nextMonth = endMonth === 12 ? 1 : endMonth + 1;
        const nextYear = endMonth === 12 ? endYear + 1 : endYear;
        const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00`;
        query = query.gte('txn_date', start).lt('txn_date', end);
      }

      const { data, error } = await query;

      if (error || !data?.length) {
        const mock = mockToTransactionRecords();
        return NextResponse.json({ transactions: mock.slice(0, limit) });
      }

      return NextResponse.json({ transactions: data as TransactionRecord[] });
    } catch {
      const mock = mockToTransactionRecords();
      return NextResponse.json({ transactions: mock.slice(0, limit) });
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
