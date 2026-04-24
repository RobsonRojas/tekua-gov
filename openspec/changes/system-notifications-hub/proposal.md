# Proposal: system-notifications-hub

## Objective
Implement a central in-app notification hub (Notification Center) to keep users informed about relevant platform events in real-time, improving engagement and reactivity to governance actions.

## Rationale
While we have Push Notifications, users need a way to see their notification history while using the platform without relying on OS-level banners. A notification hub is essential for social features like comments and contribution validations.

## Scope
- **Database**: 
    - Create `notifications` table (id, user_id, title, message, type, link, is_read, created_at).
- **Backend**:
    - Implement a helper function/trigger to auto-generate notifications for specific events (new comment, task confirmed, etc.).
- **Frontend**:
    - Notification bell icon in the Header.
    - Notification list drawer/popover.
    - Real-time updates using Supabase Realtime.
