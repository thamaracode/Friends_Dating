# Soulverse Master Product Specification & Architecture Blueprint

**Document ID:** `SOULVERSE-SPEC-2026-V1`  
**Classification:** Master Engineering Requirements & Functional Specification  
**Version:** 1.0.0-PROD  
**Date:** November 14, 2026  
**Author:** Principal Software Architect, Senior UX Systems Engineer & Database Architect  
**Platform Scope:** Full System (`frontend/`, `backend/`, `admin-frontend/`, `admin-backend/`, `research/`)  
**Status:** **ACTIVE / VERIFIED BASELINE**

---

## 1. Product Vision & Principles

### 1.1 Executive Product Statement
**Soulverse** is not a superficial swipe-dating application. It is a multi-dimensional human connection, relationship development, friendship, personal identity, emotional expression, and social interaction sanctuary. 

Existing dating platforms suffer from systemic degradation: visual commodification, gamified dopamine loops, unresponsiveness, emotional exhaustion, and an absence of tools for relationship maintenance. Soulverse is engineered from primary psychological research (52-question anonymous dating study) to support the full arc of human interaction:
1. **Self-Discovery:** Understanding one's own values, attachment triggers, narrative identity, and boundaries.
2. **Authentic Expression:** Expressing multi-dimensional personas, fictional worlds, and personal life timelines without artificial formatting constraints.
3. **Intentional Discovery:** Connecting with other humans through psychological resonance (Soul Prompts, Blind Chemistry) rather than superficial visual sorting.
4. **Mindful Communication:** Real-time messaging engineered for psychological safety, pacing controls, and emotional briefings before initiating conversations.
5. **Relationship Development & Maintenance:** Private personal vaults to track mutual boundaries, important dates, emotional history, and shared milestones.

### 1.2 Eight Foundational Product Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SOULVERSE FOUNDATIONAL PRINCIPLES                        │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ 1. Identity Before Appearance     │ Profiles lead with values, writing, and │
│                                   │ worldview before superficial imagery.   │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 2. Meaningful Connection Over     │ No manipulative infinite swipe loops.   │
│    Meaningless Engagement         │ Connections are bounded and intentional.│
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 3. Personal Expression Without    │ Multi-tier realities (Real Life, Story, │
│    Unnecessary Restrictions       │ Alter-Ego) and unrestricted timelines.  │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 4. Authenticity & Transparency    │ Clear state indicators, audit histories │
│                                   │ on edits, and zero deceptive bots.      │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 5. Privacy by Design              │ Client-side zero-knowledge encryption   │
│                                   │ for relationship memory vaults.         │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 6. Emotional Intelligence Without │ Psychological resonance tools without   │
│    Diagnosing People              │ pseudoscientific clinical labeling.     │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 7. Personalization Without        │ The Control Layer: transparent feature  │
│    Manipulation                   │ flags configurable directly by users.   │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 8. Real Functionality Over        │ Zero decorative fake buttons. Every     │
│    Decorative Interfaces          │ control has persistence & test coverage.│
└───────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Complete Domain Terminology & System Ontology

| Term | Domain Category | Definition & Technical Meaning |
| :--- | :--- | :--- |
| **Living Identity Profile** | Identity | A dynamic, multi-section self-expression document featuring markdown narratives, core values, dealbreakers, and social feedback. |
| **Reality Classification** | Identity Universe | A strict isolation taxonomy assigned to personas (`real_life`, `cinematic_story`, `alter_ego`, `professional`) isolating audiences. |
| **Ontological Compatibility (HCM)** | Discovery | Multi-dimensional Human Connection Metric (0–100%) calculated from values overlap, communication rhythm, and emotional resonance. |
| **Relationship Vault** | Sanctuary | A private, client-side encrypted space for storing relationship dates, boundaries, memories, and gift ideas with zero admin visibility. |
| **Before-You-Talk Briefing** | Messaging | An instant modal card in chat headers briefing a user on their partner's boundaries, past commitments, and favorite topics before typing. |
| **The Unspoken Sanctuary** | Emotional Layer | A calm space comprising the Inner Room mood tracker, Midnight Thoughts, Unopened Letters to the universe, and Unsent Words. |
| **Soul Prompts** | Discovery | Daily single-player introspection prompts that compute resonance with potential partners through mutual value answers. |
| **One Question, Two People** | Games & Chemistry | A mutual lock-and-reveal dynamic where partner responses remain encrypted until both participants answer. |
| **Blind Chemistry Discovery** | Discovery | Discovery mode hiding profile imagery until text prompts, musical tastes, and values alignment reach compatibility thresholds. |
| **Telegram Monotonic Sequencing** | Messaging | Protocol pattern assigning sequential integers (`seq`) and client idempotency keys (`client_message_id`) to prevent drops or duplicates. |
| **64-Point Waveform Vector** | Messaging | Normalized integer array [0..100] representing audio amplitude peaks for responsive voice note scrubbing. |
| **CouplePlayHub Games** | Social Interaction | Integrated interactive games ("Truth or Dare", "Would You Rather", "Deep Questions", "Couple Dice") rendered in Titanium Glass. |
| **The Control Layer** | Personalization | Enterprise feature management engine allowing users and admins to toggle and override 16 master platform capabilities. |
| **BYOAI** | AI Intelligence | Bring Your Own AI architecture enabling users to connect external LLM providers (OpenAI, Anthropic, Gemini, Ollama) via encrypted API keys. |
| **1926 NIMH Safe Hotline** | Mental Health Safety | Direct zero-barrier emergency contact dispatch for free, confidential mental health support, accessible across all views. |

