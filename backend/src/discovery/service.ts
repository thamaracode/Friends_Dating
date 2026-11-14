import { db } from '../db';
import type {
  DiscoveryProfile,
  DiscoveryFeedFilters,
  DiscoveryFeedResponse,
  DiscoveryFeedItem,
  ExplainableResonanceReport,
  InteractionType,
  ConnectionType,
  ConnectionRequest,
  UserConnection
} from './types';
import { calculateExplainableResonance } from './matchingEngine';

export class SocialDiscoveryService {
  /**
   * Initializes SQLite tables for social discovery, interactions, and connections
   */
  public static initTables() {
    db.exec(`
      -- Discovery Profiles
      CREATE TABLE IF NOT EXISTS discovery_profiles (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        age INTEGER NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        tagline TEXT NOT NULL,
        bio TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        primary_intention TEXT NOT NULL DEFAULT 'friendship',
        intentions_json TEXT NOT NULL, -- JSON array of ConnectionType
        core_values_json TEXT NOT NULL, -- JSON array of strings
        interests_json TEXT NOT NULL, -- JSON array of strings
        activities_json TEXT NOT NULL, -- JSON array of strings
        lifestyle_json TEXT NOT NULL, -- JSON object
        communication_json TEXT NOT NULL, -- JSON object
        photos_json TEXT NOT NULL, -- JSON array of strings
        audio_intro_url TEXT,
        video_intro_url TEXT,
        discovery_visible INTEGER DEFAULT 1,
        hide_exact_age INTEGER DEFAULT 0,
        hide_city INTEGER DEFAULT 0,
        last_active_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- User Discovery Interactions (likes, passes, saves, follows)
      CREATE TABLE IF NOT EXISTS user_interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        target_user_id TEXT NOT NULL,
        interaction_type TEXT NOT NULL CHECK(interaction_type IN ('like', 'pass', 'save', 'follow')),
        connection_type TEXT DEFAULT 'friendship',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_interactions_lookup 
        ON user_interactions(user_id, target_user_id, interaction_type);

      -- Explicit Connection Requests (Mutual Consent Protocol)
      CREATE TABLE IF NOT EXISTS connection_requests (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        connection_type TEXT NOT NULL,
        note TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'cancelled')),
        created_at INTEGER NOT NULL,
        responded_at INTEGER,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_conn_req_status 
        ON connection_requests(sender_id, recipient_id, status);

      -- Established Mutual Connections
      CREATE TABLE IF NOT EXISTS user_connections (
        id TEXT PRIMARY KEY,
        user_a_id TEXT NOT NULL,
        user_b_id TEXT NOT NULL,
        connection_type TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'unmatched')),
        established_at INTEGER NOT NULL,
        FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_conn_pair 
        ON user_connections(user_a_id, user_b_id);
    `);
  }

  /**
   * Helper to parse raw DB row into DiscoveryProfile object
   */
  private static rowToProfile(row: any): DiscoveryProfile {
    return {
      id: row.user_id,
      name: row.name,
      username: row.username,
      avatar_url: row.avatar_url,
      age: row.age,
      city: row.city,
      country: row.country,
      tagline: row.tagline,
      bio: row.bio,
      verified: Boolean(row.verified),
      primary_intention: row.primary_intention as ConnectionType,
      intentions: JSON.parse(row.intentions_json || '[]'),
      core_values: JSON.parse(row.core_values_json || '[]'),
      interests: JSON.parse(row.interests_json || '[]'),
      activities: JSON.parse(row.activities_json || '[]'),
      lifestyle: JSON.parse(row.lifestyle_json || '{}'),
      communication: JSON.parse(row.communication_json || '{}'),
      photos: JSON.parse(row.photos_json || '[]'),
      audio_intro_url: row.audio_intro_url || undefined,
      video_intro_url: row.video_intro_url || undefined,
      discovery_visible: Boolean(row.discovery_visible),
      hide_exact_age: Boolean(row.hide_exact_age),
      hide_city: Boolean(row.hide_city),
      last_active_at: Number(row.last_active_at),
      created_at: Number(row.created_at)
    };
  }

  /**
   * Retrieves a discovery profile by user ID
   */
  public static getProfile(userId: string): DiscoveryProfile | null {
    const row = db.prepare('SELECT * FROM discovery_profiles WHERE user_id = ?').get(userId);
    if (!row) return null;
    return this.rowToProfile(row);
  }

