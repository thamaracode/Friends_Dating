import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import {
  SoulPrompt,
  SoulPromptResponse,
  SoulPromptCategory,
  ResponseVisibility,
  MoodTag,
  ResonanceType,
  CompatibilityInsight
} from './types';

export class SoulPromptsService {
  /**
   * Initializes SQLite tables for Soul Prompts & Resonance Journal.
   */
  public static initTables(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS soul_prompts (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        prompt_question TEXT NOT NULL,
        philosophical_context TEXT,
        dimension_tag TEXT NOT NULL,
        display_date TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS soul_prompt_responses (
        id TEXT PRIMARY KEY,
        prompt_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        response_text TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK(visibility IN ('private', 'profile_pinned', 'community_anonymous', 'community_public')),
        author_alias TEXT,
        mood_tag TEXT NOT NULL DEFAULT 'reflective',
        reaction_felt_deeply INTEGER DEFAULT 0,
        reaction_mind_shifted INTEGER DEFAULT 0,
        reaction_inspired INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(prompt_id, user_id),
        FOREIGN KEY (prompt_id) REFERENCES soul_prompts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS soul_prompt_resonances (
        id TEXT PRIMARY KEY,
        response_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reaction_type TEXT NOT NULL CHECK(reaction_type IN ('felt_deeply', 'mind_shifted', 'inspired')),
        created_at INTEGER NOT NULL,
        UNIQUE(response_id, user_id, reaction_type),
        FOREIGN KEY (response_id) REFERENCES soul_prompt_responses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    this.seedCuratedPrompts();
  }

  /**
   * Seeds foundational, introspective relationship & intimacy prompts.
   */
  private static seedCuratedPrompts(): void {
    const count = (db.prepare('SELECT COUNT(*) as c FROM soul_prompts').get() as { c: number }).c;
    if (count > 0) return;

    const curated: Array<{
      id: string;
      category: SoulPromptCategory;
      question: string;
      context: string;
      dimensionTag: string;
      displayDate?: string;
    }> = [
      {
        id: 'sp_unspoken_expectations',
        category: 'unspoken_truths',
        question: 'What is an unspoken expectation you used to bring into relationships that you have since outgrown?',
        context: 'We often expect partners to read our minds without realizing we are asking them to heal wounds they never created.',
        dimensionTag: '#EmotionalSafety',
        displayDate: '2026-11-14'
      },
      {
        id: 'sp_feeling_seen',
        category: 'vulnerability',
        question: 'What makes you feel truly seen and understood by someone, rather than just observed?',
        context: 'Superficial attention is cheap; feeling deeply witnessed in your quietest insecurities is where real intimacy begins.',
        dimensionTag: '#VulnerableTruth',
        displayDate: '2026-11-15'
      },
      {
        id: 'sp_hard_boundary',
        category: 'boundaries',
        question: 'What is a personal boundary you had to learn the hard way through heartbreak or burnout?',
        context: 'Boundaries are the distance at which you can love both yourself and someone else simultaneously.',
        dimensionTag: '#BoundaryClarity',
        displayDate: '2026-11-16'
      },
      {
        id: 'sp_reassurance_need',
        category: 'emotional_safety',
        question: 'When you are feeling disconnected or anxious, what form of reassurance actually helps you ground yourself?',
        context: 'Some people need verbal certainty, others need quiet physical presence or intentional uninterrupted time.',
        dimensionTag: '#AttachmentStyle',
        displayDate: '2026-11-17'
      },
      {
        id: 'sp_solitude_and_love',
        category: 'intimacy_growth',
        question: 'How do you balance your craving for deep closeness with your need for solitude and independent thought?',
        context: 'The healthiest relationships are two whole individuals choosing to stand together, not two halves clinging to survive.',
        dimensionTag: '#IntentionalAutonomy',
        displayDate: '2026-11-18'
      },
      {
        id: 'sp_friendship_foundation',
        category: 'friendship',
        question: 'If romantic attraction fades for a season, what remains in your friendship that makes staying together worthwhile?',
        context: 'Long-lasting intimacy requires genuine affection, shared curiosity, mutual respect, and laughter when life is mundane.',
        dimensionTag: '#DeepFriendship',
        displayDate: '2026-11-19'
      }
    ];

    const insert = db.prepare(`
      INSERT INTO soul_prompts (id, category, prompt_question, philosophical_context, dimension_tag, display_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    for (const p of curated) {
      insert.run(p.id, p.category, p.question, p.context, p.dimensionTag, p.displayDate, now);
    }
  }

  /**
   * Retrieves today's featured prompt with viewer status.
   */
  public static getTodayPrompt(userId: string): {
    prompt: SoulPrompt;
    myResponse: SoulPromptResponse | null;
    totalResponsesCount: number;
  } {
    const todayStr = new Date().toISOString().split('T')[0];
    let row = db.prepare('SELECT * FROM soul_prompts WHERE display_date = ?').get(todayStr) as any;

    if (!row) {
      row = db.prepare('SELECT * FROM soul_prompts ORDER BY created_at ASC LIMIT 1').get() as any;
    }

    if (!row) {
      throw new Error('No soul prompts found in repository');
    }

    const prompt: SoulPrompt = {
      id: row.id,
      category: row.category as SoulPromptCategory,
      promptQuestion: row.prompt_question,
      philosophicalContext: row.philosophical_context,
      dimensionTag: row.dimension_tag,
      displayDate: row.display_date,
      createdAt: row.created_at
    };

    // Viewer's own response (if already answered)
    let myResponse: SoulPromptResponse | null = null;
    const respRow = db.prepare('SELECT * FROM soul_prompt_responses WHERE prompt_id = ? AND user_id = ?').get(prompt.id, userId) as any;

    if (respRow) {
      const userResonances = db.prepare(`
        SELECT reaction_type FROM soul_prompt_resonances WHERE response_id = ? AND user_id = ?
      `).all(respRow.id, userId) as { reaction_type: ResonanceType }[];

      myResponse = {
        id: respRow.id,
        promptId: respRow.prompt_id,
        userId: respRow.user_id,
        responseText: respRow.response_text,
        visibility: respRow.visibility as ResponseVisibility,
        authorAlias: respRow.author_alias || undefined,
        moodTag: respRow.mood_tag as MoodTag,
        reactionFeltDeeply: respRow.reaction_felt_deeply || 0,
        reactionMindShifted: respRow.reaction_mind_shifted || 0,
        reactionInspired: respRow.reaction_inspired || 0,
        userResonances: userResonances.map(r => r.reaction_type),
        isOwner: true,
        createdAt: respRow.created_at,
        updatedAt: respRow.updated_at
      };
    }

    const totalCount = (db.prepare(`
      SELECT COUNT(*) as c FROM soul_prompt_responses 
      WHERE prompt_id = ? AND visibility IN ('community_anonymous', 'community_public', 'profile_pinned')
    `).get(prompt.id) as { c: number }).c;

    return {
      prompt,
      myResponse,
      totalResponsesCount: totalCount
    };
  }

  /**
   * Retrieves all soul prompts in the library.
   */
  public static getAllPrompts(): SoulPrompt[] {
    const rows = db.prepare('SELECT * FROM soul_prompts ORDER BY created_at ASC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      category: r.category as SoulPromptCategory,
      promptQuestion: r.prompt_question,
      philosophicalContext: r.philosophical_context,
      dimensionTag: r.dimension_tag,
      displayDate: r.display_date,
      createdAt: r.created_at
    }));
  }

  /**
   * Saves or updates a user response to a soul prompt.
   */
  public static respondToPrompt(
    promptId: string,
    userId: string,
    payload: {
      responseText: string;
      visibility?: ResponseVisibility;
      moodTag?: MoodTag;
      customAlias?: string;
    }
  ): SoulPromptResponse {
    const { responseText, visibility = 'community_anonymous', moodTag = 'reflective', customAlias } = payload;

    if (!responseText || typeof responseText !== 'string' || responseText.trim().length < 5) {
      throw new Error('Response must be at least 5 characters');
    }

    const prompt = db.prepare('SELECT id FROM soul_prompts WHERE id = ?').get(promptId);
    if (!prompt) {
      throw new Error('Soul prompt not found');
    }

    const now = Date.now();
    const existing = db.prepare('SELECT id FROM soul_prompt_responses WHERE prompt_id = ? AND user_id = ?').get(promptId, userId) as any;

    let responseId = existing ? existing.id : `spr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    if (existing) {
      db.prepare(`
        UPDATE soul_prompt_responses SET
          response_text = ?,
          visibility = ?,
          author_alias = ?,
          mood_tag = ?,
          updated_at = ?
        WHERE id = ?
      `).run(responseText.trim(), visibility, customAlias || null, moodTag, now, responseId);
    } else {
      db.prepare(`
        INSERT INTO soul_prompt_responses (
          id, prompt_id, user_id, response_text, visibility, author_alias, mood_tag, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(responseId, promptId, userId, responseText.trim(), visibility, customAlias || null, moodTag, now, now);
    }

    const updated = db.prepare('SELECT * FROM soul_prompt_responses WHERE id = ?').get(responseId) as any;
    const author = db.prepare('SELECT name, avatar_url FROM users WHERE id = ?').get(userId) as any;

    return {
      id: updated.id,
      promptId: updated.prompt_id,
      userId: updated.user_id,
      responseText: updated.response_text,
      visibility: updated.visibility as ResponseVisibility,
      authorAlias: updated.author_alias || undefined,
      authorName: (visibility === 'community_public' || visibility === 'profile_pinned') ? author?.name : undefined,
      authorAvatar: (visibility === 'community_public' || visibility === 'profile_pinned') ? author?.avatar_url : undefined,
      moodTag: updated.mood_tag as MoodTag,
      reactionFeltDeeply: updated.reaction_felt_deeply || 0,
      reactionMindShifted: updated.reaction_mind_shifted || 0,
      reactionInspired: updated.reaction_inspired || 0,
      userResonances: [],
      isOwner: true,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };
  }

  /**
   * Retrieves community responses for a soul prompt with privacy preservation.
   */
  public static getCommunityResponses(
    promptId: string,
    currentUserId: string,
    limit: number = 50
  ): SoulPromptResponse[] {
    const rows = db.prepare(`
      SELECT spr.*, u.name as author_name, u.avatar_url as author_avatar
      FROM soul_prompt_responses spr
      LEFT JOIN users u ON spr.user_id = u.id
      WHERE spr.prompt_id = ? 
        AND spr.visibility IN ('community_anonymous', 'community_public', 'profile_pinned')
      ORDER BY (spr.reaction_felt_deeply + spr.reaction_mind_shifted + spr.reaction_inspired) DESC, spr.created_at DESC
      LIMIT ?
    `).all(promptId, limit) as any[];

    // Current viewer's resonances across responses
    const userResonances = db.prepare(`
      SELECT response_id, reaction_type FROM soul_prompt_resonances WHERE user_id = ?
    `).all(currentUserId) as { response_id: string; reaction_type: ResonanceType }[];

    const resonancesMap = new Map<string, ResonanceType[]>();
    for (const r of userResonances) {
      if (!resonancesMap.has(r.response_id)) resonancesMap.set(r.response_id, []);
      resonancesMap.get(r.response_id)!.push(r.reaction_type);
    }

    return rows.map(r => {
      const isOwner = r.user_id === currentUserId;
      const isAnon = r.visibility === 'community_anonymous';

      return {
        id: r.id,
        promptId: r.prompt_id,
        userId: isOwner ? r.user_id : (isAnon ? 'anon' : r.user_id),
        responseText: r.response_text,
        visibility: r.visibility as ResponseVisibility,
        authorAlias: isAnon ? (r.author_alias || 'Kindred Spirit') : undefined,
        authorName: isAnon ? undefined : r.author_name,
        authorAvatar: isAnon ? undefined : r.author_avatar,
        moodTag: r.mood_tag as MoodTag,
        reactionFeltDeeply: r.reaction_felt_deeply || 0,
        reactionMindShifted: r.reaction_mind_shifted || 0,
        reactionInspired: r.reaction_inspired || 0,
        userResonances: resonancesMap.get(r.id) || [],
        isOwner,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    });
  }

  /**
   * Submits or toggles an empathy resonance on a community response.
   */
  public static submitResonance(
    responseId: string,
    userId: string,
    resonanceType: ResonanceType
  ): {
    success: boolean;
    active: boolean;
    reactionFeltDeeply: number;
    reactionMindShifted: number;
    reactionInspired: number;
  } {
    const existing = db.prepare(`
      SELECT id FROM soul_prompt_resonances 
      WHERE response_id = ? AND user_id = ? AND reaction_type = ?
    `).get(responseId, userId, resonanceType) as any;

    const columnMap: Record<ResonanceType, string> = {
      felt_deeply: 'reaction_felt_deeply',
      mind_shifted: 'reaction_mind_shifted',
      inspired: 'reaction_inspired'
    };
    const colName = columnMap[resonanceType];

    let active = false;

    db.transaction(() => {
      if (existing) {
        db.prepare('DELETE FROM soul_prompt_resonances WHERE id = ?').run(existing.id);
        db.prepare(`UPDATE soul_prompt_responses SET ${colName} = MAX(0, ${colName} - 1) WHERE id = ?`).run(responseId);
        active = false;
      } else {
        const id = `res_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
        db.prepare(`
          INSERT INTO soul_prompt_resonances (id, response_id, user_id, reaction_type, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, responseId, userId, resonanceType, Date.now());
        db.prepare(`UPDATE soul_prompt_responses SET ${colName} = ${colName} + 1 WHERE id = ?`).run(responseId);
        active = true;
      }
    })();

    const counts = db.prepare(`
      SELECT reaction_felt_deeply, reaction_mind_shifted, reaction_inspired
      FROM soul_prompt_responses WHERE id = ?
    `).get(responseId) as any;

    return {
      success: true,
      active,
      reactionFeltDeeply: counts?.reaction_felt_deeply || 0,
      reactionMindShifted: counts?.reaction_mind_shifted || 0,
      reactionInspired: counts?.reaction_inspired || 0
    };
  }

  /**
   * Returns the user's personal soul journal (all past reflections).
   */
  public static getUserJournal(userId: string): {
    totalEntries: number;
    moodStats: Record<string, number>;
    entries: Array<{
      response: SoulPromptResponse;
      prompt: SoulPrompt;
    }>;
  } {
    const rows = db.prepare(`
      SELECT 
        spr.*, 
        sp.category as p_category, sp.prompt_question as p_question,
        sp.philosophical_context as p_context, sp.dimension_tag as p_tag,
        sp.display_date as p_date, sp.created_at as p_created_at
      FROM soul_prompt_responses spr
      JOIN soul_prompts sp ON spr.prompt_id = sp.id
      WHERE spr.user_id = ?
      ORDER BY spr.created_at DESC
    `).all(userId) as any[];

    const moodStats: Record<string, number> = {};
    const entries = rows.map(r => {
      moodStats[r.mood_tag] = (moodStats[r.mood_tag] || 0) + 1;

      const prompt: SoulPrompt = {
        id: r.prompt_id,
        category: r.p_category as SoulPromptCategory,
        promptQuestion: r.p_question,
        philosophicalContext: r.p_context,
        dimensionTag: r.p_tag,
        displayDate: r.p_date,
        createdAt: r.p_created_at
      };

      const response: SoulPromptResponse = {
        id: r.id,
        promptId: r.prompt_id,
        userId: r.user_id,
        responseText: r.response_text,
        visibility: r.visibility as ResponseVisibility,
        authorAlias: r.author_alias || undefined,
        moodTag: r.mood_tag as MoodTag,
        reactionFeltDeeply: r.reaction_felt_deeply || 0,
        reactionMindShifted: r.reaction_mind_shifted || 0,
        reactionInspired: r.reaction_inspired || 0,
        userResonances: [],
        isOwner: true,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };

      return { response, prompt };
    });

    return {
      totalEntries: entries.length,
      moodStats,
      entries
    };
  }

  /**
   * Calculates emotional & philosophical compatibility between two users.
   */
  public static computeCompatibility(userIdA: string, userIdB: string): CompatibilityInsight {
    const target = db.prepare('SELECT id, name, avatar_url FROM users WHERE id = ?').get(userIdB) as any;
    if (!target) {
      throw new Error('Target user not found');
    }

    // Prompts answered by user A
    const aResponses = db.prepare(`
      SELECT spr.prompt_id, sp.dimension_tag, sp.category
      FROM soul_prompt_responses spr
      JOIN soul_prompts sp ON spr.prompt_id = sp.id
      WHERE spr.user_id = ?
    `).all(userIdA) as { prompt_id: string; dimension_tag: string; category: string }[];

    // Prompts answered by user B
    const bResponses = db.prepare(`
      SELECT spr.prompt_id, sp.dimension_tag, sp.category
      FROM soul_prompt_responses spr
      JOIN soul_prompts sp ON spr.prompt_id = sp.id
      WHERE spr.user_id = ? AND spr.visibility != 'private'
    `).all(userIdB) as { prompt_id: string; dimension_tag: string; category: string }[];

    const aPromptIds = new Set(aResponses.map(r => r.prompt_id));
    const sharedPromptCount = bResponses.filter(r => aPromptIds.has(r.prompt_id)).length;

    const aTags = new Set(aResponses.map(r => r.dimension_tag));
    const bTags = new Set(bResponses.map(r => r.dimension_tag));
    const sharedDimensions = Array.from(aTags).filter(t => bTags.has(t));

    // Calculate score
    let baseScore = 70; // Baseline human potential
    baseScore += sharedDimensions.length * 7;
    baseScore += sharedPromptCount * 5;
    const finalScore = Math.min(98, Math.max(65, baseScore));

    const synergyInsights: string[] = [];
    if (sharedDimensions.includes('#EmotionalSafety')) {
      synergyInsights.push('Both of you prioritize emotional safety and open communication during difficult moments.');
    }
    if (sharedDimensions.includes('#BoundaryClarity')) {
      synergyInsights.push('Both of you value intentional boundaries and emotional self-respect in relationships.');
    }
    if (sharedDimensions.includes('#VulnerableTruth')) {
      synergyInsights.push('You share a desire to be deeply understood rather than admired for superficial traits.');
    }
    if (sharedDimensions.includes('#IntentionalAutonomy')) {
      synergyInsights.push('Both of you appreciate quiet personal time and give partners space to breathe.');
    }
    if (synergyInsights.length === 0) {
      synergyInsights.push('You both share a reflective mindset and intentional approach to meeting new people.');
    }

    const recommendedIcebreakers: string[] = [
      `I really resonated with how you answered the prompt on ${sharedDimensions[0] || 'relationships'}.`,
      `Would love to hear more about your perspective on emotional safety in love.`,
      `Saw your reflection on personal boundaries—how did you arrive at that conclusion?`
    ];

    return {
      targetUserId: target.id,
      targetName: target.name,
      targetAvatar: target.avatar_url,
      compatibilityScore: finalScore,
      sharedDimensions: sharedDimensions.length > 0 ? sharedDimensions : ['#ReflectiveConnection', '#IntentionalLiving'],
      synergyInsights,
      sharedPromptResponsesCount: sharedPromptCount,
      recommendedIcebreakers
    };
  }

  /**
   * Generates a context-rich conversation starter referencing a soul prompt response.
   */
  public static createPromptIcebreaker(
    responseId: string,
    senderId: string
  ): {
    conversationId: string;
    icebreakerMessage: string;
    partnerName: string;
  } {
    const resp = db.prepare(`
      SELECT spr.*, sp.prompt_question, u.id as author_id, u.name as author_name
      FROM soul_prompt_responses spr
      JOIN soul_prompts sp ON spr.prompt_id = sp.id
      JOIN users u ON spr.user_id = u.id
      WHERE spr.id = ?
    `).get(responseId) as any;

    if (!resp) {
      throw new Error('Soul prompt response not found');
    }

    if (resp.author_id === senderId) {
      throw new Error('Cannot send icebreaker to your own response');
    }

    // Find or create direct conversation between sender and author
    const partnerId = resp.author_id;
    let conv = db.prepare(`
      SELECT c.id FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?
      WHERE c.type = 'direct'
      LIMIT 1
    `).get(senderId, partnerId) as { id: string } | undefined;

    let convId = conv ? conv.id : '';
    const now = Date.now();

    if (!convId) {
      convId = `conv_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
      db.transaction(() => {
        db.prepare(`
          INSERT INTO conversations (id, type, created_at, updated_at)
          VALUES (?, 'direct', ?, ?)
        `).run(convId, now, now);

        db.prepare(`
          INSERT INTO conversation_members (conversation_id, user_id, joined_at)
          VALUES (?, ?, ?), (?, ?, ?)
        `).run(convId, senderId, now, convId, partnerId, now);
      })();
    }

    // Insert contextual icebreaker message
    const snippet = resp.response_text.length > 80 ? `${resp.response_text.slice(0, 77)}...` : resp.response_text;
    const icebreakerText = `✨ Connected over today's prompt: "${resp.prompt_question}"\n\nI really resonated with your reflection: "${snippet}"`;

    const messageId = `msg_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    db.prepare(`
      INSERT INTO messages (
        id, conversation_id, sender_id, client_message_id, sequence_number,
        message_type, text_content, created_at
      ) VALUES (?, ?, ?, ?, 1, 'text', ?, ?)
    `).run(messageId, convId, senderId, `cli_ice_${Date.now()}`, icebreakerText, now);

    db.prepare('UPDATE conversations SET last_message_id = ?, updated_at = ? WHERE id = ?').run(messageId, now, convId);

    return {
      conversationId: convId,
      icebreakerMessage: icebreakerText,
      partnerName: resp.author_name
    };
  }
}