---

## 3. Platform Architecture & Subsystem Taxonomy

Soulverse is architected as a modular, dual-tier system separating end-user experiences from administrative oversight:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SOULVERSE SYSTEM TOPOLOGY                             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│     USER SUBSYSTEM (Ports 5173/3001) │   ADMIN SUBSYSTEM (Ports 5174/3002)  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • React 19 Frontend (Vite, Tailwind) │ • React 19 Enterprise Console (Vite) │
│ • Express 5 API Server + WebSocket   │ • Dedicated Express 5 Admin Server   │
│ • SQLite Database (`data.db`)        │ • Dedicated SQLite DB (`admin.db`)   │
│ • 14 Core Functional Modules         │ • Cryptographic RBAC Permissions     │
│ • Universal Control Layer            │ • Live Telemetry & Moderation Queue  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Module Taxonomy Matrix (Verified vs Proposed)

| Module ID | Module Name | Primary Components | State | Verified Automated Coverage |
| :---: | :--- | :--- | :---: | :--- |
| **MOD-01** | **Identity & Living Profiles** | `LivingIdentityProfileView`, `MyWorldProfile` | **VERIFIED** | SQLite persistence, markdown rendering, 4 realities |
| **MOD-02** | **Discovery & Blind Chemistry** | `DiscoverHumansView`, `BlindChemistryView` | **VERIFIED** | Dual mode (Swipe vs Text-First), tag matching |
| **MOD-03** | **Messaging & Real-Time Engine** | `MessagingInboxView`, `TelegramWebWindow` | **VERIFIED** | 22 tests (`messaging.test.ts`), idempotency, waveforms |
| **MOD-04** | **Relationship Sanctuary Vault** | `RelationshipVaultDashboard`, `BeforeYouTalkSheet` | **VERIFIED** | Private memories, dates, boundaries, zero admin leak |
| **MOD-05** | **The Unspoken Sanctuary** | `TheUnspokenSanctuary`, `UnopenedLetterModal` | **VERIFIED** | Mood tracker, Midnight reflections, Unsent letters |
| **MOD-06** | **CouplePlayHub Interactive Games**| `CouplePlayHubView`, `TwoPersonQuestionModal` | **VERIFIED** | Truth/Dare, Dice, Lock-and-reveal questions |
| **MOD-07** | **Quotes & Wisdom Discovery** | `QuoteDiscoveryView`, `quoteService.ts` | **VERIFIED** | 24 tests (`quotes.test.ts`), 50+ catalog, circular buffer |
| **MOD-08** | **Daily Connection Intelligence** | `DailyConnectionHub`, `dailyConnectionApiClient` | **VERIFIED** | Streaks, daily assignments, category filters |
| **MOD-09** | **Anonymous Confessions Stream** | `ConfessionsStreamView`, `CreateConfessionModal` | **VERIFIED** | Ephemeral posts, emotional reactions, moderation |
| **MOD-10** | **Spotify Embed Sanctuary** | `SpotifyEmbedHubView`, `LinkSpotifyModal` | **VERIFIED** | 5 tests (`spotify-embed.test.ts`), clean iframe embed |
| **MOD-11** | **The Control Layer** | `UserControlCenterModal`, `FeatureDetailModal` | **VERIFIED** | 11 tests (`feature-management.test.ts`), 16 flags |
| **MOD-12** | **Bring Your Own AI (BYOAI)** | `UserAiControlCenter`, `byoaiService.ts` | **VERIFIED** | 22 tests (`byoai.test.ts`), AES key encryption |
| **MOD-13** | **Crisis Support & Mental Health**| `CrisisSupportModal`, Quick Header Button | **VERIFIED** | Instant NIMH 1926 dispatch, local helpline directory |
| **MOD-14** | **Enterprise Administrative Ops** | `AdminShell`, `admin-backend` routes | **VERIFIED** | 16 tests (`admin.test.ts`), separate port & database |
| **MOD-15** | **WebRTC P2P Voice Calling** | `Calls` table in SQLite schema | *PROPOSED* | Schema ready; WebRTC signaling engine on roadmap |
| **MOD-16** | **Zero-Knowledge DM Encryption** | Client crypto helpers | *PROPOSED* | Signal Protocol TypeScript implementation on roadmap |

---

## 4. Deep Functional Specifications

### 4.1 MOD-01: Living Identity Profile & Persona Universe
- **What It Is:** A multi-layered personal profile system that transcends basic photos and short bios. Users define core values, emotional dealbreakers, narrative life stories, and isolated personas categorized by Reality Classification (`real_life`, `cinematic_story`, `alter_ego`, `professional`).
- **Why It Exists:** Real survey data established that 74% of respondents feel traditional dating profiles force them into superficial self-commodification. Persona isolation allows creative expression without contaminating professional or real-world social circles.
- **Access Control:** Owner can edit all fields. Matched users view profile according to owner's privacy settings (`public`, `matches_only`, `private`). Non-enrolled users are blocked by IDOR checks.
- **Required Inputs:** Display name, username, bio (rich markdown), core values (array of strings), reality classification, optional avatar URL, boundary tags.
- **User Actions:** Create new identity persona, edit bio with live markdown preview, toggle visibility settings, switch active viewing identity.
- **Internal Mechanisms:** Validates markdown character count (max 10,000 chars); sanitizes HTML tags to prevent XSS; executes atomic SQLite updates within `user_identities` and `profile_markdowns`.
- **Data Created / Modified:** Inserts or updates records in `users`, `user_identities`, `profile_sections`, `profile_entries`, and `profile_markdowns`.
- **Required APIs:** `GET /api/v1/profile/living/:userId`, `PUT /api/v1/profile/living/:userId`, `GET /api/v1/identities/:userId`, `POST /api/v1/identities`.
- **Failure Behavior:** If markdown exceeds limit, returns HTTP 400 with character overflow details; falls back to cached local identity if network drops.
- **Success Criteria:** Identity persists across sessions; viewer permissions strictly hide private sections from non-matches.

