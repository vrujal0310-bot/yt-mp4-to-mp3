'use server'

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PREMIUM_PLAN } from '@/lib/products'

export async function startPremiumCheckout() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: PREMIUM_PLAN.name,
            description: PREMIUM_PLAN.description,
          },
          unit_amount: PREMIUM_PLAN.priceInCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?premium=active`,
    cancel_url: `${origin}/?premium=cancelled`,
    allow_promotion_codes: true,
  })

  if (!session.url) throw new Error('Unable to create checkout session')
  return session.url
}
