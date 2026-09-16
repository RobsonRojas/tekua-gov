# Cora Payment Integration

## Overview
This capability handles integration with the Cora Pro payment API via a Supabase Edge Function to process payments using Boleto, PIX, and Credit Card.

## Capabilities

### Payment Generation
- The system MUST expose an edge function (e.g., `cora-payment`) that accepts payment requests.
- The system MUST authenticate requests to ensure they come from valid authenticated users.
- The system MUST support creating payments using:
  - PIX (instant payment)
  - Boleto (bank slip)
  - Cartão (credit card)
- The system MUST securely manage and use Cora Pro API credentials via Supabase Secrets.

### Webhook Processing
- The system MUST expose an endpoint within the edge function to receive webhooks from Cora Pro.
- The system MUST validate the webhook signature to verify it comes from Cora Pro.
- The system MUST update the payment status in the database based on webhook events (e.g., `paid`, `failed`).

## Data Models
- Payments should be logged in a Supabase table (e.g., `payments`) to track status, payment method, amount, and Cora transaction ID.

## Security
- API keys MUST NEVER be logged or exposed.
- Webhook endpoints MUST validate origin.