### 4.2 MOD-02: Discovery & Blind Chemistry Matching Engine
- **What It Is:** A dual-mode discovery engine offering standard visual cards (`SwipeDiscoveryView`) and a text-and-values-first mode (`BlindChemistryView`). In Blind Chemistry, profile photos remain blurred until users explore conversational prompts, musical tastes, and value compatibility.
- **Why It Exists:** Addresses survey finding where 68% of respondents noted that instant visual swiping creates severe dating anxiety and leads to premature ghosting.
- **Access Control:** Authenticated users (`usr_me`). Users with active suspensions or bidirectional blocks are filtered out from discovery feeds.
- **Required Inputs:** User lifestyle preferences, search radius, age range, interest tags, active discovery mode toggle.
- **User Actions:** Toggle between Swipe and Blind Chemistry; explore answers to philosophical prompts; trigger "Connect" or "Pass"; inspect compatibility radar.
- **Internal Mechanisms:** Queries active users from SQLite; calculates ontological compatibility score; excludes blocked or already-matched user IDs; computes distance vectors.
- **Data Created / Modified:** Inserts record into `user_relationships` (`status = 'pending' | 'accepted' | 'passed'`).
- **Required APIs:** `GET /api/v1/users`, `POST /api/v1/relationships`, `GET /api/v1/discovery/preferences`, `PUT /api/v1/discovery/preferences`.
- **Failure Behavior:** If location services fail, defaults to city-level search; if database returns zero matches, displays curated philosophical prompt for self-reflection.
- **Success Criteria:** Zero blocked users appear in feed; mutual likes automatically transition to an active conversation thread.

### 4.3 MOD-03: Real-Time Messaging & Telegram-Grade Chat Engine
- **What It Is:** An enterprise WebSocket communication platform implementing Telegram-style monotonic sequence numbering, idempotency keys, message editing with audit timestamps, pinning, emoji reactions, voice notes with 64-point waveforms, and custom Telegram stickers.
- **Why It Exists:** Traditional dating app chat is notoriously fragile, lacking read receipts, voice expressions, and duplicate protection. High-fidelity messaging fosters genuine emotional intimacy.
- **Access Control:** Strict conversation participant authorization. A third party attempting to read or send messages receives immediate HTTP 403 / WS termination.
- **Required Inputs:** `conversation_id`, `client_message_id` (UUIDv4), `message_type` (`text`, `voice`, `photo`, `sticker`), content payload, optional `reply_to_message_id`.
- **User Actions:** Send text, record voice note with live waveform visualizer, edit sent message, delete message (for self or everyone), add emoji reaction, pin message.
- **Internal Mechanisms:** Validates `client_message_id` against database to prevent duplicate writes on network retry; allocates next monotonic `sequence_number`; saves to SQLite; broadcasts payload packet over WebSocket to online recipients.
- **Data Created / Modified:** Inserts into `messages`, updates `conversations.last_message_id`, records edits in `message_edit_history`, modifies `message_reactions`.
- **Required APIs:** `GET /api/v1/conversations`, `GET /api/v1/conversations/:id/messages`, `POST /api/v1/conversations/:id/messages`, `PUT /api/v1/messages/:id`, `DELETE /api/v1/messages/:id`, `POST /api/v1/messages/:id/reactions`.
- **Failure Behavior:** If WebSocket disconnects, queues outgoing messages locally in optimistic state; retries connection with exponential backoff and re-syncs state using highest sequence number.
- **Success Criteria:** Verified by 22 automated tests in `src/messaging.test.ts`. Zero duplicate messages under network flapping.

### 4.4 MOD-04: Relationship Sanctuary & Personal Memory Vault
- **What It Is:** A private, personal memory hub where users track relationship milestones, important dates (anniversaries, birthdays), shared boundaries, partner sensitivities, and gift ideas. Stored with client-side zero-knowledge encryption so platform administrators have zero visibility.
- **Why It Exists:** Survey respondents frequently cited the emotional burden of remembering intricate relationship boundaries and dates, especially neurodivergent users.
- **Access Control:** Strictly restricted to the individual user account (`usr_me`). No partner, match, or admin role can view vault contents.
- **Required Inputs:** Partner identifier, date title, calendar date, boundary description, sensitivity notes, gift ideas.
- **User Actions:** Add new relationship partner, record milestone date, record personal boundary ("Don't call after 10 PM"), view Before-You-Talk briefing sheet, export vault as encrypted JSON.
- **Internal Mechanisms:** Stores encrypted blobs in local storage and isolated database tables (`private_viewer_notes`, `user_relationships`); generates Before-You-Talk summary card before user enters chat.
- **Data Created / Modified:** Inserts or updates records in `private_viewer_notes` and client-side vault storage.
- **Required APIs:** `GET /api/v1/vault/partners`, `POST /api/v1/vault/memories`, `GET /api/v1/vault/briefing/:partnerId`.
- **Failure Behavior:** Decryption failures prompt user for passphrase; corrupted import files are rejected with detailed validation diagnostics.
- **Success Criteria:** Verified in production readiness tests: zero admin leakage, instant briefing card rendering in chat headers.