  /**
   * Creates or updates a discovery profile
   */
  public static upsertProfile(profile: Partial<DiscoveryProfile> & { id: string }): DiscoveryProfile {
    const existing = this.getProfile(profile.id);
    const now = Date.now();

    const merged: DiscoveryProfile = {
      id: profile.id,
      name: profile.name || existing?.name || 'Soulverse Member',
      username: profile.username || existing?.username || `user_${profile.id.slice(-4)}`,
      avatar_url: profile.avatar_url || existing?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      age: profile.age ?? existing?.age ?? 25,
      city: profile.city || existing?.city || 'Colombo',
      country: profile.country || existing?.country || 'Sri Lanka',
      tagline: profile.tagline || existing?.tagline || 'Exploring meaningful connection and quiet craft.',
      bio: profile.bio || existing?.bio || 'Building deep connections without superficial noise.',
      verified: profile.verified ?? existing?.verified ?? true,
      primary_intention: profile.primary_intention || existing?.primary_intention || 'friendship',
      intentions: profile.intentions || existing?.intentions || ['friendship'],
      core_values: profile.core_values || existing?.core_values || ['Authenticity', 'Curiosity', 'Kindness'],
      interests: profile.interests || existing?.interests || ['Philosophy', 'Music', 'Psychology'],
      activities: profile.activities || existing?.activities || ['Reading', 'Stargazing', 'Walking'],
      lifestyle: profile.lifestyle || existing?.lifestyle || { sleep_schedule: 'night_owl', social_energy: 'introvert' },
      communication: profile.communication || existing?.communication || { cadence: 'balanced', style: 'direct', listening_style: 'reflective', conflict_approach: 'direct_discussion' },
      photos: profile.photos || existing?.photos || [],
      audio_intro_url: profile.audio_intro_url || existing?.audio_intro_url,
      video_intro_url: profile.video_intro_url || existing?.video_intro_url,
      discovery_visible: profile.discovery_visible ?? existing?.discovery_visible ?? true,
      hide_exact_age: profile.hide_exact_age ?? existing?.hide_exact_age ?? false,
      hide_city: profile.hide_city ?? existing?.hide_city ?? false,
      last_active_at: now,
      created_at: existing?.created_at || now
    };

    db.prepare(`
      INSERT INTO discovery_profiles (
        user_id, name, username, avatar_url, age, city, country, tagline, bio,
        verified, primary_intention, intentions_json, core_values_json,
        interests_json, activities_json, lifestyle_json, communication_json,
        photos_json, audio_intro_url, video_intro_url, discovery_visible,
        hide_exact_age, hide_city, last_active_at, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        username = excluded.username,
        avatar_url = excluded.avatar_url,
        age = excluded.age,
        city = excluded.city,
        country = excluded.country,
        tagline = excluded.tagline,
        bio = excluded.bio,
        verified = excluded.verified,
        primary_intention = excluded.primary_intention,
        intentions_json = excluded.intentions_json,
        core_values_json = excluded.core_values_json,
        interests_json = excluded.interests_json,
        activities_json = excluded.activities_json,
        lifestyle_json = excluded.lifestyle_json,
        communication_json = excluded.communication_json,
        photos_json = excluded.photos_json,
        audio_intro_url = excluded.audio_intro_url,
        video_intro_url = excluded.video_intro_url,
        discovery_visible = excluded.discovery_visible,
        hide_exact_age = excluded.hide_exact_age,
        hide_city = excluded.hide_city,
        last_active_at = excluded.last_active_at
    `).run(
      merged.id, merged.name, merged.username, merged.avatar_url, merged.age, merged.city, merged.country, merged.tagline, merged.bio,
      merged.verified ? 1 : 0, merged.primary_intention, JSON.stringify(merged.intentions), JSON.stringify(merged.core_values),
      JSON.stringify(merged.interests), JSON.stringify(merged.activities), JSON.stringify(merged.lifestyle), JSON.stringify(merged.communication),
      JSON.stringify(merged.photos), merged.audio_intro_url || null, merged.video_intro_url || null, merged.discovery_visible ? 1 : 0,
      merged.hide_exact_age ? 1 : 0, merged.hide_city ? 1 : 0, merged.last_active_at, merged.created_at
    );

    return merged;
  }

