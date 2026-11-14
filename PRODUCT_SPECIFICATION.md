# Soulverse Central Product Specification

## 1. Product System Overview & Architectural Vision

Soulverse is an integrated human connection, relationship development, friendship, dating, personal identity, emotional expression, and social interaction platform.

The system rejects superficial swipe mechanics and replaces them with an emotionally intelligent, multidimensional architecture that helps humans:
- Understand themselves and express the rich dimensions of their identities.
- Form deep romantic connections, authentic friendships, and shared-interest communities.
- Maintain lasting relationships with personal memory vaulting and contextual talking points.
- Explore their inner emotional world with personal AI reflection assistants (BYOAI).
- Communicate in real-time with deterministic delivery receipts, rich stickers, and micro-games.

### Engineering Development Lifecycle
Every feature follows a strict 8-stage engineering progression:
$$\text{DISCOVER} \longrightarrow \text{SPECIFY} \longrightarrow \text{DESIGN} \longrightarrow \text{IMPLEMENT} \longrightarrow \text{INTEGRATE} \longrightarrow \text{TEST} \longrightarrow \text{VERIFY} \longrightarrow \text{DOCUMENT}$$

> [!IMPORTANT]
> **Completion Rule**: A feature is complete **only** when its expected behavior is implemented, integrated with backend services, persisted to SQLite storage, checked by ABAC/RBAC permission guards, validated by automated tests, and proven in live operational environments.

---

## 2. Core Feature Specifications & Taxonomy

### Domain A: Multidimensional Identity & Profile Space

#### Feature `IDENTITY-001`: Multi-Space Authenticated Persona Architecture
- **Purpose**: Enable a user to create and manage multiple distinct identity spaces (Real, Personal, Social, Professional, Creative, Philosophical, Cultural, Relational, Playful, Aspirational, Private, Sacred) under a single authenticated account.
- **Requirements**:
  1. Authenticated account owner can spawn distinct identity spaces without multi-account switching.
  2. Each identity has unique display name, bio, avatar, cover image, tags, skills, and classification.
  3. One identity designated as active primary, but secondary identities remain accessible.
- **Dependencies**: Database user account (`users`).
- **Database Tables**: `user_identities`.
- **API Endpoints**:
  - `GET /api/v1/profile/identities?userId=:userId`
  - `POST /api/v1/profile/identities`
  - `PUT /api/v1/profile/identities/:id`
  - `DELETE /api/v1/profile/identities/:id`
- **Frontend Components**: `IdentityUniverseHub.tsx`, `MyCharacterBuilder.tsx`, `IdentitySelector.tsx`.
- **Permissions**: Ownership required (`verifyCallerOrAdmin`).
- **Validation Rules**: Name required (1-100 chars); bio max 5,000 chars; classification in allowed enum.
- **Error Scenarios**: 400 on invalid payload; 403 on IDOR unauthorized access; 404 on missing record.
- **Automated Tests**: `backend/src/multidimensional-identity.test.ts`, `backend/src/qa-audit-master.test.ts` (Scenario 3).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Automated contract tests passing; SQLite row persistence validated.

#### Feature `IDENTITY-002`: Custom Identity Sections & Markdown Content
- **Purpose**: Allow users to author rich GitHub-Flavored Markdown sections attached to any identity space with granular section-level visibility controls.
- **Requirements**:
  1. Support arbitrary custom sections with custom title, icon, and markdown content.
  2. Granular visibility per section: `public`, `matches`, `friends`, `selected`, `private`.
  3. Drag-and-drop or ordinal reordering via `sort_order`.
- **Dependencies**: `IDENTITY-001`.
- **Database Tables**: `identity_custom_sections`.
- **API Endpoints**:
  - `POST /api/v1/profile/sections`
  - `PUT /api/v1/profile/sections/:id`
  - `DELETE /api/v1/profile/sections/:id`
