# Data-Layer Reasoning: Chat Interactions & User Registration

### Expected Inferred Data Model
* **`users`**: `id`, `email`, `auth_provider`, `created_at`, `status`
* **`conversations`**: `id`, `user_id` (nullable for guest), `session_token`, `device_type`, `started_at`
* **`messages`**: `id`, `conversation_id`, `sender_type` (user | agent), `content`, `tokens_used`, `created_at`

---

### SQL Verification Queries

```sql
-- 1. Confirm conversation persistence and message order
SELECT 
    c.id AS conversation_id,
    c.user_id,
    COUNT(m.id) AS total_messages,
    MIN(m.created_at) AS session_start,
    MAX(m.created_at) AS session_last_activity
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
WHERE c.session_token = 'guest-session-uuid-xyz'
GROUP BY c.id, c.user_id
HAVING COUNT(m.id) >= 2;

-- 2. Detect orphaned agent answers or chronological inconsistencies
SELECT 
    m1.id AS user_message_id,
    m2.id AS agent_response_id,
    m1.created_at AS user_time,
    m2.created_at AS agent_time
FROM messages m1
LEFT JOIN messages m2 
    ON m1.conversation_id = m2.conversation_id 
    AND m2.sender_type = 'agent' 
    AND m2.created_at > m1.created_at
WHERE m1.sender_type = 'user'
  AND m1.created_at >= NOW() - INTERVAL '1 hour'
  AND m2.id IS NULL;