import { db } from '../db';
import { 
  Conversation, 
  ConversationParticipant, 
  ChatMessage, 
  MessageAttachment, 
  ReactionSummary,
  DeliveryStatus
} from './types';
import { SafetyService } from './safetyService';

export class MessagingService {
  // =========================================================================
  // 1. CONVERSATION MANAGEMENT (Direct & Group)
  // =========================================================================

  /**
   * Creates a new Group Chat with participants and roles
   */
  public static createGroupConversation(params: {
    creatorId: string;
    title: string;
    description?: string;
    avatarUrl?: string;
    memberIds: string[];
  }): Conversation {
    const id = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    const insertTx = db.transaction(() => {
      // 1. Insert conversation
      db.prepare(`
        INSERT INTO conversations (id, type, title, description, avatar_url, created_by, created_at, updated_at)
        VALUES (?, 'group', ?, ?, ?, ?, ?, ?)
      `).run(
        id, 
        params.title, 
        params.description || null, 
        params.avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
        params.creatorId,
        now, 
        now
      );

      // 2. Add creator as owner
      db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, unread_count)
        VALUES (?, ?, 'owner', ?, 0)
      `).run(id, params.creatorId, now);

      // 3. Add members
      const insertMember = db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, unread_count)
        VALUES (?, ?, 'member', ?, 0)
      `);

      for (const mId of params.memberIds) {
        if (mId !== params.creatorId) {
          // Check safety blocks
          if (!SafetyService.isBlocked(params.creatorId, mId)) {
            insertMember.run(id, mId, now);
          }
        }
      }
    });

    insertTx();

    return this.getConversationById(id, params.creatorId)!;
  }

  /**
   * Adds a member to an existing group conversation
   */
  public static addMemberToGroup(conversationId: string, actorUserId: string, targetUserId: string, role: string = 'member'): boolean {
    const conv = db.prepare('SELECT type FROM conversations WHERE id = ?').get(conversationId) as any;
    if (!conv) throw new Error('Conversation not found');
    if (conv.type !== 'group') throw new Error('Cannot add members to non-group conversation');

    // Check actor permissions
    const actorMembership = db.prepare('SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
      .get(conversationId, actorUserId) as any;
    if (!actorMembership || !['owner', 'admin'].includes(actorMembership.role)) {
      throw new Error('Forbidden: Only group owner or admin can add members');
    }

    if (SafetyService.isBlocked(actorUserId, targetUserId)) {
      throw new Error('Cannot add user: blocked by safety rules');
    }

    const now = Date.now();
    db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, unread_count)
      VALUES (?, ?, ?, ?, 0)
      ON CONFLICT(conversation_id, user_id) DO UPDATE SET role = ?
    `).run(conversationId, targetUserId, role, now, role);

    return true;
  }

  /**
   * Removes a member from a group or allows a member to leave
   */
  public static removeMemberFromGroup(conversationId: string, actorUserId: string, targetUserId: string): boolean {
    const conv = db.prepare('SELECT type FROM conversations WHERE id = ?').get(conversationId) as any;
    if (!conv) throw new Error('Conversation not found');

    if (actorUserId !== targetUserId) {
      // Actor is removing someone else -> must be owner/admin
      const actorMembership = db.prepare('SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
        .get(conversationId, actorUserId) as any;
      if (!actorMembership || !['owner', 'admin'].includes(actorMembership.role)) {
        throw new Error('Forbidden: Only group owner or admin can remove other members');
      }
    }

    db.prepare('DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
      .run(conversationId, targetUserId);

    return true;
  }

  /**
   * Updates group metadata (title, description, avatarUrl, settings)
   */
  public static updateGroupInfo(
    conversationId: string, 
    actorUserId: string, 
    updates: { title?: string; description?: string; avatarUrl?: string; settings?: any }
  ): Conversation {
    const actorMembership = db.prepare('SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
      .get(conversationId, actorUserId) as any;
    if (!actorMembership || !['owner', 'admin'].includes(actorMembership.role)) {
      throw new Error('Forbidden: Only group owner or admin can update group information');
    }

    const now = Date.now();
    if (updates.title !== undefined) {
      db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?').run(updates.title, now, conversationId);
    }
    if (updates.description !== undefined) {
      db.prepare('UPDATE conversations SET description = ?, updated_at = ? WHERE id = ?').run(updates.description, now, conversationId);
    }
    if (updates.avatarUrl !== undefined) {
      db.prepare('UPDATE conversations SET avatar_url = ?, updated_at = ? WHERE id = ?').run(updates.avatarUrl, now, conversationId);
    }
    if (updates.settings !== undefined) {
      db.prepare('UPDATE conversations SET settings_json = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(updates.settings), now, conversationId);
    }

    return this.getConversationById(conversationId, actorUserId)!;
  }

  /**
   * Retrieves all members of a group with roles and presence
   */
  public static getGroupMembers(conversationId: string): Array<{
    userId: string;
    role: string;
    joinedAt: number;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeenAt?: number;
  }> {
    const rows = db.prepare(`
      SELECT 
        cm.user_id,
        cm.role,
        cm.joined_at,
        u.name,
        u.avatar_url,
        u.last_seen_at
      FROM conversation_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.conversation_id = ?
      ORDER BY cm.role = 'owner' DESC, cm.role = 'admin' DESC, cm.joined_at ASC
    `).all(conversationId) as any[];

    return rows.map(r => ({
      userId: r.user_id,
      role: r.role || 'member',
      joinedAt: r.joined_at,
      name: r.name,
      avatarUrl: r.avatar_url,
      isOnline: Boolean(Date.now() - (r.last_seen_at || 0) < 120000),
      lastSeenAt: r.last_seen_at
    }));
  }

  /**
   * Creates or retrieves a Direct Conversation between two users
   */
  public static getOrCreateDirectConversation(userA: string, userB: string): Conversation {
    if (SafetyService.isBlocked(userA, userB)) {
      throw new Error('Cannot initiate conversation: relationship is blocked');
    }

    // Look for existing direct conversation between userA and userB
    const existing = db.prepare(`
      SELECT c.id 
      FROM conversations c
      JOIN conversation_members m1 ON c.id = m1.conversation_id AND m1.user_id = ?
      JOIN conversation_members m2 ON c.id = m2.conversation_id AND m2.user_id = ?
      WHERE c.type = 'direct'
      LIMIT 1
    `).get(userA, userB) as { id: string } | undefined;

    if (existing) {
      return this.getConversationById(existing.id, userA)!;
    }

    // Create new direct conversation
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO conversations (id, type, created_at, updated_at)
        VALUES (?, 'direct', ?, ?)
      `).run(id, now, now);

      db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?)
      `).run(id, userA, now);

      db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?)
      `).run(id, userB, now);
    });

    insertTx();

    return this.getConversationById(id, userA)!;
  }

  /**
   * Retrieves conversation with full participant context and unread metadata
   */
  public static getConversationById(conversationId: string, currentUserId: string): Conversation | null {
    const row = db.prepare(`
      SELECT 
        c.*,
        cm.is_pinned,
        cm.is_archived,
        cm.is_muted,
        cm.unread_count,
        cm.draft_text,
        cm.role as my_role,
        (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as participants_count,
        lm.text_content as last_msg_text,
        lm.sender_id as last_msg_sender,
        lm.created_at as last_msg_timestamp
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = ?
      LEFT JOIN messages lm ON c.last_message_id = lm.id
      WHERE c.id = ?
    `).get(currentUserId, conversationId) as any;

    if (!row) return null;

    let title = row.title;
    let avatarUrl = row.avatar_url;
    let partnerInfo = undefined;

    if (row.type === 'direct') {
      const partner = db.prepare(`
        SELECT u.id, u.name, u.avatar_url, u.is_verified, u.last_seen_at
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = ? AND cm.user_id != ?
        LIMIT 1
      `).get(conversationId, currentUserId) as any;

      if (partner) {
        title = partner.name || 'Chat';
        avatarUrl = partner.avatar_url;
        partnerInfo = {
          id: partner.id,
          name: partner.name,
          avatarUrl: partner.avatar_url,
          isVerified: Boolean(partner.is_verified),
          lastSeenAt: partner.last_seen_at
        };
      }
    } else if (row.type === 'saved_messages') {
      title = 'Saved Messages';
      avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    }

    return {
      id: row.id,
      type: row.type,
      title: title || 'Conversation',
      description: row.description,
      avatarUrl,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageId: row.last_message_id,
      lastMessageText: row.last_msg_text,
      lastMessageSenderId: row.last_msg_sender,
      lastMessageTimestamp: row.last_msg_timestamp,
      participantsCount: row.participants_count,
      isPinned: Boolean(row.is_pinned),
      isArchived: Boolean(row.is_archived),
      isMuted: Boolean(row.is_muted),
      unreadCount: row.unread_count || 0,
      draftText: row.draft_text,
      partner: partnerInfo
    };
  }

  /**
   * Lists conversations for a user with category filtering and search
   */
  public static getUserConversations(userId: string, filter?: string): Conversation[] {
    let whereClause = 'WHERE cm.user_id = ?';
    if (filter === 'archived') {
      whereClause += ' AND cm.is_archived = 1';
    } else if (filter === 'unread') {
      whereClause += ' AND cm.unread_count > 0 AND cm.is_archived = 0';
    } else {
      whereClause += ' AND cm.is_archived = 0';
    }

    const rows = db.prepare(`
      SELECT 
        c.*,
        cm.is_pinned,
        cm.is_archived,
        cm.is_muted,
        cm.unread_count,
        cm.draft_text,
        (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as participants_count,
        lm.text_content as last_msg_text,
        lm.sender_id as last_msg_sender,
        lm.created_at as last_msg_timestamp,
        partner.id as partner_id,
        partner.name as partner_name,
        partner.avatar_url as partner_avatar,
        partner.is_verified as partner_verified,
        partner.last_seen_at as partner_last_seen
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      LEFT JOIN conversation_members other ON c.id = other.conversation_id AND other.user_id != ? AND c.type = 'direct'
      LEFT JOIN users partner ON other.user_id = partner.id
      LEFT JOIN messages lm ON c.last_message_id = lm.id
      ${whereClause}
      ORDER BY cm.is_pinned DESC, c.updated_at DESC
    `).all(userId, userId) as any[];

    return rows.map(r => {
      const isDirect = r.type === 'direct';
      const isSaved = r.type === 'saved_messages';

      const title = isSaved 
        ? 'Saved Messages' 
        : (isDirect ? (r.partner_name || 'Match') : (r.title || 'Group Chat'));

      const avatarUrl = isSaved
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : (isDirect ? (r.partner_avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80') : (r.avatar_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'));

      return {
        id: r.id,
        type: r.type,
        title,
        description: r.description,
        avatarUrl,
        createdBy: r.created_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastMessageId: r.last_message_id,
        lastMessageText: r.last_msg_text,
        lastMessageSenderId: r.last_msg_sender,
        lastMessageTimestamp: r.last_msg_timestamp,
        participantsCount: r.participants_count,
        isPinned: Boolean(r.is_pinned),
        isArchived: Boolean(r.is_archived),
        isMuted: Boolean(r.is_muted),
        unreadCount: r.unread_count || 0,
        draftText: r.draft_text,
        partner: isDirect && r.partner_id ? {
          id: r.partner_id,
          name: r.partner_name,
          avatarUrl: r.partner_avatar,
          isVerified: Boolean(r.partner_verified),
          lastSeenAt: r.partner_last_seen
        } : undefined
      };
    });
  }

  // =========================================================================
  // 2. MESSAGE OPERATIONS (Send, Edit, Delete, Reactions, Receipts)
  // =========================================================================

  /**
   * Sends a message with server-authoritative sequencing, idempotency, and attachment support
   */
  public static sendMessage(params: {
    conversationId: string;
    senderId: string;
    clientMessageId: string;
    type?: string;
    text?: string;
    mediaUrl?: string;
    voiceDuration?: number;
    voiceWaveform?: number[];
    attachments?: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      url: string;
      duration?: number;
      thumbnailUrl?: string;
      width?: number;
      height?: number;
    }>;
    replyToMessageId?: string;
    threadId?: string;
    attachmentJson?: string;
    expiresAt?: number;
    scheduledAt?: number;
  }): { message: ChatMessage; deduplicated: boolean } {
    const { conversationId, senderId, clientMessageId } = params;

    // 1. Idempotency deduplication check
    const existingMsg = db.prepare('SELECT * FROM messages WHERE client_message_id = ?').get(clientMessageId) as any;
    if (existingMsg) {
      return {
        message: this.formatMessageRow(existingMsg, senderId),
        deduplicated: true
      };
    }

    // 2. Moderation check
    if (params.text) {
      const moderation = SafetyService.moderateContent(params.text);
      if (moderation.flagged && moderation.severity === 'high') {
        throw new Error(`Message rejected by automated safety check: ${moderation.reason}`);
      }
    }

    // 3. Attachment validation
    if (params.attachments && params.attachments.length > 0) {
      for (const att of params.attachments) {
        const val = SafetyService.validateAttachment(att.fileName, att.fileSize, att.mimeType);
        if (!val.valid) {
          throw new Error(`Invalid attachment: ${val.error}`);
        }
      }
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    let savedMsg: any = null;

    const tx = db.transaction(() => {
      // Monotonic sequence number per conversation
      const seqRow = db.prepare(`
        SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq 
        FROM messages 
        WHERE conversation_id = ?
      `).get(conversationId) as { next_seq: number };
      const seq = seqRow.next_seq;

      // Insert message
      db.prepare(`
        INSERT INTO messages (
          id, conversation_id, sender_id, client_message_id, sequence_number,
          message_type, text_content, media_url, voice_duration, voice_waveform,
          reply_to_message_id, thread_id, is_edited, is_pinned, is_deleted_for_everyone,
          attachment_json, expires_at, scheduled_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
      `).run(
        messageId,
        conversationId,
        senderId,
        clientMessageId,
        seq,
        params.type || 'text',
        params.text || null,
        params.mediaUrl || null,
        params.voiceDuration || null,
        params.voiceWaveform ? JSON.stringify(params.voiceWaveform) : null,
        params.replyToMessageId || null,
        params.threadId || null,
        params.attachmentJson || (params.attachments ? JSON.stringify(params.attachments) : null),
        params.expiresAt || null,
        params.scheduledAt || null,
        now
      );

      // Insert structured attachments
      if (params.attachments) {
        const insertAtt = db.prepare(`
          INSERT INTO message_attachments (
            id, message_id, file_name, file_size, mime_type, url, duration, thumbnail_url, width, height, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const att of params.attachments) {
          const attId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          insertAtt.run(attId, messageId, att.fileName, att.fileSize, att.mimeType, att.url, att.duration || null, att.thumbnailUrl || null, att.width || null, att.height || null, now);
        }
      }

      // Update conversation metadata
      db.prepare(`
        UPDATE conversations 
        SET last_message_id = ?, updated_at = ? 
        WHERE id = ?
      `).run(messageId, now, conversationId);

      // Increment unread count for other members
      db.prepare(`
        UPDATE conversation_members
        SET unread_count = unread_count + 1
        WHERE conversation_id = ? AND user_id != ?
      `).run(conversationId, senderId);

      // Record delivery receipt for sender
      db.prepare(`
        INSERT OR REPLACE INTO message_receipts (
          id, message_id, conversation_id, user_id, delivered_at, read_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`rcp_${messageId}_${senderId}`, messageId, conversationId, senderId, now, now, now);

      savedMsg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    });

    tx.immediate();

    return {
      message: this.formatMessageRow(savedMsg, senderId),
      deduplicated: false
    };
  }

  /**
   * Retrieves paginated messages with cursor, reactions, and attachments
   */
  public static getMessages(params: {
    conversationId: string;
    userId: string;
    limit?: number;
    beforeSequence?: number;
  }): ChatMessage[] {
    const limit = Math.min(params.limit || 50, 100);

    let query = `
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
    `;
    const queryParams: any[] = [params.conversationId];

    if (params.beforeSequence) {
      query += ` AND m.sequence_number < ?`;
      queryParams.push(params.beforeSequence);
    }

    query += ` ORDER BY m.sequence_number DESC LIMIT ?`;
    queryParams.push(limit);

    const rows = (db.prepare(query).all(...queryParams) as any[]).reverse();

    return rows.map(r => this.formatMessageRow(r, params.userId));
  }

  /**
   * Retrieves messages for offline synchronization since a given sequence number
   */
  public static syncMessages(conversationId: string, sinceSequence: number, userId: string): ChatMessage[] {
    const rows = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ? AND m.sequence_number > ?
      ORDER BY m.sequence_number ASC
      LIMIT 200
    `).all(conversationId, sinceSequence) as any[];

    return rows.map(r => this.formatMessageRow(r, userId));
  }

  /**
   * Edits message content with audit history
   */
  public static editMessage(messageId: string, editorId: string, newText: string): ChatMessage {
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as any;
    if (!msg) throw new Error('Message not found');

    if (msg.sender_id !== editorId) {
      throw new Error('Forbidden: Only the sender can edit this message');
    }

    if (msg.is_deleted_for_everyone) {
      throw new Error('Cannot edit deleted message');
    }

    const now = Date.now();
    const historyId = `ed_${now}_${Math.random().toString(36).slice(2, 6)}`;

    const tx = db.transaction(() => {
      // Record in audit log
      db.prepare(`
        INSERT INTO message_edit_history (id, message_id, editor_id, previous_content, edited_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(historyId, messageId, editorId, msg.text_content || '', now);

      // Update message
      db.prepare(`
        UPDATE messages
        SET text_content = ?, is_edited = 1
        WHERE id = ?
      `).run(newText, messageId);
    });

    tx();

    const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as any;
    return this.formatMessageRow(updated, editorId);
  }

  /**
   * Deletes a message (delete for me vs delete for everyone)
   */
  public static deleteMessage(messageId: string, userId: string, mode: 'for_me' | 'for_everyone'): boolean {
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as any;
    if (!msg) throw new Error('Message not found');

    if (mode === 'for_everyone') {
      if (msg.sender_id !== userId) {
        throw new Error('Forbidden: Only sender can delete for everyone');
      }
      db.prepare(`
        UPDATE messages 
        SET is_deleted_for_everyone = 1, text_content = 'This message was deleted' 
        WHERE id = ?
      `).run(messageId);
    } else {
      // Delete for me: add userId to deleted_for_users_json
      const currentDeleted: string[] = JSON.parse(msg.deleted_for_users_json || '[]');
      if (!currentDeleted.includes(userId)) {
        currentDeleted.push(userId);
        db.prepare('UPDATE messages SET deleted_for_users_json = ? WHERE id = ?')
          .run(JSON.stringify(currentDeleted), messageId);
      }
    }

    return true;
  }

  /**
   * Toggles an emoji reaction on a message
   */
  public static toggleReaction(messageId: string, userId: string, emoji: string): { reacted: boolean } {
    const existing = db.prepare(`
      SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?
    `).get(messageId, userId, emoji);

    if (existing) {
      db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?')
        .run(messageId, userId, emoji);
      return { reacted: false };
    } else {
      const id = `rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, messageId, userId, emoji, Date.now());
      return { reacted: true };
    }
  }

  /**
   * Marks a conversation as read up to a specific sequence number or latest
   */
  public static markAsRead(conversationId: string, userId: string, sequenceNumber?: number): boolean {
    const now = Date.now();

    // 1. Reset unread count for member
    db.prepare(`
      UPDATE conversation_members 
      SET unread_count = 0, last_read_sequence = COALESCE(?, (SELECT MAX(sequence_number) FROM messages WHERE conversation_id = ?))
      WHERE conversation_id = ? AND user_id = ?
    `).run(sequenceNumber || null, conversationId, conversationId, userId);

    // 2. Update read receipts on messages
    db.prepare(`
      INSERT OR REPLACE INTO message_receipts (
        id, message_id, conversation_id, user_id, delivered_at, read_at, created_at
      )
      SELECT 
        'rcp_' || m.id || '_' || ?,
        m.id,
        m.conversation_id,
        ?,
        COALESCE(r.delivered_at, ?),
        ?,
        ?
      FROM messages m
      LEFT JOIN message_receipts r ON m.id = r.message_id AND r.user_id = ?
      WHERE m.conversation_id = ? AND m.sender_id != ?
    `).run(userId, userId, now, now, now, userId, conversationId, userId);

    return true;
  }

  /**
   * Searches messages across conversations with full-text query and filters
   */
  public static searchMessages(params: {
    userId: string;
    query: string;
    conversationId?: string;
    senderId?: string;
    type?: string;
    limit?: number;
  }): ChatMessage[] {
    const { userId, query, conversationId, senderId, type } = params;
    const limit = Math.min(params.limit || 50, 100);

    let sql = `
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN conversation_members cm ON m.conversation_id = cm.conversation_id AND cm.user_id = ?
      JOIN users u ON m.sender_id = u.id
      WHERE m.is_deleted_for_everyone = 0
        AND m.text_content LIKE ?
    `;
    const sqlParams: any[] = [userId, `%${query}%`];

    if (conversationId) {
      sql += ' AND m.conversation_id = ?';
      sqlParams.push(conversationId);
    }
    if (senderId) {
      sql += ' AND m.sender_id = ?';
      sqlParams.push(senderId);
    }
    if (type) {
      sql += ' AND m.message_type = ?';
      sqlParams.push(type);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT ?';
    sqlParams.push(limit);

    const rows = db.prepare(sql).all(...sqlParams) as any[];
    return rows.map(r => this.formatMessageRow(r, userId));
  }

  // =========================================================================
  // 3. REAL-TIME POLLS & CALL LOGGING
  // =========================================================================

  /**
   * Creates a Poll message in a conversation
   */
  public static createPollMessage(params: {
    conversationId: string;
    senderId: string;
    clientMessageId: string;
    question: string;
    options: string[];
    allowsMultiple?: boolean;
    expiresAt?: number;
  }): { message: ChatMessage; deduplicated: boolean } {
    if (!params.question.trim()) throw new Error('Poll question cannot be empty');
    if (!params.options || params.options.length < 2) throw new Error('Poll must have at least 2 options');

    const pollAttachment = {
      question: params.question,
      options: params.options.map((opt, id) => ({ id, text: opt })),
      allowsMultiple: Boolean(params.allowsMultiple),
      closed: false
    };

    return this.sendMessage({
      conversationId: params.conversationId,
      senderId: params.senderId,
      clientMessageId: params.clientMessageId,
      type: 'poll',
      text: params.question,
      attachmentJson: JSON.stringify(pollAttachment),
      expiresAt: params.expiresAt
    });
  }

  /**
   * Casts or toggles a vote on a poll
   */
  public static votePoll(messageId: string, userId: string, optionIndex: number): {
    success: boolean;
    pollData: any;
  } {
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as any;
    if (!msg) throw new Error('Message not found');
    if (msg.message_type !== 'poll') throw new Error('Message is not a poll');

    const pollMetadata = msg.attachment_json ? JSON.parse(msg.attachment_json) : null;
    if (!pollMetadata) throw new Error('Malformed poll metadata');
    if (pollMetadata.closed) throw new Error('This poll is closed');

    const allowsMultiple = Boolean(pollMetadata.allowsMultiple);
    const existing = db.prepare('SELECT id FROM poll_votes WHERE message_id = ? AND user_id = ? AND option_index = ?')
      .get(messageId, userId, optionIndex);

    const now = Date.now();
    const tx = db.transaction(() => {
      if (existing) {
        // Toggle off
        db.prepare('DELETE FROM poll_votes WHERE message_id = ? AND user_id = ? AND option_index = ?')
          .run(messageId, userId, optionIndex);
      } else {
        if (!allowsMultiple) {
          // Clear any previous votes by this user
          db.prepare('DELETE FROM poll_votes WHERE message_id = ? AND user_id = ?')
            .run(messageId, userId);
        }
        const voteId = `pv_${now}_${Math.random().toString(36).slice(2, 6)}`;
        db.prepare(`
          INSERT INTO poll_votes (id, message_id, user_id, option_index, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(voteId, messageId, userId, optionIndex, now);
      }
    });

    tx();

    const formatted = this.formatMessageRow(msg, userId);
    return {
      success: true,
      pollData: formatted.pollData
    };
  }

  /**
   * Logs a WebRTC call
   */
  public static logCall(call: {
    id: string;
    conversationId: string;
    callerId: string;
    recipientId: string;
    callType: 'voice' | 'video';
    status: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected';
    durationSeconds?: number;
    startedAt: number;
    endedAt?: number;
  }) {
    db.prepare(`
      INSERT OR REPLACE INTO calls (
        id, conversation_id, caller_id, recipient_id, call_type, status, duration_seconds, started_at, ended_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      call.id,
      call.conversationId,
      call.callerId,
      call.recipientId,
      call.callType,
      call.status,
      call.durationSeconds || 0,
      call.startedAt,
      call.endedAt || null
    );
  }

  /**
   * Updates call status and duration
   */
  public static updateCallStatus(callId: string, status: string, durationSeconds?: number) {
    const now = Date.now();
    db.prepare(`
      UPDATE calls 
      SET status = ?, duration_seconds = COALESCE(?, duration_seconds), ended_at = ?
      WHERE id = ?
    `).run(status, durationSeconds || null, now, callId);
  }

  /**
   * Retrieves call history for a user
   */
  public static getCallsHistory(userId: string, conversationId?: string) {
    let sql = `
      SELECT c.*, 
             u1.name as caller_name, u1.avatar_url as caller_avatar,
             u2.name as recipient_name, u2.avatar_url as recipient_avatar
      FROM calls c
      JOIN users u1 ON c.caller_id = u1.id
      JOIN users u2 ON c.recipient_id = u2.id
      WHERE (c.caller_id = ? OR c.recipient_id = ?)
    `;
    const params: any[] = [userId, userId];

    if (conversationId) {
      sql += ' AND c.conversation_id = ?';
      params.push(conversationId);
    }

    sql += ' ORDER BY c.started_at DESC LIMIT 50';
    return db.prepare(sql).all(...params);
  }

  // =========================================================================
  // HELPER FORMATTERS
  // =========================================================================

  private static formatMessageRow(row: any, currentUserId: string): ChatMessage {
    const deletedForUsers: string[] = JSON.parse(row.deleted_for_users_json || '[]');
    const isDeletedForMe = deletedForUsers.includes(currentUserId);

    // Fetch reactions for this message
    const reactionRows = db.prepare(`
      SELECT emoji, COUNT(*) as count,
             SUM(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as user_reacted
      FROM message_reactions
      WHERE message_id = ?
      GROUP BY emoji
    `).all(currentUserId, row.id) as any[];

    const reactions: ReactionSummary[] = reactionRows.map(r => ({
      emoji: r.emoji,
      count: r.count,
      userReacted: Boolean(r.user_reacted)
    }));

    // Fetch attachments
    const attachmentRows = db.prepare(`
      SELECT * FROM message_attachments WHERE message_id = ?
    `).all(row.id) as any[];

    const attachments: MessageAttachment[] = attachmentRows.map(a => ({
      id: a.id,
      messageId: a.message_id,
      fileName: a.file_name,
      fileSize: a.file_size,
      mimeType: a.mime_type,
      url: a.url,
      duration: a.duration,
      thumbnailUrl: a.thumbnail_url,
      width: a.width,
      height: a.height,
      createdAt: a.created_at
    }));

    // Reply-to context
    let replyTo = undefined;
    if (row.reply_to_message_id) {
      const parent = db.prepare(`
        SELECT m.id, u.name as sender_name, m.text_content
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).get(row.reply_to_message_id) as any;

      if (parent) {
        replyTo = {
          id: parent.id,
          senderName: parent.sender_name,
          textSnippet: parent.text_content ? parent.text_content.slice(0, 60) : 'Attachment'
        };
      }
    }

    const isDeleted = Boolean(row.is_deleted_for_everyone);

    // Poll data formatting
    let pollData = undefined;
    if (row.message_type === 'poll') {
      try {
        const rawPoll = row.attachment_json ? JSON.parse(row.attachment_json) : null;
        if (rawPoll && rawPoll.question && rawPoll.options) {
          const votes = db.prepare('SELECT user_id, option_index FROM poll_votes WHERE message_id = ?').all(row.id) as Array<{ user_id: string; option_index: number }>;
          const userVotedOptionIds = votes.filter(v => v.user_id === currentUserId).map(v => v.option_index);
          const options = rawPoll.options.map((opt: any, idx: number) => {
            const optVotes = votes.filter(v => v.option_index === idx);
            return {
              id: idx,
              text: typeof opt === 'string' ? opt : opt.text,
              voteCount: optVotes.length,
              voterIds: optVotes.map(v => v.user_id)
            };
          });
          pollData = {
            question: rawPoll.question,
            options,
            allowsMultiple: Boolean(rawPoll.allowsMultiple),
            totalVotes: votes.length,
            closed: Boolean(rawPoll.closed),
            userVotedOptionIds
          };
        }
      } catch (e) {
        console.warn('Failed to parse poll data for message', row.id, e);
      }
    }

    return {
      id: row.id,
      clientMessageId: row.client_message_id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
      sequenceNumber: row.sequence_number,
      type: row.message_type,
      text: isDeleted ? 'This message was deleted' : (isDeletedForMe ? '' : row.text_content),
      mediaUrl: isDeleted || isDeletedForMe ? undefined : row.media_url,
      voiceDurationSeconds: row.voice_duration,
      voiceWaveform: row.voice_waveform ? JSON.parse(row.voice_waveform) : undefined,
      attachments: isDeleted || isDeletedForMe ? [] : attachments,
      replyToMessageId: row.reply_to_message_id,
      replyTo,
      threadId: row.thread_id,
      isEdited: Boolean(row.is_edited),
      isPinned: Boolean(row.is_pinned),
      isDeleted,
      deletedForMe: isDeletedForMe,
      reactions,
      status: 'delivered',
      createdAt: row.created_at,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: row.sender_id === currentUserId,
      pollData
    };
  }
}
