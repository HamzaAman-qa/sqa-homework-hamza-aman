# Data-Layer Reasoning: Chat Messages & Account Creation

### (a) Sending a message to the agent

Expect a row per turn, not per conversation, so streaming and retries are auditable:

- **`conversations`**: `id`, `user_id` (nullable — guests exist pre-login), `session_token`, `started_at`
- **`messages`**: `id`, `conversation_id`, `sender_type` (`user`/`agent`), `content`, `created_at`, `latency_ms` (agent rows only)

### (b) Creating an account

Signup has to reconcile the guest session that likely already exists from Part (a):

- **`users`**: `id`, `email`, `created_at`, `auth_provider`
- **`conversations.user_id`** gets backfilled from `NULL` to the new `users.id` on the guest session that converted — this is the join that proves guest history didn't get orphaned.

### SQL verification queries

```sql
-- 1. Every message belongs to a conversation that still exists (no orphans)
SELECT m.id, m.conversation_id
FROM messages m
LEFT JOIN conversations c ON c.id = m.conversation_id
WHERE c.id IS NULL;

-- 2. Agent turns pair with a preceding user turn, same conversation, non-negative latency
SELECT m1.id AS user_msg, m2.id AS agent_msg
FROM messages m1
JOIN messages m2 ON m2.conversation_id = m1.conversation_id
  AND m2.sender_type = 'agent' AND m2.created_at > m1.created_at
WHERE m1.sender_type = 'user'
  AND (m2.latency_ms IS NULL OR m2.latency_ms < 0);

-- 3. A converted guest conversation now points at a real user row
SELECT c.id, c.user_id
FROM conversations c
LEFT JOIN users u ON u.id = c.user_id
WHERE c.user_id IS NOT NULL AND u.id IS NULL;
```

### Downstream pipeline integrity check

Before conversations feed an analytics job, assert **referential completeness per batch**: `count(distinct conversation_id in messages) == count(conversations ingested in the same window)`. A drop here means the pipeline silently lost conversations mid-stream rather than a query bug — the kind of thing a per-row check won't surface but a batch-level count will.