- **Frontend Components**: `GitHubMarkdownEditor.tsx`, `GitHubMarkdownRenderer.tsx`, `LivingIdentityProfileView.tsx`.
- **Permissions**: Author ownership checked on mutate; reader evaluated via ABAC policy on read.
- **Validation Rules**: Title required; content max 5,000 characters; visibility in allowed enum.
- **Error Scenarios**: 403 on unauthorized mutation; 400 on oversized payload.
- **Automated Tests**: `backend/src/multidimensional-identity.test.ts`, `backend/src/messaging.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Section creation and ABAC filtering tested green in test suites.

#### Feature `IDENTITY-003`: Chronological Life Timeline & Era Engine
- **Purpose**: Document key milestone events across a user's life with historical eras (CE, BCE) and personal event categorization.
- **Requirements**:
  1. Timeline entries with numeric year, era label, display date, title, and rich description.
  2. Categorized into personal, creative, relationship, or professional nature.
  3. Privacy controls per timeline event.
- **Dependencies**: `IDENTITY-001`.
- **Database Tables**: `identity_timeline_events`.
- **API Endpoints**:
  - `GET /api/v1/profile/timeline?userId=:userId`
  - `POST /api/v1/profile/timeline`
  - `DELETE /api/v1/profile/timeline/:id`
- **Frontend Components**: `YearLifeTimelineView.tsx`, `Timeline.tsx`.
- **Permissions**: Ownership checked on create/delete; ABAC enforced on read.
- **Validation Rules**: Year value valid string; numeric year integer; title required.
- **Error Scenarios**: 400 on malformed year; 404 on invalid event ID.
- **Automated Tests**: `backend/src/messaging.test.ts`, `backend/src/multidimensional-identity.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Multi-year chapter queries and chronological sorting verified.

---

### Domain B: Personality Psychology & Emotional Intelligence

#### Feature `PSYCHOLOGY-001`: Big Five (OCEAN) Dimensional Framework
- **Purpose**: Provide self-assessment and relational profiling using the scientific Big Five personality model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism/Emotional Stability).
- **Requirements**:
  1. Calculate normalized dimension scores (0-100) across all 5 Big Five axes.
  2. Generate dynamic personality facets and relational compatibility insights.
  3. Support radar chart visualization and trait history tracking.
- **Dependencies**: `users`.
- **Database Tables**: `user_personality_profiles`, `user_trait_history`.
- **API Endpoints**:
  - `GET /api/v1/personality/:userId`
  - `POST /api/v1/personality/assess`
- **Frontend Components**: `PersonalitySanctuaryView.tsx`.
- **Permissions**: Self or mutual match (ABAC).
- **Validation Rules**: Scores must fall in range [0, 100]; traits must match OCEAN taxonomy.
- **Error Scenarios**: 400 on out-of-range scores.
- **Automated Tests**: `backend/src/personality-ei-framework.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Contract tests verifying score calculations and radar visualizations passing.

#### Feature `PSYCHOLOGY-002`: Emotional Intelligence (EQ) & Attachment Profile
- **Purpose**: Assess interpersonal communication styles, emotional self-awareness, empathy levels, and attachment style tendencies (Secure, Anxious, Avoidant, Fearful).
- **Requirements**:
  1. Evaluate self-regulation, empathy, conflict management, and emotional vocabulary.
  2. Provide actionable communication recommendations tailored to partner attachment style.
- **Dependencies**: `PSYCHOLOGY-001`.
- **Database Tables**: `user_activity_preferences`.
- **API Endpoints**:
  - `GET /api/v1/personality/eq/:userId`
  - `POST /api/v1/personality/eq/evaluate`
- **Frontend Components**: `PersonalitySanctuaryView.tsx`.
- **Permissions**: Caller ownership or mutual match.
- **Validation Rules**: Attachment styles restricted to valid enum values.
- **Error Scenarios**: 404 on unassessed user.
- **Automated Tests**: `backend/src/personality-ei-framework.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: EQ evaluation and attachment style serialization verified.

---

### Domain C: Social Discovery, Friendship & Dating Engine

#### Feature `DISCOVERY-001`: Multimodal Compatibility & Discovery Cards
- **Purpose**: Discover other humans based on shared values, personality complementarity, relationship intentions, and lifestyle habits without shallow swipe counters.
- **Requirements**:
  1. Multi-criteria filtering: intention (friendship, dating, creative collaboration, long-term), distance, habits, personality traits.
  2. Compatibility score breakdown calculating similarity vs complementarity.
  3. Profile card inspection with audio voice notes and Spotify music embeds.
- **Dependencies**: `IDENTITY-001`, `PSYCHOLOGY-001`.
- **Database Tables**: `users`, `user_identities`, `user_settings`.
- **API Endpoints**:
  - `GET /api/v1/discovery/feed`
  - `GET /api/v1/discovery/recommendations`
