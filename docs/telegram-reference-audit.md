# Telegram Reference Audit: Deep Source-Code Investigation
**Project:** FRIENDS Dating Platform — Telegram-Depth Personal Messaging Engine  
**Author:** Antigravity Engineering Pair  
**Date:** November 2026

---

## 1. Executive Summary & Legal / Architectural Directives

To elevate the messaging capabilities of the **FRIENDS** dating platform to the highest tier of real-time reliability and interaction polish, this report provides a thorough, verifiable investigation of official Telegram open-source clients and core libraries:
1. **Telegram Web K (`TelegramOrg/Telegram-web-k`)**: Primary web reference (TypeScript, Solid/Virtual DOM, Vite).
2. **Telegram Android (`DrKLO/Telegram`)**: Touch gestures, voice note recording locks, animations (`TMessagesProj`).
3. **Telegram Desktop (`telegramdesktop/tdesktop`)**: Desktop keyboard navigation, responsive splitting (`Telegram/SourceFiles`).
4. **Telegram iOS (`TelegramMessenger/Telegram-iOS`)**: Asynchronous list rendering, gestures, haptics (`TelegramUI`).
5. **TDLib (`tdlib/td`)**: Message lifecycle, updates, ordering, offline reconciliation (`td/telegram`).

### Licensing & Intellectual Property Compliance
- **GPL v3.0 (Telegram Web K, Telegram Android, Telegram Desktop, Telegram iOS)**: These repositories are governed by GNU General Public License v3.0. Under our directive, **no GPL-licensed source code, proprietary shaders, branding, logos, or MTProto network bindings are copied or linked**.
- **Boost Software License 1.0 (TDLib)**: Permissive, but TDLib is an MTProto client library for Telegram's proprietary servers. We do not use MTProto or Telegram accounts; our platform runs its own authenticated WebSocket + SQLite/Postgres backend.
- **Architectural Implementation**: We study and independently implement the architectural patterns (state machines, monotonic sequence numbers, optimistic UI reconciliation, multi-device sync, and contextual interaction workflows) while strictly preserving our proprietary **Pink Ambient + Dark Luxury** visual design system.

---

## 2. Source-Code Architecture Mapping by Repository

### A. Telegram Web K (`TelegramOrg/Telegram-web-k`)
- **Primary Source Directories**:
  - `src/components/chat/`:
    - `chat.ts`: Main conversation container, manages active peer subscription, scroll geometry, and unread counters.
    - `bubbles.ts`: Message bubble renderer, bubble tail geometry, timestamp layout, status double-checks, reactions ribbon.
    - `input.ts`: Composer area, multiline textarea auto-sizing, draft debouncing, voice recording lock, attachment dock.
    - `topbar.ts`: Conversation header, peer status (online, last seen, typing status), voice/video call triggers.
    - `contextMenu.ts`: Long-press/right-click contextual menu (Reply, Copy, Pin, Edit, Delete, Forward, Save).
  - `src/components/mediaViewer/`:
    - `mediaViewer.ts`: Fullscreen lightbox, touch swipe transitions, zoom transformation, media downloading.
  - `src/lib/appManagers/`:
    - `appMessagesManager.ts`: Manages message lifecycle (`sending`, `sent`, `read`), sequence numbering, and local storage cache.
    - `appDraftsManager.ts`: Syncs drafts locally and remotely per peer.

### B. Telegram Android (`DrKLO/Telegram`)
- **Primary Source Files (`TMessagesProj/src/main/java/org/telegram/`)**:
  - `ui/ChatActivity.java`: Core chat fragment handling touch events, swipe-to-reply gesture velocity, virtualized message recycling, and keyboard avoidance.
  - `messenger/MessagesController.java`: Central state manager coordinating active dialogs, message caches, pinned messages, and read receipt updates.
  - `messenger/SendMessagesHelper.java`: Queue manager for outbound messages, media compression, audio recording chunking, and idempotency handling.

### C. Telegram Desktop (`telegramdesktop/tdesktop`)
- **Primary Source Files (`Telegram/SourceFiles/`)**:
  - `history/history_widget.cpp`: Main desktop chat widget controlling scrolling, keyboard shortcuts (`Esc` to close/cancel reply, `Up` arrow to edit last message, `Enter` to send, `Ctrl+F` in-chat search), and split-view sidebar resizing.
  - `history/history_item.cpp`: Underlying data model for message items, edit history preservation, and reaction aggregates.