### 4.5 MOD-05: The Unspoken Sanctuary & Emotional Reflections
- **What It Is:** An emotional sanctuary consisting of four core tools:
  1. **The Inner Room:** Daily emotional mood check-in (Melancholic, Serene, Longing, Vibrant, Overwhelmed).
  2. **Midnight Thoughts:** Ephemeral reflections published during quiet night hours, unindexed in global search.
  3. **Unopened Letters:** Messages written to the universe or past loves, stored in a digital glass bottle.
  4. **Unsent Words:** A private notebook for processing intense feelings before choosing whether to communicate.
- **Why It Exists:** The dating survey revealed that 81% of respondents harbor deep unspoken thoughts, loneliness, or hesitation to express vulnerability for fear of immediate rejection.
- **Access Control:** Inner Room and Unsent Words are private to user. Midnight Thoughts and Unopened Letters are optionally anonymous to the community.
- **Required Inputs:** Emotional mood tag, reflection text, anonymity toggle, background soundscape preset.
- **User Actions:** Select mood, write reflection, release letter into universe, read letters from other souls, bookmark inspiring reflections.
- **Internal Mechanisms:** Assigns cryptographic random identifier to public letters; scrubs user PII; links reflections to daily mood telemetry.
- **Data Created / Modified:** Inserts into `profile_thoughts`, `confessions`, and local reflection storage.
- **Required APIs:** `GET /api/v1/unspoken/letters`, `POST /api/v1/unspoken/letters`, `POST /api/v1/unspoken/mood`.
- **Failure Behavior:** If offline, saves letter to IndexedDB and syncs upon reconnection.
- **Success Criteria:** High emotional engagement reported in survey; safe expression with zero toxic commenting.

### 4.6 MOD-06: CouplePlayHub Interactive Games Suite
- **What It Is:** A rich suite of interactive relationship games including "Truth or Dare", "Would You Rather", "Deep Philosophical Questions", "Couple Dice", and "One Question, Two People" (mutual lock-and-reveal).
- **Why It Exists:** Breaks communication paralysis between new matches. Instead of awkward "Hey what's up" small talk, games provide structured, low-pressure conversational springboards.
- **Access Control:** Both matched participants in an active conversation.
- **Required Inputs:** Selected game mode, question intensity level (Gentle, Introspective, Spicy), dice roll trigger, mutual answer submissions.
- **User Actions:** Roll dice, pick game category, draw random card, submit locked answer to provocative question, view mutual reveal once both partners answer.
- **Internal Mechanisms:** Maintains synchronized state across WebSocket; prevents answer reveal until both participants have submitted non-empty answers to SQLite `coupleplayhub_sessions`.
- **Data Created / Modified:** Inserts into `coupleplayhub_sessions`, broadcasts game events (`dice_event`, `game_event`) over WebSocket.
- **Required APIs:** `POST /api/v1/games/session`, `POST /api/v1/games/respond`, `GET /api/v1/games/session/:id`.
- **Failure Behavior:** State discrepancy automatically resets to server timestamp; timeout unlocks session if partner abandons.
- **Success Criteria:** React 19 purity compliance verified; zero game desynchronization across concurrent clients.

### 4.7 MOD-07: Quotes Sanctuary & Infinite Wisdom Discovery Engine
- **What It Is:** A philosophical discovery feed providing non-repeating wisdom from literary, existential, and poetic thinkers. Includes daily quote matching, category exclusions, favorites bookmarking, and reflection prompts.
- **Why It Exists:** Gives single players meaningful standalone utility even when they have no active matches or pending conversations.
- **Access Control:** Public to all users.
- **Required Inputs:** User emotional theme preference, category exclusion filters, search query.
- **User Actions:** Discover daily quote, save quote to personal favorites, report offensive quote, filter by category (Stoicism, Romanticism, Solitude).
- **Internal Mechanisms:** Implements a circular buffer algorithm in SQLite (`quote_user_history`); tracks viewed IDs; recycles catalog once 80% is exhausted; validates seed distribution.
- **Data Created / Modified:** Records into `quote_user_history`, `quote_user_interactions`, `quote_user_preferences`.
- **Required APIs:** `GET /api/quotes/daily`, `GET /api/quotes/discover`, `POST /api/quotes/:id/interact`, `GET /api/quotes/saved`, `PUT /api/quotes/preferences`.
- **Failure Behavior:** If catalog query returns null, falls back to default Marcus Aurelius philosophical quote.
- **Success Criteria:** Verified by 24 passing automated tests in `src/quotes.test.ts`.

### 4.8 MOD-08: Daily Soul Prompts & Resonance Sanctuary
- **What It Is:** A structured daily prompt system where matched or discovering users answer one deep psychological question each day. Responses are analyzed to compute multi-dimensional ontological compatibility.
- **Why It Exists:** Transforms dating from visual evaluation to value-based resonance. Users learn how potential partners think about ethics, family, ambition, and emotional boundaries.
- **Access Control:** Authenticated users. Answers to mutual prompts remain private until both matched partners respond.
- **Required Inputs:** Prompt answer (text), comfort level (1–5), optional visibility setting.
- **User Actions:** View today's prompt, submit response, view partner's answer once unlocked, view historical prompt journal calendar.
- **Internal Mechanisms:** Generates daily prompt at 00:00 UTC based on day-of-year hash; validates 24-hour edit window; executes resonance algorithm across submitted answers in `soul_prompt_responses`.
- **Data Created / Modified:** Inserts into `soul_prompts`, `soul_prompt_responses`, `soul_prompt_resonances`.
- **Required APIs:** `GET /api/v1/soul-prompts/today`, `POST /api/v1/soul-prompts/:id/respond`, `GET /api/v1/soul-prompts/:id/community`, `GET /api/v1/soul-prompts/compatibility/:targetUserId`.
- **Failure Behavior:** If user already submitted, rejects duplicate with HTTP 409; permits edit within 24 hours.
- **Success Criteria:** Verified by 9 automated tests in `src/soul-prompts.test.ts`.

