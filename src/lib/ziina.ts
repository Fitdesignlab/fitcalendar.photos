// Ziina payments — INACTIVE. Fit Calendar Photos is free for now.
// Docs: https://docs.ziina.com/api-reference/payment-intent
export const PAYMENTS_ENABLED = false

export interface PaymentIntentRequest {
  eventId: string
  amountFils: number // 100 AED = 10000; minimum 2 AED
  currency?: 'AED' | 'USD' | 'EUR' | 'GBP'
  successUrl: string
  cancelUrl: string
  test?: boolean
}

// TODO: move to a server route — never expose the Ziina Business token in the browser.
// TODO: POST https://api-v2.ziina.com/api/payment_intent with Bearer token (scope write_payment_intents),
//       body { amount, currency_code, success_url, cancel_url, test } -> returns redirect_url.
// TODO: webhook handler for payment_intent.status.updated; on status "completed" mark eventId paid for user. Verify HMAC.
export async function createPaymentIntent(_req: PaymentIntentRequest): Promise<{ redirectUrl: string } | null> {
  if (!PAYMENTS_ENABLED) return null
  throw new Error('Ziina integration not implemented')
}

export function isEventUnlocked(_eventId: string): boolean {
  // TODO: when PAYMENTS_ENABLED, check paid status from backend.
  return !PAYMENTS_ENABLED
}
