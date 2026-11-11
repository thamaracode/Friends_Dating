# Telegram Feature Parity Matrix
**Project:** FRIENDS Dating & Social Discovery Platform  
**Target Benchmark:** Telegram (Web K / Android / Desktop / iOS / TDLib)

---

| Feature | Telegram Behavior | Our Current Behavior | Missing Work | Implementation Status | Tests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chat Folders** | Custom tabs (`All`, `Unread`, `Archived`, etc.) with real unread counts. | Tab bar filtering by `All`, `Matches`, `Friends`, `Unread`, `Archived`. | Custom user-created folders UI modal. | **IMPLEMENTED** | Vitest integration test verified. |
| **Message Ordering** | Monotonic server sequence and 64-bit TDLib order positioning. | Server-assigned integer sequence number per conversation. | None. Fully ACID compliant. | **IMPLEMENTED** | `seq` ordering verified in DB test. |
| **Idempotency** | Prevents duplicate sends on network retry via client-generated ID. | Unique `client_message_id` constraint with duplicate detection response. | None. | **IMPLEMENTED** | Resend retry test verified. |
| **Threaded Replies** | Swipe left to reply, jump to parent message with animated flash. | Reply banner in composer, parent snippet in bubble, jump-to-parent. | Enhanced spring swipe touch gesture on mobile. | **IMPLEMENTED** | Functional in UI. |
| **Message Editing** | Author can edit within time window; shows `edited` label and audit. | Author can edit message; logs to `message_edit_history`; `edited` label. | Configurable time-window expiry policy. | **IMPLEMENTED** | Vitest PATCH test verified. |
| **Message Deletion** | "Delete for me" and "Delete for everyone" options. | Full support for "Delete for everyone" soft deletion and local removal. | Bulk deletion selector. | **IMPLEMENTED** | WebSocket fanout test verified. |
| **Reactions** | Animated emoji bar, tap to toggle, reaction count badges. | Context menu emoji bar (❤️, 🔥, ✨, 🌹, 😂, 😮) with live aggregate counts. | Reaction animation popover spring. | **IMPLEMENTED** | Toggle test verified in Vitest. |
| **Pinning** | Pin messages in conversation header; jump to pinned item. | Pinned message banner at top of chat timeline; instant unpin/jump. | Multiple pinned messages carousel. | **IMPLEMENTED** | Pin patch test verified. |
| **Draft Sync** | Local and cloud draft synchronization across active devices. | Draft auto-saved on keystroke; restored on conversation open. | Debounced draft socket event. | **IMPLEMENTED** | Draft PUT/GET test verified. |
| **Voice Notes** | Hold-to-record, lock mode, live audio waveform, variable playback. | Native `MediaRecorder` + Web Audio API amplitudes + waveform player (1x/1.5x/2x). | Audio compression on low-bandwidth connections. | **IMPLEMENTED** | Waveform player verified. |
| **WebRTC Calls** | One-to-one encrypted audio and video calling with signaling. | Native `RTCPeerConnection` with STUN, camera toggle, mic mute, duration HUD. | TURN relay configuration for strict NATs. | **IMPLEMENTED** | Socket signaling verified. |
| **In-Chat Search** | Real-time text search highlighting matches in timeline. | Search bar in header filtering messages by substring instantaneously. | Match count indicators (1 of N) with Next/Prev. | **IMPLEMENTED** | Query test verified. |
| **Saved Messages** | Dedicated personal cloud chat for notes, forwarding, and bookmarks. | Dedicated `conv_saved` conversation with instant forward action. | Tagging and folder categorization for saved notes. | **IMPLEMENTED** | Saved conversation test verified. |
| **Scheduled Messages**| Schedule message for specific date/time; background delivery. | Backend background runner (10s sweep) dispatching due messages. | Date-time picker UI in composer. | **IMPLEMENTED** | Background queue test verified. |
| **Safety & Moderation**| Report spam/harassment, block user preventing new calls/messages. | Relational `user_blocks` blocking messages; `user_reports` submission queue. | Admin dashboard UI for reviewing reports. | **IMPLEMENTED** | Block & Report tests verified. |
| **Dating-Specific UX** | Custom Telegram bots / interactive games. | Native server-authoritative dating games (Truth or Dare, Would You Rather, Lucky Dice). | Additional mini-games (Two Truths and a Lie). | **IMPLEMENTED** | Game session initialization test verified. |
