import { db } from '../db';
import type {
  PrmPerson,
  PrmInteraction,
  PrmMemory,
  PrmCommitment,
  PrmReminder,
  PersonFullDossier,
  BeforeYouTalkBriefing,
  AiRelationshipInsights,
  RelationshipCategory,
  RelationshipLifecyclePhase,
  InteractionType,
  MemoryType,
  CommitmentStatus,
  ReminderCategory
} from './types';
import { AiRelationshipContextEngine } from './aiContextEngine';

export class RelationshipVaultService {
  /**
   * Initializes SQLite tables for Personal Relationship Management (PRM)
   */
  public static initTables() {
    db.exec(`
      -- Managed Persons & Relational Entities
      CREATE TABLE IF NOT EXISTS prm_persons (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        target_user_id TEXT,
        name TEXT NOT NULL,
        nickname TEXT,
        avatar_url TEXT,
        relationship_category TEXT NOT NULL,
        custom_category_name TEXT,
        relationship_status TEXT NOT NULL,
        custom_status_label TEXT,
        significance_level INTEGER DEFAULT 3,
        first_met_date TEXT,
        first_met_location TEXT,
        anniversary_date TEXT,
        birthday_date TEXT,
        favourite_food TEXT,
        favourite_drink TEXT,
        favourite_colour TEXT,
        love_language TEXT,
        communication_style TEXT,
        communication_preferences_json TEXT, -- JSON
        boundaries_json TEXT, -- JSON array
        shared_interests_json TEXT, -- JSON array
        things_they_love_json TEXT, -- JSON array
        things_they_dislike_json TEXT, -- JSON array
        is_locked INTEGER DEFAULT 0,
        last_interacted_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_prm_persons_owner 
        ON prm_persons(owner_user_id, relationship_category);

      -- Interaction Timeline Logs
      CREATE TABLE IF NOT EXISTS prm_interactions (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        interaction_type TEXT NOT NULL,
        participants_json TEXT NOT NULL, -- JSON array
        title TEXT,
        notes TEXT NOT NULL,
        emotional_tone TEXT,
        attachments_json TEXT, -- JSON array
        related_memory_ids_json TEXT, -- JSON array
        follow_up_actions_json TEXT, -- JSON array
        created_at INTEGER NOT NULL,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES prm_persons(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_prm_interactions_timeline 
        ON prm_interactions(person_id, timestamp DESC);

      -- Personal Memories, Quotes & Unresolved Discussions
      CREATE TABLE IF NOT EXISTS prm_memories (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        memory_type TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        emotional_significance INTEGER DEFAULT 3,
        occurred_at TEXT,
        tags_json TEXT, -- JSON array
        is_unresolved INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES prm_persons(id) ON DELETE CASCADE
      );

      -- Commitments & Promises Tracker
      CREATE TABLE IF NOT EXISTS prm_commitments (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        made_by TEXT NOT NULL CHECK(made_by IN ('me', 'them', 'mutual')),
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'fulfilled', 'broken', 'renegotiated')),
        fulfilled_at INTEGER,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES prm_persons(id) ON DELETE CASCADE
      );

      -- Reminders & Dates
      CREATE TABLE IF NOT EXISTS prm_reminders (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        due_date TEXT NOT NULL,
        reminder_timing TEXT NOT NULL DEFAULT 'day_of',
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'dismissed', 'completed')),
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES prm_persons(id) ON DELETE CASCADE
      );
    `);
  }

