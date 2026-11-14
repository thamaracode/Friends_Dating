import { QuestionEcosystemItem } from './types';

export const SEED_QUESTIONS_ECOSYSTEM: Omit<QuestionEcosystemItem, 'created_at' | 'updated_at' | 'likes_count' | 'answers_count' | 'views_count' | 'shares_count'>[] = [
  // =========================================================================
  // 1. SELF-DISCOVERY
  // =========================================================================
  {
    id: 'q_self_01',
    question_text: 'What is a core truth about yourself that took you years to finally accept?',
    primary_category: 'self_discovery',
    subcategory: 'self_perception',
    depth_level: 'deep',
    difficulty: 'medium',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Reflect on traits or desires you previously tried to hide or change to fit in.',
    follow_up_questions: [
      'How did accepting this truth change the quality of your relationships?',
      'What advice would you give to your younger self when you were wrestling with it?'
    ],
    content_tags: ['#selfacceptance', '#authenticity', '#growth', '#identity'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Internal Psychology Framework',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_self_02',
    question_text: 'If your daily habits were a silent confession of your actual priorities, what do they confess?',
    primary_category: 'self_discovery',
    subcategory: 'ambitions',
    depth_level: 'reflective',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Notice the difference between what we claim to value and where our time actually flows.',
    follow_up_questions: [
      'Which habit brings you genuine tranquility versus temporary distraction?',
      'What small shift could realign your hours with your values?'
    ],
    content_tags: ['#discipline', '#habits', '#intentionality', '#clarity'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Curated Wisdom',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_self_03',
    question_text: 'What fear secretly guides some of your biggest life decisions without you consciously naming it?',
    primary_category: 'self_discovery',
    subcategory: 'fears',
    depth_level: 'philosophical',
    difficulty: 'advanced',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Often fear of abandonment, mediocrity, or failure masquerades as ambition or caution.',
    follow_up_questions: [
      'When did you first realize this fear was sitting in the driver’s seat?',
      'What would your next chapter look like if that fear lost its veto power?'
    ],
    content_tags: ['#courage', '#fears', '#subconscious', '#liberation'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Psychological Exploration',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 2. LOVE AND ROMANCE
  // =========================================================================
  {
    id: 'q_love_01',
    question_text: 'What does feeling truly emotionally safe with a romantic partner look like in practice?',
    primary_category: 'love_and_romance',
    subcategory: 'intimacy',
    depth_level: 'deep',
    difficulty: 'medium',
    sensitivity: 'intimate',
    audience_suitability: 'all_audiences',
    context_tip: 'Think about physical posture, how disagreements unfold, and unspoken allowances.',
    follow_up_questions: [
      'What behavior instantly erodes that feeling of sanctuary for you?',
      'How do you actively signal safety to someone you cherish?'
    ],
    content_tags: ['#emotional_safety', '#intimacy', '#vulnerability', '#romance'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Attachment & Relational Science',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_love_02',
    question_text: 'Is love primarily an involuntary feeling that happens to you, or a daily disciplined practice?',
    primary_category: 'love_and_romance',
    subcategory: 'commitment',
    depth_level: 'philosophical',
    difficulty: 'advanced',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Contemplate how lasting couples transition beyond early infatuation.',
    follow_up_questions: [
      'What is your definition of enduring commitment when the butterflies fade?',
      'What small daily ritual keeps emotional affection alive?'
    ],
    content_tags: ['#commitment', '#love_philosophy', '#devotion', '#relationships'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Couples Sanctuary',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_love_03',
    question_text: 'What is a tender romantic gesture that costs nothing, yet leaves a permanent imprint on your heart?',
    primary_category: 'love_and_romance',
    subcategory: 'affection',
    depth_level: 'casual',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Focus on small attentiveness: remembering a detail, a forehead kiss, or an unprompted cup of tea.',
    follow_up_questions: [
      'When did someone surprise you with subtle thoughtfulness?',
      'What love language resonates deepest when you are tired or overwhelmed?'
    ],
    content_tags: ['#affection', '#tenderness', '#romantic_gestures', '#heart'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Relational Resonance',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 3. FRIENDSHIP
  // =========================================================================
  {
    id: 'q_friend_01',
    question_text: 'What distinguishes a true kindred spirit friend from a pleasant social companion?',
    primary_category: 'friendship',
    subcategory: 'loyalty',
    depth_level: 'reflective',
    difficulty: 'medium',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Think about silence tolerance, honesty, and mutual celebration of each other’s triumphs.',
    follow_up_questions: [
      'How many people currently inhabit that kindred inner circle for you?',
      'How do you show up for friends during their quiet valleys?'
    ],
    content_tags: ['#friendship', '#loyalty', '#kindred_spirits', '#belonging'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Social Topology Study',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_friend_02',
    question_text: 'How do you handle setting a gentle boundary with a close friend without making them feel rejected?',
    primary_category: 'friendship',
    subcategory: 'boundaries',
    depth_level: 'deep',
    difficulty: 'advanced',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Healthy boundaries protect relationships; they do not penalize them.',
    follow_up_questions: [
      'What was the outcome the last time you communicated a needed limit?',
      'How do you receive boundaries when a friend expresses one to you?'
    ],
    content_tags: ['#boundaries', '#communication', '#healthy_friendship'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Relational Ethics',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 4. EMOTIONAL INTELLIGENCE
  // =========================================================================
  {
    id: 'q_eq_01',
    question_text: 'When you feel a sudden surge of irritation or anger, what softer emotion is usually hiding underneath?',
    primary_category: 'emotional_intelligence',
    subcategory: 'emotional_awareness',
    depth_level: 'deep',
    difficulty: 'advanced',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Anger is frequently a secondary bodyguard for fear, unexpressed hurt, or fatigue.',
    follow_up_questions: [
      'What physical bodily cue alerts you that irritation is rising?',
      'How has recognizing the underlying softness altered how you respond?'
    ],
    content_tags: ['#emotional_intelligence', '#anger_management', '#self_awareness'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Somatic Psychology',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_eq_02',
    question_text: 'What does meaningful empathy look like when you completely disagree with someone’s worldview?',
    primary_category: 'emotional_intelligence',
    subcategory: 'empathy',
    depth_level: 'philosophical',
    difficulty: 'advanced',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Differentiate between agreement with a belief and comprehension of the human pain behind it.',
    follow_up_questions: [
      'Can you think of a moment someone listened to you with grace despite disagreement?',
      'How does bridging that divide sharpen emotional maturity?'
    ],
    content_tags: ['#empathy', '#active_listening', '#perspective_taking'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Interpersonal Philosophy',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 5. LIFE EXPERIENCES
  // =========================================================================
  {
    id: 'q_life_01',
    question_text: 'What was a severe disappointment in your past that unexpectedly redirected you to a much richer path?',
    primary_category: 'life_experiences',
    subcategory: 'turning_points',
    depth_level: 'reflective',
    difficulty: 'medium',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Consider closed doors that forced you to discover untrodden landscapes.',
    follow_up_questions: [
      'How long did it take before you could view that closed door with gratitude?',
      'What strength did the adversity carve into your character?'
    ],
    content_tags: ['#resilience', '#turning_points', '#gratitude', '#wisdom'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Biographical Inquiry',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_life_02',
    question_text: 'Which childhood memory still evokes a profound sense of wonder whenever you remember it?',
    primary_category: 'life_experiences',
    subcategory: 'childhood',
    depth_level: 'casual',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Recall sights, smells, night skies, or uncomplicated play.',
    follow_up_questions: [
      'How can you invite a drop of that childlike wonder into your current week?',
      'Who shared that moment with you?'
    ],
    content_tags: ['#childhood', '#wonder', '#nostalgia', '#innocence'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Memoir Engine',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 6. IMAGINATION AND CREATIVITY
  // =========================================================================
  {
    id: 'q_imag_01',
    question_text: 'If you were guaranteed complete anonymity and unlimited resources for one creative year, what would you build?',
    primary_category: 'imagination_and_creativity',
    subcategory: 'dreams',
    depth_level: 'reflective',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Remove prestige, social media praise, and monetization from the equation.',
    follow_up_questions: [
      'Why haven’t you started a miniature version of this already?',
      'What medium calls to your hands: music, prose, architecture, code, or cinema?'
    ],
    content_tags: ['#creativity', '#dreams', '#imagination', '#unfiltered'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Creative Workshop',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_imag_02',
    question_text: 'In an alternate universe where you chose the opposite fork in the road at age 18, who is that person now?',
    primary_category: 'imagination_and_creativity',
    subcategory: 'alternate_lives',
    depth_level: 'philosophical',
    difficulty: 'medium',
    sensitivity: 'vulnerable',
    audience_suitability: 'all_audiences',
    context_tip: 'Picture their city, their accent, their quiet evening routine.',
    follow_up_questions: [
      'What part of them do you secretly envy or mourn?',
      'What truth about the life you DID choose are you profoundly proud of?'
    ],
    content_tags: ['#multiverse', '#alternate_paths', '#identity', '#imagination'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Cinematic Identity Series',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 7. FUN AND SOCIAL INTERACTION
  // =========================================================================
  {
    id: 'q_fun_01',
    question_text: 'Would you rather have the ability to speak every human language fluently, or speak with animals with mutual understanding?',
    primary_category: 'fun_and_social',
    subcategory: 'would_you_rather',
    depth_level: 'casual',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Consider travel, diplomacy, the secret thoughts of dogs, and existential companionship.',
    follow_up_questions: [
      'What is the very first conversation you would initiate with your choice?',
      'Which choice would teach you more about the mysteries of consciousness?'
    ],
    content_tags: ['#would_you_rather', '#icebreaker', '#fun', '#playful'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Party & Chemistry Vault',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_fun_02',
    question_text: 'What is a completely harmless, bizarre opinion or hill you will cheerfully die on?',
    primary_category: 'fun_and_social',
    subcategory: 'funny_questions',
    depth_level: 'casual',
    difficulty: 'easy',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'From cereal temperature to pineapple on pizza or airport arrival times.',
    follow_up_questions: [
      'How fiercely have you defended this at dinner tables?',
      'Has anyone ever successfully changed your mind?'
    ],
    content_tags: ['#quirks', '#humor', '#hot_takes', '#lighthearted'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Icebreaker Collective',
    approval_status: 'approved',
    is_daily_eligible: true
  },

  // =========================================================================
  // 8. DEEP CONVERSATIONS
  // =========================================================================
  {
    id: 'q_deep_01',
    question_text: 'Do you believe human consciousness is a rare, accidental candle flame in the dark cosmos, or the cosmos waking up to know itself?',
    primary_category: 'deep_conversations',
    subcategory: 'existential_questions',
    depth_level: 'philosophical',
    difficulty: 'advanced',
    sensitivity: 'existential',
    audience_suitability: 'all_audiences',
    context_tip: 'Contemplate astronomy, poetry, mortality, and our shared cosmic origin.',
    follow_up_questions: [
      'How does your answer affect your daily feelings toward strangers on the street?',
      'Does contemplating cosmic scale make you feel insignificant or remarkably precious?'
    ],
    content_tags: ['#cosmos', '#consciousness', '#philosophy', '#wonder'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Cosmic Reflection Circle',
    approval_status: 'approved',
    is_daily_eligible: true
  },
  {
    id: 'q_deep_02',
    question_text: 'If you had the power to instantly erase all collective human memory of one single concept or invention, what would you choose?',
    primary_category: 'deep_conversations',
    subcategory: 'morality',
    depth_level: 'philosophical',
    difficulty: 'advanced',
    sensitivity: 'general',
    audience_suitability: 'all_audiences',
    context_tip: 'Think about unintended ripple effects on culture, science, and empathy.',
    follow_up_questions: [
      'What positive byproduct might disappear along with it?',
      'What virtue would humanity have to invent in its place?'
    ],
    content_tags: ['#morality', '#society', '#ethics', '#deep_questions'],
    language: 'en',
    author_name: 'Soulverse Sanctuary',
    source_name: 'Moral Inquiry Framework',
    approval_status: 'approved',
    is_daily_eligible: true
  }
];
