import { getMeAction } from '@/app/actions/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getMeAction();

  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(user);
}
