# Implementation Tasks: Cora Payment Integration

## Phase 1: Setup and Database
- [x] 1. Create the database table `cora_payments` or verify an existing suitable table.
- [x] 2. Setup the Supabase Edge Function `cora-payment` structure (`supabase functions new cora-payment`).
- [x] 3. Configure the local environment variables with mock Cora Pro credentials for development.

## Phase 2: Edge Function Core & Authentication
- [x] 4. Implement Cora Pro authentication logic (handling mTLS/certificates or token generation).
- [x] 5. Implement user authentication verification using Supabase Auth in the edge function.
- [x] 6. Setup routing logic within the edge function to differentiate between `/create` and `/webhook`.

## Phase 3: Payment Methods Implementation
- [x] 7. Implement PIX generation logic (calling Cora API and formatting response).
- [x] 8. Implement Boleto generation logic.
- [x] 9. Implement Cartão (Credit Card) processing logic.
- [x] 10. Implement database insertion for pending payments upon successful API call.

## Phase 4: Webhook Handling
- [x] 11. Implement webhook signature verification to ensure requests are authentically from Cora Pro.
- [x] 12. Parse webhook events (e.g., payment completed, failed, expired).
- [x] 13. Update the corresponding payment records in the database based on the webhook event using a Service Role key.

## Phase 5: Testing
- [x] 14. Write or perform manual tests for PIX, Boleto, and Cartão creation flows.
- [x] 15. Simulate webhook events and verify database updates.

## Phase 6: Documentation
- [x] 16. Criar um manual detalhando a configuração do `cora-payment` no Supabase e como integrá-lo a partir de um site externo para processar pagamentos.