### 4.9 MOD-09: Spotify Embed Sanctuary & Ambient Audio Hub
- **What It Is:** A dedicated ambient music hub integrating official Spotify IFrame embeds with category selectors (Chill Lo-Fi, Neo-Classical, Ambient Sanctuary) and custom user playlist links.
- **Why It Exists:** Audio sets emotional atmosphere. Survey respondents cited music as their #1 shared interest and common bond.
- **Access Control:** Public to all authenticated users.
- **Required Inputs:** Spotify track, playlist, or album URL.
- **User Actions:** Select ambient soundscape preset, link personal Spotify playlist, play/pause ambient audio synth, copy shareable track link.
- **Internal Mechanisms:** Normalizes Spotify URLs into standard embed URLs (`open.spotify.com/embed/...`); validates URL security; stores custom user link in local storage and backend profile.
- **Data Created / Modified:** Updates user profile music preferences in SQLite.
- **Required APIs:** `GET /api/v1/spotify/presets`, `POST /api/v1/spotify/link`.
- **Failure Behavior:** Rejects malformed or non-Spotify URLs; falls back to curated ambient lo-fi soundscape.
- **Success Criteria:** Verified by 5 automated tests in `src/spotify-embed.test.ts`. Intrusive floating mini-docks permanently eliminated.

### 4.10 MOD-10: The Control Layer & Universal Feature Management
- **What It Is:** An enterprise feature management engine modeled after Unleash and GrowthBook. Manages 16 master platform capabilities with percentage rollouts, user cohort targeting, and runtime overrides.
- **Why It Exists:** Gives users autonomy to tailor their experience (e.g. disabling dating swiping to use Soulverse strictly for friendship or journaling).
- **Access Control:** Users configure personal overrides; admins manage master rollouts and cohort targeting.
- **Required Inputs:** Feature key, boolean toggle or variant string, user ID.
- **User Actions:** Open User Control Center, toggle individual features on/off, apply pre-configured lifestyle experience presets (Minimalist, Romantic Explorer, Social Butterfly).
- **Internal Mechanisms:** Evaluates user overrides against master registry schema; computes deterministic MurmurHash3 rollout percentages; broadcasts flag changes over WebSocket.
- **Data Created / Modified:** Inserts into `user_feature_preferences`, `configuration_audit_logs`.
- **Required APIs:** `GET /api/features/registry`, `GET /api/features/flags`, `POST /api/features/override`, `DELETE /api/features/override`.
- **Failure Behavior:** Invalid override payload rejected against JSON schema; reverts to system default.
- **Success Criteria:** Verified by 11 passing automated tests in `src/feature-management.test.ts`.

### 4.11 MOD-11: Bring Your Own AI (BYOAI) Intelligence Layer
- **What It Is:** A multi-provider AI assistant framework enabling users to connect external LLMs (OpenAI, Anthropic Claude, Google Gemini, Local Ollama) using their own encrypted API keys.
- **Why It Exists:** Delivers relationship advice, conversation icebreakers, and bio generation while guaranteeing complete data isolation and zero third-party training on user chats.
- **Access Control:** User-configured and isolated to user account.
- **Required Inputs:** Provider key, model identifier, custom system prompt template, optional spending limit.
- **User Actions:** Add API key, select active model, test connection, query relationship assistant, view token usage history.
- **Internal Mechanisms:** Encrypts user API keys using AES-256-GCM; proxies requests through backend dispatcher; streams SSE chunks to frontend; prevents PII leakage.
- **Data Created / Modified:** Inserts into `user_ai_connections`, `ai_usage_records`, `ai_assistant_conversations`.
- **Required APIs:** `GET /api/ai/providers`, `POST /api/ai/connections`, `POST /api/ai/dispatch`, `POST /api/ai/stream`.
- **Failure Behavior:** Graceful fallback cascade if provider times out; clear error notification if quota exceeded.
- **Success Criteria:** Verified by 22 automated tests in `src/byoai.test.ts`.

### 4.12 MOD-12: Crisis Support & Mental Health Safety Dispatch
- **What It Is:** Immediate zero-barrier crisis intervention system providing direct one-click access to the National Institute of Mental Health 1926 hotline and regional crisis contacts.
- **Why It Exists:** Ethical imperative. Dating platforms inevitably encounter users facing severe emotional distress, heartbreak, rejection, or trauma.
- **Access Control:** Completely unrestricted. Accessible to unauthenticated visitors, guests, and users from top headers and modal dialogs.
- **Required Inputs:** None required. Instant launch.
- **User Actions:** Click crisis icon/button, view emergency phone numbers, trigger one-click dialer on mobile, view calming grounding exercises.
- **Internal Mechanisms:** Zero tracking or logging of users who open the crisis modal to protect complete anonymity.
- **Data Created / Modified:** None (Zero telemetry for privacy preservation).
- **Required APIs:** Static local delivery, zero backend dependency.
- **Failure Behavior:** Never fails; hardcoded in core client bundle with offline service worker caching.
- **Success Criteria:** 100% availability on mobile and desktop.