- **Frontend Components**: `SoulverseMobileDiscoverExperience.tsx`, `SocialDiscoveryEngineView.tsx`, `ProfileCard.tsx`.
- **Permissions**: Caller must be unblocked and authenticated.
- **Validation Rules**: Filter parameters sanitized; blocked profiles automatically excluded.
- **Error Scenarios**: 400 on invalid filter range; 403 on suspended account.
- **Automated Tests**: `backend/src/discovery-engine.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 14 tests passing in `discovery-engine.test.ts`.

#### Feature `MATCHING-001`: Bidirectional Connection Request Lifecycle
- **Purpose**: Formalize human connections through intention-labeled connection requests.
- **Requirements**:
  1. Send connection request with personal note and connection intention.
  2. Recipient can accept, reject, or archive request.
  3. Acceptance creates mutual entry in `user_relationships`.
- **Dependencies**: `DISCOVERY-001`.
- **Database Tables**: `connection_requests`, `user_relationships`.
- **API Endpoints**:
  - `POST /api/v1/connection-requests`
  - `POST /api/v1/connection-requests/:id/respond`
  - `GET /api/v1/users/:userId/connection-requests`
- **Frontend Components**: `SoulverseConnectionsPage.tsx`, `LikesAndMatchesView.tsx`.
- **Permissions**: Requester cannot send request to blocked user; recipient must match caller ID to respond.
- **Validation Rules**: Cannot send duplicate pending request; note max 500 characters.
- **Error Scenarios**: 409 on duplicate pending request; 403 on blocked user target.
- **Automated Tests**: `backend/src/architecture-security.test.ts` (Suite 4).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Lifecycle transition tested and verified in contract tests.

---

### Domain D: Relationship Management & Personal Memory Vault

#### Feature `RELATIONSHIP-001`: Non-Linear Relationship Vault
- **Purpose**: Maintain meaningful connections with flexible, non-linear lifecycles rather than forced dating funnels.
- **Requirements**:
  1. Record contacts across custom relationship categories (friendship, romantic interest, committed relationship, mentor, creative partner, archived).
  2. Status transitions without sequential lock-in.
  3. Export relationship dossier as structured document.
- **Dependencies**: `users`.
- **Database Tables**: `relationships`.
- **API Endpoints**:
  - `GET /api/v1/vault/persons`
  - `POST /api/v1/vault/persons`
  - `PUT /api/v1/vault/persons/:id`
  - `GET /api/v1/vault/persons/:id/export`
- **Frontend Components**: `RelationshipVaultDashboard.tsx`, `IndividualRelationshipDetailModal.tsx`.
- **Permissions**: Ownership checked on all vault operations.
- **Validation Rules**: Contact name required; category in allowed enum.
- **Error Scenarios**: 403 on IDOR; 404 on missing person record.
- **Automated Tests**: `backend/src/relationship-vault.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 12 tests passing in `relationship-vault.test.ts`.

#### Feature `MEMORY-001`: Interpersonal Memory & Context Talking Points
- **Purpose**: Allow users to record memorable quotes, dietary preferences, emotional boundaries, important dates, and contextual talking points about someone.
- **Requirements**:
  1. Save private memory entries linked to specific relationships.
  2. Tag memories with memory type (important quote, preference, boundary, shared milestone).
  3. "Before You Talk" contextual briefing sheet surfacing recent memories and follow-ups.
- **Dependencies**: `RELATIONSHIP-001`.
- **Database Tables**: `relationship_memories`.
- **API Endpoints**:
  - `POST /api/v1/vault/memories`
  - `GET /api/v1/vault/memories?personId=:id`
  - `GET /api/v1/vault/persons/:id/context`
- **Frontend Components**: `BeforeYouTalkSheet.tsx`, `QuickConversationMemoryModal.tsx`.
- **Permissions**: Owner-only private access.
- **Validation Rules**: Memory content required (1-2,000 chars); memory_type in allowed enum.
- **Error Scenarios**: 400 on empty memory; 403 on cross-user read attempt.
- **Automated Tests**: `backend/src/relationship-vault.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Memory recording and contextual briefing synthesis verified.

---

### Domain E: Dynamic Connection Content & Wisdom Engine

#### Feature `CONTENT-001`: Infinite Wisdom Quotes Sanctuary
- **Purpose**: Daily connection and philosophical reflection content categorized across love, friendship, identity, and deep life questions.
- **Requirements**:
  1. Browse wisdom quotes across 16 taxonomical categories.
  2. Daily quote of the day with user context and resonance bookmarking.
  3. Interaction logging (like, bookmark, share, report).
- **Dependencies**: None.
- **Database Tables**: `quotes`, `quote_user_history`, `quote_user_interactions`, `quote_user_preferences`.
- **API Endpoints**:
  - `GET /api/quotes/discover`
  - `GET /api/quotes/categories`
  - `POST /api/quotes/:id/interact`
- **Frontend Components**: `QuoteDiscoveryView.tsx`.
- **Permissions**: Public read; authenticated interaction.
- **Validation Rules**: Quote ID valid; interaction type in allowed enum.
- **Error Scenarios**: 404 on missing quote ID.
- **Automated Tests**: `backend/src/quotes.test.ts`, `backend/src/content-engine.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 24 tests passing in `quotes.test.ts`.

