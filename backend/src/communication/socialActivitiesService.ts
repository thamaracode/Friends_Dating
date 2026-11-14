import { db } from '../db';
import { 
  WatchPartyRoom, 
  SocialActivityRoom, 
  SocialInvitation 
} from './types';

export class SocialActivitiesService {
  // =========================================================================
  // 1. WATCH PARTY COORDINATION (Movie-watch & video sync)
  // =========================================================================

  public static createWatchParty(params: {
    title: string;
    hostId: string;
    videoUrl: string;
    videoType?: 'youtube' | 'vimeo' | 'hls' | 'mp4';
    conversationId?: string;
  }): WatchPartyRoom {
    const id = `wp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    const videoType = params.videoType || 'youtube';

    db.prepare(`
      INSERT INTO watch_party_rooms (
        id, conversation_id, title, host_id, video_url, video_type,
        playback_position, is_playing, current_viewers_count, sync_state_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 1, '{}', ?, ?)
    `).run(
      id,
      params.conversationId || null,
      params.title,
      params.hostId,
      params.videoUrl,
      videoType,
      now,
      now
    );

    return {
      id,
      conversationId: params.conversationId,
      title: params.title,
      hostId: params.hostId,
      videoUrl: params.videoUrl,
      videoType,
      playbackPosition: 0,
      isPlaying: false,
      currentViewersCount: 1,
      createdAt: now,
      updatedAt: now
    };
  }

  public static getWatchParty(id: string): WatchPartyRoom | null {
    const row = db.prepare('SELECT * FROM watch_party_rooms WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      conversationId: row.conversation_id,
      title: row.title,
      hostId: row.host_id,
      videoUrl: row.video_url,
      videoType: row.video_type,
      playbackPosition: row.playback_position,
      isPlaying: Boolean(row.is_playing),
      currentViewersCount: row.current_viewers_count,
      syncStateJson: row.sync_state_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public static syncWatchPartyPlayback(
    roomId: string,
    userId: string,
    position: number,
    isPlaying: boolean
  ): WatchPartyRoom {
    const party = this.getWatchParty(roomId);
    if (!party) {
      throw new Error('Watch party room not found');
    }

    const now = Date.now();
    db.prepare(`
      UPDATE watch_party_rooms
      SET playback_position = ?, is_playing = ?, updated_at = ?
      WHERE id = ?
    `).run(position, isPlaying ? 1 : 0, now, roomId);

    return {
      ...party,
      playbackPosition: position,
      isPlaying,
      updatedAt: now
    };
  }

  // =========================================================================
  // 2. SHARED-INTEREST ROOMS & ONLINE LOUNGES
  // =========================================================================

  public static getSocialRooms(): SocialActivityRoom[] {
    const rows = db.prepare(`
      SELECT 
        r.*,
        u.name as host_name,
        u.avatar_url as host_avatar,
        (SELECT COUNT(*) FROM social_room_participants p WHERE p.room_id = r.id) as participants_count
      FROM social_activity_rooms r
      LEFT JOIN users u ON r.host_id = u.id
      WHERE r.is_active = 1
      ORDER BY r.created_at DESC
    `).all() as any[];

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      topic: r.topic,
      category: r.category,
      roomType: r.room_type,
      hostId: r.host_id,
      hostName: r.host_name,
      hostAvatar: r.host_avatar,
      maxParticipants: r.max_participants,
      tags: JSON.parse(r.tags_json || '[]'),
      isActive: Boolean(r.is_active),
      activeSpeaker: r.active_speaker,
      participantsCount: r.participants_count,
      createdAt: r.created_at
    }));
  }

  public static createSocialRoom(params: {
    title: string;
    topic: string;
    category: string;
    roomType?: 'lounge' | 'coworking' | 'watch_party' | 'discussion';
    hostId: string;
    maxParticipants?: number;
    tags?: string[];
  }): SocialActivityRoom {
    const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    const tags = params.tags || [];

    db.prepare(`
      INSERT INTO social_activity_rooms (
        id, title, topic, category, room_type, host_id, max_participants, tags_json, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      params.title,
      params.topic,
      params.category,
      params.roomType || 'lounge',
      params.hostId,
      params.maxParticipants || 12,
      JSON.stringify(tags),
      now
    );

    // Auto-join host as active speaker
    db.prepare(`
      INSERT INTO social_room_participants (
        room_id, user_id, joined_at, is_speaker, is_muted, is_hand_raised
      ) VALUES (?, ?, ?, 1, 0, 0)
    `).run(id, params.hostId, now);

    return {
      id,
      title: params.title,
      topic: params.topic,
      category: params.category,
      roomType: params.roomType || 'lounge',
      hostId: params.hostId,
      maxParticipants: params.maxParticipants || 12,
      tags,
      isActive: true,
      participantsCount: 1,
      createdAt: now
    };
  }

  public static joinRoom(roomId: string, userId: string): boolean {
    const now = Date.now();
    db.prepare(`
      INSERT OR REPLACE INTO social_room_participants (
        room_id, user_id, joined_at, is_speaker, is_muted, is_hand_raised
      ) VALUES (?, ?, ?, 0, 1, 0)
    `).run(roomId, userId, now);
    return true;
  }

  public static leaveRoom(roomId: string, userId: string): boolean {
    db.prepare('DELETE FROM social_room_participants WHERE room_id = ? AND user_id = ?')
      .run(roomId, userId);
    return true;
  }

  public static toggleHandRaise(roomId: string, userId: string, isRaised: boolean): boolean {
    db.prepare(`
      UPDATE social_room_participants 
      SET is_hand_raised = ? 
      WHERE room_id = ? AND user_id = ?
    `).run(isRaised ? 1 : 0, roomId, userId);
    return true;
  }

  // =========================================================================
  // 3. INVITATIONS & SOCIAL ACTIVITIES
  // =========================================================================

  public static sendInvitation(params: {
    inviterId: string;
    inviteeId: string;
    activityType: 'event' | 'watch_party' | 'room' | 'group_chat';
    activityId: string;
    title: string;
  }): SocialInvitation {
    const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO social_invitations (
        id, inviter_id, invitee_id, activity_type, activity_id, title, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      params.inviterId,
      params.inviteeId,
      params.activityType,
      params.activityId,
      params.title,
      now
    );

    return {
      id,
      inviterId: params.inviterId,
      inviteeId: params.inviteeId,
      activityType: params.activityType,
      activityId: params.activityId,
      title: params.title,
      status: 'pending',
      createdAt: now
    };
  }

  public static respondInvitation(invitationId: string, userId: string, response: 'accepted' | 'declined'): boolean {
    const res = db.prepare(`
      UPDATE social_invitations
      SET status = ?
      WHERE id = ? AND invitee_id = ?
    `).run(response, invitationId, userId);

    return res.changes > 0;
  }

  public static getUserInvitations(userId: string): SocialInvitation[] {
    const rows = db.prepare(`
      SELECT 
        id, inviter_id as inviterId, invitee_id as inviteeId,
        activity_type as activityType, activity_id as activityId,
        title, status, created_at as createdAt
      FROM social_invitations
      WHERE invitee_id = ?
      ORDER BY created_at DESC
    `).all(userId) as SocialInvitation[];

    return rows;
  }
}