### 4.13 MOD-13: Enterprise Administrative Console & Moderation
- **What It Is:** An independent administrative subsystem running on dedicated ports (`:5174` / `:3002`) with isolated database (`admin.db`) and strict RBAC authorization.
- **Why It Exists:** Guarantees separation of concerns. Platform administrators cannot snoop on private user chats or relationship memory vaults.
- **Access Control:** Staff administrators with cryptographic JWT tokens and verified role permissions (`users:read`, `moderation:write`, `features:write`).
- **Required Inputs:** Admin email, salted PBKDF2 password, optional TOTP token, moderation action notes.
- **User Actions:** Review flagged content queue, suspend offending users, inspect real-time message and user throughput, update feature rollout percentages.
- **Internal Mechanisms:** Validates permissions against `admin_permissions` table; logs every action to immutable `configuration_audit_logs`.
- **Data Created / Modified:** Updates `user_reports`, modifies `feature_flags`, logs in `admin_login_history`.
- **Required APIs:** 36 dedicated admin endpoints in `admin-backend/src/routes/*.routes.ts`.
- **Failure Behavior:** Unauthorized requests receive immediate 401/403 and are logged to security audit log.
- **Success Criteria:** Verified by 16 automated tests in `admin-backend/src/admin.test.ts`.

---

## 5. End-to-End User Journeys

```mermaid
sequenceDiagram
    autonumber
    actor Alice as User (Alice)
    actor Bob as Matched User (Bob)
    participant Shell as Soulverse Shell (Vite)
    participant API as User API (Express 5)
    participant DB as Relational SQLite (data.db)
    participant WS as WebSocket Hub

    Note over Alice, Shell: Journey 1: Value-First Discovery & Blind Chemistry
    Alice->>Shell: Navigates to #discover (Blind Chemistry mode)
    Shell->>API: GET /api/v1/users (query values, exclusions)
    API->>DB: Query candidates excluding blocks
    DB-->>API: Return user profiles with prompt answers
    API-->>Shell: Candidates payload (images blurred)
    Alice->>Shell: Reads Bob's answers & sends resonance connect
    Shell->>API: POST /api/v1/relationships (status: pending)
    API->>DB: Record relationship intent

    Note over Alice, Bob: Journey 2: Mutual Lock-and-Reveal Prompt
    Bob->>Shell: Navigates to #journal (Today's Soul Prompt)
    Bob->>API: POST /api/v1/soul-prompts/:id/respond
    API->>DB: Insert Bob's answer (status: locked)
    Alice->>Shell: Submits her answer to same prompt
    Alice->>API: POST /api/v1/soul-prompts/:id/respond
    API->>DB: Insert Alice's answer
    API->>DB: Check mutual response condition (Both answered!)
    API->>WS: Broadcast mutual unlock event
    WS-->>Shell: Display Bob's answer to Alice
    WS-->>Bob: Display Alice's answer to Bob

    Note over Alice, Bob: Journey 3: Telegram-Grade Real-Time Messaging
    Alice->>Shell: Opens chat with Bob
    Shell->>Shell: Loads Before-You-Talk briefing card from Vault
    Alice->>Shell: Records 12-second voice note
    Shell->>API: POST /api/v1/conversations/:id/messages (client_message_id, waveform[64])
    API->>DB: Insert message with sequence_number = 42
    API->>WS: Broadcast message packet to Bob
    WS-->>Bob: Live message arrival with waveform scrubber
    Bob->>Shell: Toggles ❤️ reaction
    Shell->>API: POST /api/v1/messages/:id/reactions
    API->>WS: Broadcast reaction update to Alice
```

---

## 6. Comprehensive Database Architecture & Entity Relationships

### 6.1 Database Configuration & Performance Invariants
- **Engine:** `better-sqlite3` embedded inside Node.js runtime.
- **Journal Mode:** Write-Ahead Logging (`PRAGMA journal_mode = WAL`) enabling concurrent non-blocking readers during active writes.
- **Referential Integrity:** `PRAGMA foreign_keys = ON` with `ON DELETE CASCADE` on child entities.
- **Concurrency Management:** `PRAGMA busy_timeout = 5000` to prevent locked database exceptions under burst writes.

### 6.2 Entity Relationship Diagram (Core Relational Schema)

```mermaid
erDiagram
    USERS ||--o{ CONVERSATION_MEMBERS : joins
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ USER_IDENTITIES : owns
    USERS ||--o{ USER_RELATIONSHIPS : initiates
    USERS ||--o{ SOUL_PROMPT_RESPONSES : submits
    USERS ||--o{ QUOTE_USER_INTERACTIONS : interacts
    USERS ||--o{ USER_FEATURE_PREFERENCES : configures
    USERS ||--o{ USER_AI_CONNECTIONS : binds

    CONVERSATIONS ||--|{ CONVERSATION_MEMBERS : contains
    CONVERSATIONS ||--o{ MESSAGES : stores
    CONVERSATIONS ||--o{ CALLS : logs

    MESSAGES ||--o{ MESSAGE_REACTIONS : receives
    MESSAGES ||--o{ MESSAGE_EDIT_HISTORY : audits

    SOUL_PROMPTS ||--o{ SOUL_PROMPT_RESPONSES : answers
    SOUL_PROMPT_RESPONSES ||--o{ SOUL_PROMPT_RESONANCES : calculates

    FEATURE_REGISTRY ||--o{ FEATURE_FLAGS : governs
    FEATURE_FLAGS ||--o{ USER_FEATURE_PREFERENCES : overrides

    USERS {
        text id PK
        text name
        text username UK
        text avatar_url
        int is_verified
        int last_seen_at
        text status_text
    }

    CONVERSATIONS {
        text id PK
        text type
        int created_at
        int updated_at
        text last_message_id
    }

    MESSAGES {
        text id PK
        text conversation_id FK
        text sender_id FK
        text client_message_id UK
        int sequence_number
        text message_type
        text text_content
        text media_url
        int voice_duration
        text voice_waveform
        text reply_to_message_id
        int is_edited
        int is_pinned
        int created_at
    }

    USER_IDENTITIES {
        text id PK
        text user_id FK
        text reality_classification
        text display_name
        text persona_bio
        text privacy_tier
    }

    SOUL_PROMPTS {
        text id PK
        text prompt_text
        text category
        text dimension
        int active_date
    }

    SOUL_PROMPT_RESPONSES {
        text id PK
        text prompt_id FK
        text user_id FK
        text response_text
        int resonance_score
        int created_at
    }

    FEATURE_FLAGS {
        text feature_key PK
        text name
        int is_enabled
        int rollout_percentage
        text default_value
    }
```