#### Feature `CONTENT-002`: Daily Soul Prompts & Resonance Sanctuary
- **Purpose**: Introspective prompts inviting thoughtful written responses with optional community sharing and resonance reactions.
- **Requirements**:
  1. Daily prompt rotation across self-discovery, relationships, and human nature.
  2. Publish answers as private journal, friends-only, or community-wide.
  3. Resonate with other answers and generate icebreaker questions.
- **Dependencies**: `IDENTITY-001`.
- **Database Tables**: `soul_prompts`, `soul_prompt_responses`.
- **API Endpoints**:
  - `GET /api/soul-prompts/today`
  - `POST /api/soul-prompts/:id/respond`
  - `GET /api/soul-prompts/:id/community`
  - `POST /api/soul-prompts/responses/:id/resonate`
- **Frontend Components**: `SoulJournalSanctuary.tsx`.
- **Permissions**: ABAC enforced on response visibility.
- **Validation Rules**: Response content required (max 2,000 chars); visibility in allowed enum.
- **Error Scenarios**: 400 on empty text; 403 on private response inspection.
- **Automated Tests**: `backend/src/soul-prompts.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 9 tests passing in `soul-prompts.test.ts`.

#### Feature `QUESTION-001`: Multidimensional Question Discovery & Non-Repeating Refresh
- **Purpose**: Provide a deep question discovery engine spanning 8 core domains and 60+ subcategories with a true, non-repeating refresh mechanism powered by local IndexedDB and server-side view logs.
- **Requirements**:
  1. Extensive taxonomy covering: Self-Discovery, Love & Romance, Friendship, Emotional Intelligence, Life Experiences, Creativity, Fun & Social, and Deep Conversations.
  2. Question metadata: depth level, difficulty, sensitivity, audience suitability, context tips, follow-ups, and tags.
  3. True Refresh button: excludes recently viewed IDs and skipped items (`question_views`, `question_skips`); gracefully handles cycle resets.
  4. Timezone-aware deterministic daily questions based on date key.
  5. Personal history tracking: answered, saved, skipped, and my answers.
- **Dependencies**: `offlineContentDb.ts`, `users`.
- **Database Tables**: `questions_ecosystem`, `question_views`, `question_skips`.
- **API Endpoints**:
  - `GET /api/v1/social/questions`
  - `GET /api/v1/social/questions/random`
  - `GET /api/v1/social/questions/daily`
  - `GET /api/v1/social/questions/:id`
  - `POST /api/v1/social/questions/:id/skip`
  - `GET /api/v1/social/questions/history`
- **Frontend Components**: `QuestionSanctuaryView.tsx`.
- **Permissions**: Public read; authenticated interaction.
- **Validation Rules**: Category in allowed enum; depth level in allowed enum.
- **Error Scenarios**: 404 on missing question; graceful cycle reset when category fully consumed.
- **Automated Tests**: `backend/src/social-feed-master.test.ts` (Suite 1).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 14 tests passing in `social-feed-master.test.ts`.

#### Feature `QUESTION-002`: Question Answering, Community Perspectives & ABAC Privacy
- **Purpose**: Empower users to author candid reflections, answers, and media responses with strict backend ABAC privacy controls and community perspectives.
- **Requirements**:
  1. Support diverse answer formats: short text, long text, single/multiple choice, poll response, image, structured reflection.
  2. Privacy controls: `private` (secure personal journal), `connections`, `friends`, `selected`, `public`.
  3. Strict server-side ABAC authorization (private answers never leak to unauthorized callers).
  4. Discussion thread separation: comments on questions distinct from profile answers.
  5. One-click conversion from question answer to shared social post.
- **Dependencies**: `QUESTION-001`, `social_posts`.
- **Database Tables**: `question_answers`, `social_comments`.
- **API Endpoints**:
  - `POST /api/v1/social/questions/:id/answers`
  - `GET /api/v1/social/questions/:id/answers`
  - `DELETE /api/v1/social/answers/:id`
- **Frontend Components**: `QuestionSanctuaryView.tsx`.
- **Permissions**: Author verified on mutate; ABAC evaluated on query.
- **Validation Rules**: Answer text required; visibility in allowed enum.
- **Error Scenarios**: 403 on inspecting private answer; 404 on invalid question.
- **Automated Tests**: `backend/src/social-feed-master.test.ts` (Suite 1).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: ABAC leakage protection and CRUD assertions passing.

#### Feature `FEED-001`: Multimodal Social Post & Publishing Engine
- **Purpose**: Enable rich, intentional social publishing across 17 distinct post formats with persistent client-side drafts, automatic hashtag indexing, mention tracking, and immutable edit history.
- **Requirements**:
  1. 17 supported post formats: text, image, video, audio, question, poll, story, experience, thought, reflection, quote, link, multi-image, carousel, shared answer, event, challenge.
  2. Local-first auto-save draft persistence via Dexie.js (`offlineContentDb.ts`) preventing loss of user writing.
  3. Automatic hashtag extraction (`#hashtag`) with usage indexing in `social_hashtags`.
  4. User mention parsing (`@username`) with dispatch into `social_mentions`.
  5. Immutable versioned edit history in `social_post_edits` and controlled soft deletion.
  6. Multi-tier visibility: `public`, `connections`, `friends`, `selected`, `private`, `custom`.
