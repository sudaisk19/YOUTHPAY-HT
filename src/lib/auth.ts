import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';
import { TokenPayload, verifyToken } from '@/lib/jwt';

export type { TokenPayload } from '@/lib/jwt';

export const DEMO_USER: TokenPayload = {
  userId: '00000000-0000-0000-0000-000000000001',
  email: 'sudais@youthpay.test',
  role: 'teen',
  fullName: 'Sudais',
  parentId: '00000000-0000-0000-0000-000000000002',
  monthlyAllowance: 10000,
};

const TEEN_DEMO_USER_ID = DEMO_USER.userId;

export function getSession(request: Request): TokenPayload | null {
  const nextCookies = (
    request as Request & { cookies?: { get: (name: string) => { value: string } | undefined } }
  ).cookies;

  const tokenFromCookies = nextCookies?.get('yp_token')?.value;
  if (tokenFromCookies) {
    return verifyToken(tokenFromCookies);
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)yp_token=([^;]+)/);
  const token = match?.[1];
  if (!token) return null;

  return verifyToken(decodeURIComponent(token));
}

export function resolveSession(request: Request): TokenPayload {
  return getSession(request) ?? DEMO_USER;
}

export async function getDataUserId(session: TokenPayload): Promise<string> {
  if (session.role !== 'parent') {
    return session.userId;
  }

  if (!isDatabaseConfigured()) {
    return TEEN_DEMO_USER_ID;
  }

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('parent_id', session.userId)
      .limit(1)
      .single();

    if (error || !data?.id) {
      return TEEN_DEMO_USER_ID;
    }

    return data.id as string;
  } catch {
    return TEEN_DEMO_USER_ID;
  }
}
