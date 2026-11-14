import { PsychologyConcept, ReflectionExercise } from './types';

export const INITIAL_PSYCHOLOGY_CONCEPTS: PsychologyConcept[] = [
  // =========================================================================
  // DOMAIN 1: PERSONALITY PSYCHOLOGY
  // =========================================================================
  {
    id: 'concept_introversion_extraversion',
    domain: 'personality_psychology',
    framework_type: 'scientific',
    title: 'Introversion, Extraversion & Ambiversion',
    scientific_name: 'Extraversion Dimension (Five Factor Model / Eysenck Cortical Arousal)',
    definition: 'A fundamental psychological spectrum measuring where an individual directs their energy and how they replenish mental resources. Extraversion reflects stimulation seeking through external interaction; introversion reflects sensitivity to external stimulation and replenishment through solitude.',
    practical_example: 'After a 4-hour high-density social gathering, an introverted individual feels depleted and seeks a quiet room to read, whereas an extraverted individual feels energized and suggests going to a late-night diner.',
    related_concepts: ['Ambiversion', 'Sensory Processing Sensitivity', 'Social Battery', 'Cortical Arousal'],
    appropriate_context: 'Understanding personal pacing, planning social calendars, and communicating energy limits to friends or romantic partners.',
    limitations_and_caveats: 'Introversion is not social anxiety or misanthropy, and extraversion is not superficiality. Most healthy humans are ambiverts who shift depending on environmental comfort and relational safety.',
    spectrum_low_label: 'Deep Introspection & Solitary Recharging',
    spectrum_high_label: 'Expansive Social Energy & External Stimulation',
    badge_color: '#3B82F6',
    sort_order: 1,
    created_at: 1700000000000
  },
  {
    id: 'concept_openness_experience',
    domain: 'personality_psychology',
    framework_type: 'scientific',
    title: 'Openness to Experience',
    scientific_name: 'Openness / Intellect (Costa & McCrae FFM)',
    definition: 'A Big Five trait reflecting intellectual curiosity, aesthetic appreciation, unconventional thinking, and appetite for novel sensory and conceptual experiences.',
    practical_example: 'Choosing to spend a weekend exploring philosophical poetry, avant-garde cinema, or obscure cuisines rather than sticking to familiar routines.',
    related_concepts: ['Curiosity', 'Creativity', 'Cognitive Flexibility', 'Aesthetic Sensitivity'],
    appropriate_context: 'Assessing shared intellectual appetite, travel compatibility, and conversational depth in friendships or dating.',
    limitations_and_caveats: 'High openness is not superior to low openness; individuals with lower openness often excel at consistency, tradition, and grounding stability.',
    spectrum_low_label: 'Pragmatic, Familiar & Grounded',
    spectrum_high_label: 'Imaginative, Unconventional & Novelty-Seeking',
    badge_color: '#8B5CF6',
    sort_order: 2,
    created_at: 1700000000000
  },
  {
    id: 'concept_conscientiousness',
    domain: 'personality_psychology',
    framework_type: 'scientific',
    title: 'Conscientiousness & Orderliness',
    scientific_name: 'Conscientiousness (Five Factor Model)',
    definition: 'The trait governing impulse control, goal-directed behavior, diligence, organization, and adherence to obligations and promises.',
    practical_example: 'Keeping a shared calendar updated, following through on a commitment made weeks prior, and preparing thoughtfully before embarking on a collaborative project.',
    related_concepts: ['Accountability', 'Reliability', 'Executive Function', 'Diligence'],
    appropriate_context: 'Understanding cohabitation expectations, project collaborations, and domestic harmony in long-term relationships.',
    limitations_and_caveats: 'Extremely high conscientiousness can manifest as perfectionism or rigidity, while lower conscientiousness often accompanies spontaneity and adaptability.',
    spectrum_low_label: 'Spontaneous, Flexible & Improvisational',
    spectrum_high_label: 'Disciplined, Structured & Thorough',
    badge_color: '#10B981',
    sort_order: 3,
    created_at: 1700000000000
  },
  {
    id: 'concept_agreeableness',
    domain: 'personality_psychology',
    framework_type: 'scientific',
    title: 'Agreeableness vs Critical Rationality',
    scientific_name: 'Agreeableness (Five Factor Model)',
    definition: 'A measure of altruism, empathy, trust, and prosocial orientation versus competitive, skepticism-driven, and critical analytical approaches to relationships.',
    practical_example: 'In a disagreement over restaurant choices, an agreeable person prioritizes their partner’s emotional comfort, whereas a more critical person prioritizes objective quality or value.',
    related_concepts: ['Compassion', 'Politeness', 'Conflict Avoidance', 'Empathic Concern'],
    appropriate_context: 'Navigating negotiation, empathy expression, and interpersonal warmth.',
    limitations_and_caveats: 'Agreeableness should not be confused with weakness; individuals low in agreeableness often make tough, objective decisions that protect boundaries under pressure.',
    spectrum_low_label: 'Direct, Skeptical & Analytically Critical',
    spectrum_high_label: 'Empathetic, Accommodating & Prosocial',
    badge_color: '#EC4899',
    sort_order: 4,
    created_at: 1700000000000
  },
  {
    id: 'concept_emotional_stability',
    domain: 'personality_psychology',
    framework_type: 'scientific',
    title: 'Emotional Stability & Stress Resilience',
    scientific_name: 'Neuroticism vs Emotional Stability (Five Factor Model)',
    definition: 'The continuum of affective reactivity to stressors, uncertainty, and perceived threat, ranging from even-keeled equanimity to heightened emotional vigilance.',
    practical_example: 'When travel plans are abruptly cancelled due to bad weather, a highly emotionally stable person calmly explores hotel options, while a more reactive person feels a surge of panic before regaining composure.',
    related_concepts: ['Stress Response', 'Affect Regulation', 'Equanimity', 'Vigilance'],
    appropriate_context: 'Understanding coping strategies in crisis, pacing under stress, and creating relational safety.',
    limitations_and_caveats: 'Higher reactivity is not a mental disorder; it often correlates with heightened artistic empathy, early threat detection, and emotional perceptiveness.',
    spectrum_low_label: 'Deeply Reactive, Sensitive & Vigilant',
    spectrum_high_label: 'Calm, Resilient & Even-Keeled',
    badge_color: '#0EA5E9',
    sort_order: 5,
    created_at: 1700000000000
  },

  // =========================================================================
  // DOMAIN 2: EMOTIONAL INTELLIGENCE
  // =========================================================================
  {
    id: 'concept_self_awareness',
    domain: 'emotional_intelligence',
    framework_type: 'scientific',
    title: 'Emotional Self-Awareness',
    scientific_name: 'Introspective Metacognition & Interoception',
    definition: 'The conscious capacity to observe, name, and understand one’s internal emotional states, psychological triggers, somatic sensations, and motives in real time.',
    practical_example: 'Noticing a tightening in one’s chest during a conversation and recognizing: "I am feeling defensive because I interpreted that comment as questioning my competence."',
    related_concepts: ['Interoception', 'Metacognition', 'Mindfulness', 'Emotional Granularity'],
    appropriate_context: 'Personal growth, pre-conflict de-escalation, and maintaining authentic self-expression.',
    limitations_and_caveats: 'Self-awareness is the prerequisite for change, not the change itself. Awareness without self-compassion can devolve into hyper-critical rumination.',
    spectrum_low_label: 'Intuitive & Gut-Driven Experiencing',
    spectrum_high_label: 'Hyper-Reflective & Metacognitive',
    badge_color: '#F59E0B',
    sort_order: 6,
    created_at: 1700000000000
  },
  {
    id: 'concept_self_regulation',
    domain: 'emotional_intelligence',
    framework_type: 'scientific',
    title: 'Self-Regulation & The Pause',
    scientific_name: 'Executive Affect Regulation (Gross Process Model of Emotion Regulation)',
    definition: 'The ability to monitor, modulate, and channel intense affective impulses into deliberate, value-aligned responses rather than immediate reactive lash-outs.',
    practical_example: 'Feeling sudden frustration upon receiving a blunt email, stepping away from the keyboard for 5 deep breaths, and responding thoughtfully an hour later.',
    related_concepts: ['Inhibitory Control', 'Mindful Pause', 'Cognitive Reappraisal', 'Distress Tolerance'],
    appropriate_context: 'Managing heated discussions, resolving relational friction, and avoiding impulsive declarations.',
    limitations_and_caveats: 'Regulation does not mean suppression or emotional numbing. Healthy regulation honors the feeling while choosing the action consciously.',
    spectrum_low_label: 'Spontaneous & Immediate Expression',
    spectrum_high_label: 'Deliberate, Paused & Modulated Action',
    badge_color: '#10B981',
    sort_order: 7,
    created_at: 1700000000000
  },
  {
    id: 'concept_emotional_vocabulary',
    domain: 'emotional_intelligence',
    framework_type: 'scientific',
    title: 'Emotional Vocabulary & Granularity',
    scientific_name: 'Emotional Granularity (Lisa Feldman Barrett)',
    definition: 'The skill of distinguishing between specific emotional nuances (e.g. distinguishing between feeling "lonely", "exhausted", "unseen", or "bored") rather than lumping them under vague labels like "bad" or "stressed".',
    practical_example: 'Instead of saying "I am just in a bad mood", articulating: "I am feeling overwhelmed by conflicting deadlines and a bit unappreciated for my recent effort."',
    related_concepts: ['Feelings Wheel', 'Affective Labeling', 'Linguistic Attunement'],
    appropriate_context: 'Journaling, couples communication, psychotherapy dialogue, and clarifying internal needs.',
    limitations_and_caveats: 'Words alone cannot replace somatic processing, but naming an emotion accurately activates the prefrontal cortex and reduces amygdala hyperactivity.',
    spectrum_low_label: 'Broad, Somatic & General States',
    spectrum_high_label: 'Highly Nuanced, Specific & Articulate',
    badge_color: '#A855F7',
    sort_order: 8,
    created_at: 1700000000000
  },
  {
    id: 'concept_emotional_boundaries',
    domain: 'emotional_intelligence',
    framework_type: 'research_supported',
    title: 'Emotional Boundaries & Differentiation',
    scientific_name: 'Differentiation of Self (Bowen Family Systems Theory)',
    definition: 'The psychological capacity to remain deeply compassionate and connected to another person without adopting their anxiety, distress, or emotional turmoil as one’s own responsibility.',
    practical_example: 'Listening with full warmth and empathy to a friend going through a divorce, offering practical support, while not letting their despair ruin your sleep or self-worth.',
    related_concepts: ['Enmeshment', 'Codependency Prevention', 'Sovereign Empathy'],
    appropriate_context: 'Caregiving relationships, partnership support, and preventing emotional burnout.',
    limitations_and_caveats: 'Boundaries are not walls of emotional detachment; healthy boundaries protect connection by making connection sustainable.',
    spectrum_low_label: 'Porous, Highly Absorbent & Resonant',
    spectrum_high_label: 'Clear, Differentiated & Self-Sovereign',
    badge_color: '#6366F1',
    sort_order: 9,
    created_at: 1700000000000
  },

  // =========================================================================
  // DOMAIN 3: INTERPERSONAL BEHAVIOR
  // =========================================================================
  {
    id: 'concept_communication_styles',
    domain: 'interpersonal_behavior',
    framework_type: 'research_supported',
    title: 'Communication Styles: Direct, Assertive & Empathetic',
    scientific_name: 'Interpersonal Communication Taxonomy',
    definition: 'The habitual patterns, tonalities, and pacing through which a person shares information, requests needs, and delivers feedback to others.',
    practical_example: 'Assertive/Direct: "I appreciate your idea, but I have a concern about the timeline. Can we review it together?" vs Passive: Saying nothing and feeling resentful later.',
    related_concepts: ['Assertiveness', 'Nonviolent Communication', 'Tone Modulation', 'Clarity'],
    appropriate_context: 'Conflict resolution, workplace collaboration, and establishing dating expectations.',
    limitations_and_caveats: 'No single communication style works universally across all cultural contexts; adaptability to the listener’s nervous system is key.',
    spectrum_low_label: 'Gentle, Indirect & Harmony-Preserving',
    spectrum_high_label: 'Direct, Explicit & Candor-Prioritizing',
    badge_color: '#E11D48',
    sort_order: 10,
    created_at: 1700000000000
  },
  {
    id: 'concept_active_reflective_listening',
    domain: 'interpersonal_behavior',
    framework_type: 'scientific',
    title: 'Active & Reflective Listening',
    scientific_name: 'Person-Centered Attunement (Carl Rogers)',
    definition: 'A communication practice where the listener gives undivided attention, mirrors back what they heard without jumping to problem-solving, and validates the speaker’s emotional reality.',
    practical_example: 'Responding: "It sounds like you felt really dismissed in that meeting when your idea was talked over, is that right?" before offering any advice.',
    related_concepts: ['Empathic Validation', 'Attunement', 'Non-Judgmental Presence'],
    appropriate_context: 'De-escalating relationship arguments, emotional comforting, and deep friendship bonds.',
    limitations_and_caveats: 'Reflective listening can feel robotic if performed merely as a script rather than from genuine curiosity and care.',
    spectrum_low_label: 'Solution-Oriented & Action-Driven',
    spectrum_high_label: 'Reflective, Holding-Space & Validating',
    badge_color: '#14B8A6',
    sort_order: 11,
    created_at: 1700000000000
  },
  {
    id: 'concept_attachment_theory',
    domain: 'interpersonal_behavior',
    framework_type: 'scientific',
    title: 'Attachment Patterns: Secure, Anxious & Avoidant Dynamics',
    scientific_name: 'Adult Attachment Working Models (Bowlby, Ainsworth, Hazan & Shaver)',
    definition: 'Subconscious relational templates formed through developmental history that influence how one perceives safety, closeness, autonomy, and vulnerability in intimate partnerships.',
    practical_example: 'In response to an unanswered text, an anxious dynamic experiences a spike in fear of abandonment, while an avoidant dynamic experiences a reflex to withdraw and preserve independence.',
    related_concepts: ['Secure Base', 'Anxious Hyperactivating', 'Deactivating Strategies', 'Earned Security'],
    appropriate_context: 'Dating selection, understanding recurring relationship triggers, and cultivating earned secure attachment.',
    limitations_and_caveats: 'CRITICAL: Attachment styles are not permanent clinical diagnoses or personality defects. They are adaptive strategies that change across different partners and through deliberate emotional work.',
    spectrum_low_label: 'Autonomous & Space-Valuing',
    spectrum_high_label: 'Attuned & Connection-Seeking',
    badge_color: '#F43F5E',
    sort_order: 12,
    created_at: 1700000000000
  },
  {
    id: 'concept_vulnerability_trust',
    domain: 'interpersonal_behavior',
    framework_type: 'research_supported',
    title: 'Vulnerability & The Trust Reciprocity Loop',
    scientific_name: 'Vulnerability and Mutual Self-Disclosure (Brené Brown & Arthur Aron)',
    definition: 'The courage to show up and be seen when the outcome cannot be controlled. Trust is built in small increments as one person takes a micro-risk of disclosure and the other responds with safety and validation.',
    practical_example: 'Sharing an insecurity about starting a new project, receiving acceptance, and thereby allowing the other person to share a private fear of their own.',
    related_concepts: ['Psychological Safety', 'Emotional Exposure', 'Reciprocity'],
    appropriate_context: 'Deepening friendships, transitioning from casual dating to intimacy, and healing after conflict.',
    limitations_and_caveats: 'Vulnerability is not indiscriminate oversharing ("floodlighting"). True intimacy requires boundaries and pacing matched to relational trust.',
    spectrum_low_label: 'Guarded, Measured & Slow-to-Reveal',
    spectrum_high_label: 'Open, Courageous & Readily Transparent',
    badge_color: '#D97706',
    sort_order: 13,
    created_at: 1700000000000
  },

  // =========================================================================
  // DOMAIN 4: VALUES AND CHARACTER
  // =========================================================================
  {
    id: 'concept_integrity',
    domain: 'values_character',
    framework_type: 'research_supported',
    title: 'Integrity & Moral Congruence',
    scientific_name: 'Value-Behavior Congruence',
    definition: 'The internal consistency between what a person professes to believe and how they act when no one is watching or when convenience tempts compromise.',
    practical_example: 'Declining an unfair advantage in a professional negotiation because it contradicts your standard of fair play, even when you would never be caught.',
    related_concepts: ['Honesty', 'Reliability', 'Ethical Courage', 'Self-Respect'],
    appropriate_context: 'Long-term partnership selection, establishing trust, and personal self-respect.',
    limitations_and_caveats: 'Integrity should be rooted in compassion, not self-righteous moral superiority.',
    badge_color: '#10B981',
    sort_order: 14,
    created_at: 1700000000000
  },
  {
    id: 'concept_authenticity',
    domain: 'values_character',
    framework_type: 'scientific',
    title: 'Authenticity & Freedom from Pretense',
    scientific_name: 'Authentic Functioning (Kernis & Goldman)',
    definition: 'Operating in alignment with one’s genuine values, feelings, and thoughts rather than wearing a social mask purely to win approval or avoid temporary friction.',
    practical_example: 'Politely declining an invitation to an event you dislike rather than making up a fake illness or going while silently harboring resentment.',
    related_concepts: ['Self-Congruence', 'Unmasking', 'Courageous Honesty'],
    appropriate_context: 'Profile creation, first dates, and honest life path decisions.',
    limitations_and_caveats: 'Authenticity is not an excuse for cruelty or refusing personal growth. One can be authentically kind, tactful, and considerate.',
    badge_color: '#8B5CF6',
    sort_order: 15,
    created_at: 1700000000000
  },
  {
    id: 'concept_compassion_accountability',
    domain: 'values_character',
    framework_type: 'research_supported',
    title: 'Compassion & Clear Accountability',
    scientific_name: 'Prosocial Responsibility & Reparative Action',
    definition: 'The balance between generous empathy for human fallibility and the willingness to take full ownership of the impact of one’s mistakes without dodging or deflecting.',
    practical_example: 'When late for an important dinner, saying: "I am sorry for making you wait. My planning fell short and that was unfair to your evening. Here is how I will ensure it does not happen again."',
    related_concepts: ['Reparation', 'Genuine Apology', 'Humility', 'Grace'],
    appropriate_context: 'Resolving domestic and relational friction and building resilient repair rituals.',
    limitations_and_caveats: 'Accountability without compassion leads to shame spirals; compassion without accountability leads to boundary erosion.',
    badge_color: '#EC4899',
    sort_order: 16,
    created_at: 1700000000000
  },
  {
    id: 'concept_curiosity_independence',
    domain: 'values_character',
    framework_type: 'scientific',
    title: 'Curiosity & Intellectual Independence',
    scientific_name: 'Epistemic Drive & Psychological Sovereignty',
    definition: 'An insatiable appetite to learn, question assumptions, explore alternative paradigms, and think critically for oneself rather than adopting crowd consensus.',
    practical_example: 'Reading opposing viewpoints on a contentious topic with genuine curiosity before forming a nuanced perspective.',
    related_concepts: ['Open-Mindedness', 'Autonomous Thinking', 'Lifelong Learning'],
    appropriate_context: 'Intellectual companionship, problem solving, and mutual inspiration.',
    limitations_and_caveats: 'Independence must not turn into hyper-independence that blocks connection or collaborative teamwork.',
    badge_color: '#0EA5E9',
    sort_order: 17,
    created_at: 1700000000000
  },

  // =========================================================================
  // DOMAIN 5: RELATIONSHIP DYNAMICS
  // =========================================================================
  {
    id: 'concept_emotional_availability',
    domain: 'relationship_dynamics',
    framework_type: 'research_supported',
    title: 'Emotional Availability & Receptivity',
    scientific_name: 'Affective Receptivity and Relational Presence',
    definition: 'The willingness and psychological bandwidth to be emotionally reachable, present, and vulnerable with another human being without excessive defense mechanisms.',
    practical_example: 'Being able to look into a partner’s eyes during a moment of tenderness without needing to crack a joke or look away from awkwardness.',
    related_concepts: ['Presence', 'Affective Safety', 'Intimacy Capacity'],
    appropriate_context: 'Assessing readiness for serious dating and deepening mutual commitment.',
    limitations_and_caveats: 'Availability fluctuates with life circumstances (grief, burnout, career crises); it is a state that requires ongoing maintenance.',
    spectrum_low_label: 'Reserved & Emotionally Guarded',
    spectrum_high_label: 'Fully Available, Open & Attuned',
    badge_color: '#10B981',
    sort_order: 18,
    created_at: 1700000000000
  },
  {
    id: 'concept_relationship_expectations',
    domain: 'relationship_dynamics',
    framework_type: 'research_supported',
    title: 'Relationship Expectations & Clear Agreements',
    scientific_name: 'Relational Contracting & Role Clarity',
    definition: 'The proactive translation of unspoken internal fantasies, assumptions, and desires into clear, mutually negotiated relational agreements.',
    practical_example: 'Discussing early on: "How often do we each need solo evenings each week?" rather than assuming the other person shares your ideal frequency.',
    related_concepts: ['Implicit Assumptions', 'Mutual Consent', 'Boundary Alignment'],
    appropriate_context: 'Preventing resentment in dating and long-term co-creation of partnerships.',
    limitations_and_caveats: 'Expectations should be living agreements that are revisited as partners grow and circumstances evolve.',
    spectrum_low_label: 'Organic, Unspoken & Flow-Driven',
    spectrum_high_label: 'Explicit, Articulated & Negotiated',
    badge_color: '#3B82F6',
    sort_order: 19,
    created_at: 1700000000000
  },
  {
    id: 'concept_commitment_affection',
    domain: 'relationship_dynamics',
    framework_type: 'scientific',
    title: 'Commitment, Affection & Triangular Love',
    scientific_name: 'Triangular Theory of Love (Robert Sternberg)',
    definition: 'The interplay between Intimacy (emotional closeness), Passion (physical and romantic drive), and Commitment (the deliberate decision to maintain connection through adversity).',
    practical_example: 'Choosing to stand by a partner during an illness or family crisis when romance and physical passion are temporarily overshadowed by logistical caregiving.',
    related_concepts: ['Devotion', 'Affection Modalities', 'Sternberg Triangle'],
    appropriate_context: 'Assessing relational trajectory and understanding different seasons of love.',
    limitations_and_caveats: 'Commitment without affection becomes a chore; affection without commitment remains volatile. Balance is dynamic.',
    spectrum_low_label: 'Exploratory & Season-to-Season',
    spectrum_high_label: 'Steadfast, Long-Term & Dedicated',
    badge_color: '#F43F5E',
    sort_order: 20,
    created_at: 1700000000000
  },

  // =========================================================================
  // DOMAIN 6: SELF-REFLECTION
  // =========================================================================
  {
    id: 'concept_personal_contradictions',
    domain: 'self_reflection',
    framework_type: 'research_supported',
    title: 'Personal Contradictions & Multidimensional Self',
    scientific_name: 'Dialectical Self-Concept & Cognitive Complexity',
    definition: 'The mature recognition that human beings hold opposing tendencies simultaneously (e.g. craving deep intimacy while fiercely protecting solitude; being ambitious yet longing for simplicity).',
    practical_example: 'Acknowledging: "I am deeply social and love hosting dinner parties, yet if I do not get entire days in complete silence, my mood collapses."',
    related_concepts: ['Shadow Self', 'Internal Polarity', 'Wholeness vs Perfection'],
    appropriate_context: 'Overcoming self-shaming and embracing the full paradox of one’s identity.',
    limitations_and_caveats: 'Recognizing contradictions is not an excuse for hypocrisy; it is an invitation to integrate conflicting needs with balance.',
    badge_color: '#F59E0B',
    sort_order: 21,
    created_at: 1700000000000
  },
  {
    id: 'concept_fears_insecurities',
    domain: 'self_reflection',
    framework_type: 'scientific',
    title: 'Core Insecurities & Relational Triggers',
    scientific_name: 'Core Vulnerability & Emotional Schemas',
    definition: 'The recurring internal narratives and fears (e.g. fear of being invisible, fear of being trapped, fear of judgment) that shape defensive reactions under stress.',
    practical_example: 'Recognizing that when a partner is quiet, your immediate assumption that "they are angry with me" stems from childhood hypervigilance, not from their actual state.',
    related_concepts: ['Trigger Mapping', 'Core Vulnerability', 'Schema Therapy'],
    appropriate_context: 'Preventing misinterpretations in relationships and developing emotional self-soothing.',
    limitations_and_caveats: 'Insecurities are normal human phenomena; acknowledging them diffuses their power, whereas hiding them allows them to steer behavior.',
    badge_color: '#E11D48',
    sort_order: 22,
    created_at: 1700000000000
  },
  {
    id: 'concept_identity_evolution',
    domain: 'self_reflection',
    framework_type: 'scientific',
    title: 'Narrative Identity & Lifelong Growth',
    scientific_name: 'Narrative Identity Theory (Dan McAdams)',
    definition: 'The evolving story a person constructs to make sense of their past, present, and desired future, viewing character as an evolving journey rather than a fixed box.',
    practical_example: 'Looking back at who you were five years ago and recognizing how a difficult breakup transformed your capacity for empathy and boundaries today.',
    related_concepts: ['Growth Mindset', 'Post-Traumatic Growth', 'Life Story Chapters'],
    appropriate_context: 'Setting personal development goals and reflecting on changes over time.',
    limitations_and_caveats: 'Growth takes time and nonlinear setbacks are natural; identity evolution is not a race.',
    badge_color: '#6366F1',
    sort_order: 23,
    created_at: 1700000000000
  },

  // =========================================================================
  // POPULAR PSYCHOLOGY & ARCHETYPES (WITH CLEAR CAVEATS)
  // =========================================================================
  {
    id: 'concept_love_languages',
    domain: 'relationship_dynamics',
    framework_type: 'popular_psychology',
    title: 'The Five Expressions of Affection ("Love Languages")',
    scientific_name: 'Affection Preference Typology (Gary Chapman)',
    definition: 'A popular descriptive model proposing five primary ways people prefer to express and receive relational care: Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, and Physical Touch.',
    practical_example: 'Recognizing that your partner feels most cherished when you cook them dinner (Acts of Service), while you feel most loved through unhurried conversation (Quality Time).',
    related_concepts: ['Relational Dialects', 'Affection Matching', 'Emotional Attunement'],
    appropriate_context: 'Sparking fun, accessible dialogue between partners about daily affection preferences.',
    limitations_and_caveats: 'POPULAR PSYCHOLOGY CAVEAT: Empirical research shows love languages are not fixed biological categories; people appreciate all five forms depending on context, and satisfaction depends on mutual willingness to listen, not identical scores.',
    badge_color: '#F43F5E',
    sort_order: 24,
    created_at: 1700000000000
  },
  {
    id: 'concept_enneagram_models',
    domain: 'personality_psychology',
    framework_type: 'popular_psychology',
    title: 'Enneagram Motivation Archetypes',
    scientific_name: 'Typological Motivation System',
    definition: 'A popular psychological model classifying personalities into nine core motivational archetypes based on central desires, core fears, and defense mechanisms.',
    practical_example: 'A Type 1 focusing on integrity and improvement, or a Type 4 cultivating depth, uniqueness, and authentic feeling.',
    related_concepts: ['Typology', 'Core Desires', 'Shadow Integration'],
    appropriate_context: 'Creative self-reflection and storytelling.',
    limitations_and_caveats: 'POPULAR PSYCHOLOGY CAVEAT: The Enneagram lacks peer-reviewed empirical validation comparable to the Big Five. Use it as a reflective mirror or creative lens, never as a clinical diagnosis.',
    badge_color: '#A855F7',
    sort_order: 25,
    created_at: 1700000000000
  },
  {
    id: 'concept_narrative_archetypes',
    domain: 'self_reflection',
    framework_type: 'narrative_archetype',
    title: 'Mythic & Narrative Archetypes (Hero, Sage, Caregiver, Rebel)',
    scientific_name: 'Archetypal Psychology (Carl Jung & Joseph Campbell)',
    definition: 'Universal mythic patterns and narrative roles that humans throughout history have projected into literature, cinema, and their own life stories.',
    practical_example: 'Channeling the "Sage" when seeking wisdom and objectivity, or the "Rebel" when disrupting an unhealthy status quo.',
    related_concepts: ['Monomyth', 'The Hero’s Journey', 'Symbolic Identity'],
    appropriate_context: 'Cinematic profiles, creative worldbuilding, and imaginative identity spaces.',
    limitations_and_caveats: 'ARCHETYPE CAVEAT: Archetypes are symbolic and literary expressions of human imagination, not rigid neurological categories.',
    badge_color: '#E11D48',
    sort_order: 26,
    created_at: 1700000000000
  }
];