- **Dependencies**: `offlineContentDb.ts`, `users`.
- **Database Tables**: `social_posts`, `social_post_edits`, `social_post_drafts`, `social_hashtags`, `social_mentions`.
- **API Endpoints**:
  - `POST /api/v1/social/posts`
  - `GET /api/v1/social/posts/:id`
  - `PATCH /api/v1/social/posts/:id`
  - `DELETE /api/v1/social/posts/:id`
  - `GET /api/v1/social/posts/:id/edits`
  - `POST /api/v1/social/drafts`
  - `GET /api/v1/social/drafts`
- **Frontend Components**: `PostComposerModal.tsx`, `SocialFeedView.tsx`.
- **Permissions**: Ownership required on edit/delete; ABAC enforced on read.
- **Validation Rules**: Content or media required; post_type in allowed enum.
- **Error Scenarios**: 403 on unauthorized mutation; 404 on deleted post.
- **Automated Tests**: `backend/src/social-feed-master.test.ts` (Suite 2).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Multimodal post creation, hashtag extraction, and edit history verified.

#### Feature `FEED-002`: Transparent Recommendation & Algorithmic Social Feed
- **Purpose**: Deliver an engaging, emotionally mature social feed experience with transparent ranking signals, monotonic cursor pagination, nested threaded comments, and emotional reactions.
- **Requirements**:
  1. Multiple feed modes: For You, Following, Friends, Questions, Trending, Latest, Saved.
  2. Transparent ranking factoring in user category affinities, author relationship strength, recency decay, and depth signals.
  3. Deterministic cursor pagination (`cursor = timestamp_id`) preventing missing or duplicate items across page boundaries.
  4. Nested threaded comments supporting parent-child replies up to depth level 3 with soft-deletion preservation.
  5. 6 emotion-aligned reactions: like, love, laugh, thoughtful, support, celebrate with atomic toggle and accurate count aggregation.
  6. Bookmarks and custom collections organization.
  7. Content moderation reporting workflow with admin queue.
- **Dependencies**: `FEED-001`, `social_comments`, `social_reactions`.
- **Database Tables**: `social_posts`, `social_comments`, `social_reactions`, `social_bookmarks`, `social_collections`, `content_moderation_reports`.
- **API Endpoints**:
  - `GET /api/v1/social/posts`
  - `GET /api/v1/social/comments`
  - `POST /api/v1/social/comments`
  - `DELETE /api/v1/social/comments/:id`
  - `POST /api/v1/social/reactions`
  - `POST /api/v1/social/bookmarks`
  - `GET /api/v1/social/collections`
  - `POST /api/v1/social/reports`
- **Frontend Components**: `SocialFeedView.tsx`.
- **Permissions**: Public feed reads; authenticated reactions and comments.
- **Validation Rules**: Reaction type in allowed enum; comment content non-empty; depth level <= 3.
- **Error Scenarios**: 400 on empty comment; 403 on private post comments.
- **Automated Tests**: `backend/src/social-feed-master.test.ts` (Suites 3, 4, 5, 6).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Cursor pagination, comment nesting, and reaction toggling verified.

---

### Domain F: Personal AI Intelligence & Multi-Provider Architecture (BYOAI)

#### Feature `AI-001`: Bring Your Own AI (BYOAI) Encryption & Connections
- **Purpose**: Allow users to connect their personal API keys (OpenAI, Anthropic Claude, Google Gemini) securely without vendor lock-in or centralized scraping.
- **Requirements**:
  1. AES-256 encrypted credential storage at rest with unique per-user keys.
  2. Test connection endpoint validating key with upstream provider before saving.
  3. Zero fake functionality guard: explicit error when key is missing, never fabricated text.
- **Dependencies**: None.
- **Database Tables**: `user_ai_connections`.
- **API Endpoints**:
  - `GET /api/ai/providers`
  - `POST /api/ai/connections`
  - `POST /api/ai/connections/:id/test`
  - `DELETE /api/ai/connections/:id`