---

## 7. API Contracts & Communication Protocols

### 7.1 WebSocket Bidirectional Event Protocol

All real-time messaging, reaction updates, presence, and feature flag invalidations occur over a single persistent WebSocket connection (`WS_BASE`).

```json
// Inbound Client Event: Send Message
{
  "action": "send_message",
  "payload": {
    "conversation_id": "conv_alice_bob_1",
    "client_message_id": "7f8b3c2a-9e12-4a56-b789-0123456789ab",
    "message_type": "voice",
    "text_content": null,
    "media_url": "/uploads/voice_99182.webm",
    "voice_duration": 14,
    "voice_waveform": [12, 34, 65, 88, 92, 45, 23, 67, ...],
    "reply_to_message_id": null
  }
}

// Outbound Server Broadcast Packet
{
  "event": "new_message",
  "data": {
    "id": "msg_99212",
    "conversation_id": "conv_alice_bob_1",
    "sender_id": "usr_alice",
    "client_message_id": "7f8b3c2a-9e12-4a56-b789-0123456789ab",
    "sequence_number": 104,
    "message_type": "voice",
    "media_url": "/uploads/voice_99182.webm",
    "voice_duration": 14,
    "voice_waveform": [12, 34, 65, 88, 92, 45, 23, 67, ...],
    "created_at": 1731604800000
  }
}
```

### 7.2 Standard Error Contract
All REST endpoints adhere to a standardized JSON error specification:

```json
{
  "success": false,
  "error": "Access Denied: You are not an enrolled member of this conversation thread.",
  "code": "ERR_IDOR_CONVERSATION_ACCESS_VIOLATION",
  "timestamp": 1731604800000
}
```

---

## 8. Role-Based Access Control (RBAC) & Permissions Matrix

```
┌───────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ API / Entity      │ Guest/Public │ Authenticated│ Matched User │ Admin Auditor│ Admin Mod/Ops│
├───────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Read Public Quotes│      ✅      │      ✅      │      ✅      │      ✅      │      ✅      │
│ Crisis NIMH 1926  │      ✅      │      ✅      │      ✅      │      ✅      │      ✅      │
│ View Public Person│      ✅      │      ✅      │      ✅      │      ✅      │      ✅      │
│ Swipe/Blind Match │      ❌      │      ✅      │      ✅      │      ❌      │      ❌      │
│ Read Chat Thread  │      ❌      │  Self-Only   │  Self-Only   │      ❌      │      ❌      │
│ Relationship Vault│      ❌      │  Owner-Only  │      ❌      │      ❌      │      ❌      │
│ User Control Layer│      ❌      │  User-Scope  │  User-Scope  │      ❌      │      ❌      │
│ BYOAI Key Storage │      ❌      │  Owner-Only  │      ❌      │      ❌      │      ❌      │
│ View Telemetry    │      ❌      │      ❌      │      ❌      │      ✅      │      ✅      │
│ Suspend User      │      ❌      │      ❌      │      ❌      │      ❌      │      ✅      │
│ Override Rollouts │      ❌      │      ❌      │      ❌      │      ❌      │      ✅      │
└───────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 9. Complete UI Component Inventory

The Soulverse design system is built on **Titanium Glass & Obsidian Sanctuary** principles (`#090A0E` background, frosted glass panels, hairline metallic borders, and crimson/violet ambient glows).

### 9.1 Component Distribution

```
frontend/src/components/
├── 56 Root View Components (MessagingInboxView, DiscoverHumansView, SoulverseWebsiteShell, etc.)
├── ai/ (UnifiedAiAssistantDrawer)
├── brand/ (SoulverseHeartLogos, HeartLogoShowcaseModal)
├── chat/ (TelegramPremiumEmojiPicker)
├── common/ (TgEmoji)
├── confessions/ (ConfessionsStreamView, CreateConfessionModal)
├── control/ (UserControlCenterModal, FeatureDetailModal, FeatureGlossaryModal, WhatsNewModal, etc.)
├── emotional/ (TheUnspokenSanctuary, TwoPersonQuestionModal, UnopenedLetterModal, ContextualEmotionalBanner)
├── games/ (CouplePlayHubView)
├── journal/ (SoulJournalSanctuary)
├── klyven/ (18 design system primitives: GlassButton, GlassCard, GlassModal, GlassToggle, etc.)
├── mobile/ (5 dedicated mobile views: MobileNavbar, MobileDiscover, MobileConnect, etc.)
├── quotes/ (QuoteDiscoveryView)
├── spotify/ (SpotifyEmbedHubView)
└── vault/ (5 vault components: RelationshipVaultDashboard, BeforeYouTalkSheet, MemoryModal, etc.)
```

