## Context

The system currently uses an i18n-ready structure for activity titles and descriptions (JSONB), but an implementation bug in the frontend registration form causes descriptions to be stored as plain strings. Additionally, the governance workflow requires a way for members to communicate about specific tasks to clarify requirements or request more information before validation.

## Goals / Non-Goals

**Goals:**
- Correct the task registration payload to ensure data integrity for multilingual display.
- Enable community dialogue on tasks through a structured interaction system.
- Ensure real-time or near-real-time updates of task comments.

**Non-Goals:**
- Implementing a full-featured real-time chat (WebSocket-based). Standard polling or manual refresh is sufficient for now.
- Edit/Delete functionality for comments (minimal version first).

## Decisions

### 1. Database Schema for Interactions
A new table `activity_interactions` will be created instead of a generic "comments" table to allow for future extensibility (e.g., structured responses or attachments).

- **Table**: `activity_interactions`
  - `id`: UUID (Primary Key)
  - `activity_id`: UUID (Foreign Key to `activities`)
  - `user_id`: UUID (Foreign Key to `profiles`)
  - `content`: TEXT (The message)
  - `metadata`: JSONB (For future flags like `is_private`, `is_info_request`)
  - `created_at`: TIMESTAMPTZ

### 2. API Extension
The existing `api-work` Edge Function will be extended to handle interaction lifecycle:
- `fetchInteractions`: Returns chronological list of messages for a given activity ID, joining with `profiles` for user names/avatars.
- `postInteraction`: Creates a new record.

### 3. Data Migration for Legacy Descriptions
Existing records where the `description` column contains a string instead of a JSON object will be migrated to prevent display failures.
- **Strategy**: SQL update to wrap strings into `{ "pt": value, "en": value }`.

## Risks / Trade-offs

- **[Risk] Data Type Mismatch** → **[Mitigation]** The migration script will check if the value is already a JSON object before wrapping.
- **[Trade-off] Polling vs Sockets** → We will use simple state refresh after posting for now. Given the low-concurrency nature of these task interactions, full real-time sync via Supabase Realtime is deferred to keep complexity low.