- **Frontend Components**: `byoaiService.ts`, `AIRelationshipAssistantModal.tsx`.
- **Permissions**: Ownership strictly required.
- **Validation Rules**: Provider in allowed enum; encrypted key non-empty.
- **Error Scenarios**: 400 on malformed key; 401 on rejected upstream handshake.
- **Automated Tests**: `backend/src/byoai.test.ts`, `backend/src/qa-audit-master.test.ts` (Scenario 7).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 22 tests passing in `byoai.test.ts`.

#### Feature `AI-002`: Task Routing, Token Usage & Spending Safeguards
- **Purpose**: Direct specialized tasks (reflection, relationship analysis, message drafting, question generation) to user-chosen providers with strict spending limits.
- **Requirements**:
  1. Map tasks to specific models (e.g. Claude 3.5 Sonnet for reflection, GPT-4o Mini for quick suggestions).
  2. Track token inference usage and estimated costs in SQLite.
  3. Enforce user-defined daily/monthly spending caps.
- **Dependencies**: `AI-001`.
- **Database Tables**: `user_ai_task_routing`, `user_ai_spending_limits`, `ai_usage_records`.
- **API Endpoints**:
  - `POST /api/ai/dispatch`
  - `GET /api/ai/usage`
  - `PUT /api/ai/spending-limits`
- **Frontend Components**: `byoaiService.ts`, `UserControlCenterModal.tsx`.
- **Permissions**: Caller ownership.
- **Validation Rules**: Spending cap numeric; task in registered task types.
- **Error Scenarios**: 403 on spending limit exceeded; 400 on invalid task.
- **Automated Tests**: `backend/src/byoai.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Token accounting and cap enforcement validated.

---

### Domain G: Real-Time Communication & Social Interaction

#### Feature `MESSAGING-001`: Monotonic Sequenced Messaging Engine
- **Purpose**: Enterprise-grade direct and group messaging with strictly monotonic sequence numbers, offline sync, and optimistic UI updates.
- **Requirements**:
  1. Sequential message ordering via monotonically incrementing integer sequence numbers.
  2. Message editing with immutable audit history (`message_edit_history`).
  3. Soft deletion (`is_deleted = 1`) with transparent tombstone rendering.
  4. Deduplication via `Idempotency-Key` headers.
- **Dependencies**: `users`, `user_relationships`.
- **Database Tables**: `conversations`, `conversation_members`, `messages`, `message_edit_history`.
- **API Endpoints**:
  - `GET /api/v1/conversations`
  - `GET /api/v1/conversations/:id/messages`
  - `POST /api/v1/conversations/:id/messages`
  - `PATCH /api/v1/messages/:id`
  - `DELETE /api/v1/messages/:id`
- **Frontend Components**: `MessagingInboxView.tsx`, `ChatInterface.tsx`.
- **Permissions**: Participant enrollment verified on read/write; author verified on edit/delete.
- **Validation Rules**: Text or media URL required; clientMessageId required; max text 10,000 chars.
- **Error Scenarios**: 403 if blocked or not member; 400 on missing clientMessageId.
- **Automated Tests**: `backend/src/messaging.test.ts`, `backend/src/communication-engine.test.ts`, `backend/src/qa-audit-master.test.ts` (Scenario 8).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Monotonic sequence numbers and idempotency deduplication verified.

#### Feature `MESSAGING-002`: Rich Reactions, Premium Emojis & Mini-Games
- **Purpose**: Enhance emotional communication through Telegram Premium emojis, reactions, audio voice notes, and server-authoritative turn-based games (20 Questions, Truth or Dare).
- **Requirements**:
  1. Toggle emoji reactions per message with real-time sync.
  2. Zulut30 Telegram Premium custom emoji rendering and recent tracking.
  3. Dating-specific turn-based games inside chat with state synchronization.
- **Dependencies**: `MESSAGING-001`.
- **Database Tables**: `message_reactions`, `user_recent_emojis`, `active_games`.
- **API Endpoints**:
  - `POST /api/v1/messages/:id/reactions`
  - `POST /api/v1/conversations/:id/games`
  - `GET /api/telegram-emojis/style`
- **Frontend Components**: `CouplePlayHubView.tsx`, `MessagingInboxView.tsx`.
- **Permissions**: Participant in conversation.
- **Validation Rules**: Emoji string valid; game move valid according to state machine.
- **Error Scenarios**: 403 on non-participant action.
- **Automated Tests**: `backend/src/telegram-emojis.test.ts`, `backend/src/messaging.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 15 tests passing in `telegram-emojis.test.ts`.

