# Design: system-notifications-hub

## Database Schema

### Table: `notifications`
- `id`: UUID (Primary Key)
- `user_id`: UUID (References profiles.id)
- `title`: JSONB (Localized title)
- `message`: JSONB (Localized message)
- `type`: TEXT (e.g., 'system', 'vote', 'task', 'social')
- `link`: TEXT (Optional redirect path)
- `is_read`: BOOLEAN (Default: false)
- `created_at`: TIMESTAMPTZ (Default: now())

### Indexes
- `idx_notifications_user_id`: For fast lookup per user.
- `idx_notifications_unread`: For the counter.

## Frontend Architecture

### Context Provider: `NotificationContext`
- Holds the state of notifications and the unread count.
- Subscribes to Supabase Realtime for the current user's notifications.
- Exposes `markAsRead` and `delete` functions.

### Components
- `NotificationBell`: Toolbar icon with unread badge.
- `NotificationPopover`: Dropdown list of recent notifications.
- `NotificationPage`: Full view of all notifications.

## Event Integration
- **Voting**: New topic created, vote started, vote ended.
- **Tasks**: Task assigned, evidence submitted, validation received, payout processed.
- **Social**: New comment on a topic you commented on.