  /**
   * Helper: Parses DB row into PrmPerson
   */
  private static rowToPerson(row: any): PrmPerson {
    return {
      id: row.id,
      owner_user_id: row.owner_user_id,
      target_user_id: row.target_user_id || undefined,
      name: row.name,
      nickname: row.nickname || undefined,
      avatar_url: row.avatar_url || undefined,
      relationship_category: row.relationship_category as RelationshipCategory,
      custom_category_name: row.custom_category_name || undefined,
      relationship_status: row.relationship_status as RelationshipLifecyclePhase,
      custom_status_label: row.custom_status_label || undefined,
      significance_level: Number(row.significance_level || 3),
      first_met_date: row.first_met_date || undefined,
      first_met_location: row.first_met_location || undefined,
      anniversary_date: row.anniversary_date || undefined,
      birthday_date: row.birthday_date || undefined,
      favourite_food: row.favourite_food || undefined,
      favourite_drink: row.favourite_drink || undefined,
      favourite_colour: row.favourite_colour || undefined,
      love_language: row.love_language || undefined,
      communication_style: row.communication_style || undefined,
      communication_preferences: JSON.parse(row.communication_preferences_json || '{}'),
      boundaries: JSON.parse(row.boundaries_json || '[]'),
      shared_interests: JSON.parse(row.shared_interests_json || '[]'),
      things_they_love: JSON.parse(row.things_they_love_json || '[]'),
      things_they_dislike: JSON.parse(row.things_they_dislike_json || '[]'),
      is_locked: Boolean(row.is_locked),
      last_interacted_at: row.last_interacted_at ? Number(row.last_interacted_at) : undefined,
      created_at: Number(row.created_at),
      updated_at: Number(row.updated_at)
    };
  }

  /**
   * Lists all managed relationships for an account owner (enforces data isolation)
   */
  public static listPersons(
    ownerUserId: string,
    categoryFilter?: RelationshipCategory,
    statusFilter?: RelationshipLifecyclePhase
  ): PrmPerson[] {
    let query = 'SELECT * FROM prm_persons WHERE owner_user_id = ?';
    const params: any[] = [ownerUserId];

    if (categoryFilter) {
      query += ' AND relationship_category = ?';
      params.push(categoryFilter);
    }
    if (statusFilter) {
      query += ' AND relationship_status = ?';
      params.push(statusFilter);
    }

    query += ' ORDER BY significance_level DESC, updated_at DESC';
    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(r => this.rowToPerson(r));
  }

  /**
   * Gets a single managed person
   */
  public static getPerson(ownerUserId: string, personId: string): PrmPerson | null {
    const row = db.prepare('SELECT * FROM prm_persons WHERE id = ? AND owner_user_id = ?').get(personId, ownerUserId);
    if (!row) return null;
    return this.rowToPerson(row);
  }

  /**
   * Creates a new managed relationship record
   */
  public static createPerson(ownerUserId: string, data: Partial<PrmPerson> & { name: string }): PrmPerson {
    const now = Date.now();
    const id = data.id || `per_${now}_${Math.random().toString(36).slice(2, 7)}`;

    db.prepare(`
      INSERT INTO prm_persons (
        id, owner_user_id, target_user_id, name, nickname, avatar_url,
        relationship_category, custom_category_name, relationship_status, custom_status_label,
        significance_level, first_met_date, first_met_location, anniversary_date, birthday_date,
        favourite_food, favourite_drink, favourite_colour, love_language, communication_style,
        communication_preferences_json, boundaries_json, shared_interests_json,
        things_they_love_json, things_they_dislike_json, is_locked, last_interacted_at,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `).run(
      id, ownerUserId, data.target_user_id || null, data.name, data.nickname || null, data.avatar_url || null,
      data.relationship_category || 'friendship', data.custom_category_name || null,
      data.relationship_status || 'new_acquaintance', data.custom_status_label || null,
      data.significance_level || 3, data.first_met_date || null, data.first_met_location || null,
      data.anniversary_date || null, data.birthday_date || null, data.favourite_food || null,
      data.favourite_drink || null, data.favourite_colour || null, data.love_language || null,
      data.communication_style || null, JSON.stringify(data.communication_preferences || {}),
      JSON.stringify(data.boundaries || []), JSON.stringify(data.shared_interests || []),
      JSON.stringify(data.things_they_love || []), JSON.stringify(data.things_they_dislike || []),
      data.is_locked ? 1 : 0, data.last_interacted_at || null, now, now
    );

    return this.getPerson(ownerUserId, id)!;
  }

