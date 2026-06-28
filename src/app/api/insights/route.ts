import { NextRequest, NextResponse } from 'next/server';
import { buildStats } from '@/lib/aggregator';
import { getDataUserId, resolveSession } from '@/lib/auth';
import { FALLBACK_INSIGHTS, isFallbackInsights } from '@/lib/insights-fallback';
import { mockToTransactionRecords } from '@/lib/mock-to-records';
import { generateInsights } from '@/lib/parser';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';
import { InsightCard, TransactionRecord } from '@/lib/types';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function fetchTransactions(userId: string): Promise<TransactionRecord[]> {
  if (!isDatabaseConfigured()) {
    return mockToTransactionRecords();
  }

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('txn_date', { ascending: false });

    if (error || !data?.length) {
      return mockToTransactionRecords();
    }

    return data as TransactionRecord[];
  } catch {
    return mockToTransactionRecords();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = resolveSession(request);
    const dataUserId = await getDataUserId(session);
    const body = (await request.json()) as { user_id?: string; refresh?: boolean };
    const userId = body.user_id ?? dataUserId;
    const month = currentMonth();
    const skipCache = body.refresh === true;

    if (!skipCache && isDatabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: cached } = await supabase
          .from('insights_cache')
          .select('insights, generated_at')
          .eq('user_id', userId)
          .eq('month', month)
          .gte('generated_at', oneHourAgo)
          .single();

        const cachedInsights = cached?.insights as InsightCard[] | undefined;
        if (cachedInsights && !isFallbackInsights(cachedInsights)) {
          return NextResponse.json({ insights: cachedInsights });
        }
      } catch {
        void 0;
      }
    }

    const transactions = await fetchTransactions(userId);
    const stats = buildStats(transactions);

    let insights: InsightCard[];
    try {
      insights = await generateInsights(userId, stats);
    } catch {
      insights = FALLBACK_INSIGHTS;
    }

    if (isDatabaseConfigured() && !isFallbackInsights(insights)) {
      try {
        const supabase = getSupabaseServer();
        await supabase.from('insights_cache').upsert(
          {
            user_id: userId,
            month,
            insights,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,month' }
        );
      } catch {
        void 0;
      }
    }

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: FALLBACK_INSIGHTS });
  }
}
