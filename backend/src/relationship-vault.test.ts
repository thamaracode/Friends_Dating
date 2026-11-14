import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { RelationshipVaultService } from './relationship-vault/service';

const BASE_URL = 'http://127.0.0.1:3001/api/v1/vault';

describe('Master Prompt 05: Relationship Management, Personal Memory and Interpersonal Context Engine Test Suite', () => {
  beforeAll(() => {
    RelationshipVaultService.initTables();
    RelationshipVaultService.seedVaultData();
  });

  // 1. Metadata & Non-Linear Lifecycles
  describe('1. Relational Metadata & Non-Linear Lifecycles', () => {
    it('provides all 13 relationship lifecycle phases with metadata and badges', async () => {
      const res = await fetch(`${BASE_URL}/metadata`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const phases = Object.keys(data.lifecyclePhases);
      expect(phases).toContain('new_acquaintance');
      expect(phases).toContain('getting_to_know');
      expect(phases).toContain('friendship_development');
      expect(phases).toContain('romantic_interest');
      expect(phases).toContain('dating');
      expect(phases).toContain('committed_relationship');
      expect(phases).toContain('long_distance');
      expect(phases).toContain('professional');
      expect(phases).toContain('family');
      expect(phases).toContain('on_pause');
      expect(phases).toContain('ended');
      expect(phases).toContain('archived');
      expect(phases).toContain('custom');

      for (const phase of Object.values(data.lifecyclePhases) as any[]) {
        expect(phase.label).toBeDefined();
        expect(phase.description.length).toBeGreaterThan(10);
        expect(phase.badgeColor).toBeDefined();
      }
    });

    it('creates a person and supports non-linear lifecycle transitions without forced sequence', async () => {
      // 1. Create with 'new_acquaintance'
      const createRes = await fetch(`${BASE_URL}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          name: 'Maya Lin',
          nickname: 'Maya',
          relationship_category: 'romantic',
          relationship_status: 'new_acquaintance',
          significance_level: 4,
          favourite_food: 'Ramen with extra bamboo shoots',
          boundaries: ['No calling during work meetings', 'Values slow text replies']
        })
      });
      const created = await createRes.json();
      expect(created.success).toBe(true);
      const personId = created.person.id;
      expect(created.person.relationship_status).toBe('new_acquaintance');

      // 2. Transition directly to 'dating'
      const update1 = await fetch(`${BASE_URL}/persons/${personId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({ relationship_status: 'dating' })
      });
      const data1 = await update1.json();
      expect(data1.person.relationship_status).toBe('dating');

      // 3. Non-linear jump to 'on_pause'
      const update2 = await fetch(`${BASE_URL}/persons/${personId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          relationship_status: 'on_pause',
          custom_status_label: 'Taking intentional space for 2 weeks'
        })
      });
      const data2 = await update2.json();
      expect(data2.person.relationship_status).toBe('on_pause');
      expect(data2.person.custom_status_label).toBe('Taking intentional space for 2 weeks');

      // Clean up test person
      await fetch(`${BASE_URL}/persons/${personId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'usr_me' }
      });
    });
  });

  // 2. Personal Memory & Quotes Recording
  describe('2. Personal Memory, Quotes & Unresolved Discussions', () => {
    it('records important things someone said, reflections, and unresolved discussions', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];
      expect(person).toBeDefined();

      // Add a quote memory
      const quoteRes = await fetch(`${BASE_URL}/persons/${person.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          memory_type: 'quote',
          title: 'Perspective on Solitude',
          content: 'I do not want to be saved from solitude; I want to be accompanied within it.',
          emotional_significance: 5,
          tags: ['Solitude', 'Vulnerability', 'Philosophy']
        })
      });
      const quoteData = await quoteRes.json();
      expect(quoteData.success).toBe(true);
      expect(quoteData.memory.memory_type).toBe('quote');

      // Add an unresolved discussion
      const unresolvedRes = await fetch(`${BASE_URL}/persons/${person.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          memory_type: 'unresolved_discussion',
          title: 'Misunderstanding about weekend plans',
          content: 'Felt some tension around last-minute schedule changes. Need to revisit gently with validation.',
          emotional_significance: 4,
          is_unresolved: true,
          tags: ['Communication', 'Pacing']
        })
      });
      const unresolvedData = await unresolvedRes.json();
      expect(unresolvedData.success).toBe(true);
      expect(unresolvedData.memory.is_unresolved).toBe(true);
      const memoryId = unresolvedData.memory.id;

      // Update / Resolve discussion
      const resolveRes = await fetch(`${BASE_URL}/memories/${memoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({ is_unresolved: false })
      });
      const resolveData = await resolveRes.json();
      expect(resolveData.success).toBe(true);
      expect(resolveData.memory.is_unresolved).toBe(false);
    });
  });

  // 3. Interaction Timeline Logging
  describe('3. Interaction Timeline Logging with Past Timestamps', () => {
    it('logs interaction with custom timestamp, attachments, and updates last_interacted_at', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];
      const pastTime = Date.now() - (86400000 * 5); // 5 days ago

      const res = await fetch(`${BASE_URL}/persons/${person.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          timestamp: pastTime,
          interaction_type: 'voice_call',
          title: 'Late Night Audio Check-in',
          notes: 'Talked for 45 minutes about her childhood memories and quiet hobbies.',
          emotional_tone: 'comforting',
          attachments: [{ type: 'photo', url: 'https://images.unsplash.com/photo-1518709268805?w=400', label: 'Tea shop photo' }],
          follow_up_actions: ['Send her that article on acoustic architecture']
        })
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.interaction.interaction_type).toBe('voice_call');
      expect(data.interaction.timestamp).toBe(pastTime);
      expect(data.interaction.attachments).toHaveLength(1);

      // Verify interaction appears in timeline query
      const listRes = await fetch(`${BASE_URL}/persons/${person.id}/interactions`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const listData = await listRes.json();
      expect(listData.interactions.length).toBeGreaterThan(0);
    });
  });

  // 4. Commitments & Promises Tracker
  describe('4. Commitments & Promises Tracker', () => {
    it('tracks commitments made by me vs them and transitions status to fulfilled', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      // Add commitment made by me
      const res = await fetch(`${BASE_URL}/persons/${person.id}/commitments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          made_by: 'me',
          title: 'Drop off her favorite matcha tea tin',
          description: 'Authentic Kyoto ceremonial grade matcha.',
          due_date: 'This Thursday',
          notes: 'Leave on porch if she is in studio'
        })
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.commitment.status).toBe('pending');
      const commitmentId = data.commitment.id;

      // Update to fulfilled
      const updateRes = await fetch(`${BASE_URL}/commitments/${commitmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          status: 'fulfilled',
          notes: 'Dropped off with a warm sticky note!'
        })
      });
      const updateData = await updateRes.json();
      expect(updateData.success).toBe(true);
      expect(updateData.commitment.status).toBe('fulfilled');
      expect(updateData.commitment.fulfilled_at).toBeGreaterThan(0);
    });
  });

  // 5. Reminders & Calendar Alerts
  describe('5. Reminders & Alerts', () => {
    it('adds and updates reminders with categories and advance timings', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      const res = await fetch(`${BASE_URL}/persons/${person.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({
          title: 'Special Anniversary Dinner',
          category: 'anniversary',
          due_date: 'October 14',
          reminder_timing: '1_week_before',
          notes: 'Reserve quiet corner table with garden view.'
        })
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.reminder.category).toBe('anniversary');
      const reminderId = data.reminder.id;

      // Complete reminder
      const updateRes = await fetch(`${BASE_URL}/reminders/${reminderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({ status: 'completed' })
      });
      const updateData = await updateRes.json();
      expect(updateData.success).toBe(true);
    });
  });

  // 6. AI Relationship Assistance & Context Engine
  describe('6. AI Relationship Assistance & "Before You Talk" Context Engine', () => {
    it('generates factual "Before You Talk" briefing with clear provenance', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      const res = await fetch(`${BASE_URL}/persons/${person.id}/briefing`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.briefing.provenance).toBe('user_recorded_facts');
      expect(data.briefing.thingsTheyAppreciate).toBeInstanceOf(Array);
      expect(data.briefing.sensitiveBoundariesToRespect).toBeInstanceOf(Array);
    });

    it('generates AI insights with conversation starters, patterns, and non-diagnostic disclaimer', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      const res = await fetch(`${BASE_URL}/persons/${person.id}/ai-insights`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.insights.provenance).toBe('ai_assisted');
      expect(data.insights.disclaimer).toContain('analytical suggestion derived from user-recorded context');
      expect(data.insights.conversationStarters.length).toBeGreaterThan(0);
      expect(data.insights.communicationPatternObservations).toBeDefined();

      for (const starter of data.insights.conversationStarters) {
        expect(starter.starter.length).toBeGreaterThan(15);
        expect(starter.rationale.length).toBeGreaterThan(10);
      }
    });
  });

  // 7. Strict Account-Level Data Isolation & Security
  describe('7. Strict Account-Level Data Isolation & Security Boundary', () => {
    it('prevents another user (Bob) from accessing Alice managed relationship records', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      // Bob tries to access Alice's private managed person dossier
      const res = await fetch(`${BASE_URL}/persons/${person.id}/dossier`, {
        headers: { 'x-user-id': 'usr_bob_imposter' }
      });
      expect(res.status).toBe(404); // Data isolation: returns not found, zero leakage
    });

    it('prevents another user (Bob) from modifying Alice managed relationship records', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      const res = await fetch(`${BASE_URL}/persons/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_bob_imposter' },
        body: JSON.stringify({ name: 'Hacked Name' })
      });
      expect(res.status).toBe(404);

      // Verify name remains unchanged in database
      const check = RelationshipVaultService.getPerson('usr_me', person.id);
      expect(check?.name).toBe(person.name);
    });
  });

  // 8. Export & Cascading Purge
  describe('8. Export & Cascading Purge', () => {
    it('exports complete dossier in structured JSON and Markdown formats', async () => {
      const person = RelationshipVaultService.listPersons('usr_me')[0];

      // JSON export
      const jsonRes = await fetch(`${BASE_URL}/persons/${person.id}/export?format=json`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(jsonRes.status).toBe(200);
      const jsonData = await jsonRes.json();
      expect(jsonData.success).toBe(true);
      expect(jsonData.dossier.person.id).toBe(person.id);

      // Markdown export
      const mdRes = await fetch(`${BASE_URL}/persons/${person.id}/export?format=markdown`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(mdRes.status).toBe(200);
      const mdText = await mdRes.text();
      expect(mdText).toContain('# Relationship Dossier:');
      expect(mdText).toContain('Promises & Commitments');
      expect(mdText).toContain('Memories & Quotes');
    });

    it('deletes person and cascades to purge all interactions, memories, and commitments', async () => {
      // 1. Create disposable person
      const p = RelationshipVaultService.createPerson('usr_me', { name: 'Disposable Test Person' });
      RelationshipVaultService.logInteraction('usr_me', p.id, { interaction_type: 'text_chat', notes: 'Temporary' });
      RelationshipVaultService.addMemory('usr_me', p.id, { memory_type: 'moment', content: 'Temporary memory' });
      RelationshipVaultService.addCommitment('usr_me', p.id, { made_by: 'me', title: 'Temporary promise' });

      // 2. Delete person
      const delRes = await fetch(`${BASE_URL}/persons/${p.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(delRes.status).toBe(200);

      // 3. Verify cascading purge in database
      const countP = db.prepare('SELECT COUNT(*) as c FROM prm_persons WHERE id = ?').get(p.id) as { c: number };
      const countI = db.prepare('SELECT COUNT(*) as c FROM prm_interactions WHERE person_id = ?').get(p.id) as { c: number };
      const countM = db.prepare('SELECT COUNT(*) as c FROM prm_memories WHERE person_id = ?').get(p.id) as { c: number };
      const countC = db.prepare('SELECT COUNT(*) as c FROM prm_commitments WHERE person_id = ?').get(p.id) as { c: number };

      expect(countP.c).toBe(0);
      expect(countI.c).toBe(0);
      expect(countM.c).toBe(0);
      expect(countC.c).toBe(0);
    });
  });
});
