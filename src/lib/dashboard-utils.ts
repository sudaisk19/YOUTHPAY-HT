import type { InsightCard as ApiInsight } from '@/lib/types';
import type { InsightCard as UiInsight } from '@/types';

const TYPE_MAP: Record<ApiInsight['type'], UiInsight['type']> = {
  alert: 'danger',
  tip: 'info',
  positive: 'success',
  behavioral: 'warning',
};

const TYPE_LABEL: Record<ApiInsight['type'], string> = {
  alert: 'Alert',
  tip: 'Tip',
  positive: 'Win',
  behavioral: 'Pattern',
};

export function apiInsightToUi(insight: ApiInsight): UiInsight {
  return {
    type: TYPE_MAP[insight.type] ?? 'info',
    icon: TYPE_LABEL[insight.type] ?? 'Tip',
    title: insight.title,
    body: insight.body,
  };
}

export function computeHealthScore(
  totalSpent: number,
  totalReceived: number,
  duplicateCount: number
): number {
  if (totalReceived === 0) return 72;
  const utilization = totalSpent / totalReceived;
  let score = 100;
  if (utilization > 1) score -= 30;
  else if (utilization > 0.8) score -= 15;
  score -= duplicateCount * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { weekday: 'short' }).slice(0, 3);
}

export function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
}
