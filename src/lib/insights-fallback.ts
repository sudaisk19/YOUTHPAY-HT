import { InsightCard } from '@/lib/types';

export const FALLBACK_INSIGHTS: InsightCard[] = [
  {
    type: 'tip',
    icon: 'money',
    title: 'Track your spending',
    body: 'Connect more accounts to see your full financial picture.',
  },
  {
    type: 'tip',
    icon: 'chart',
    title: 'Review weekly totals',
    body: 'Check your spending every Sunday to stay within your weekly budget.',
  },
  {
    type: 'positive',
    icon: 'star',
    title: 'Good job saving',
    body: 'Keeping track of expenses is the first step to saving more PKR.',
  },
  {
    type: 'behavioral',
    icon: 'warning',
    title: 'Watch weekend spending',
    body: 'Weekend spending is often higher. Plan ahead to avoid overspending.',
  },
];

const FALLBACK_TITLES = new Set(FALLBACK_INSIGHTS.map((i) => i.title));

export function isFallbackInsights(insights: InsightCard[]): boolean {
  if (insights.length !== 4) return true;
  return insights.every((card) => FALLBACK_TITLES.has(card.title));
}
