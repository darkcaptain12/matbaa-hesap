import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Customer } from '../../types';

const KEY = 'matbaa_customers';

export async function GET() {
  try {
    const data = await kv.get<Customer[]>(KEY);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const customers: Customer[] = await req.json();
    await kv.set(KEY, customers);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