  /**
   * Updates an existing managed person
   */
  public static updatePerson(ownerUserId: string, personId: string, updates: Partial<PrmPerson>): PrmPerson | null {
    const existing = this.getPerson(ownerUserId, personId);
    if (!existing) return null;

    const now = Date.now();
    const merged: PrmPerson = {
      ...existing,
      ...updates,
      updated_at: now
    };

    db.prepare(`
      UPDATE prm_persons SET
        name = ?, nickname = ?, avatar_url = ?, relationship_category = ?, custom_category_name = ?,
        relationship_status = ?, custom_status_label = ?, significance_level = ?,
        first_met_date = ?, first_met_location = ?, anniversary_date = ?, birthday_date = ?,
        favourite_food = ?, favourite_drink = ?, favourite_colour = ?, love_language = ?,
        communication_style = ?, communication_preferences_json = ?, boundaries_json = ?,
        shared_interests_json = ?, things_they_love_json = ?, things_they_dislike_json = ?,
        is_locked = ?, last_interacted_at = ?, updated_at = ?
      WHERE id = ? AND owner_user_id = ?
    `).run(
      merged.name, merged.nickname || null, merged.avatar_url || null, merged.relationship_category, merged.custom_category_name || null,
      merged.relationship_status, merged.custom_status_label || null, merged.significance_level,
      merged.first_met_date || null, merged.first_met_location || null, merged.anniversary_date || null, merged.birthday_date || null,
      merged.favourite_food || null, merged.favourite_drink || null, merged.favourite_colour || null, merged.love_language || null,
      merged.communication_style || null, JSON.stringify(merged.communication_preferences || {}), JSON.stringify(merged.boundaries || []),
      JSON.stringify(merged.shared_interests || []), JSON.stringify(merged.things_they_love || []), JSON.stringify(merged.things_they_dislike || []),
      merged.is_locked ? 1 : 0, merged.last_interacted_at || null, now, personId, ownerUserId
    );

    return this.getPerson(ownerUserId, personId);
  }

  /**
   * Permanently deletes a managed person and purges all interactions, memories, and commitments
   */
  public static deletePerson(ownerUserId: string, personId: string): boolean {
    const res = db.prepare('DELETE FROM prm_persons WHERE id = ? AND owner_user_id = ?').run(personId, ownerUserId);
    return res.changes > 0;
  }

