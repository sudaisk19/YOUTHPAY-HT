export interface ParseResponse {
  merchant_name: string | null;
  amount_pkr: number | null;
  direction: 'debit' | 'credit' | null;
  payment_method: string | null;
  txn_date: string | null;
  category: string | null;
  is_roman_urdu: boolean;
  confidence: number;
  parsed_by: 'regex' | 'gemini';
}

export interface TransactionRecord extends ParseResponse {
  id: string;
  user_id: string;
  is_duplicate: boolean;
  raw_text: string;
  created_at: string;
}

export interface InsightCard {
  type: 'alert' | 'tip' | 'positive' | 'behavioral';
  icon: string;
  title: string;
  body: string;
}

export interface TransactionStats {
  category_totals: Record<string, number>;
  daily_totals: Record<string, number>;
  top_merchants: { name: string; total: number; count: number }[];
  weekend_ratio: number;
  total_spent: number;
  total_received: number;
  duplicate_count: number;
}

export interface SimulatedEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  parsed: boolean;
  parseResult?: ParseResponse & { is_duplicate: boolean; transaction_id?: string | null };
}

export type InputType = 'sms' | 'email_body' | 'eml_base64';

export class ParserUnavailableError extends Error {
  constructor(message = 'Parser service unavailable') {
    super(message);
    this.name = 'ParserUnavailableError';
  }
}

export class ParserError extends Error {
  status: number;

  constructor(status: number, message = 'Parser request failed') {
    super(message);
    this.name = 'ParserError';
    this.status = status;
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Database unavailable') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}
