export type Direction = 'debit' | 'credit';

export type PaymentMethod =
  | 'IBFT'
  | 'ATM'
  | 'Card'
  | 'App'
  | 'QR'
  | 'Wallet';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Lifestyle'
  | 'Utilities'
  | 'Beauty'
  | 'Education'
  | 'Entertainment'
  | 'Coffee'
  | 'Allowance';

export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  direction: Direction;
  bank: string;
  method: PaymentMethod;
  category: Category;
  isDuplicate?: boolean;
}

export interface User {
  name: string;
  age: number;
  city: string;
  allowance: number;
  avatar: string;
}

export interface CategoryConfig {
  color: string;
  icon: string;
}

export interface DailySpend {
  day: string;
  amount: number;
}

export interface InsightCard {
  type: 'warning' | 'success' | 'danger' | 'info';
  icon: string;
  title: string;
  body: string;
}