  /**
   * Logs an interaction with historical timestamp support
   */
  public static logInteraction(
    ownerUserId: string,
    personId: string,
    data: {
      timestamp?: number;
      interaction_type: InteractionType;
      participants?: string[];
      title?: string;
      notes: string;
      emotional_tone?: 'joyful' | 'deep' | 'vulnerable' | 'tense' | 'comforting' | 'neutral';
      attachments?: Array<{ type: string; url: string; label?: string }>;
      related_memory_ids?: string[];
      follow_up_actions?: string[];
    }
  ): PrmInteraction {
    const person = this.getPerson(ownerUserId, personId);
    if (!person) throw new Error('Person not found in your relationship vault');

    const now = Date.now();
    const interactionTimestamp = data.timestamp || now;
    const id = `int_${now}_${Math.random().toString(36).slice(2, 7)}`;

    db.prepare(`
      INSERT INTO prm_interactions (
        id, owner_user_id, person_id, timestamp, interaction_type, participants_json,
        title, notes, emotional_tone, attachments_json, related_memory_ids_json,
        follow_up_actions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, ownerUserId, personId, interactionTimestamp, data.interaction_type,
      JSON.stringify(data.participants || [person.name]), data.title || null, data.notes,
      data.emotional_tone || 'neutral', JSON.stringify(data.attachments || []),
      JSON.stringify(data.related_memory_ids || []), JSON.stringify(data.follow_up_actions || []), now
    );

    // Update person's last_interacted_at
    db.prepare('UPDATE prm_persons SET last_interacted_at = ?, updated_at = ? WHERE id = ?').run(
      interactionTimestamp, now, personId
    );

    return {
      id,
      owner_user_id: ownerUserId,
      person_id: personId,
      timestamp: interactionTimestamp,
      interaction_type: data.interaction_type,
      participants: data.participants || [person.name],
      title: data.title,
      notes: data.notes,
      emotional_tone: data.emotional_tone || 'neutral',
      attachments: data.attachments || [],
      related_memory_ids: data.related_memory_ids || [],
      follow_up_actions: data.follow_up_actions || [],
      created_at: now
    };
  }

  /**
   * Retrieves interaction history timeline for a person
   */
  public static getInteractions(ownerUserId: string, personId: string): PrmInteraction[] {
    const rows = db.prepare(`
      SELECT * FROM prm_interactions 
      WHERE person_id = ? AND owner_user_id = ? 
      ORDER BY timestamp DESC
    `).all(personId, ownerUserId) as any[];

    return rows.map(r => ({
      id: r.id,
      owner_user_id: r.owner_user_id,
      person_id: r.person_id,
      timestamp: Number(r.timestamp),
      interaction_type: r.interaction_type as InteractionType,
      participants: JSON.parse(r.participants_json || '[]'),
      title: r.title || undefined,
      notes: r.notes,
      emotional_tone: r.emotional_tone || undefined,
      attachments: JSON.parse(r.attachments_json || '[]'),
      related_memory_ids: JSON.parse(r.related_memory_ids_json || '[]'),
      follow_up_actions: JSON.parse(r.follow_up_actions_json || '[]'),
      created_at: Number(r.created_at)
    }));
  }

  /**
   * Adds a personal memory, quote, or reflection
   */
  public static addMemory(
    ownerUserId: string,
    personId: string,
    data: {
      memory_type: MemoryType;
      title?: string;
      content: string;
      emotional_significance?: number;
      occurred_at?: string;
      tags?: string[];
      is_unresolved?: boolean;
    }
  ): PrmMemory {
    const now = Date.now();
    const id = `mem_${now}_${Math.random().toString(36).slice(2, 7)}`;

    db.prepare(`
      INSERT INTO prm_memories (
        id, owner_user_id, person_id, memory_type, title, content,
        emotional_significance, occurred_at, tags_json, is_unresolved,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, ownerUserId, personId, data.memory_type, data.title || null, data.content,
      data.emotional_significance || 3, data.occurred_at || null, JSON.stringify(data.tags || []),
      data.is_unresolved ? 1 : 0, now, now
    );

    return {
      id,
      owner_user_id: ownerUserId,
      person_id: personId,
      memory_type: data.memory_type,
      title: data.title,
      content: data.content,
      emotional_significance: data.emotional_significance || 3,
      occurred_at: data.occurred_at,
      tags: data.tags || [],
      is_unresolved: Boolean(data.is_unresolved),
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Retrieves all memories for a person
   */
  public static getMemories(ownerUserId: string, personId: string): PrmMemory[] {
    const rows = db.prepare(`
      SELECT * FROM prm_memories 
      WHERE person_id = ? AND owner_user_id = ? 
      ORDER BY created_at DESC
    `).all(personId, ownerUserId) as any[];

    return rows.map(r => ({
      id: r.id,
      owner_user_id: r.owner_user_id,
      person_id: r.person_id,
      memory_type: r.memory_type as MemoryType,
      title: r.title || undefined,
      content: r.content,
      emotional_significance: Number(r.emotional_significance || 3),
      occurred_at: r.occurred_at || undefined,
      tags: JSON.parse(r.tags_json || '[]'),
      is_unresolved: Boolean(r.is_unresolved),
      created_at: Number(r.created_at),
      updated_at: Number(r.updated_at)
    }));
  }

  /**
   * Updates an existing memory
   */
  public static updateMemory(ownerUserId: string, memoryId: string, updates: Partial<PrmMemory>): PrmMemory | null {
    const now = Date.now();
    const existing = db.prepare('SELECT * FROM prm_memories WHERE id = ? AND owner_user_id = ?').get(memoryId, ownerUserId) as any;
    if (!existing) return null;

    db.prepare(`
      UPDATE prm_memories SET
        title = ?, content = ?, emotional_significance = ?, is_unresolved = ?, updated_at = ?
      WHERE id = ? AND owner_user_id = ?
    `).run(
      updates.title !== undefined ? updates.title : existing.title,
      updates.content !== undefined ? updates.content : existing.content,
      updates.emotional_significance !== undefined ? updates.emotional_significance : existing.emotional_significance,
      updates.is_unresolved !== undefined ? (updates.is_unresolved ? 1 : 0) : existing.is_unresolved,
      now, memoryId, ownerUserId
    );

    const updated = db.prepare('SELECT * FROM prm_memories WHERE id = ?').get(memoryId) as any;
    return {
      id: updated.id,
      owner_user_id: updated.owner_user_id,
      person_id: updated.person_id,
      memory_type: updated.memory_type as MemoryType,
      title: updated.title || undefined,
      content: updated.content,
      emotional_significance: Number(updated.emotional_significance),
      occurred_at: updated.occurred_at || undefined,
      tags: JSON.parse(updated.tags_json || '[]'),
      is_unresolved: Boolean(updated.is_unresolved),
      created_at: Number(updated.created_at),
      updated_at: Number(updated.updated_at)
    };
  }

  /**
   * Adds a commitment or promise
   */
  public static addCommitment(
    ownerUserId: string,
    personId: string,
    data: {
      made_by: 'me' | 'them' | 'mutual';
      title: string;
      description?: string;
      due_date?: string;
      notes?: string;
    }
  ): PrmCommitment {
    const now = Date.now();
    const id = `com_${now}_${Math.random().toString(36).slice(2, 7)}`;

    db.prepare(`
      INSERT INTO prm_commitments (
        id, owner_user_id, person_id, made_by, title, description,
        due_date, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      id, ownerUserId, personId, data.made_by, data.title, data.description || null,
      data.due_date || null, data.notes || null, now
    );

    return {
      id,
      owner_user_id: ownerUserId,
      person_id: personId,
      made_by: data.made_by,
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      status: 'pending',
      notes: data.notes,
      created_at: now
    };
  }

  /**
   * Retrieves commitments for a person
   */
  public static getCommitments(ownerUserId: string, personId: string): PrmCommitment[] {
    const rows = db.prepare(`
      SELECT * FROM prm_commitments 
      WHERE person_id = ? AND owner_user_id = ? 
      ORDER BY created_at DESC
    `).all(personId, ownerUserId) as any[];

    return rows.map(r => ({
      id: r.id,
      owner_user_id: r.owner_user_id,
      person_id: r.person_id,
      made_by: r.made_by as 'me' | 'them' | 'mutual',
      title: r.title,
      description: r.description || undefined,
      due_date: r.due_date || undefined,
      status: r.status as CommitmentStatus,
      fulfilled_at: r.fulfilled_at ? Number(r.fulfilled_at) : undefined,
      notes: r.notes || undefined,
      created_at: Number(r.created_at)
    }));
  }

  /**
   * Updates commitment status (e.g. fulfilled, broken)
   */
  public static updateCommitment(
    ownerUserId: string,
    commitmentId: string,
    updates: { status?: CommitmentStatus; notes?: string }
  ): PrmCommitment | null {
    const now = Date.now();
    const existing = db.prepare('SELECT * FROM prm_commitments WHERE id = ? AND owner_user_id = ?').get(commitmentId, ownerUserId) as any;
    if (!existing) return null;

    const fulfilledAt = updates.status === 'fulfilled' ? now : existing.fulfilled_at;

    db.prepare(`
      UPDATE prm_commitments SET
        status = ?, notes = ?, fulfilled_at = ?
      WHERE id = ? AND owner_user_id = ?
    `).run(
      updates.status || existing.status,
      updates.notes !== undefined ? updates.notes : existing.notes,
      fulfilledAt,
      commitmentId,
      ownerUserId
    );

    const updated = db.prepare('SELECT * FROM prm_commitments WHERE id = ?').get(commitmentId) as any;
    return {
      id: updated.id,
      owner_user_id: updated.owner_user_id,
      person_id: updated.person_id,
      made_by: updated.made_by,
      title: updated.title,
      description: updated.description || undefined,
      due_date: updated.due_date || undefined,
      status: updated.status,
      fulfilled_at: updated.fulfilled_at ? Number(updated.fulfilled_at) : undefined,
      notes: updated.notes || undefined,
      created_at: Number(updated.created_at)
    };
  }

  /**
   * Adds a reminder
   */
  public static addReminder(
    ownerUserId: string,
    personId: string,
    data: {
      title: string;
      category: ReminderCategory;
      due_date: string;
      reminder_timing?: 'day_of' | 'day_before' | '3_days_before' | '1_week_before';
      notes?: string;
    }
  ): PrmReminder {
    const now = Date.now();
    const id = `rem_${now}_${Math.random().toString(36).slice(2, 7)}`;

    db.prepare(`
      INSERT INTO prm_reminders (
        id, owner_user_id, person_id, title, category, due_date,
        reminder_timing, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      id, ownerUserId, personId, data.title, data.category, data.due_date,
      data.reminder_timing || 'day_of', data.notes || null, now
    );

    return {
      id,
      owner_user_id: ownerUserId,
      person_id: personId,
      title: data.title,
      category: data.category,
      due_date: data.due_date,
      reminder_timing: data.reminder_timing || 'day_of',
      status: 'pending',
      notes: data.notes,
      created_at: now
    };
  }

  /**
   * Retrieves reminders for a person
   */
  public static getReminders(ownerUserId: string, personId: string): PrmReminder[] {
    const rows = db.prepare(`
      SELECT * FROM prm_reminders 
      WHERE person_id = ? AND owner_user_id = ? 
      ORDER BY due_date ASC
    `).all(personId, ownerUserId) as any[];

    return rows.map(r => ({
      id: r.id,
      owner_user_id: r.owner_user_id,
      person_id: r.person_id,
      title: r.title,
      category: r.category as ReminderCategory,
      due_date: r.due_date,
      reminder_timing: r.reminder_timing as any,
      status: r.status as any,
      notes: r.notes || undefined,
      created_at: Number(r.created_at)
    }));
  }

  /**
   * Updates reminder status (e.g. dismissed, completed)
   */
  public static updateReminder(
    ownerUserId: string,
    reminderId: string,
    status: 'pending' | 'dismissed' | 'completed'
  ): boolean {
    const res = db.prepare('UPDATE prm_reminders SET status = ? WHERE id = ? AND owner_user_id = ?').run(
      status, reminderId, ownerUserId
    );
    return res.changes > 0;
  }

  /**
   * Retrieves the full relationship dossier with all timeline events, memories, commitments, and briefings
   */
  public static getFullDossier(ownerUserId: string, personId: string): PersonFullDossier | null {
    const person = this.getPerson(ownerUserId, personId);
    if (!person) return null;

    const interactions = this.getInteractions(ownerUserId, personId);
    const memories = this.getMemories(ownerUserId, personId);
    const commitments = this.getCommitments(ownerUserId, personId);
    const reminders = this.getReminders(ownerUserId, personId);

    const briefing = AiRelationshipContextEngine.generateBriefing(
      person,
      interactions,
      memories,
      commitments,
      reminders
    );

    return {
      person,
      interactions,
      memories,
      commitments,
      reminders,
      briefing
    };
  }

  /**
   * Generates AI Relationship Assistance insights
   */
  public static getAiInsights(ownerUserId: string, personId: string): AiRelationshipInsights | null {
    const person = this.getPerson(ownerUserId, personId);
    if (!person) return null;

    const interactions = this.getInteractions(ownerUserId, personId);
    const memories = this.getMemories(ownerUserId, personId);
    const commitments = this.getCommitments(ownerUserId, personId);

    return AiRelationshipContextEngine.generateAiInsights(
      person,
      interactions,
      memories,
      commitments
    );
  }

  /**
   * Pre-seeds initial relationship dossiers for the primary user
   */
  public static seedVaultData() {
    this.initTables();

    const count = db.prepare('SELECT COUNT(*) as c FROM prm_persons').get() as { c: number };
    if (count && count.c > 0) return;

    const ownerId = 'usr_me';

    // 1. Alex Rivera (Girlfriend / Committed Relationship)
    const alex = this.createPerson(ownerId, {
      id: 'prm_alex',
      target_user_id: 'usr_alex',
      name: 'Alex Rivera',
      nickname: 'Alex',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      relationship_category: 'romantic',
      relationship_status: 'committed_relationship',
      custom_status_label: 'Girlfriend',
      significance_level: 5,
      first_met_date: 'October 14, 2024',
      first_met_location: 'University library coffee counter during a rainy afternoon',
      anniversary_date: 'February 14',
      birthday_date: 'August 12',
      favourite_food: 'Thin crust woodfired Margherita pizza with fresh basil',
      favourite_drink: 'Hot spiced chai with cardamom',
      favourite_colour: 'Deep obsidian & forest green',
      love_language: 'Quality Time & thoughtful gestures',
      communication_style: 'Prefers calls and slow voice notes over endless dry texting',
      communication_preferences: {
        cadence: 'Daily evening call or thoughtful asynchronous voice notes',
        best_time_to_reach: 'After 8:30 PM (post studio presentation wrap-up)',
        space_needs: 'Needs 30 minutes of quiet solitude after long presentations'
      },
      boundaries: [
        'No phone scrolling during dinner together',
        'Direct honesty over avoidant silence when upset',
        'Respect her studio focus hours between 10 AM and 4 PM'
      ],
      shared_interests: ['Studio Ghibli Soundtracks', 'Indie Game Design', 'Film Noir', 'Mountain Treks'],
      things_they_love: [
        'Rain on tin roofs while sipping hot tea',
        'Analog film grain photography',
        'Unexpected small gifts with handwritten notes',
        'Outer Wilds planetary orbits'
      ],
      things_they_dislike: [
        'Dry "k" replies or dismissive tone',
        'Being rushed when explaining an emotional concept',
        'Loud crowded clubs with excessive bass'
      ],
      last_interacted_at: Date.now() - 86400000
    });

    // Seed Alex's interactions
    this.logInteraction(ownerId, alex.id, {
      timestamp: Date.now() - 86400000,
      interaction_type: 'in_person',
      title: 'Rainy Cafe Walk & Architecture Talk',
      notes: 'Met at the corner cafe. She spoke with immense passion about her upcoming architectural thesis. She mentioned feeling a bit of presentation anxiety.',
      emotional_tone: 'deep',
      follow_up_actions: ['Ask how the thesis jury went on Tuesday morning', 'Bring hot chai']
    });

    // Seed Alex's memories & quotes
    this.addMemory(ownerId, alex.id, {
      memory_type: 'quote',
      title: 'Quote on Meaningful Stories',
      content: 'Stories do not need to save the world to matter. They only need to save one lonely afternoon.',
      emotional_significance: 5,
      tags: ['Storytelling', 'Meaning', 'Art']
    });

    this.addMemory(ownerId, alex.id, {
      memory_type: 'unresolved_discussion',
      title: 'Planning off-grid cabin weekend',
      content: 'Discussed planning an off-grid cabin weekend in the Knuckles hills. We still need to finalize dates for November.',
      emotional_significance: 4,
      is_unresolved: true,
      tags: ['Travel', 'Cabin', 'Planning']
    });

    // Seed Alex's commitments
    this.addCommitment(ownerId, alex.id, {
      made_by: 'me',
      title: 'Bring her a printed copy of the vintage cinema poster',
      description: 'Found a high-res scan of the 1954 Japanese film poster she loves.',
      due_date: 'Next Saturday',
      notes: 'Frame it nicely in dark oak.'
    });

    this.addCommitment(ownerId, alex.id, {
      made_by: 'them',
      title: 'Alex promised to teach me basic synthesizer modular patching',
      due_date: 'This Sunday afternoon'
    });

    // Seed Alex's reminders
    this.addReminder(ownerId, alex.id, {
      title: 'Alex Birthday Celebration',
      category: 'birthday',
      due_date: 'August 12',
      reminder_timing: '1_week_before',
      notes: 'Plan an intimate dinner with close friends.'
    });

    this.addReminder(ownerId, alex.id, {
      title: 'Thesis Defense Jury Follow-Up',
      category: 'follow_up',
      due_date: 'Tomorrow at 10 AM',
      reminder_timing: 'day_of',
      notes: 'Send a warm supportive message before she walks into the jury room.'
    });

    // 2. Tara Perera (Friendship / Creative Partner)
    const tara = this.createPerson(ownerId, {
      id: 'prm_tara',
      target_user_id: 'usr_tara',
      name: 'Tara Perera',
      nickname: 'Tara',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      relationship_category: 'creative_partner',
      relationship_status: 'friendship_development',
      custom_status_label: 'Documentary Co-Creator',
      significance_level: 4,
      birthday_date: 'November 22',
      favourite_food: 'Crispy vegetable samosas & black filter coffee',
      love_language: 'Words of affirmation & thoughtful creative critique',
      communication_style: 'Direct, thoughtful, and values slow reflection before reacting',
      boundaries: ['Does not answer messages while in the darkroom developing prints'],
      shared_interests: ['Cinematography', 'Street Photography', 'Philosophy'],
      things_they_love: ['16mm film reels', 'Quiet bookshops', 'Rainy mornings'],
      things_they_dislike: ['Superficial small talk', 'Performative social media posting']
    });

    this.logInteraction(ownerId, tara.id, {
      timestamp: Date.now() - (86400000 * 3),
      interaction_type: 'shared_activity',
      title: 'Street Photography Walk in Fort',
      notes: 'Walked through old colonial streets capturing dusk light leaks. Talked about loneliness in modern cities.',
      emotional_tone: 'vulnerable'
    });
  }
}