  /**
   * Retrieves paginated, configurable discovery feed with explainable resonance cards
   */
  public static getDiscoveryFeed(viewerId: string, filters: DiscoveryFeedFilters = {}): DiscoveryFeedResponse {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(50, filters.limit || 12));
    const offset = (page - 1) * limit;

    // 1. Fetch or synthesize viewer profile
    let viewerProfile = this.getProfile(viewerId);
    if (!viewerProfile) {
      viewerProfile = this.upsertProfile({
        id: viewerId,
        name: 'You',
        username: viewerId,
        primary_intention: (filters.connectionType && filters.connectionType !== 'all') ? filters.connectionType : 'friendship'
      });
    }

    // 2. Build Bidirectional Exclusions:
    // - Blocker or blocked
    // - Reported by viewer
    // - Passed by viewer within last 7 days
    const blockedRows = db.prepare(`
      SELECT blocked_id AS uid FROM user_blocks WHERE blocker_id = ?
      UNION
      SELECT blocker_id AS uid FROM user_blocks WHERE blocked_id = ?
    `).all(viewerId, viewerId) as { uid: string }[];

    const reportedRows = db.prepare(`
      SELECT reported_user_id AS uid FROM user_reports WHERE reporter_id = ?
    `).all(viewerId) as { uid: string }[];

    const passedRows = db.prepare(`
      SELECT target_user_id AS uid FROM user_interactions 
      WHERE user_id = ? AND interaction_type = 'pass' AND created_at > ?
    `).all(viewerId, Date.now() - (7 * 86400000)) as { uid: string }[];

    const excludedIds = new Set<string>([
      viewerId,
      ...blockedRows.map(r => r.uid),
      ...reportedRows.map(r => r.uid),
      ...passedRows.map(r => r.uid)
    ]);

    // 3. Query all eligible candidate profiles
    const allCandidatesRaw = db.prepare(`
      SELECT * FROM discovery_profiles 
      WHERE discovery_visible = 1
    `).all();

    let candidates = allCandidatesRaw
      .map(r => this.rowToProfile(r))
      .filter(p => !excludedIds.has(p.id));

    // 4. Apply Filters
    if (filters.connectionType && filters.connectionType !== 'all') {
      const targetType = filters.connectionType;
      candidates = candidates.filter(p => 
        p.primary_intention === targetType || p.intentions.includes(targetType)
      );
    }

    if (filters.minAge) {
      candidates = candidates.filter(p => p.age >= filters.minAge!);
    }
    if (filters.maxAge) {
      candidates = candidates.filter(p => p.age <= filters.maxAge!);
    }
    if (filters.city && filters.city.trim()) {
      const q = filters.city.toLowerCase().trim();
      candidates = candidates.filter(p => p.city.toLowerCase().includes(q));
    }
    if (filters.interests && filters.interests.length > 0) {
      const targetInterests = new Set(filters.interests.map(i => i.toLowerCase().trim()));
      candidates = candidates.filter(p => 
        p.interests.some(i => targetInterests.has(i.toLowerCase().trim()))
      );
    }
    if (filters.values && filters.values.length > 0) {
      const targetValues = new Set(filters.values.map(v => v.toLowerCase().trim()));
      candidates = candidates.filter(p => 
        p.core_values.some(v => targetValues.has(v.toLowerCase().trim()))
      );
    }

    // 5. Query viewer interaction states in bulk
    const likesReceived = new Set(
      (db.prepare(`
        SELECT user_id FROM user_interactions 
        WHERE target_user_id = ? AND interaction_type = 'like'
      `).all(viewerId) as { user_id: string }[]).map(r => r.user_id)
    );

    const viewerLikes = new Set(
      (db.prepare(`
        SELECT target_user_id FROM user_interactions 
        WHERE user_id = ? AND interaction_type = 'like'
      `).all(viewerId) as { target_user_id: string }[]).map(r => r.target_user_id)
    );

    const viewerSaves = new Set(
      (db.prepare(`
        SELECT target_user_id FROM user_interactions 
        WHERE user_id = ? AND interaction_type = 'save'
      `).all(viewerId) as { target_user_id: string }[]).map(r => r.target_user_id)
    );

    const activeConnections = new Set(
      (db.prepare(`
        SELECT CASE WHEN user_a_id = ? THEN user_b_id ELSE user_a_id END AS partner_id
        FROM user_connections
        WHERE (user_a_id = ? OR user_b_id = ?) AND status = 'active'
      `).all(viewerId, viewerId, viewerId) as { partner_id: string }[]).map(r => r.partner_id)
    );

