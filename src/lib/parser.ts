import {
  InputType,
  InsightCard,
  ParseResponse,
  ParserError,
  ParserUnavailableError,
  TransactionStats,
} from '@/lib/types';

const TIMEOUT_MS = 10_000;

function getParserUrl(): string {
  const url = process.env.PARSER_API_URL;
  if (!url) {
    throw new ParserUnavailableError('PARSER_API_URL is not configured');
  }
  return url.replace(/\/$/, '');
}

async function parserFetch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const baseUrl = getParserUrl();

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new ParserError(res.status, `Parser returned ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ParserError) throw err;
    throw new ParserUnavailableError();
  }
}

export async function parseNotification(
  rawText: string,
  source: string,
  inputType: InputType
): Promise<ParseResponse> {
  return parserFetch<ParseResponse>('/parse', {
    raw_text: rawText,
    source,
    input_type: inputType,
  });
}

export async function generateInsights(
  userId: string,
  stats: TransactionStats
): Promise<InsightCard[]> {
  const baseUrl = getParserUrl();

  try {
    const res = await fetch(`${baseUrl}/generate-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, stats }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new ParserError(res.status, `Parser returned ${res.status}`);
    }

    const data = (await res.json()) as { insights: InsightCard[] };
    return data.insights;
  } catch (err) {
    if (err instanceof ParserError) throw err;
    throw new ParserUnavailableError();
  }
}