### D. Telegram iOS (`TelegramMessenger/Telegram-iOS`)
- **Primary Source Files (`submodules/TelegramUI/`)**:
  - `ChatController.swift`: Manages chat view lifecycle, audio session routing (earpiece vs speaker), and interactive transitions.
  - `ChatHistoryListNode.swift`: High-performance asynchronous display list (`ListView`), optimizing scroll FPS and dynamic cell height calculation.
  - `ChatMessageItem.swift`: Message bubble layout constraints, grouped bubble corner radii, and reactions popover animation.

### E. TDLib (`tdlib/td`)
- **Key Schemas & Event Handlers (`td/telegram/`)**:
  - `sendMessage`: Outbound message dispatch with client-side temporary ID.
  - `updateNewMessage`: Authoritative server message dispatch emitting permanent message ID, sequence order, and timestamp.
  - `updateMessageSendSucceeded`: Reconciles optimistic local message with server record.
  - `updateChatPosition`: 64-bit integer `order` calculation for sorting chat list items.

---

## 3. Feature-by-Feature Deep Dive & Implementation Plan

### 1. Message Bubble Grouping & Tail Geometry
- **Telegram Behavior**: Consecutive messages from the same sender within 5 minutes omit repeated avatars and author titles. The outer corners of grouped messages have reduced border radius (e.g. 6px vs 18px), while only the final bubble receives the tail anchor.
- **FRIENDS Implementation**:
  - CSS layout classes: `.bubble-group-first`, `.bubble-group-middle`, `.bubble-group-last`.
  - Timestamp & read receipts nested in the bubble bottom-right with high contrast overlay.

### 2. Swipe-to-Reply & Threaded Previews
- **Telegram Behavior**: Horizontal swipe left on mobile triggers a spring-animated arrow and haptic feedback, loading the message into the composer reply banner. Tapping the reply banner navigates and flashes the referenced message.
- **FRIENDS Implementation**:
  - Integrated `replyToMessageId` in backend message payload.
  - Reply banner above composer with one-click dismiss (`X`).
  - Bubble click / tap on reply banner scrolls smoothly to the parent message and applies a temporary pink highlight glow.

### 3. Voice Recording with Real Audio Waveforms
- **Telegram Behavior**: Press-and-hold mic icon to record, slide up to lock, slide left to cancel. While locked, audio duration counts up and an animated waveform visualizes microphone input.
- **FRIENDS Implementation**:
  - Web Audio API `AudioContext` and `AnalyserNode` analyze real mic frequencies.
  - `MediaRecorder` generates WebM audio chunks, uploaded via `POST /api/v1/attachments/upload`.
  - Custom `VoiceWaveformPlayer` with scrubber seek and 1x / 1.5x / 2x speed toggle.

### 4. Real-Time WebRTC Calling
- **Telegram Behavior**: End-to-end peer calls with interactive signaling (offer, answer, ICE candidates), local/remote video switching, mic mute, and call duration HUD.
- **FRIENDS Implementation**:
  - Integrated `RTCPeerConnection` with STUN (`stun:stun.l.google.com:19302`).
  - Signaling handled over existing authenticated WebSocket via `call.signal`.
  - Floating call modal with real `<video>` streams and camera/mic controls.

### 5. Multi-Folder Navigation & Chat Filters
- **Telegram Behavior**: Top tab bar with custom folders (All, Personal, Work, Unread) and badges showing unread counts.
- **FRIENDS Implementation**:
  - Folders: `All`, `Matches`, `Friends`, `Unread`, `Archived`.
  - Persisted unread counters and archive states in relational database.

### 6. In-Chat Search & Message Jump
- **Telegram Behavior**: Search header filtering messages in real time with jump-to-result.
- **FRIENDS Implementation**:
  - Endpoint `GET /api/v1/conversations/:id/search?q=...`.
  - In-chat search bar with instant timeline filtering.

---

## 4. Visual Identity: Telegram Depth × Pink Ambient
We maintain a strict distinction between Telegram's functionality and our visual identity:
- **Telegram**: Neutral blue/cyan palette (`#2481CC`), standard flat white/grey panels.
- **FRIENDS**: Dark luxury plum/charcoal base (`#100B12`, `#1B121D`), rose-gold accents (`#FF4F87`, `#FF78A8`), blush highlights (`#FFB4CE`, `#FFF1F3`), soft glowing gradients, and translucent glassmorphism panels.