    const pendingRequests = new Set(
      (db.prepare(`
        SELECT recipient_id FROM connection_requests 
        WHERE sender_id = ? AND status = 'pending'
      `).all(viewerId) as { recipient_id: string }[]).map(r => r.recipient_id)
    );

    // 6. Compute Explainable Resonance for each candidate
    const scoredItems: DiscoveryFeedItem[] = candidates.map(candidate => {
      const isConnected = activeConnections.has(candidate.id);
      const isPending = pendingRequests.has(candidate.id);
      const hasLikedViewer = likesReceived.has(candidate.id);
      const hasViewerLiked = viewerLikes.has(candidate.id);
      const isSaved = viewerSaves.has(candidate.id);

      const resonance = calculateExplainableResonance(viewerProfile!, candidate, isConnected);

      let connectionStatus: 'none' | 'pending' | 'connected' = 'none';
      if (isConnected) connectionStatus = 'connected';
      else if (isPending) connectionStatus = 'pending';

      return {
        profile: candidate,
        resonance,
        hasLikedViewer,
        hasViewerLiked,
        isSaved,
        connectionStatus
      };
    });

    // 7. Sort Feed
    const sortBy = filters.sortBy || 'resonance';
    scoredItems.sort((a, b) => {
      if (sortBy === 'resonance') {
        return b.resonance.overallResonanceScore - a.resonance.overallResonanceScore;
      }
      if (sortBy === 'recently_active') {
        return b.profile.last_active_at - a.profile.last_active_at;
      }
      if (sortBy === 'new_members') {
        return b.profile.created_at - a.profile.created_at;
      }
      if (sortBy === 'shared_interests') {
        return b.resonance.sharedInterests.length - a.resonance.sharedInterests.length;
      }
      return 0;
    });

