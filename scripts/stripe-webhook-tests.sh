#!/bin/bash
# Stripe webhook test cases for ChaseThePay
# Prerequisites: Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in another terminal
# Ensure STRIPE_WEBHOOK_SECRET in .env.local matches the secret from stripe listen

set -e

echo "=== Stripe Webhook Test Cases for ChaseThePay ==="
echo ""

echo "1. checkout.session.completed (Pro upgrade)"
echo "   → Updates settings.stripe_customer_id when client_reference_id matches a user"
stripe trigger checkout.session.completed
echo ""

echo "2. invoice.paid (Invoice recovery)"
echo "   → Marks invoice as paid, sets recovered_at, syncs marketing"
stripe trigger invoice.paid
echo ""

echo "3. customer.subscription.updated (Plan change)"
echo "   → Updates settings.plan when stripe_customer_id matches"
stripe trigger customer.subscription.updated
echo ""

echo "4. customer.subscription.deleted (Cancel Pro)"
echo "   → Sets plan to free when subscription ends"
stripe trigger customer.subscription.deleted
echo ""

echo "5. customer.created (unhandled - verify we don't crash)"
echo "   → We ignore this; webhook should still return 200"
stripe trigger customer.created
echo ""

echo "=== Done. Check your stripe listen terminal for forwarded events ==="
echo "=== Check your Next.js server logs for webhook handling ==="
