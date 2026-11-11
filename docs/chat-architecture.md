# Soulverse Chat & Real-Time Messaging Architecture Specification
**Document Version:** 2.0.0  
**Target Architecture:** Telegram-Inspired Real-Time Messaging Platform  
**System Foundation:** TypeScript, Node.js, Express, WebSocket, SQLite (WAL mode), React 19, Tailwind CSS v4

---

## 1. Architectural Overview & Design Philosophy

Soulverse's messaging platform is designed following the architectural principles of **TDLib**, **Telegram Web K**, and **Telegram Desktop**, adapted for an immersive human connection and identity universe.

The platform provides sub-50ms message propagation, monotonic conversation sequence ordering, offline synchronization, rich media streaming, and server-authoritative privacy controls without compromising browser performance or memory footprint.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOULVERSE MESSAGING STACK                        │
├────────────────────────────────────────────────────────────────────────┤
│  Client (React + TypeScript)                                           │
│   ├── Optimistic UI Cache & Pending Outbox Queue                       │
│   ├── Waveform Audio Recorder (Web Audio API + MediaRecorder)           │
│   ├── Sandboxed Sticker & Lottie Animated Emoji Engine                 │
│   └── Virtualized Chat Viewport (Sub-millisecond DOM recycling)        │
├────────────────────────────────────────────────────────────────────────┤
│  Transport Layer                                                       │
│   ├── WebSocket (Persistent Duplex Connection / Heartbeats)            │
│   ├── REST Fallback / Offline Synchronization Engine                   │
│   └── WebRTC PeerConnection Signaling (Audio / Video Calls)           │
├────────────────────────────────────────────────────────────────────────┤
│  Backend Server (Node.js + Express + WS Engine)                        │
│   ├── Monotonic Sequence Number Allocator                              │
│   ├── Client Idempotency Guard (Duplicate Detection)                   │
│   ├── Multi-Device WebSocket Fanout Router                             │
│   ├── Background Scheduled Message Dispatcher                          │
│   └── Permission & Privacy Policy Evaluator                            │
├────────────────────────────────────────────────────────────────────────┤
│  Data Layer (SQLite WAL Mode)                                          │
│   ├── `messages` (Indexed on conversation_id, sequence_number)         │
│   ├── `conversations` & `conversation_members`                         │
│   ├── `message_reactions` & `message_edit_history`                     │
│   ├── `scheduled_messages` & `user_blocks`                             │
│   └── `stickers` & `sticker_packs`                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Messaging Components

### 2.1 Monotonic Ordering & ACID Delivery
- Every message sent within a conversation is assigned a strictly increasing integer `sequence_number`.
- Transactions execute within SQLite's Write-Ahead Logging (`WAL`) mode, guaranteeing serializable delivery without race conditions between concurrent devices.
- Clients sort and reconcile timeline state using `(conversation_id, sequence_number)` rather than local client timestamps, eliminating out-of-order bubble jitter caused by unsynchronized device clocks.

### 2.2 Idempotency & Network Recovery Outbox
- Every outgoing message originates with a cryptographically unique `client_message_id` (UUIDv4) generated on the client.
- When an unstable network drops a connection during transit:
  1. The client retains unacknowledged messages in an in-memory optimistic outbox.
  2. Upon WebSocket reconnect, the client flushes pending messages with their original `client_message_id`.
  3. The server checks the `UNIQUE(conversation_id, client_message_id)` constraint:
     - If previously inserted, it idempotently returns the existing sequence number without creating a duplicate bubble.
     - If new, it commits and broadcasts to recipient devices.

### 2.3 Multi-Device Synchronization & Fanout
- A single user account can have simultaneous active sessions across desktop browsers, tablets, and mobile devices.
- The server maintains a `Map<userId, Set<WebSocket>>`:
  - When User A sends a message from their laptop, the event fans out to User B's active devices *and* echoes back to User A's mobile browser to immediately sync outbox state, read status, and drafts.

### 2.4 Message Editing, Deletion & Audit History
- **Editing:** When an author edits a message, the server archives the previous content in `message_edit_history` with timestamps, sets `is_edited = 1`, and broadcasts `message.edited` to active conversation members.
- **Deletion:** The server supports both soft-delete (with tombstone) and permanent cascade deletion, dispatching `message.deleted` to remove bubbles from client viewports immediately.
- **Reactions:** Mutual emoji reactions (❤️, 🔥, ✨, 🌹, 😂, 😮) are stored in `message_reactions`, allowing instant toggling, participant inspection, and real-time counter updates.

---

## 3. Media, Audio & Sticker Pipeline

### 3.1 Voice Notes & Audio Waveform Player
- Native recording via `navigator.mediaDevices.getUserMedia` using the browser's `MediaRecorder` API encoded into lightweight audio formats.
- Live volume amplitudes are sampled via an `AudioContext` and `AnalyserNode` during recording, generating an array of 32 normalized peak bars (`waveform_json`).
- Clients render interactive canvas/SVG waveforms with scrubbing and variable playback rates (`1.0x`, `1.5x`, `2.0x`).

### 3.2 Sticker & Emoji Ecosystem
- Curated vector and raster sticker packs categorized into *Love & Romance*, *Flirting & Chemistry*, *Memes & Reactions*, *Gaming*, and *Everyday Moments*.
- Optimized formats:
  - **WebP:** Transparent losslessly compressed raster stickers.
  - **Lottie / Vector:** Lightweight animated animations rendered with low CPU overhead.
- Safe client rendering: Stickers are loaded within restricted sandboxed DOM elements to prevent cross-origin script injection or CSS payload execution.

---

## 4. Privacy, Safety & Contact Notes

### 4.1 Telegram-Inspired Private Viewer Notes (`private_viewer_notes`)
- A viewer can record private notes about another user while inspecting their profile.
- **Cryptographic & Architectural Isolation:**
  - Notes are stored with composite key `(viewer_id, target_user_id)`.
  - The API endpoint `GET /api/v1/viewer-notes/:targetUserId` strictly verifies the authenticated `viewer_id`.
  - The target user or third-party viewers **can never see or discover** notes written about them.
  - Private notes are completely excluded from public profile responses and search index payloads.

### 4.2 Interaction Milestones & Progressive Discovery
- Soulverse tracks real conversation statistics (total messages exchanged, days connected, conversation frequency).
- Reaching thresholds (10, 50, 100, 250, 500, 1000 messages) unlocks celebratory milestones.
- **Anti-Exploitation Rule:**
  - Messages thresholds **NEVER** automatically expose addresses, phone numbers, or private memories.
  - Deeper information requires explicit, voluntary owner sharing through `relationship_voluntary_shares`.

### 4.3 Blocking & Reporting Controls
- `user_blocks`: Immediately terminates active WebRTC signaling and prevents direct message dispatch.
- `user_reports`: Structured abuse triage queue with reporter anonymity and administrative audit logging.

---

## 5. Security & Legal Considerations

- **Encryption Transparency:** Soulverse uses TLS 1.3 in-transit encryption. It does not falsely claim zero-knowledge end-to-end encryption until a double-ratchet protocol (such as the Signal or MTProto client protocol) is fully implemented, verified, and audited.
- **Copyright Integrity:** Soulverse utilizes custom, original artwork and open-source icons (Lucide / Unicode standard). It strictly prohibits extracting proprietary Telegram sticker packs, graphics, or copyrighted binary assets without authorization.
