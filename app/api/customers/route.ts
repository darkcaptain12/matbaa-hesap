import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import type { Customer } from '../../types';

const KEY = 'matbaa_customers';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Upstash env vars');
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const redis = getRedis();
    const data = await redis.get<Customer[]>(KEY);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const customers: Customer[] = await req.json();
    await redis.set(KEY, customers);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