export const INITIAL_REFLECTION_EXERCISES: ReflectionExercise[] = [
  {
    id: 'ex_values_alignment_audit',
    domain: 'values_character',
    title: 'Core Values & Life Alignment Audit',
    subtitle: 'Identify what truly guides your decisions and examine where your daily life aligns or diverges.',
    estimated_minutes: 8,
    framework_type: 'research_supported',
    ethical_disclaimer: 'This exercise is a self-guided introspection tool. There are no right or wrong answers, and your reflections are private to you.',
    sort_order: 1,
    prompts: [
      {
        id: 'p1_top_values',
        prompt_text: 'Which 3 to 5 core values feel non-negotiable for your self-respect and peace of mind?',
        helper_text: 'e.g. Integrity, Curiosity, Kindness, Independence, Courage, Loyalty',
        prompt_type: 'long_text'
      },
      {
        id: 'p2_lived_vs_aspired',
        prompt_text: 'In which area of your life right now are you living closest to your values, and where do you feel friction?',
        helper_text: 'Reflect on work, relationships, boundaries, or personal habits.',
        prompt_type: 'long_text'
      },
      {
        id: 'p3_micro_adjustment',
        prompt_text: 'What is one concrete micro-decision you can make this week to restore alignment?',
        prompt_type: 'long_text'
      }
    ]
  },
  {
    id: 'ex_communication_calm_vs_stress',
    domain: 'interpersonal_behavior',
    title: 'How I Communicate Under Calm vs Overwhelm',
    subtitle: 'Map your communication tendencies when you feel safe versus when your nervous system is stressed.',
    estimated_minutes: 6,
    framework_type: 'scientific',
    ethical_disclaimer: 'Understanding your stress response is about self-compassion and relational clarity, not self-judgment.',
    sort_order: 2,
    prompts: [
      {
        id: 'p1_calm_style',
        prompt_text: 'When you feel calm, safe, and unhurried, how do you naturally communicate with others?',
        helper_text: 'e.g. Warm and attentive, humorous and playful, analytical and structured, or reflective.',
        prompt_type: 'long_text'
      },
      {
        id: 'p2_stress_style',
        prompt_text: 'When you feel criticized, overwhelmed, or exhausted, what is your initial defensive reflex?',
        helper_text: 'Do you withdraw and go quiet? Do you over-explain and seek reassurance? Or do you get direct and impatient?',
        prompt_type: 'long_text'
      },
      {
        id: 'p3_ideal_partner_response',
        prompt_text: 'What can a companion do in that moment of overwhelm that genuinely helps you de-escalate?',
        prompt_type: 'long_text'
      }
    ]
  },
  {
    id: 'ex_emotional_boundaries_mapping',
    domain: 'emotional_intelligence',
    title: 'Relational Boundary & Energy Mapping',
    subtitle: 'Clarify where your emotional responsibility begins and ends in close relationships.',
    estimated_minutes: 7,
    framework_type: 'research_supported',
    ethical_disclaimer: 'Boundaries are not selfish; they are the framework that makes authentic long-term connection sustainable.',
    sort_order: 3,
    prompts: [
      {
        id: 'p1_energy_drain',
        prompt_text: 'What kind of social or emotional interaction reliably leaves you feeling drained or resentful?',
        prompt_type: 'long_text'
      },
      {
        id: 'p2_unspoken_need',
        prompt_text: 'What boundary do you find hardest to assert with people you care about?',
        helper_text: 'e.g. Saying no to plans, expressing when a comment hurt, or taking solo space without guilt.',
        prompt_type: 'long_text'
      },
      {
        id: 'p3_boundary_mantra',
        prompt_text: 'Write a simple sentence you can tell yourself when you feel the urge to compromise your boundaries.',
        prompt_type: 'long_text'
      }
    ]
  },
  {
    id: 'ex_personal_contradictions',
    domain: 'self_reflection',
    title: 'Embracing the Paradoxes of My Personality',
    subtitle: 'Explore the seemingly contradictory dualities that make your identity uniquely human.',
    estimated_minutes: 5,
    framework_type: 'research_supported',
    ethical_disclaimer: 'Holding contradictions is a hallmark of emotional maturity, not inconsistency.',
    sort_order: 4,
    prompts: [
      {
        id: 'p1_first_paradox',
        prompt_text: 'What are two seemingly opposite traits that are both 100% true about you?',
        helper_text: 'e.g. "I love deep socializing, but need complete solitary isolation to recharge" or "I am fiercely independent, but yearn for gentle companionship."',
        prompt_type: 'long_text'
      },
      {
        id: 'p2_reconciliation',
        prompt_text: 'How do these two sides actually support or balance each other in your life?',
        prompt_type: 'long_text'
      }
    ]
  },
  {
    id: 'ex_attachment_safety_reflection',
    domain: 'relationship_dynamics',
    title: 'Relational Safety, Trust & Intimacy Reflection',
    subtitle: 'Explore what conditions allow you to feel genuinely secure, seen, and valued in a partnership.',
    estimated_minutes: 8,
    framework_type: 'scientific',
    ethical_disclaimer: 'This reflection is educational and self-descriptive. It does not replace professional relationship counseling.',
    sort_order: 5,
    prompts: [
      {
        id: 'p1_safety_triggers',
        prompt_text: 'What specific behaviors from another person instantly signal to you that they are emotionally safe and trustworthy?',
        helper_text: 'e.g. Consistent follow-through, keeping calm during disagreements, listening without unsolicited advice.',
        prompt_type: 'long_text'
      },
      {
        id: 'p2_vulnerability_pace',
        prompt_text: 'How do you prefer intimacy to develop over time? What pacing feels healthy and natural to you?',
        prompt_type: 'long_text'
      },
      {
        id: 'p3_growth_edge',
        prompt_text: 'What is one relational habit you are actively working to unlearn or improve in yourself?',
        prompt_type: 'long_text'
      }
    ]
  }
];
