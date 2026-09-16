# Design: Cora Payment Integration

## Architecture

We will implement a single Supabase Edge Function named `cora-payment` to handle both payment initiation and webhook handling based on the HTTP method and path.

### Components
1. **Edge Function `cora-payment`**:
   - `POST /` (or `POST /create`): Handles payment initiation from the frontend. Validates user, constructs the Cora Pro API payload based on the requested method (Boleto, PIX, Cartão), and calls the Cora API.
   - `POST /webhook`: Handles incoming webhooks from Cora Pro. Validates the signature, parses the event, and updates the payment status in the database.

2. **Database Schema**:
   - `cora_payments` (or use existing transactions table):
     - `id` (uuid)
     - `user_id` (uuid)
     - `amount` (numeric)
     - `payment_method` (varchar) - 'pix', 'boleto', 'credit_card'
     - `cora_transaction_id` (varchar)
     - `status` (varchar) - 'pending', 'paid', 'failed'
     - `created_at`, `updated_at`

### Dependencies
- Use `fetch` API within the edge function to communicate with Cora Pro API.
- Use `@supabase/supabase-js` to interact with the database using a Service Role Key for webhook updates, and standard client for user-initiated requests.

## Implementation Details

### Environment Variables
- `CORA_API_URL`: Cora API Base URL
- `CORA_CLIENT_ID`: Cora Client ID
- `CORA_PRIVATE_KEY` / `CORA_CERTIFICATE`: For mTLS / API authentication as required by Cora Pro.
- `CORA_WEBHOOK_SECRET`: To validate incoming webhooks.

### Error Handling
- Validate all incoming parameters (amount, method, buyer details).
- Return standard HTTP error codes with descriptive JSON payloads.
- Log failures to help with debugging.
