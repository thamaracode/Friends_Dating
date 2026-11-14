import type {
  PrmPerson,
  PrmInteraction,
  PrmMemory,
  PrmCommitment,
  PrmReminder,
  BeforeYouTalkBriefing,
  AiRelationshipInsights
} from './types';

export class AiRelationshipContextEngine {
  /**
   * Generates a "Before You Talk" instant briefing based entirely on recorded facts
   */
  public static generateBriefing(
    person: PrmPerson,
    interactions: PrmInteraction[],
    memories: PrmMemory[],
    commitments: PrmCommitment[],
    reminders: PrmReminder[]
  ): BeforeYouTalkBriefing {
    const now = Date.now();

    // 1. Last interaction analysis
    let daysSinceLastInteraction: number | null = null;
    let lastInteractionSummary: string | null = null;

    if (interactions.length > 0) {
      // Sort desc by timestamp
      const sorted = [...interactions].sort((a, b) => b.timestamp - a.timestamp);
      const latest = sorted[0];
      const diffMs = now - latest.timestamp;
      daysSinceLastInteraction = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      lastInteractionSummary = latest.notes || latest.title || 'Previous interaction recorded.';
    }

    // 2. Upcoming reminders (due within next 30 days or pending)
    const upcomingReminders = reminders
      .filter(r => r.status === 'pending')
      .slice(0, 5);

    // 3. Pending commitments
    const pendingCommitmentsMadeByMe = commitments
      .filter(c => (c.made_by === 'me' || c.made_by === 'mutual') && (c.status === 'pending' || c.status === 'in_progress'));

    const pendingCommitmentsMadeByThem = commitments
      .filter(c => (c.made_by === 'them' || c.made_by === 'mutual') && (c.status === 'pending' || c.status === 'in_progress'));

    // 4. Unresolved discussions
    const unresolvedDiscussions = memories
      .filter(m => m.is_unresolved || m.memory_type === 'unresolved_discussion');

    // 5. Things they appreciate
    const thingsTheyAppreciate = [
      ...person.things_they_love,
      ...(person.favourite_food ? [`Favorite food: ${person.favourite_food}`] : []),
      ...(person.love_language ? [`Love language: ${person.love_language}`] : [])
    ];

    // 6. Sensitive boundaries
    const sensitiveBoundariesToRespect = [
      ...person.boundaries,
      ...person.things_they_dislike
    ];

    return {
      person,
      daysSinceLastInteraction,
      lastInteractionSummary,
      upcomingReminders,
      pendingCommitmentsMadeByMe,
      pendingCommitmentsMadeByThem,
      unresolvedDiscussions,
      thingsTheyAppreciate,
      sensitiveBoundariesToRespect,
      generatedAt: now,
      provenance: 'user_recorded_facts'
    };
  }

  /**
   * Generates AI-assisted conversation starters, pattern observations, and draft messages
   * strictly grounded in user-recorded context.
   */
  public static generateAiInsights(
    person: PrmPerson,
    interactions: PrmInteraction[],
    memories: PrmMemory[],
    commitments: PrmCommitment[]
  ): AiRelationshipInsights {
    const conversationStarters: Array<{ starter: string; rationale: string; topics: string[] }> = [];

    // Starter 1: Follow up on unresolved discussion if any
    const unresolved = memories.find(m => m.is_unresolved || m.memory_type === 'unresolved_discussion');
    if (unresolved) {
      conversationStarters.push({
        starter: `I was reflecting on what you mentioned earlier regarding "${unresolved.title || unresolved.content.slice(0, 45)}...". How are you feeling about that now?`,
        rationale: 'Follows up on an open, unresolved discussion without being pushy.',
        topics: unresolved.tags.length > 0 ? unresolved.tags : ['Reflection', 'Check-in']
      });
    }

    // Starter 2: Shared interest hook
    if (person.shared_interests && person.shared_interests.length > 0) {
      const interest = person.shared_interests[0];
      conversationStarters.push({
        starter: `Saw something recently that reminded me of your interest in ${interest}. How has that been going lately?`,
        rationale: `Connects naturally through shared enthusiasm for ${interest}.`,
        topics: [interest]
      });
    }

    // Starter 3: Fulfill pending promise or check in on a commitment
    const myPromise = commitments.find(c => c.made_by === 'me' && c.status === 'pending');
    if (myPromise) {
      conversationStarters.push({
        starter: `Wanted to check in about "${myPromise.title}"—making sure we are still on track for that.`,
        rationale: 'Demonstrates personal accountability and integrity.',
        topics: ['Commitment', 'Follow-through']
      });
    } else {
      conversationStarters.push({
        starter: `Hey ${person.nickname || person.name}, had a quiet moment today and wanted to see how your week is treating you. No need to reply right away.`,
        rationale: 'Gentle, pressure-free outreach respecting asynchronous communication needs.',
        topics: ['Care', 'Low-pressure']
      });
    }

    // Pattern Analysis
    const totalInteractions = interactions.length;
    let cadenceSummary = 'Initial connection tracking phase.';
    if (totalInteractions >= 5) {
      cadenceSummary = 'Healthy, established interaction rhythm with regular touchpoints.';
    } else if (totalInteractions > 0) {
      cadenceSummary = 'Emerging communication history; pacing is developing.';
    }

    const pendingPromisesCount = commitments.filter(c => c.status === 'pending').length;
    const unresolvedCount = memories.filter(m => m.is_unresolved).length;

    let healthNotes = 'Balanced interpersonal context.';
    if (unresolvedCount > 2) {
      healthNotes = 'Multiple unresolved discussions recorded. Consider scheduling dedicated, distraction-free time to listen.';
    } else if (pendingPromisesCount > 3) {
      healthNotes = 'Several commitments are currently pending. Review open promises to prevent unintentional drift.';
    }

    // Message Draft Suggestions
    const draftMessageSuggestions = [
      {
        tone: 'Warm & Asynchronous',
        subject: 'Thinking of you',
        body: `Hey ${person.nickname || person.name}, hope you are having an unhurried day. Just wanted to send some warmth your way and let you know I appreciate our connection. Catch up whenever your schedule clears.`
      },
      {
        tone: 'Thoughtful Follow-up',
        subject: 'Quick check-in',
        body: `Hey ${person.nickname || person.name}, was thinking about our last conversation and wanted to see how you're feeling. Let me know if you ever want to grab coffee or take an evening walk.`
      }
    ];

    return {
      personId: person.id,
      conversationStarters: conversationStarters.slice(0, 3),
      communicationPatternObservations: {
        cadenceSummary,
        observedBalance: 'Reciprocal notes and updates',
        unresolvedCount,
        healthNotes
      },
      draftMessageSuggestions,
      provenance: 'ai_assisted',
      disclaimer: 'Every AI-generated observation is an analytical suggestion derived from user-recorded context. It is not an objective fact or a clinical diagnosis.'
    };
  }
}
