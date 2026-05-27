import { NextRequest } from 'next/server';
import { initiateCheckout } from '@/backend/controllers/checkout.controller';

export async function POST(req: NextRequest) {
  return await initiateCheckout(req);
}