    // 8. Slice pagination
    const total = scoredItems.length;
    const paginatedItems = scoredItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
      activeFilterSummary: {
        connectionType: filters.connectionType || 'all',
        totalExclusionsApplied: excludedIds.size,
        sortBy
      }
    };
  }

  /**
   * Generates a deep-dive explainable resonance report between viewer and target user
   */
  public static explainResonance(viewerId: string, targetUserId: string): ExplainableResonanceReport | null {
    const viewer = this.getProfile(viewerId);
    const target = this.getProfile(targetUserId);
    if (!viewer || !target) return null;

    const isConnected = Boolean(db.prepare(`
      SELECT 1 FROM user_connections 
      WHERE ((user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?))
      AND status = 'active'
    `).get(viewerId, targetUserId, targetUserId, viewerId));

    return calculateExplainableResonance(viewer, target, isConnected);
  }

  /**
   * Records a user interaction (like, pass, save, follow)
   */
  public static recordInteraction(
    userId: string,
    targetUserId: string,
    type: InteractionType,
    connectionType: ConnectionType = 'friendship'
  ): {
    success: boolean;
    mutualMatchEstablished: boolean;
    connection?: UserConnection;
  } {
    if (userId === targetUserId) {
      return { success: false, mutualMatchEstablished: false };
    }

    const now = Date.now();
    const id = `act_${userId}_${targetUserId}_${type}_${now}`;

    // Upsert or insert interaction record
    db.prepare(`
      INSERT INTO user_interactions (id, user_id, target_user_id, interaction_type, connection_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, targetUserId, type, connectionType, now);

    let mutualMatchEstablished = false;
    let establishedConnection: UserConnection | undefined;

    // If this is a 'like', check if target user has previously liked this user
    if (type === 'like') {
      const reciprocalLike = db.prepare(`
        SELECT * FROM user_interactions 
        WHERE user_id = ? AND target_user_id = ? AND interaction_type = 'like'
      `).get(targetUserId, userId) as any;

      if (reciprocalLike) {
        mutualMatchEstablished = true;
        // Check if connection already exists
        const [userA, userB] = [userId, targetUserId].sort();
        const existingConn = db.prepare(`
          SELECT * FROM user_connections WHERE user_a_id = ? AND user_b_id = ?
        `).get(userA, userB) as any;

        if (!existingConn) {
          const connId = `conn_${userA}_${userB}_${now}`;
          db.prepare(`
            INSERT INTO user_connections (id, user_a_id, user_b_id, connection_type, status, established_at)
            VALUES (?, ?, ?, ?, 'active', ?)
          `).run(connId, userA, userB, connectionType, now);

          establishedConnection = {
            id: connId,
            user_a_id: userA,
            user_b_id: userB,
            connection_type: connectionType,
            status: 'active',
            established_at: now
          };
        }
      }
    }

    return {
      success: true,
      mutualMatchEstablished,
      connection: establishedConnection
    };
  }

  /**
   * Sends an explicit connection request with optional personalized note
   */
  public static sendConnectionRequest(
    senderId: string,
    recipientId: string,
    connectionType: ConnectionType,
    note?: string
  ): { success: boolean; request?: ConnectionRequest; error?: string } {
    if (senderId === recipientId) {
      return { success: false, error: 'Cannot connect with yourself.' };
    }

    // Check bidirectional block
    const isBlocked = db.prepare(`
      SELECT 1 FROM user_blocks 
      WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
    `).get(senderId, recipientId, recipientId, senderId);

    if (isBlocked) {
      return { success: false, error: 'Connection unavailable due to boundary settings.' };
    }

    // Check if reverse pending request already exists -> auto-accept
    const reverseReq = db.prepare(`
      SELECT * FROM connection_requests 
      WHERE sender_id = ? AND recipient_id = ? AND status = 'pending'
    `).get(recipientId, senderId) as any;

    const now = Date.now();

    if (reverseReq) {
      // Auto-accept both!
      db.prepare(`
        UPDATE connection_requests SET status = 'accepted', responded_at = ? WHERE id = ?
      `).run(now, reverseReq.id);

      const [userA, userB] = [senderId, recipientId].sort();
      const connId = `conn_${userA}_${userB}_${now}`;
      db.prepare(`
        INSERT OR REPLACE INTO user_connections (id, user_a_id, user_b_id, connection_type, status, established_at)
        VALUES (?, ?, ?, ?, 'active', ?)
      `).run(connId, userA, userB, connectionType, now);

      return {
        success: true,
        request: {
          id: reverseReq.id,
          sender_id: recipientId,
          recipient_id: senderId,
          connection_type: connectionType,
          status: 'accepted',
          created_at: reverseReq.created_at,
          responded_at: now
        }
      };
    }

    const reqId = `req_${senderId}_${recipientId}_${now}`;
    db.prepare(`
      INSERT INTO connection_requests (id, sender_id, recipient_id, connection_type, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).run(reqId, senderId, recipientId, connectionType, note || null, now);

    return {
      success: true,
      request: {
        id: reqId,
        sender_id: senderId,
        recipient_id: recipientId,
        connection_type: connectionType,
        note,
        status: 'pending',
        created_at: now
      }
    };
  }

  /**
   * Responds to an incoming connection request (accept or decline)
   */
  public static respondToConnectionRequest(
    recipientId: string,
    requestId: string,
    action: 'accept' | 'decline'
  ): { success: boolean; connection?: UserConnection; error?: string } {
    const req = db.prepare(`
      SELECT * FROM connection_requests WHERE id = ? AND recipient_id = ?
    `).get(requestId, recipientId) as any;

    if (!req) {
      return { success: false, error: 'Connection request not found.' };
    }

    const now = Date.now();
    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    db.prepare(`
      UPDATE connection_requests SET status = ?, responded_at = ? WHERE id = ?
    `).run(newStatus, now, requestId);

    let connection: UserConnection | undefined;

    if (action === 'accept') {
      const [userA, userB] = [req.sender_id, req.recipient_id].sort();
      const connId = `conn_${userA}_${userB}_${now}`;

      db.prepare(`
        INSERT OR REPLACE INTO user_connections (id, user_a_id, user_b_id, connection_type, status, established_at)
        VALUES (?, ?, ?, ?, 'active', ?)
      `).run(connId, userA, userB, req.connection_type, now);

      connection = {
        id: connId,
        user_a_id: userA,
        user_b_id: userB,
        connection_type: req.connection_type as ConnectionType,
        status: 'active',
        established_at: now
      };
    }

    return { success: true, connection };
  }

  /**
   * Retrieves active connections for a user with partner profile details
   */
  public static getConnections(userId: string, typeFilter?: ConnectionType): UserConnection[] {
    let query = `
      SELECT * FROM user_connections 
      WHERE (user_a_id = ? OR user_b_id = ?) AND status = 'active'
    `;
    const params: any[] = [userId, userId];

    if (typeFilter) {
      query += ` AND connection_type = ?`;
      params.push(typeFilter);
    }

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(r => {
      const partnerId = r.user_a_id === userId ? r.user_b_id : r.user_a_id;
      const partnerProfile = this.getProfile(partnerId) || undefined;
      return {
        id: r.id,
        user_a_id: r.user_a_id,
        user_b_id: r.user_b_id,
        connection_type: r.connection_type as ConnectionType,
        status: r.status,
        established_at: Number(r.established_at),
        partner_profile: partnerProfile
      };
    });
  }

  /**
   * Unmatches / dissolves an established connection
   */
  public static unmatch(userId: string, targetUserId: string): boolean {
    const [userA, userB] = [userId, targetUserId].sort();
    const result = db.prepare(`
      UPDATE user_connections SET status = 'unmatched' 
      WHERE user_a_id = ? AND user_b_id = ?
    `).run(userA, userB);
    return result.changes > 0;
  }

  /**
   * Resets passed profiles so user can explore the feed again
   */
  public static resetPasses(userId: string): number {
    const result = db.prepare(`
      DELETE FROM user_interactions 
      WHERE user_id = ? AND interaction_type = 'pass'
    `).run(userId);
    return result.changes;
  }

  /**
   * Retrieves saved profiles for a user
   */
  public static getSavedProfiles(userId: string): DiscoveryFeedItem[] {
    const savedRows = db.prepare(`
      SELECT target_user_id FROM user_interactions 
      WHERE user_id = ? AND interaction_type = 'save'
      ORDER BY created_at DESC
    `).all(userId) as { target_user_id: string }[];

    const viewerProfile = this.getProfile(userId);
    const items: DiscoveryFeedItem[] = [];

    for (const r of savedRows) {
      const profile = this.getProfile(r.target_user_id);
      if (profile) {
        const resonance = viewerProfile 
          ? calculateExplainableResonance(viewerProfile, profile)
          : ({} as any);

        items.push({
          profile,
          resonance,
          hasLikedViewer: false,
          hasViewerLiked: false,
          isSaved: true,
          connectionStatus: 'none'
        });
      }
    }

    return items;
  }

  /**
   * Seeds diverse, realistic discovery profiles covering all 9 connection types
   */
  public static seedDiscoveryProfiles() {
    this.initTables();

    const existingCount = db.prepare('SELECT COUNT(*) as c FROM discovery_profiles').get() as { c: number };
    if (existingCount && existingCount.c >= 6) {
      return; // Already populated
    }

    const now = Date.now();

    const seedProfiles: DiscoveryProfile[] = [
      {
        id: 'usr_me',
        name: 'Kavindu Senanayake',
        username: 'kavindu',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        age: 26,
        city: 'Colombo',
        country: 'Sri Lanka',
        tagline: 'Software architect, quiet thinker, lo-fi listener & indie game explorer.',
        bio: 'Designing human-first social systems. I appreciate long walks, philosophical deep-dives, and friends who respect comfortable silence.',
        verified: true,
        primary_intention: 'friendship',
        intentions: ['friendship', 'creative_collaboration', 'shared_interest'],
        core_values: ['Authenticity', 'Curiosity', 'Kindness', 'Intellectual Honesty'],
        interests: ['Indie Games', 'System Design', 'Psychology', 'Philosophy', 'Lo-Fi Music'],
        activities: ['Stargazing', 'Coding Experiments', 'Reading Memoirs', 'Tea Brewing'],
        lifestyle: {
          sleep_schedule: 'night_owl',
          social_energy: 'introvert',
          pets: 'cat_lover',
          living_space: 'minimalist'
        },
        communication: {
          cadence: 'balanced',
          style: 'direct',
          listening_style: 'reflective',
          conflict_approach: 'direct_discussion'
        },
        photos: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'
        ],
        discovery_visible: true,
        last_active_at: now,
        created_at: now - 86400000 * 30
      },
      {
        id: 'usr_alex',
        name: 'Alex Rivera',
        username: 'alex_r',
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        age: 25,
        city: 'Kandy',
        country: 'Sri Lanka',
        tagline: 'Game mechanics designer, synthesizer nerd & night sky stargazer.',
        bio: 'Creating independent interactive worlds. Let us skip performative small talk and talk about outer wild space mechanics.',
        verified: true,
        primary_intention: 'creative_collaboration',
        intentions: ['creative_collaboration', 'friendship', 'activity_partners'],
        core_values: ['Creative Agency', 'Intellectual Honesty', 'Kindness', 'Curiosity'],
        interests: ['Indie Games', 'Astronomy', 'Psychology', 'Synthesizers', 'Retro Sci-Fi'],
        activities: ['Sound Design', 'Telescope Stargazing', 'Game Prototyping'],
        lifestyle: {
          sleep_schedule: 'night_owl',
          social_energy: 'ambivert',
          pets: 'dog_lover',
          living_space: 'cozy_cluttered'
        },
        communication: {
          cadence: 'slow_asynchronous',
          style: 'playful',
          listening_style: 'action_oriented',
          conflict_approach: 'need_space_first'
        },
        photos: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 300000,
        created_at: now - 86400000 * 25
      },
      {
        id: 'usr_tara',
        name: 'Tara Perera',
        username: 'tara_p',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        age: 24,
        city: 'Colombo',
        country: 'Sri Lanka',
        tagline: 'Documentary photographer & literature nerd. Film grain and honest moments.',
        bio: 'Capturing moments people forget to look at twice. Looking for slow living, quiet loyalty, and shared creative journeys.',
        verified: true,
        primary_intention: 'dating',
        intentions: ['dating', 'long_term', 'creative_collaboration'],
        core_values: ['Loyalty', 'Intellectual Honesty', 'Vulnerability', 'Curiosity'],
        interests: ['Cinematography', 'Literature', 'Psychology', 'Ambient Lo-Fi', 'Film Noir'],
        activities: ['Street Photography', 'Darkroom Printing', 'Bookstore Wandering'],
        lifestyle: {
          sleep_schedule: 'flexible',
          social_energy: 'introvert',
          pets: 'cat_lover',
          living_space: 'organized'
        },
        communication: {
          cadence: 'balanced',
          style: 'gentle',
          listening_style: 'validating',
          conflict_approach: 'direct_discussion'
        },
        photos: [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 7200000,
        created_at: now - 86400000 * 20
      },
      {
        id: 'usr_dinuk',
        name: 'Dinuk Fernando',
        username: 'dinuk_f',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        age: 25,
        city: 'Galle',
        country: 'Sri Lanka',
        tagline: 'Marine biology student. Ocean conservation by day, acoustic strings by night.',
        bio: 'Always ready to offer an empathetic listening ear without unsolicited judgment. Coral reefs, diving, and honest support.',
        verified: true,
        primary_intention: 'community_connections',
        intentions: ['community_connections', 'friendship', 'activity_partners'],
        core_values: ['Kindness', 'Loyalty', 'Empathy', 'Environmental Stewardship'],
        interests: ['Marine Biology', 'Ocean Conservation', 'Acoustic Guitar', 'Philosophy'],
        activities: ['Scuba Diving', 'Beach Cleanups', 'Playing Guitar'],
        lifestyle: {
          sleep_schedule: 'early_bird',
          social_energy: 'ambivert',
          pets: 'all_animals',
          living_space: 'minimalist'
        },
        communication: {
          cadence: 'frequent_daily',
          style: 'gentle',
          listening_style: 'reflective',
          conflict_approach: 'collaborative_walk'
        },
        photos: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 3600000,
        created_at: now - 86400000 * 15
      },
      {
        id: 'usr_elena',
        name: 'Elena Rostova',
        username: 'elena_films',
        avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        age: 27,
        city: 'Colombo',
        country: 'Sri Lanka',
        tagline: 'Independent filmmaker & scriptwriter. Visual poetry in 16mm.',
        bio: 'Looking for screenwriting collaborators, sound artists, and actors who prefer poetic realism over Hollywood formula.',
        verified: true,
        primary_intention: 'creative_collaboration',
        intentions: ['creative_collaboration', 'professional_networking', 'friendship'],
        core_values: ['Creative Agency', 'Courage', 'Authenticity', 'Curiosity'],
        interests: ['Cinematography', 'Screenwriting', 'Analog Synth', 'Architecture'],
        activities: ['Short Film Production', 'Film Festivals', 'Coffeehouse Storyboarding'],
        lifestyle: {
          sleep_schedule: 'night_owl',
          social_energy: 'ambivert',
          pets: 'none',
          living_space: 'organized'
        },
        communication: {
          cadence: 'balanced',
          style: 'metaphorical',
          listening_style: 'analytical',
          conflict_approach: 'direct_discussion'
        },
        photos: [
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 1800000,
        created_at: now - 86400000 * 10
      },
      {
        id: 'usr_marcus',
        name: 'Marcus Vance',
        username: 'marcus_climbs',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        age: 28,
        city: 'Kandy',
        country: 'Sri Lanka',
        tagline: 'Rock climber, trail runner & mountain lover. Moving in wild terrain.',
        bio: 'Looking for dependable activity partners to tackle multi-pitch climbing routes and sunrise trail runs in the central hills.',
        verified: true,
        primary_intention: 'activity_partners',
        intentions: ['activity_partners', 'friendship', 'community_connections'],
        core_values: ['Courage', 'Accountability', 'Loyalty', 'Simplicity'],
        interests: ['Bouldering', 'Trail Running', 'Wilderness Survival', 'Acoustic Folk'],
        activities: ['Outdoor Climbing', 'Camping Under Stars', 'Backpacking'],
        lifestyle: {
          sleep_schedule: 'early_bird',
          social_energy: 'extrovert',
          pets: 'dog_lover',
          living_space: 'minimalist'
        },
        communication: {
          cadence: 'direct',
          style: 'direct',
          listening_style: 'action_oriented',
          conflict_approach: 'collaborative_walk'
        },
        photos: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 5400000,
        created_at: now - 86400000 * 8
      },
      {
        id: 'usr_priya',
        name: 'Priya Raman',
        username: 'priya_minds',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        age: 26,
        city: 'Colombo',
        country: 'Sri Lanka',
        tagline: 'Clinical psychology researcher & tea lover. The art of listening.',
        bio: 'Exploring human resilience, cognitive biases, and why we do what we do. Seeking slow friendships with authentic depth.',
        verified: true,
        primary_intention: 'friendship',
        intentions: ['friendship', 'shared_interest', 'professional_networking'],
        core_values: ['Intellectual Honesty', 'Empathy', 'Curiosity', 'Kindness'],
        interests: ['Psychology', 'Neuroscience', 'Philosophy', 'Artisan Tea'],
        activities: ['Reading Papers', 'Brewing Oolong Tea', 'Writing Essays'],
        lifestyle: {
          sleep_schedule: 'flexible',
          social_energy: 'introvert',
          pets: 'cat_lover',
          living_space: 'organized'
        },
        communication: {
          cadence: 'slow_asynchronous',
          style: 'intellectual',
          listening_style: 'reflective',
          conflict_approach: 'direct_discussion'
        },
        photos: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 900000,
        created_at: now - 86400000 * 6
      },
      {
        id: 'usr_sora',
        name: 'Sora Tanaka',
        username: 'sora_keys',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        age: 27,
        city: 'Colombo',
        country: 'Sri Lanka',
        tagline: 'Classical pianist & slow-living enthusiast. Finding calm in melody.',
        bio: 'Devoted to Bach, Chopin, and the art of unhurried mornings. Looking for a long-term life partner with shared warmth and patience.',
        verified: true,
        primary_intention: 'long_term',
        intentions: ['long_term', 'dating', 'friendship'],
        core_values: ['Authenticity', 'Loyalty', 'Kindness', 'Patience'],
        interests: ['Neoclassical Piano', 'Gardening', 'Literature', 'Architecture'],
        activities: ['Playing Piano', 'Tending Houseplants', 'Morning Walks'],
        lifestyle: {
          sleep_schedule: 'early_bird',
          social_energy: 'introvert',
          pets: 'dog_lover',
          living_space: 'organized'
        },
        communication: {
          cadence: 'balanced',
          style: 'gentle',
          listening_style: 'validating',
          conflict_approach: 'direct_discussion'
        },
        photos: [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'
        ],
        discovery_visible: true,
        last_active_at: now - 1200000,
        created_at: now - 86400000 * 4
      }
    ];

    for (const p of seedProfiles) {
      // Ensure user entry exists in users table first for foreign key integrity
      db.prepare(`
        INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(p.id, p.name, p.username, p.avatar_url, p.verified ? 1 : 0, p.last_active_at, p.tagline);

      this.upsertProfile(p);
    }
  }
}
