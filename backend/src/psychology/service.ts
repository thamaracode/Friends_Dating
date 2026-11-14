import { db } from '../db';
import { 
  PsychologyConcept, 
  ConceptualDomain, 
  FrameworkType, 
  UserPersonalityProfile, 
  ReflectionExercise, 
  UserReflectionResponse, 
  UserPerceptionFeedback, 
  UserTraitHistorySnapshot, 
  CompatibilityResonanceReport,
  CommunicationStyle,
  AttachmentAwareness
} from './types';
import { INITIAL_PSYCHOLOGY_CONCEPTS, INITIAL_REFLECTION_EXERCISES } from './seedData';

export class PsychologyService {
  
  // =========================================================================
  // 1. CONCEPT LEXICON
  // =========================================================================
  
  getAllConcepts(domain?: ConceptualDomain, frameworkType?: FrameworkType, search?: string): PsychologyConcept[] {
    let query = 'SELECT * FROM psychology_concepts WHERE 1=1';
    const params: any[] = [];

    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }
    if (frameworkType) {
      query += ' AND framework_type = ?';
      params.push(frameworkType);
    }
    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR definition LIKE ? OR practical_example LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY sort_order ASC, title ASC';
    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(r => ({
      id: r.id,
      domain: r.domain,
      framework_type: r.framework_type,
      title: r.title,
      scientific_name: r.scientific_name || undefined,
      definition: r.definition,
      practical_example: r.practical_example,
      related_concepts: r.related_concepts ? JSON.parse(r.related_concepts) : [],
      appropriate_context: r.appropriate_context,
      limitations_and_caveats: r.limitations_and_caveats,
      spectrum_low_label: r.spectrum_low_label || undefined,
      spectrum_high_label: r.spectrum_high_label || undefined,
      badge_color: r.badge_color || undefined,
      sort_order: r.sort_order,
      created_at: r.created_at
    }));
  }

  getConceptById(id: string): PsychologyConcept | null {
    const row = db.prepare('SELECT * FROM psychology_concepts WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      domain: row.domain,
      framework_type: row.framework_type,
      title: row.title,
      scientific_name: row.scientific_name || undefined,
      definition: row.definition,
      practical_example: row.practical_example,
      related_concepts: row.related_concepts ? JSON.parse(row.related_concepts) : [],
      appropriate_context: row.appropriate_context,
      limitations_and_caveats: row.limitations_and_caveats,
      spectrum_low_label: row.spectrum_low_label || undefined,
      spectrum_high_label: row.spectrum_high_label || undefined,
      badge_color: row.badge_color || undefined,
      sort_order: row.sort_order,
      created_at: row.created_at
    };
  }

  // =========================================================================
  // 2. USER PERSONALITY & EI PROFILE
  // =========================================================================

  getUserProfile(userId: string, viewerId: string = 'usr_me'): UserPersonalityProfile | null {
    const row = db.prepare('SELECT * FROM user_personality_profiles WHERE user_id = ?').get(userId) as any;
    if (!row) return null;

    const isOwner = viewerId === userId;
    const visibility = row.visibility || 'public';

    // Privacy gating
    if (!isOwner) {
      if (visibility === 'private') {
        return null;
      }
      // Note: friends_only / connections_only checks can be performed by caller or connection verify
    }

    return {
      user_id: row.user_id,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : {},
      selected_traits: row.selected_traits ? JSON.parse(row.selected_traits) : [],
      trait_explanations: row.trait_explanations ? JSON.parse(row.trait_explanations) : {},
      communication_style: row.communication_style || 'unspecified',
      communication_notes: row.communication_notes || '',
      listening_style: row.listening_style || 'unspecified',
      attachment_awareness: row.attachment_awareness || 'unspecified',
      attachment_notes: row.attachment_notes || '',
      core_values: row.core_values ? JSON.parse(row.core_values) : [],
      values_explanations: row.values_explanations ? JSON.parse(row.values_explanations) : {},
      emotional_boundaries: row.emotional_boundaries || '',
      conflict_style: row.conflict_style || '',
      visibility: row.visibility || 'public',
      updated_at: row.updated_at
    };
  }

  saveUserProfile(userId: string, data: Partial<UserPersonalityProfile>): UserPersonalityProfile {
    const now = Date.now();
    const existing = this.getUserProfile(userId, userId);

    const merged: UserPersonalityProfile = {
      user_id: userId,
      dimensions: data.dimensions !== undefined ? data.dimensions : (existing?.dimensions || {}),
      selected_traits: data.selected_traits !== undefined ? data.selected_traits : (existing?.selected_traits || []),
      trait_explanations: data.trait_explanations !== undefined ? data.trait_explanations : (existing?.trait_explanations || {}),
      communication_style: data.communication_style !== undefined ? data.communication_style : (existing?.communication_style || 'unspecified'),
      communication_notes: data.communication_notes !== undefined ? data.communication_notes : (existing?.communication_notes || ''),
      listening_style: data.listening_style !== undefined ? data.listening_style : (existing?.listening_style || 'unspecified'),
      attachment_awareness: data.attachment_awareness !== undefined ? data.attachment_awareness : (existing?.attachment_awareness || 'unspecified'),
      attachment_notes: data.attachment_notes !== undefined ? data.attachment_notes : (existing?.attachment_notes || ''),
      core_values: data.core_values !== undefined ? data.core_values : (existing?.core_values || []),
      values_explanations: data.values_explanations !== undefined ? data.values_explanations : (existing?.values_explanations || {}),
      emotional_boundaries: data.emotional_boundaries !== undefined ? data.emotional_boundaries : (existing?.emotional_boundaries || ''),
      conflict_style: data.conflict_style !== undefined ? data.conflict_style : (existing?.conflict_style || ''),
      visibility: data.visibility !== undefined ? data.visibility : (existing?.visibility || 'public'),
      updated_at: now
    };

    const stmt = db.prepare(`
      INSERT INTO user_personality_profiles (
        user_id, dimensions, selected_traits, trait_explanations,
        communication_style, communication_notes, listening_style,
        attachment_awareness, attachment_notes, core_values,
        values_explanations, emotional_boundaries, conflict_style,
        visibility, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        dimensions = excluded.dimensions,
        selected_traits = excluded.selected_traits,
        trait_explanations = excluded.trait_explanations,
        communication_style = excluded.communication_style,
        communication_notes = excluded.communication_notes,
        listening_style = excluded.listening_style,
        attachment_awareness = excluded.attachment_awareness,
        attachment_notes = excluded.attachment_notes,
        core_values = excluded.core_values,
        values_explanations = excluded.values_explanations,
        emotional_boundaries = excluded.emotional_boundaries,
        conflict_style = excluded.conflict_style,
        visibility = excluded.visibility,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      merged.user_id,
      JSON.stringify(merged.dimensions),
      JSON.stringify(merged.selected_traits),
      JSON.stringify(merged.trait_explanations),
      merged.communication_style,
      merged.communication_notes,
      merged.listening_style,
      merged.attachment_awareness,
      merged.attachment_notes,
      JSON.stringify(merged.core_values),
      JSON.stringify(merged.values_explanations),
      merged.emotional_boundaries,
      merged.conflict_style,
      merged.visibility,
      now
    );

    return merged;
  }

  // =========================================================================
  // 3. REFLECTION EXERCISES & RESPONSES
  // =========================================================================

  getAllExercises(domain?: ConceptualDomain): ReflectionExercise[] {
    let query = 'SELECT * FROM reflection_exercises WHERE 1=1';
    const params: any[] = [];
    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }
    query += ' ORDER BY sort_order ASC';

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(r => ({
      id: r.id,
      domain: r.domain,
      title: r.title,
      subtitle: r.subtitle,
      estimated_minutes: r.estimated_minutes,
      framework_type: r.framework_type,
      prompts: r.prompts_json ? JSON.parse(r.prompts_json) : [],
      ethical_disclaimer: r.ethical_disclaimer,
      sort_order: r.sort_order
    }));
  }

  getExerciseById(id: string): ReflectionExercise | null {
    const row = db.prepare('SELECT * FROM reflection_exercises WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      domain: row.domain,
      title: row.title,
      subtitle: row.subtitle,
      estimated_minutes: row.estimated_minutes,
      framework_type: row.framework_type,
      prompts: row.prompts_json ? JSON.parse(row.prompts_json) : [],
      ethical_disclaimer: row.ethical_disclaimer,
      sort_order: row.sort_order
    };
  }

  submitExerciseResponse(
    userId: string, 
    exerciseId: string, 
    answers: Record<string, any>, 
    personalTakeaway?: string,
    visibility: 'private' | 'friends_only' | 'public' = 'private'
  ): UserReflectionResponse {
    const now = Date.now();
    const id = `resp_${exerciseId}_${userId}`;

    db.prepare(`
      INSERT INTO user_reflection_responses (
        id, user_id, exercise_id, answers_json, personal_takeaway, visibility, completed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        answers_json = excluded.answers_json,
        personal_takeaway = excluded.personal_takeaway,
        visibility = excluded.visibility,
        updated_at = excluded.updated_at
    `).run(
      id,
      userId,
      exerciseId,
      JSON.stringify(answers),
      personalTakeaway || null,
      visibility,
      now,
      now
    );

    return {
      id,
      user_id: userId,
      exercise_id: exerciseId,
      answers,
      personal_takeaway: personalTakeaway,
      visibility,
      completed_at: now,
      updated_at: now
    };
  }

  getUserExerciseResponses(userId: string, viewerId: string = 'usr_me'): UserReflectionResponse[] {
    const isOwner = viewerId === userId;
    let query = 'SELECT * FROM user_reflection_responses WHERE user_id = ?';
    if (!isOwner) {
      query += " AND visibility != 'private'";
    }
    query += ' ORDER BY updated_at DESC';

    const rows = db.prepare(query).all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      exercise_id: r.exercise_id,
      answers: r.answers_json ? JSON.parse(r.answers_json) : {},
      personal_takeaway: r.personal_takeaway || undefined,
      visibility: r.visibility,
      completed_at: r.completed_at,
      updated_at: r.updated_at
    }));
  }

  // =========================================================================
  // 4. VOLUNTARY PERCEPTION FEEDBACK (PERCEPTION MIRROR)
  // =========================================================================

  submitPerceptionFeedback(
    authorUserId: string,
    targetUserId: string,
    payload: {
      strengths_observed: string[];
      communication_impression: string;
      values_witnessed: string[];
      warmth_resonance_rating?: number;
      constructive_perspective?: string;
      is_anonymous?: boolean;
    }
  ): UserPerceptionFeedback {
    const now = Date.now();
    const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO user_perception_feedback (
        id, target_user_id, author_user_id, strengths_observed,
        communication_impression, values_witnessed, warmth_resonance_rating,
        constructive_perspective, is_anonymous, visibility, is_approved_by_target, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      targetUserId,
      authorUserId,
      JSON.stringify(payload.strengths_observed || []),
      payload.communication_impression || '',
      JSON.stringify(payload.values_witnessed || []),
      payload.warmth_resonance_rating || 5,
      payload.constructive_perspective || null,
      payload.is_anonymous ? 1 : 0,
      'private_to_target',
      0,
      now
    );

    return {
      id,
      target_user_id: targetUserId,
      author_user_id: authorUserId,
      strengths_observed: payload.strengths_observed || [],
      communication_impression: payload.communication_impression || '',
      values_witnessed: payload.values_witnessed || [],
      warmth_resonance_rating: payload.warmth_resonance_rating || 5,
      constructive_perspective: payload.constructive_perspective,
      is_anonymous: !!payload.is_anonymous,
      visibility: 'private_to_target',
      is_approved_by_target: false,
      created_at: now
    };
  }

  getUserPerceptionFeedback(targetUserId: string, viewerId: string = 'usr_me'): UserPerceptionFeedback[] {
    const isTarget = viewerId === targetUserId;
    let query = `
      SELECT f.*, u.name as author_name, u.avatar_url as author_avatar
      FROM user_perception_feedback f
      LEFT JOIN users u ON f.author_user_id = u.id
      WHERE f.target_user_id = ?
    `;

    if (!isTarget) {
      query += " AND f.is_approved_by_target = 1 AND f.visibility = 'public_if_approved'";
    }
    query += ' ORDER BY f.created_at DESC';

    const rows = db.prepare(query).all(targetUserId) as any[];
    return rows.map(r => ({
      id: r.id,
      target_user_id: r.target_user_id,
      author_user_id: r.author_user_id,
      author_name: r.is_anonymous ? 'Anonymous Companion' : (r.author_name || 'Companion'),
      author_avatar: r.is_anonymous ? '' : r.author_avatar,
      strengths_observed: r.strengths_observed ? JSON.parse(r.strengths_observed) : [],
      communication_impression: r.communication_impression,
      values_witnessed: r.values_witnessed ? JSON.parse(r.values_witnessed) : [],
      warmth_resonance_rating: r.warmth_resonance_rating,
      constructive_perspective: r.constructive_perspective || undefined,
      is_anonymous: !!r.is_anonymous,
      visibility: r.visibility,
      is_approved_by_target: !!r.is_approved_by_target,
      created_at: r.created_at
    }));
  }

  // =========================================================================
  // 5. TRAIT EVOLUTION & HISTORY OVER TIME
  // =========================================================================

  recordTraitSnapshot(
    userId: string,
    snapshotLabel: string,
    growthReflections?: string
  ): UserTraitHistorySnapshot {
    const profile = this.getUserProfile(userId, userId);
    const now = Date.now();
    const id = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const dimensions = profile?.dimensions || {};
    const coreValues = profile?.core_values || [];

    db.prepare(`
      INSERT INTO user_trait_history (
        id, user_id, snapshot_label, dimensions_json, core_values_json, growth_reflections, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      snapshotLabel,
      JSON.stringify(dimensions),
      JSON.stringify(coreValues),
      growthReflections || null,
      now
    );

    return {
      id,
      user_id: userId,
      snapshot_label: snapshotLabel,
      dimensions,
      core_values: coreValues,
      growth_reflections: growthReflections,
      recorded_at: now
    };
  }

  getUserTraitHistory(userId: string, viewerId: string = 'usr_me'): UserTraitHistorySnapshot[] {
    const isOwner = viewerId === userId;
    if (!isOwner) {
      // Historical introspective timelines are private to the account owner
      return [];
    }

    const rows = db.prepare('SELECT * FROM user_trait_history WHERE user_id = ? ORDER BY recorded_at ASC').all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      snapshot_label: r.snapshot_label,
      dimensions: r.dimensions_json ? JSON.parse(r.dimensions_json) : {},
      core_values: r.core_values_json ? JSON.parse(r.core_values_json) : [],
      growth_reflections: r.growth_reflections || undefined,
      recorded_at: r.recorded_at
    }));
  }

  // =========================================================================
  // 6. EXPLAINABLE COMPATIBILITY & RESONANCE
  // =========================================================================

  calculateCompatibilityResonance(userAId: string, userBId: string): CompatibilityResonanceReport {
    const profileA = this.getUserProfile(userAId, userAId);
    const profileB = this.getUserProfile(userBId, userAId) || this.getUserProfile(userBId, userBId);

    const valuesA = new Set(profileA?.core_values || ['integrity', 'authenticity', 'curiosity']);
    const valuesB = new Set(profileB?.core_values || ['integrity', 'compassion', 'curiosity']);

    const overlappingValues: string[] = [];
    const userUnique: string[] = [];
    const partnerUnique: string[] = [];

    valuesA.forEach(v => {
      if (valuesB.has(v)) overlappingValues.push(v);
      else userUnique.push(v);
    });

    valuesB.forEach(v => {
      if (!valuesA.has(v)) partnerUnique.push(v);
    });

    const unionSize = new Set([...valuesA, ...valuesB]).size || 1;
    const valueAlignmentRatio = Math.round((overlappingValues.length / unionSize) * 100);

    // Dimension comparisons
    const dimsA = profileA?.dimensions || { introversion_extraversion: 40, openness: 80, conscientiousness: 70, agreeableness: 75, emotional_stability: 65 };
    const dimsB = profileB?.dimensions || { introversion_extraversion: 55, openness: 85, conscientiousness: 60, agreeableness: 80, emotional_stability: 70 };

    const dimensionalResonance: CompatibilityResonanceReport['dimensional_resonance'] = [];
    let totalDimScore = 0;
    let dimCount = 0;

    const dimensionKeys = [
      { key: 'introversion_extraversion', title: 'Social Energy & Recharging' },
      { key: 'openness', title: 'Intellectual & Aesthetic Curiosity' },
      { key: 'conscientiousness', title: 'Structure & Follow-Through' },
      { key: 'agreeableness', title: 'Empathy & Warmth' },
      { key: 'emotional_stability', title: 'Stress Equanimity & Coping' }
    ];

    dimensionKeys.forEach(dk => {
      const valA = dimsA[dk.key] !== undefined ? dimsA[dk.key] : 50;
      const valB = dimsB[dk.key] !== undefined ? dimsB[dk.key] : 50;
      const diff = Math.abs(valA - valB);

      let explanation = '';
      if (dk.key === 'introversion_extraversion') {
        if (diff < 20) explanation = 'Similar social battery pacing; comfortable sharing quiet evenings or lively outings together.';
        else explanation = 'Complementary social pacing: one partner brings conversational spark while the other provides grounded depth.';
      } else if (dk.key === 'openness') {
        if (diff < 20) explanation = 'Strong intellectual harmony; likely to enjoy deep discussions, book trades, and creative explorations.';
        else explanation = 'One partner brings novel perspectives while the other brings practical grounding.';
      } else if (dk.key === 'conscientiousness') {
        if (diff < 25) explanation = 'Harmonious domestic and organizational expectations; predictable coordination.';
        else explanation = 'May benefit from explicitly agreeing on chore schedules and planning routines.';
      } else {
        explanation = `Close alignment on ${dk.title.toLowerCase()} creates mutual emotional safety and ease.`;
      }

      // Calculate score for this dimension (higher harmony when closer, but diversity is also rewarded)
      const dimHarmony = Math.max(50, 100 - diff * 0.7);
      totalDimScore += dimHarmony;
      dimCount++;

      dimensionalResonance.push({
        dimension_key: dk.key,
        dimension_title: dk.title,
        user_val: valA,
        partner_val: valB,
        difference: diff,
        explanation
      });
    });

    const avgDimScore = dimCount > 0 ? Math.round(totalDimScore / dimCount) : 75;
    const overallScore = Math.min(98, Math.max(55, Math.round(valueAlignmentRatio * 0.45 + avgDimScore * 0.55)));

    const styleA: CommunicationStyle = profileA?.communication_style || 'direct';
    const styleB: CommunicationStyle = profileB?.communication_style || 'empathetic';

    let complementarityNotes = 'Both communicators bring thoughtful intentionality.';
    if ((styleA === 'direct' && styleB === 'empathetic') || (styleA === 'empathetic' && styleB === 'direct')) {
      complementarityNotes = 'High synergy: direct clarity meets compassionate listening, preventing both ambiguity and harshness.';
    } else if (styleA === styleB) {
      complementarityNotes = `Shared ${styleA} communication style creates effortless mutual comprehension and predictable rhythm.`;
    }

    const attachA: AttachmentAwareness = profileA?.attachment_awareness || 'secure_leaning';
    const attachB: AttachmentAwareness = profileB?.attachment_awareness || 'exploring_growth';

    return {
      overall_score: overallScore,
      shared_values: {
        overlapping: overlappingValues,
        user_unique: userUnique,
        partner_unique: partnerUnique,
        alignment_ratio: valueAlignmentRatio
      },
      communication_synergy: {
        user_style: styleA,
        partner_style: styleB,
        complementarity_notes: complementarityNotes,
        listening_harmony: 'Active validation paired with mutual curiosity creates a resilient container for honesty.'
      },
      attachment_dynamic: {
        user_attachment: attachA,
        partner_attachment: attachB,
        growth_opportunities: 'Practicing proportional self-disclosure and direct reassurance during moments of disconnect.',
        relational_safety_notes: 'Both partners prioritize emotional safety, making it easy to de-escalate friction through conscious dialogue.'
      },
      dimensional_resonance: dimensionalResonance,
      ethical_caveat: 'This resonance overview is an educational and reflective exploration of shared values and stated communication preferences. It is not an algorithmic verdict, psychological diagnosis, or guarantee of outcome.'
    };
  }
}

export const psychologyService = new PsychologyService();