#### Feature `MESSAGING-003`: Local-First Offline Outbox & Cursor Synchronization
- **Purpose**: Guarantee zero message loss in network degradation scenarios using client-side IndexedDB persistence (Dexie.js), background outbox reconciliation, and cursor-based differential synchronization.
- **Requirements**:
  1. Offline storage with IndexedDB tables: `conversations`, `messages`, `outbox`, `drafts`, `settings`.
  2. Automatic optimistic message rendering in outbox state (`sending`, `queued`, `delivered`, `failed`).
  3. Continuous background reconciliation on network restoration and WebSocket re-connection.
  4. Monotonic cursor differential synchronization (`GET /api/v1/conversations/:id/sync?since=:seq`) returning only newly sequenced deltas.
  5. Persistent unsent draft preservation per conversation across client reloads.
- **Dependencies**: `MESSAGING-001`, `offlineChatDb.ts`.
- **Database Tables**: IndexedDB `soulverse_chat_db`, SQLite `messages`.
- **API Endpoints**:
  - `GET /api/v1/conversations/:id/sync?since=:seq`
  - `POST /api/v1/conversations/:id/messages`
- **Frontend Components**: `offlineChatDb.ts`, `chatApiClient.ts`, `MessagingInboxView.tsx`.
- **Permissions**: Conversation membership verified.
- **Validation Rules**: `since` must be non-negative integer sequence counter.
- **Error Scenarios**: 401 on unauthenticated caller; 403 on non-participant.
- **Automated Tests**: `backend/src/realtime-comms-master.test.ts` (Sync & Outbox assertions).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Monotonic delta synchronization contract tests passing in `realtime-comms-master.test.ts`.

#### Feature `CALLING-001`: WebRTC Real-Time Audio & Video Calling Subsystem
- **Purpose**: High-fidelity, low-latency 1-to-1 voice and video calling leveraging native browser `RTCPeerConnection` with WebSocket-based SDP/ICE signaling and zero recurring third-party media server costs.
- **Requirements**:
  1. Sovereign P2P media streaming via standard W3C WebRTC API and public Google STUN relays (`stun:stun.l.google.com:19302`).
  2. Full signaling protocol over WebSocket: `call.offer`, `call.answer`, `call.ice_candidate`, `call.hangup`, `call.reject`.
  3. Deterministic state machine (`idle`, `calling`, `ringing`, `connecting`, `connected`, `ended`, `error`).
  4. Audio track mute/unmute and camera stream toggle without session renegotiation failures.
  5. Persistent call history logging (`calls` table) recording caller, recipient, call type, status, and duration.
- **Dependencies**: Realtime Gateway WebSocket server, native browser MediaDevices API.
- **Database Tables**: `calls`.
- **API Endpoints**:
  - `POST /api/v1/calls`
  - `PATCH /api/v1/calls/:id`
  - `GET /api/v1/calls/history`
- **Frontend Components**: `webrtcCallService.ts`, `MessagingInboxView.tsx` (Calling HUD & Incoming Call Prompts).
- **Permissions**: Conversation participant.
- **Validation Rules**: Call type must be `audio` or `video`; status transitions strictly enforced.
- **Error Scenarios**: `permission_denied` gracefully handled with clear user-facing diagnostic; 404 on invalid call ID.
- **Automated Tests**: `backend/src/realtime-comms-master.test.ts` (Call logging & lifecycle assertions).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Automated call lifecycle tests passing in `realtime-comms-master.test.ts`.

#### Feature `POLLS-001`: Real-Time Interactive Poll Engine & Dynamic Consensus Voting
- **Purpose**: Foster community and group decision-making with native, server-authoritative polls supporting single and multi-choice ballots, dynamic percentage recalculation, and real-time WebSocket sync.
- **Requirements**:
  1. Structured poll creation within conversations with question and 2-10 configurable options.
  2. Atomic vote registration preventing ballot tampering or duplicate voting.
  3. Real-time vote percentage and voter count aggregation computed directly by database engine.
  4. Support for single-vote and multiple-vote configurations.
  5. Interactive animated vote progress bars with optimistic toggle in UI.
- **Dependencies**: `MESSAGING-001`.
- **Database Tables**: `messages`, `poll_votes`.
- **API Endpoints**:
  - `POST /api/v1/conversations/:id/poll`
  - `POST /api/v1/messages/:id/poll/vote`
- **Frontend Components**: `MessagingInboxView.tsx` (Poll Card Bubble & New Poll Modal).
- **Permissions**: Participant in conversation.
- **Validation Rules**: Question required; at least 2 non-empty options; option index in valid range.
- **Error Scenarios**: 400 on out-of-bounds option index; 403 on non-participant.
- **Automated Tests**: `backend/src/realtime-comms-master.test.ts` (Poll creation & vote aggregation assertions).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 13 / 13 tests passing in `realtime-comms-master.test.ts`.

