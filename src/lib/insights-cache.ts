import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';

export async function invalidateInsightsCache(userId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    const supabase = getSupabaseServer();
    await supabase.from('insights_cache').delete().eq('user_id', userId);
  } catch {
    void 0;
  }
}