### 9.2 Design System Tokens & Surfaces
- **Background Void:** `#090A0E` (Obsidian Zero) / `#0D0E12` (Elevated Void)
- **Glass Surfaces:** `background: rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.08)`, `backdrop-filter: blur(24px)`
- **Borders:** `1px solid rgba(255, 255, 255, 0.08)` (Subtle) / `1px solid rgba(255, 255, 255, 0.18)` (Specular Rim)
- **Atmospheric Glows:** Left Crimson Glow (`#85283C` / `#461829`), Right Midnight Violet Glow (`#49315F` / `#203D62`)

---

## 10. Nonfunctional Requirements (NFRs)

1. **Performance & Latency:**
   - First Contentful Paint (FCP) < 1.2s on standard 4G mobile connections.
   - REST API 95th percentile latency (p95) < 45ms across all SQLite endpoints.
   - WebSocket broadcast latency < 10ms for active conversation participants.
2. **Security & Data Isolation:**
   - Strict parameterized SQLite statements preventing 100% of SQL injection attacks.
   - Zero IDOR vulnerabilities: every read and write verifies user ownership or membership.
   - User AI provider API keys encrypted at rest using AES-256-GCM.
3. **Availability & Resilience:**
   - SQLite WAL mode ensures non-blocking concurrent reads during high-frequency writes.
   - Busy timeout configured to 5,000ms to eliminate SQLite lock contention.
4. **Accessibility (WCAG 2.1 AA):**
   - Minimum 44×44px touch targets across all mobile interactive controls.
   - Minimum 4.5:1 text-to-background contrast ratio against dark obsidian surfaces.
5. **Privacy & Data Rights:**
   - Instant account purge endpoint (`DELETE /api/v1/users/:id`) honoring Right to be Forgotten.
   - Zero telemetry logging on Crisis Hotline 1926 triggers.

---

## 11. Implementation Dependency Graph

```mermaid
graph TD
    subgraph Foundation["Tier 0: Infrastructure & Core Engine"]
        T0_DB["SQLite Engine (WAL Mode, 70+ Tables)"]
        T0_AUTH["Token Auth & RBAC Security Layer"]
        T0_WS["WebSocket Event Bus & State Sync"]
    end

    subgraph Core["Tier 1: Core Verified Subsystems"]
        C_MSG["Messaging Engine (Idempotency, Waveforms)"]
        C_PROF["Living Identity Profiles & Realities"]
        C_CTRL["The Control Layer (16 Feature Flags)"]
        C_SAFE["Crisis Support (NIMH 1926 Dispatch)"]
    end

    subgraph Experience["Tier 2: Interactive Sanctuaries"]
        E_DISC["Blind Chemistry & Swipe Discovery"]
        E_SOUL["Soul Prompts & Resonance Sanctuary"]
        E_VAULT["Relationship Vault (Zero-Knowledge)"]
        E_EMO["The Unspoken Sanctuary"]
        E_GAMES["CouplePlayHub Games Suite"]
        E_SPOT["Spotify Embed Sanctuary"]
        E_QUOTE["Quotes Wisdom Discovery"]
    end

    subgraph Intelligence["Tier 3: Advanced Intelligence & Admin"]
        I_AI["BYOAI Multi-Provider Engine"]
        I_ADM["Independent Admin Console (:5174/:3002)"]
    end

    subgraph Roadmap["Tier 4: Future Roadmap (Proposed)"]
        R_RTC["WebRTC P2P Voice Date Engine (P0)"]
        R_WAL["Automated SQLite WAL Snapshot Cron (P0)"]
        R_I18N["Sinhala-English Cultural Engine (P1)"]
        R_E2E["Zero-Knowledge DM Signal Protocol (P2)"]
    end

    T0_DB --> C_MSG
    T0_DB --> C_PROF
    T0_DB --> C_CTRL
    T0_WS --> C_MSG
    T0_AUTH --> C_PROF

    C_PROF --> E_DISC
    C_MSG --> E_GAMES
    C_PROF --> E_VAULT
    C_CTRL --> E_SPOT
    C_CTRL --> E_QUOTE
    C_CTRL --> E_SOUL

    C_CTRL --> I_AI
    T0_AUTH --> I_ADM
    T0_DB --> I_ADM

    C_MSG -.-> R_RTC
    T0_DB -.-> R_WAL
    C_PROF -.-> R_I18N
    C_MSG -.-> R_E2E
```

---

## 12. Verification & Testing Strategy

The system's integrity is validated by **168 automated unit, integration, and security tests** running via Vitest v5.1.0:

```bash
# User Backend Test Battery (10 suites, 152 tests)
cd backend && npx vitest run
# Result: 10 passed, 152 passed (6.61s)

# Admin Backend Test Battery (1 suite, 16 tests)
cd admin-backend && npx vitest run
# Result: 1 passed, 16 passed (2.16s)

# Total Coverage: 168 / 168 Passing Tests (0 Failures, 0 Skips)
```

All four project workspaces (`frontend`, `backend`, `admin-frontend`, `admin-backend`) compile with **0 TypeScript errors** (`tsc -b` and `tsc --noEmit`) and maintain **0 high/critical vulnerabilities** under `npm audit`.

---

## 13. Conclusion & Baseline Status

Soulverse has been fully discovered, audited, and codified into this Master Specification. The system possesses a mature, cohesive, and deeply differentiated technical foundation that fundamentally surpasses traditional dating applications by anchoring human connection in authenticity, multi-dimensional identity, and emotional intelligence.
