import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken, TokenPayload } from '@/lib/jwt';
import { getSupabaseServer, isDatabaseConfigured } from '@/lib/supabase-server';

interface LoginBody {
  email: string;
  password: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'teen' | 'parent';
  monthly_allowance: number;
  parent_id: string | null;
}

const COOKIE_NAME = 'yp_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseServer();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, monthly_allowance, parent_id')
      .eq('email', body.email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const row = user as UserRow;
    const passwordMatch = await bcrypt.compare(body.password, row.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const payload: TokenPayload = {
      userId: row.id,
      email: row.email,
      role: row.role,
      fullName: row.full_name,
      parentId: row.parent_id,
      monthlyAllowance: Number(row.monthly_allowance),
    };

    const token = signToken(payload);
    const response = NextResponse.json({
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
