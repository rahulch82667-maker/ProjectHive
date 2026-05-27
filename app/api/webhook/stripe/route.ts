import { NextRequest } from 'next/server';
import { stripeWebhook } from '@/backend/controllers/checkout.controller';

export async function POST(req: NextRequest) {
  return await stripeWebhook(req);
}