---

### Domain H: Administration, Governance & Security

#### Feature `ADMIN-001`: Dedicated Air-Gapped Administration Console
- **Purpose**: Segregate operational, moderation, and infrastructure controls into an independent console (`admin.soulverse.im` on port 5174) with Casbin-style RBAC clearance.
- **Requirements**:
  1. Air-gapped administration system running on separate port with independent auth token.
  2. Casbin-style relational authorization tables (`admin_roles`, `admin_permissions`).
  3. Emergency feature kill-switches overriding user preferences with audit reasons.
- **Dependencies**: None.
- **Database Tables**: `admin_roles`, `admin_permissions`, `feature_registry`, `feature_audit_log`.
- **API Endpoints**:
  - `GET /api/features/registry`
  - `POST /api/features/admin/toggle`
  - `GET /api/v1/admin/audit-logs`
- **Frontend Components**: `admin-frontend/src/App.tsx`, `AdminDashboard.tsx`.
- **Permissions**: `super_admin` or `moderator` clearance.
- **Validation Rules**: Reason required on emergency kill-switch; valid role clearance required.
- **Error Scenarios**: 403 Forbidden for unauthorized callers; audit event logged.
- **Automated Tests**: `backend/src/feature-management.test.ts`, `admin-backend/src/admin.test.ts`.
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: 16 tests passing in `admin.test.ts`; 11 tests passing in `feature-management.test.ts`.

#### Feature `SECURITY-001`: GDPR Compliance Engine (Articles 17 & 20)
- **Purpose**: Implement comprehensive data portability and irrevocable account erasure complying with European Union GDPR and global privacy standards.
- **Requirements**:
  1. **Article 20 Data Portability**: Produce a standardized, comprehensive JSON bundle of all profile spaces, settings, sessions, memories, connection requests, and messages with secure download links.
  2. **Article 17 Right to Erasure**: Irrevocably purge all personal records across 44 relational SQLite tables upon exact token confirmation (`DELETE_MY_ACCOUNT_PERMANENTLY`).
  3. Immutable consent tracking (`consent_records`) recording explicit opt-in/opt-out with IP and timestamps.
- **Dependencies**: Full relational schema.
- **Database Tables**: All 44 SQLite tables, `user_data_exports`, `consent_records`.
- **API Endpoints**:
  - `POST /api/v1/users/:userId/export`
  - `GET /api/v1/users/:userId/exports/:exportId/download`
  - `DELETE /api/v1/users/:userId/gdpr-erasure`
  - `POST /api/v1/users/:userId/consent`
- **Frontend Components**: `SoulverseAccountPage.tsx`, `SoulverseSettingsPage.tsx`.
- **Permissions**: Verified caller or super admin only (`verifyCallerOrAdmin`).
- **Validation Rules**: Exact token confirmation required for erasure; export type in allowed enum.
- **Error Scenarios**: 400 on token mismatch; 403 on IDOR unauthorized caller.
- **Automated Tests**: `backend/src/architecture-security.test.ts` (Suite 7), `backend/src/qa-audit-master.test.ts` (Scenario 6).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Cascading erasure and 600+ KB JSON export bundle generation verified.

#### Feature `SECURITY-002`: Zero-Downtime Hot Online Backups & Integrity Monitoring
- **Purpose**: Maintain enterprise high availability and data resilience with online streaming SQLite snapshots and continuous PRAGMA integrity verification.
- **Requirements**:
  1. Streaming hot backup via `better-sqlite3` native `db.backup()` without locking or downtime.
  2. SHA-256 cryptographic checksum calculation and backup history recording.
  3. WAL checkpointing (`TRUNCATE`) and `PRAGMA integrity_check` validation.
- **Dependencies**: SQLite persistence.
- **Database Tables**: `backup_history`.
- **API Endpoints**:
  - `POST /api/v1/system/backup`
  - `GET /api/v1/system/health`
  - `POST /api/v1/system/checkpoint-wal`
- **Frontend Components**: `AdminDashboard.tsx`.
- **Permissions**: Admin clearance (`system:write`).
- **Validation Rules**: Backup directory writable; database file unlocked.
- **Error Scenarios**: 500 on disk exhaustion; 403 on unprivileged caller.
- **Automated Tests**: `backend/src/architecture-security.test.ts` (Suite 8), `backend/src/qa-audit-master.test.ts` (Scenario 10).
- **Implementation Status**: **VERIFIED**
- **Verification Evidence**: Live hot backup creation and PRAGMA integrity reporting green.
