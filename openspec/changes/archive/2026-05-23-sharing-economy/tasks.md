## 1. Database and Storage Setup

- [x] 1.1 Create `equipment_items` table with RLS policies and link to profiles
- [x] 1.2 Create `equipment_questions` and `equipment_moderation_logs` tables with RLS
- [x] 1.3 Create `sharing_transactions` table with RLS to track handovers
- [x] 1.4 Setup Supabase Storage bucket for handover evidence photos

## 2. Backend and API Endpoints

- [x] 2.1 Create Supabase edge function or Next.js API for creating/updating equipment items
- [x] 2.2 Create API endpoint for Q&A (asking and answering)
- [x] 2.3 Create API endpoint for moderation (remove with justification)
- [x] 2.4 Create API endpoint for handover workflow (borrower evidence, owner confirmation)
- [x] 2.5 Integrate `sharing_transactions` completion with the `wallet_system` to transfer "surreias"

## 3. Frontend - Marketplace and Listing

- [x] 3.1 Create new "Sharing" tab/page in the main navigation
- [x] 3.2 Build the marketplace grid/list view to display active, public equipment items
- [x] 3.3 Create the item creation/edit form (title, description, price, privacy toggle)
- [x] 3.4 Build the public item detail page (`/sharing/:itemId`)

## 4. Frontend - Moderation, Q&A, and Handover

- [x] 4.1 Implement Q&A UI on the item detail page (ask form for members, answer form for owner)
- [x] 4.2 Add admin moderation controls (remove button + justification modal) on item pages
- [x] 4.3 Build the handover UI for borrowers (upload evidence photo) and owners (confirm return)
- [x] 4.4 Add notification triggers for Q&A, moderation, and handover events
