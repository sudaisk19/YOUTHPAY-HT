import type {
  Transaction,
  User,
  CategoryConfig,
  DailySpend,
} from '@/types';

export const MOCK_USER: User = {
  name: 'Sudais',
  age: 17,
  city: 'Karachi',
  allowance: 10000,
  avatar: 'S',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, date: '2026-06-01', merchant: 'Pocket Money', amount: 10000, direction: 'credit', bank: 'Meezan', method: 'IBFT', category: 'Allowance' },
  { id: 2, date: '2026-06-01', merchant: 'MINISO PK', amount: 1701, direction: 'debit', bank: 'UBL', method: 'ATM', category: 'Lifestyle' },
  { id: 3, date: '2026-06-01', merchant: 'Easyload', amount: 431, direction: 'debit', bank: 'Bank Alfalah', method: 'ATM', category: 'Utilities' },
  { id: 4, date: '2026-06-01', merchant: 'Easyload', amount: 489, direction: 'debit', bank: 'Bank Alfalah', method: 'App', category: 'Utilities' },
  { id: 5, date: '2026-06-01', merchant: 'Yango', amount: 377, direction: 'debit', bank: 'UBL', method: 'Card', category: 'Transport' },
  { id: 6, date: '2026-06-01', merchant: 'MINISO Lucky', amount: 653, direction: 'debit', bank: 'Bank Alfalah', method: 'Wallet', category: 'Lifestyle' },
  { id: 7, date: '2026-06-01', merchant: 'Bagallery', amount: 1408, direction: 'debit', bank: 'JazzCash', method: 'IBFT', category: 'Beauty' },
  { id: 8, date: '2026-06-02', merchant: 'WB by Hema', amount: 1188, direction: 'debit', bank: 'Meezan', method: 'ATM', category: 'Beauty' },
  { id: 9, date: '2026-06-02', merchant: 'Bagallery', amount: 2078, direction: 'debit', bank: 'UBL', method: 'App', category: 'Beauty' },
  { id: 10, date: '2026-06-02', merchant: 'Easyload', amount: 311, direction: 'debit', bank: 'Bank Alfalah', method: 'Wallet', category: 'Utilities' },
  { id: 11, date: '2026-06-02', merchant: 'inDrive', amount: 533, direction: 'debit', bank: 'NayaPay', method: 'App', category: 'Transport' },
  { id: 12, date: '2026-06-02', merchant: 'Liberty Books', amount: 836, direction: 'debit', bank: 'Bank Alfalah', method: 'ATM', category: 'Education' },
  { id: 13, date: '2026-06-02', merchant: 'Easyload', amount: 313, direction: 'debit', bank: 'JazzCash', method: 'ATM', category: 'Utilities' },
  { id: 14, date: '2026-06-02', merchant: 'School Cafeteria', amount: 196, direction: 'debit', bank: 'Meezan', method: 'IBFT', category: 'Food' },
  { id: 15, date: '2026-06-03', merchant: 'Coffee Wagon', amount: 474, direction: 'debit', bank: 'UBL', method: 'IBFT', category: 'Coffee' },
  { id: 16, date: '2026-06-03', merchant: 'inDrive', amount: 425, direction: 'debit', bank: 'HBL', method: 'QR', category: 'Transport' },
  { id: 17, date: '2026-06-03', merchant: 'inDrive', amount: 521, direction: 'debit', bank: 'JazzCash', method: 'QR', category: 'Transport', isDuplicate: true },
  { id: 18, date: '2026-06-03', merchant: 'MINISO PK', amount: 1110, direction: 'debit', bank: 'JazzCash', method: 'App', category: 'Lifestyle' },
  { id: 19, date: '2026-06-04', merchant: 'Yango', amount: 459, direction: 'debit', bank: 'Meezan', method: 'ATM', category: 'Transport' },
  { id: 20, date: '2026-06-04', merchant: 'KFC', amount: 787, direction: 'debit', bank: 'Bank Alfalah', method: 'IBFT', category: 'Food' },
  { id: 21, date: '2026-06-04', merchant: 'MINISO PK', amount: 1275, direction: 'debit', bank: 'UBL', method: 'IBFT', category: 'Lifestyle' },
  { id: 22, date: '2026-06-04', merchant: 'inDrive', amount: 277, direction: 'debit', bank: 'UBL', method: 'IBFT', category: 'Transport' },
  { id: 23, date: '2026-06-04', merchant: 'Yango', amount: 407, direction: 'debit', bank: 'Meezan', method: 'Card', category: 'Transport' },
  { id: 24, date: '2026-06-04', merchant: 'KFC', amount: 1596, direction: 'debit', bank: 'JazzCash', method: 'ATM', category: 'Food' },
  { id: 25, date: '2026-06-05', merchant: 'Atrium Cinema', amount: 1760, direction: 'debit', bank: 'NayaPay', method: 'Card', category: 'Entertainment' },
  { id: 26, date: '2026-06-05', merchant: 'Liberty Books', amount: 951, direction: 'debit', bank: 'Easypaisa', method: 'QR', category: 'Education' },
  { id: 27, date: '2026-06-05', merchant: 'Atrium Cinema', amount: 1442, direction: 'debit', bank: 'Meezan', method: 'IBFT', category: 'Entertainment' },
  { id: 28, date: '2026-06-05', merchant: 'Liberty Books', amount: 1467, direction: 'debit', bank: 'UBL', method: 'QR', category: 'Education' },
  { id: 29, date: '2026-06-05', merchant: 'WB by Hema', amount: 1154, direction: 'debit', bank: 'HBL', method: 'Card', category: 'Beauty' },
];

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Food: { color: '#FF6B6B', icon: 'F' },
  Transport: { color: '#4ECDC4', icon: 'T' },
  Lifestyle: { color: '#A8E63D', icon: 'L' },
  Utilities: { color: '#FFE66D', icon: 'U' },
  Beauty: { color: '#FF6EB4', icon: 'B' },
  Education: { color: '#6C5CE7', icon: 'E' },
  Entertainment: { color: '#FD79A8', icon: 'N' },
  Coffee: { color: '#FDCB6E', icon: 'C' },
  Allowance: { color: '#2DD4BF', icon: 'A' },
  Other: { color: '#5B4CF5', icon: 'O' },
};

export const CATEGORY_TOTALS: Record<string, number> = {
  Food: 2579,
  Transport: 3051,
  Lifestyle: 2984,
  Beauty: 2342,
  Utilities: 1544,
  Education: 3254,
  Entertainment: 3202,
  Coffee: 474,
};

export const DAILY_SPENDING: DailySpend[] = [
  { day: 'Mon', amount: 4659 },
  { day: 'Tue', amount: 5455 },
  { day: 'Wed', amount: 2530 },
  { day: 'Thu', amount: 4801 },
  { day: 'Fri', amount: 6774 },
  { day: 'Sat', amount: 0 },
  { day: 'Sun', amount: 0 },
];

export const HEALTH_SCORE = 72;
export const TOTAL_SPENT = 24219;
export const TOTAL_ALLOWANCE = 10000;

export const BANKS = [
  'Meezan',
  'UBL',
  'HBL',
  'JazzCash',
  'NayaPay',
  'Bank Alfalah',
  'Easypaisa',
];

export const fmt = (n: number) => 'PKR ' + n.toLocaleString('en-PK');

export const merchantInitial = (m: string) => m.trim().charAt(0).toUpperCase();
