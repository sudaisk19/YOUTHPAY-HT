import { NextRequest, NextResponse } from 'next/server';
import { getDataUserId, resolveSession } from '@/lib/auth';
import { invalidateInsightsCache } from '@/lib/insights-cache';
import { parseCsvTransactions } from '@/lib/parse-csv';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const session = resolveSession(request);
    const userId = await getDataUserId(session);
    const body = (await request.json()) as { csv?: string };

    if (!body.csv?.trim()) {
      return NextResponse.json({ error: 'csv field is required' }, { status: 400 });
    }

    const { rows, errors: parseErrors } = parseCsvTransactions(body.csv);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found', details: parseErrors },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured', parsed: rows.length, details: parseErrors },
        { status: 503 }
      );
    }

    const supabase = getSupabaseServer();
    const inserts = rows.map((row) => ({
      user_id: userId,
      merchant_name: row.merchant_name,
      amount_pkr: row.amount_pkr,
      direction: row.direction,
      payment_method: row.payment_method,
      txn_date: row.txn_date,
      category: row.category,
      is_roman_urdu: false,
      confidence: 1.0,
      parsed_by: 'regex' as const,
      is_duplicate: false,
      raw_text: `csv:${row.merchant_name}:${row.amount_pkr}`,
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(inserts)
      .select('id');

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    await invalidateInsightsCache(userId);

    return NextResponse.json({
      imported: data?.length ?? 0,
      skipped: parseErrors.length,
      errors: parseErrors,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
