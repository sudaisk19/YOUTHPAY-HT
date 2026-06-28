import { NextRequest, NextResponse } from 'next/server';
import { getDataUserId, resolveSession } from '@/lib/auth';
import { invalidateInsightsCache } from '@/lib/insights-cache';
import { parseNotification } from '@/lib/parser';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';
import {
  InputType,
  ParserUnavailableError,
  ParseResponse,
  TransactionRecord,
} from '@/lib/types';

interface ParseRequestBody {
  raw_text: string;
  source: string;
  input_type: InputType;
  existing_transactions?: TransactionRecord[];
}

function checkDuplicateLocally(
  parsed: ParseResponse,
  existing: TransactionRecord[]
): boolean {
  if (!parsed.merchant_name || !parsed.amount_pkr || !parsed.txn_date) {
    return false;
  }

  const parsedTime = new Date(parsed.txn_date).getTime();

  return existing.some((txn) => {
    if (
      txn.merchant_name?.toLowerCase() !== parsed.merchant_name?.toLowerCase()
    ) {
      return false;
    }
    if (txn.amount_pkr !== parsed.amount_pkr) return false;
    if (!txn.txn_date) return false;
    const diff = Math.abs(new Date(txn.txn_date).getTime() - parsedTime);
    return diff <= 5 * 60 * 1000;
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = resolveSession(request);
    const userId = await getDataUserId(session);
    const body = (await request.json()) as ParseRequestBody;

    if (!body.raw_text || !body.input_type) {
      return NextResponse.json(
        { error: 'raw_text and input_type are required' },
        { status: 400 }
      );
    }

    let parsed: ParseResponse;
    try {
      parsed = await parseNotification(
        body.raw_text,
        body.source ?? '',
        body.input_type
      );
    } catch (err) {
      if (err instanceof ParserUnavailableError) {
        return NextResponse.json(
          { error: 'Parser unavailable' },
          { status: 503 }
        );
      }
      throw err;
    }

    const existing = body.existing_transactions ?? [];
    let isDuplicate = checkDuplicateLocally(parsed, existing);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        transaction_id: null,
        ...parsed,
        is_duplicate: isDuplicate,
        warning: 'Database not configured — result not persisted',
      });
    }

    try {
      const supabase = getSupabaseServer();

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          merchant_name: parsed.merchant_name,
          amount_pkr: parsed.amount_pkr,
          direction: parsed.direction ?? 'debit',
          payment_method: parsed.payment_method,
          txn_date: parsed.txn_date,
          category: parsed.category,
          is_roman_urdu: parsed.is_roman_urdu,
          confidence: parsed.confidence,
          parsed_by: parsed.parsed_by,
          is_duplicate: isDuplicate,
          raw_text: body.raw_text,
        })
        .select('id, is_duplicate')
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }

      await invalidateInsightsCache(userId);

      return NextResponse.json({
        transaction_id: data.id,
        ...parsed,
        is_duplicate: data.is_duplicate ?? isDuplicate,
      });
    } catch {
      return NextResponse.json({
        transaction_id: null,
        ...parsed,
        is_duplicate: isDuplicate,
        warning: 'Database unavailable — result not persisted',
      });
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
