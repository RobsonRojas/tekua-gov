#!/bin/bash

echo "Testing Cora Payment Integration locally..."

# 1. Create a payment
echo "\n--- Creating a PIX payment ---"
curl -X POST http://localhost:54321/functions/v1/cora-payment/create \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.50, "method": "pix"}'

# 2. Simulate Webhook
echo "\n\n--- Simulating Webhook ---"
curl -X POST http://localhost:54321/functions/v1/cora-payment/webhook \
  -H "Cora-Signature: test-signature" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment.paid",
    "data": {
      "id": "<REPLACE_WITH_CORA_TRANSACTION_ID>"
    }
  }'
