import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    fullName: session.fullName,
    monthlyAllowance: session.monthlyAllowance,
    parentId: session.parentId,
  });
}
