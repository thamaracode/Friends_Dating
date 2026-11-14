import type {
  CoupleGameMeta,
  DiceOption,
  RouletteSlice,
  TruthOrDareCard,
  KamaSutraPosition,
  BottleChallenge,
  TimerChallenge,
  PartyGamePrompt
} from '../types/couplePlayHub';

export const COUPLE_GAMES_METADATA: CoupleGameMeta[] = [
  {
    id: 'sexy_dice',
    title: 'Super Sexy Dice',
    subtitle: 'Sensual multi-dice rolling with real physics',
    description: 'Roll for action, body part, and intensity. Customize 2-dice or 3-dice mode and progress from sweet romantic caresses to spicy bedroom exploration.',
    badge: 'Popular',
    iconName: 'Dices',
    accentColor: '#EC4899', // Pink
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 15,
    tags: ['Dice Physics', 'Custom Tiers', 'Sensual Touch']
  },
  {
    id: 'sex_roulette',
    title: 'Passion Roulette Wheel',
    subtitle: 'Spin the velvet wheel of intimate desires',
    description: '12 exciting sectors ranging from whispers and sensual massage to strip dares and sensory anticipation. Feel the excitement as the wheel slows down.',
    badge: 'Hot',
    iconName: 'Disc',
    accentColor: '#F59E0B', // Amber / Gold
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 20,
    tags: ['Spin Wheel', '12 Sectors', 'Erotic Dares']
  },
  {
    id: 'truth_or_dare',
    title: 'Couples Truth or Dare',
    subtitle: 'Vulnerability, deep curiosity & spicy physical dares',
    description: 'Uncover secrets and desires you have never shared before. Features 4 intimacy tiers from sweet vanilla conversation starters to wild boundary pushing.',
    badge: 'Trending',
    iconName: 'Flame',
    accentColor: '#EF4444', // Red
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 30,
    tags: ['100+ Cards', 'Intimacy Tiers', 'Turn-Based']
  },
  {
    id: 'kama_sutra',
    title: 'Kama Sutra Cards',
    subtitle: 'Artistic positions, emotional moods & bedroom inspiration',
    description: 'Curated intimate positions complete with difficulty ratings, emotional intimacy guidance, and tips to reignite passionate chemistry tonight.',
    badge: 'Sensual',
    iconName: 'Sparkles',
    accentColor: '#8B5CF6', // Purple
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 25,
    tags: ['Artistic Positions', 'Moods', 'Flexibility Tips']
  },
  {
    id: 'spin_bottle',
    title: 'Spin the Intimate Bottle',
    subtitle: 'Digital couples edition with dynamic touch challenges',
    description: 'Flick the bottle and let fate decide who initiates and who receives. Complete sensual challenges tailored specifically for two lovers.',
    badge: 'Classic',
    iconName: 'Wine',
    accentColor: '#10B981', // Emerald
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 15,
    tags: ['Bottle Spin', 'Mutual Dares', 'Spontaneous']
  },
  {
    id: 'sexy_timer',
    title: 'Rush Challenge: Sexy Timer',
    subtitle: 'Sensory missions against a pulsing countdown clock',
    description: 'Race against 30, 60, 90, 120, or 300 seconds to deliver breathless touches, kisses, or confessions before the gentle chime sounds.',
    badge: 'Intense',
    iconName: 'Timer',
    accentColor: '#06B6D4', // Cyan
    minPlayers: 2,
    maxPlayers: 2,
    estDurationMinutes: 10,
    tags: ['Pulsing Ring', 'Touch Missions', 'Fast Paced']
  },
  {
    id: 'party_games',
    title: 'Couples Party & Date Night',
    subtitle: 'Would You Rather, Never Have I Ever & Most Likely To',
    description: 'Playful psychological connection games perfect for an intimate evening on the sofa or double-date banter with close couple friends.',
    badge: 'Fun',
    iconName: 'PartyPopper',
    accentColor: '#F97316', // Orange
    minPlayers: 2,
    maxPlayers: 4,
    estDurationMinutes: 20,
    tags: ['Lovers Edition', 'Community Stats', 'Date Night']
  }
];

// ============================================================================
// 1. SEXY DICE DATA
// ============================================================================
export const DICE_ACTIONS: Record<string, string[]> = {
  vanilla: [
    'Kiss softly', 'Gentle massage', 'Whisper to', 'Trace fingers on', 'Caress', 'Warm hug from behind',
    'Tickle playfully', 'Blow warm breath on', 'Stare lovingly at', 'Praise', 'Brush lips against', 'Hold hands touching'
  ],
  pg: [
    'Nibble playfully', 'Trail light kisses along', 'Suck gently', 'Slow sensual rub', 'Lick teasingly',
    'Whisper a secret fantasy about', 'Firmly caress', 'Use your hair to tickle', 'Bite softly on', 'Feather touch'
  ],
  xxx: [
    'Deeply lick', 'Bite passionately', 'Passionate suction on', 'Sensual warm massage with oil on', 'Tease without touching center of',
    'Lick with ice cube across', 'Kiss all the way down', 'Slow rhythmic strokes on', 'Undress and caress', 'Blindfolded touch on'
  ],
  kinky: [
    'Lightly spank', 'Blindfold & surprise', 'Tie hands gently & tease', 'Command partner while touching',
    'Drip warm wax (or warm oil) on', 'Tease for 60 seconds with denial on', 'Firm gripping touch on', 'Ice cube trail then warm breath on'
  ]
};

export const DICE_BODY_PARTS: Record<string, string[]> = {
  vanilla: [
    'Lips', 'Cheek', 'Forehead', 'Nape of neck', 'Shoulders', 'Hands', 'Fingertips', 'Collarbone', 'Hair', 'Earlobes'
  ],
  pg: [
    'Neck', 'Ears', 'Collarbone', 'Back of knees', 'Lower back', 'Hip bones', 'Stomach', 'Inside of wrists', 'Inner arms'
  ],
  xxx: [
    'Inner thighs', 'Cleavage / Chest', 'Belly button down', 'Pelvis curve', 'Upper buttocks', 'Erogenous sweet spot', 'Back of thighs'
  ],
  kinky: [
    'Buttocks', 'Very inner crease of thigh', 'Arch of foot with feathers', 'Sensitive nape while pinned', 'Partner’s absolute choice'
  ]
};

export const DICE_STYLES_DURATIONS: Record<string, string[]> = {
  vanilla: [
    'For 30 Seconds', 'With eyes closed', 'While smiling', 'Extremely slowly', 'Softly humming', 'Holding eye contact'
  ],
  pg: [
    'For 45 Seconds', 'While breathing deeply', 'Whispering dirty sweet things', 'With teasing pauses', 'Alternating fast & slow'
  ],
  xxx: [
    'For 60 Seconds', 'With ice or warm breath', 'Passionate & breathless', 'Blindfolded', 'Under dim candlelight', 'With partner unable to speak'
  ],
  kinky: [
    'For 90 Seconds without stopping', 'With hands restrained', 'Partner must beg for more', 'Using only lips and tongue', 'While maintaining deep eye contact'
  ]
};

// ============================================================================
// 2. SEX ROULETTE WHEEL DATA
// ============================================================================
export const ROULETTE_SLICES: RouletteSlice[] = [
  {
    id: 'roulette_1',
    title: 'Sensual Neck Kiss',
    shortDesc: 'Trail soft lips down the collarbone',
    color: '#EC4899',
    icon: 'Heart',
    tier: 'vanilla',
    actionPrompt: 'Gently tilt partner’s head and place 10 slow, warm kisses along their jawline and down to their collarbone.'
  },
  {
    id: 'roulette_2',
    title: 'Whisper Fantasy',
    shortDesc: 'Confess a deep secret craving',
    color: '#8B5CF6',
    icon: 'MessageSquare',
    tier: 'pg',
    actionPrompt: 'Lean right into partner’s ear and whisper one vivid thing you’ve been dying to do with them tonight.'
  },
  {
    id: 'roulette_3',
    title: 'Spicy Dare',
    shortDesc: 'Remove an item of clothing with teeth',
    color: '#EF4444',
    icon: 'Flame',
    tier: 'xxx',
    actionPrompt: 'Remove one piece of your partner’s clothing using only your teeth and lips. Hands behind your back!'
  },
  {
    id: 'roulette_4',
    title: 'Sensory Blindfold',
    shortDesc: 'Blindfold partner for 2 minutes',
    color: '#6366F1',
    icon: 'EyeOff',
    tier: 'kinky',
    actionPrompt: 'Blindfold your partner. Use three different textures (fingertips, breath, fabric) to tease their skin without telling them what is next.'
  },
  {
    id: 'roulette_5',
    title: 'Deep French Kiss',
    shortDesc: '60 uninterrupted seconds of tongue kiss',
    color: '#F43F5E',
    icon: 'Smile',
    tier: 'vanilla',
    actionPrompt: 'Take your partner in your arms and share a passionate, tongue-entangled French kiss for 60 uninterrupted seconds.'
  },
  {
    id: 'roulette_6',
    title: 'Shoulder Massage',
    shortDesc: 'Firm hands releasing tension',
    color: '#10B981',
    icon: 'Hand',
    tier: 'vanilla',
    actionPrompt: 'Stand behind your partner and give them a firm, rhythmic 2-minute shoulder and upper back massage.'
  },
  {
    id: 'roulette_7',
    title: 'Ice or Fire',
    shortDesc: 'Temperature play across their stomach',
    color: '#06B6D4',
    icon: 'Snowflake',
    tier: 'xxx',
    actionPrompt: 'Run an ice cube (or blowing hot breath) from their chest down to their lower belly, following immediately with your warm lips.'
  },
  {
    id: 'roulette_8',
    title: 'Partner’s Command',
    shortDesc: 'Partner gets 1 free erotic command',
    color: '#F59E0B',
    icon: 'Crown',
    tier: 'kinky',
    actionPrompt: 'Partner has complete authority! They can issue one intimacy command that you must obey right now.'
  },
  {
    id: 'roulette_9',
    title: 'Slow Candle Dance',
    shortDesc: 'Body-to-body slow movement',
    color: '#D97706',
    icon: 'Music',
    tier: 'pg',
    actionPrompt: 'Stand close, pull partner against your hips, and slow dance to silence or music for 90 seconds feeling each other’s warmth.'
  },
  {
    id: 'roulette_10',
    title: 'Thigh Tease',
    shortDesc: 'Trace the forbidden border',
    color: '#E11D48',
    icon: 'Sparkles',
    tier: 'xxx',
    actionPrompt: 'Rest your partner back and slowly run your fingers up their inner thighs, stopping just millimeters away from the center.'
  },
  {
    id: 'roulette_11',
    title: 'Truthful Confession',
    shortDesc: 'When did you first feel lust for me?',
    color: '#3B82F6',
    icon: 'HelpCircle',
    tier: 'vanilla',
    actionPrompt: 'Look directly into partner’s eyes and recount the exact moment you first felt intense physical desire for them.'
  },
  {
    id: 'roulette_12',
    title: 'Lap Tease',
    shortDesc: 'Sit close and whisper',
    color: '#9333EA',
    icon: 'Zap',
    tier: 'pg',
    actionPrompt: 'Sit directly on your partner’s lap, wrap your arms around their neck, and deliver light bites to their earlobes.'
  }
];

// ============================================================================
// 3. TRUTH OR DARE CARDS
// ============================================================================
export const TRUTH_OR_DARE_DECK: TruthOrDareCard[] = [
  // Vanilla Truths
  {
    id: 'tod_t_v1',
    type: 'truth',
    tier: 'vanilla',
    category: 'Romantic Connection',
    chemistryPoints: 10,
    prompt: 'What was your very first thought when you saw me for the first time?'
  },
  {
    id: 'tod_t_v2',
    type: 'truth',
    tier: 'vanilla',
    category: 'Vulnerability',
    chemistryPoints: 15,
    prompt: 'What is one tiny habit of mine that secretly melts your heart every time I do it?'
  },
  {
    id: 'tod_t_v3',
    type: 'truth',
    tier: 'vanilla',
    category: 'Romance',
    chemistryPoints: 10,
    prompt: 'If we could escape to anywhere in the world tonight with zero phones, where would we go?'
  },
  {
    id: 'tod_t_v4',
    type: 'truth',
    tier: 'vanilla',
    category: 'Memory',
    chemistryPoints: 10,
    prompt: 'Which song reminds you most of our love or our chemistry?'
  },

  // Vanilla Dares
  {
    id: 'tod_d_v1',
    type: 'dare',
    tier: 'vanilla',
    category: 'Sweet Physical',
    chemistryPoints: 15,
    prompt: 'Give your partner a 60-second head and scalp massage with gentle finger stroking.'
  },
  {
    id: 'tod_d_v2',
    type: 'dare',
    tier: 'vanilla',
    category: 'Eye Contact',
    chemistryPoints: 20,
    prompt: 'Hold uninterrupted eye contact with your partner for 60 seconds without laughing or speaking.'
  },
  {
    id: 'tod_d_v3',
    type: 'dare',
    tier: 'vanilla',
    category: 'Affection',
    chemistryPoints: 15,
    prompt: 'Kiss your partner on three places that are NOT their lips.'
  },

  // PG Truths
  {
    id: 'tod_t_pg1',
    type: 'truth',
    tier: 'pg',
    category: 'Chemistry & Attraction',
    chemistryPoints: 20,
    prompt: 'What outfit or look of mine turns you on the most?'
  },
  {
    id: 'tod_t_pg2',
    type: 'truth',
    tier: 'pg',
    category: 'Teasing',
    chemistryPoints: 20,
    prompt: 'Have you ever had a dream about me that made you blush the next morning? What happened?'
  },
  {
    id: 'tod_t_pg3',
    type: 'truth',
    tier: 'pg',
    category: 'Desire',
    chemistryPoints: 25,
    prompt: 'What is your favorite part of my body to touch when nobody else is watching?'
  },

  // PG Dares
  {
    id: 'tod_d_pg1',
    type: 'dare',
    tier: 'pg',
    category: 'Sensory Tease',
    chemistryPoints: 25,
    prompt: 'Slowly unbutton or unzip one article of clothing from your partner while whispering praise in their ear.'
  },
  {
    id: 'tod_d_pg2',
    type: 'dare',
    tier: 'pg',
    category: 'Sensual',
    chemistryPoints: 25,
    prompt: 'Bite your partner’s bottom lip gently and hold it for three seconds before pulling back with a smile.'
  },
  {
    id: 'tod_d_pg3',
    type: 'dare',
    tier: 'pg',
    category: 'Touch',
    chemistryPoints: 30,
    prompt: 'Trace the silhouette of your partner’s body from waist to shoulder using only the tips of your fingernails.'
  },

  // XXX (Spicy) Truths
  {
    id: 'tod_t_xxx1',
    type: 'truth',
    tier: 'xxx',
    category: 'Erotic Desires',
    chemistryPoints: 35,
    prompt: 'What is one sexual fantasy you have fantasized about doing together, but have felt too shy to ask for out loud?'
  },
  {
    id: 'tod_t_xxx2',
    type: 'truth',
    tier: 'xxx',
    category: 'Intimacy Secrets',
    chemistryPoints: 35,
    prompt: 'Describe in detail the most intensely pleasurable moment we have ever shared in bed.'
  },
  {
    id: 'tod_t_xxx3',
    type: 'truth',
    tier: 'xxx',
    category: 'Anticipation',
    chemistryPoints: 40,
    prompt: 'If tonight was our wildest night ever with zero rules, what is the first thing you would do to me?'
  },

  // XXX (Spicy) Dares
  {
    id: 'tod_d_xxx1',
    type: 'dare',
    tier: 'xxx',
    category: 'Passionate Exploration',
    chemistryPoints: 40,
    prompt: 'Place your hands under your partner’s shirt and stroke their bare skin for 60 seconds without kissing.'
  },
  {
    id: 'tod_d_xxx2',
    type: 'dare',
    tier: 'xxx',
    category: 'Erotic Tease',
    chemistryPoints: 45,
    prompt: 'Kiss a trail from your partner’s neck all the way down to their waistband, lingering at their belly button.'
  },
  {
    id: 'tod_d_xxx3',
    type: 'dare',
    tier: 'xxx',
    category: 'Oral Sensation',
    chemistryPoints: 50,
    prompt: 'Take an ice cube into your mouth and kiss partner passionately until the ice completely melts.'
  },

  // Kinky Truths
  {
    id: 'tod_t_k1',
    type: 'truth',
    tier: 'kinky',
    category: 'Power & Surrender',
    chemistryPoints: 45,
    prompt: 'Do you prefer taking full dominant control, or completely surrendering control to me in the bedroom? Why?'
  },
  {
    id: 'tod_t_k2',
    type: 'truth',
    tier: 'kinky',
    category: 'Sensory Exploration',
    chemistryPoints: 50,
    prompt: 'What is a kink, roleplay, or unconventional fetish that turns you on when you think about it?'
  },

  // Kinky Dares
  {
    id: 'tod_d_k1',
    type: 'dare',
    tier: 'kinky',
    category: 'Restraint & Tease',
    chemistryPoints: 50,
    prompt: 'Restrain partner’s hands above their head with a scarf or tie. Tease them for 90 seconds while they cannot move.'
  },
  {
    id: 'tod_d_k2',
    type: 'dare',
    tier: 'kinky',
    category: 'Command & Obedience',
    chemistryPoints: 55,
    prompt: 'Kneel in front of your partner, look up into their eyes, and ask for permission before touching any part of their body.'
  },
  {
    id: 'tod_d_k3',
    type: 'dare',
    tier: 'kinky',
    category: 'Edging & Denial',
    chemistryPoints: 60,
    prompt: 'Bring partner right to the edge of heavy breathing with intense touch, then immediately stop and make them wait.'
  }
];

// ============================================================================
// 4. KAMA SUTRA CARDS
// ============================================================================
export const KAMA_SUTRA_POSITIONS: KamaSutraPosition[] = [
  {
    id: 'ks_lotus',
    title: 'The Sacred Lotus',
    sanskritName: 'Padmasana Intima',
    difficulty: 'Moderate',
    mood: 'Romantic',
    intimacyScore: 10,
    description: 'One partner sits cross-legged while the other sits directly in their lap, wrapping arms and legs around each other in deep mutual embrace.',
    tips: [
      'Synchronize your breathing with every movement.',
      'Maintain continuous eye contact or rest foreheads together.',
      'Slow, rhythmic circular rocking creates profound emotional and physical intimacy.'
    ]
  },
  {
    id: 'ks_velvet_arch',
    title: 'The Velvet Arch',
    sanskritName: 'Chhatra Asana',
    difficulty: 'Moderate',
    mood: 'Passionate',
    intimacyScore: 9,
    description: 'One partner lies on their back with hips elevated on pillows, legs gently resting over the other partner’s shoulders for intense deep contact.',
    tips: [
      'A firm pillow under the lower hips maximizes comfortable angles.',
      'Caress the inner calves and thighs while gently guiding rhythm.',
      'Allows both partners to see every expression of pleasure clearly.'
    ]
  },
  {
    id: 'ks_standing_orchid',
    title: 'The Standing Orchid',
    sanskritName: 'Utthita Asana',
    difficulty: 'Adventurous',
    mood: 'Erotic',
    intimacyScore: 8,
    description: 'Against a firm wall or bedroom door, one partner lifts the other, wrapping their thighs securely around the hips for spontaneous, passionate power.',
    tips: [
      'Start near a supportive counter or sturdy surface for leverage.',
      'Kiss deeply to maintain balance and physical connection.',
      'Incredible for spontaneous bursts of burning desire.'
    ]
  },
  {
    id: 'ks_bridge_of_whispers',
    title: 'The Whispering Spoons',
    sanskritName: 'Karnika Asana',
    difficulty: 'Gentle',
    mood: 'Sensual',
    intimacyScore: 10,
    description: 'Both partners lie on their sides curved together like nesting spoons. One partner embraces from behind, whispering into the nape of the other’s neck.',
    tips: [
      'Gentle lazy movements ideal for morning intimacy or late night unwinding.',
      'Leaves hands completely free to caress chest, stomach, and hips.',
      'Warm skin contact from head to toe.'
    ]
  },
  {
    id: 'ks_ocean_wave',
    title: 'The Ocean Wave',
    sanskritName: 'Taranga Asana',
    difficulty: 'Gentle',
    mood: 'Romantic',
    intimacyScore: 9,
    description: 'Face-to-face lying horizontal, one leg hooked over partner’s hip to lock bodies together. Intimate chest-to-chest contact with soft kisses throughout.',
    tips: [
      'Interlock fingers above the pillow.',
      'Take turns setting the slow ocean wave rhythm.',
      'Unsurpassed for tender soul-bonding.'
    ]
  },
  {
    id: 'ks_royal_canopy',
    title: 'The Empress Canopy',
    sanskritName: 'Virajita Asana',
    difficulty: 'Gentle',
    mood: 'Playful',
    intimacyScore: 9,
    description: 'One partner lies comfortably relaxed on their back while the other partner sits upright on top, having total control over angle, tempo, and depth.',
    tips: [
      'The sitting partner can lean forward for kisses or arch back for clitoral stimulation.',
      'The reclining partner can cup partner’s hips to guide tempo gently.',
      'Empowering and effortlessly pleasurable.'
    ]
  }
];

// ============================================================================
// 5. SPIN THE BOTTLE CHALLENGES
// ============================================================================
export const BOTTLE_CHALLENGES: BottleChallenge[] = [
  {
    id: 'bot_1',
    tier: 'vanilla',
    target: 'initiator',
    prompt: 'Deliver 5 slow kisses to partner’s cheek, jaw, nose, forehead, and lips in sequence.',
    timeLimitSeconds: 30
  },
  {
    id: 'bot_2',
    tier: 'pg',
    target: 'initiator',
    prompt: 'Whisper into partner’s ear the exact outfit they own that makes your heart race.',
    timeLimitSeconds: 45
  },
  {
    id: 'bot_3',
    tier: 'xxx',
    target: 'mutual',
    prompt: 'Both of you must share a heated French kiss while one partner’s hands are pinned above their head.',
    timeLimitSeconds: 60
  },
  {
    id: 'bot_4',
    tier: 'kinky',
    target: 'receiver',
    prompt: 'Partner gets to blindfold you and lightly trace an ice cube down your throat and chest.',
    timeLimitSeconds: 90
  },
  {
    id: 'bot_5',
    tier: 'vanilla',
    target: 'mutual',
    prompt: 'Look into each other’s eyes and say three genuine things you adore about each other’s personality.',
    timeLimitSeconds: 60
  },
  {
    id: 'bot_6',
    tier: 'pg',
    target: 'initiator',
    prompt: 'Give partner a 45-second neck and collarbone nibble with warm breath in between.',
    timeLimitSeconds: 45
  },
  {
    id: 'bot_7',
    tier: 'xxx',
    target: 'initiator',
    prompt: 'Remove your partner’s socks or shirt using only your teeth without hands touching.',
    timeLimitSeconds: 60
  }
];

// ============================================================================
// 6. SEXY TIMER CHALLENGES
// ============================================================================
export const TIMER_CHALLENGES: TimerChallenge[] = [
  {
    id: 'tim_30s_1',
    tier: 'vanilla',
    durationSeconds: 30,
    title: 'The Breathless Rapid Kiss',
    instructions: 'Plant as many gentle, loving kisses on partner’s face, neck, and hands as you can before the clock expires.',
    sensoryFocus: 'Soft lips & laughter'
  },
  {
    id: 'tim_60s_1',
    tier: 'pg',
    durationSeconds: 60,
    title: 'Feather Silhouette Tease',
    instructions: 'Trace partner’s entire body using only the tips of your fingernails. You must never let your skin lose contact.',
    sensoryFocus: 'Goosebumps & tingling'
  },
  {
    id: 'tim_60s_2',
    tier: 'xxx',
    durationSeconds: 60,
    title: 'The Silent Lip Lock',
    instructions: 'Deep French kiss without making any vocal sound. If either person giggles or sighs, add 30 seconds!',
    sensoryFocus: 'Passionate suction & tension'
  },
  {
    id: 'tim_90s_1',
    tier: 'xxx',
    durationSeconds: 90,
    title: 'Inner Thigh Border Trail',
    instructions: 'Kiss a path along partner’s inner thighs, getting tantalizingly closer to the center with every second without touching it.',
    sensoryFocus: 'Anticipation & heavy breathing'
  },
  {
    id: 'tim_120s_1',
    tier: 'vanilla',
    durationSeconds: 120,
    title: 'Tension-Melting Shoulder Rub',
    instructions: 'Kneel behind your partner and deliver deep, rhythmic thumb circles into their traps, neck, and shoulder blades.',
    sensoryFocus: 'Warm release & deep sighing'
  },
  {
    id: 'tim_300s_1',
    tier: 'kinky',
    durationSeconds: 300,
    title: 'The 5-Minute Surrender & Tease',
    instructions: 'One partner lies completely still with arms open. The other partner explores every inch of skin with hot breath, kisses, and teasing pauses. No rush.',
    sensoryFocus: 'Total surrender & heightened senses'
  }
];

// ============================================================================
// 7. COUPLES PARTY & DATE NIGHT GAMES
// ============================================================================
export const PARTY_GAME_PROMPTS: PartyGamePrompt[] = [
  // Would You Rather: Lovers Edition
  {
    id: 'wyr_1',
    gameMode: 'would_you_rather',
    tier: 'pg',
    question: 'Would you rather have a candlelit bubble bath with champagne or a spontaneous midnight road trip to the beach under the stars?',
    optionA: 'Candlelit Bubble Bath & Wine',
    optionB: 'Midnight Beach Road Trip',
    stats: { optionAPercent: 54, optionBPercent: 46, totalVotes: 1420 }
  },
  {
    id: 'wyr_2',
    gameMode: 'would_you_rather',
    tier: 'xxx',
    question: 'Would you rather have passionate lovemaking in an exhilarating semi-public place or a 2-hour sensory marathon in a 5-star suite?',
    optionA: 'Thrilling Semi-Public Adventure',
    optionB: '2-Hour Luxury Suite Marathon',
    stats: { optionAPercent: 41, optionBPercent: 59, totalVotes: 2310 }
  },
  {
    id: 'wyr_3',
    gameMode: 'would_you_rather',
    tier: 'kinky',
    question: 'Would you rather be blindfolded with zero idea of what comes next, or be in complete command of your partner for an entire evening?',
    optionA: 'Blindfolded & Surrendered',
    optionB: 'Complete Seductive Command',
    stats: { optionAPercent: 48, optionBPercent: 52, totalVotes: 1890 }
  },

  // Never Have I Ever: Couples Edition
  {
    id: 'nhie_1',
    gameMode: 'never_have_i_ever',
    tier: 'vanilla',
    question: 'Never have I ever stalked my partner’s old social media photos from years before we met.',
    stats: { optionAPercent: 78, optionBPercent: 22, totalVotes: 3200 }
  },
  {
    id: 'nhie_2',
    gameMode: 'never_have_i_ever',
    tier: 'pg',
    question: 'Never have I ever sent a risky photo while sitting in a boring work meeting or lecture.',
    stats: { optionAPercent: 62, optionBPercent: 38, totalVotes: 2450 }
  },
  {
    id: 'nhie_3',
    gameMode: 'never_have_i_ever',
    tier: 'xxx',
    question: 'Never have I ever had intense romantic thoughts about my partner while looking at them across a crowded dinner table.',
    stats: { optionAPercent: 89, optionBPercent: 11, totalVotes: 4120 }
  },

  // Most Likely To
  {
    id: 'mlt_1',
    gameMode: 'most_likely_to',
    tier: 'vanilla',
    question: 'Who is most likely to initiate spontaneous cuddling when one of us is trying to be productive?',
    stats: { optionAPercent: 51, optionBPercent: 49, totalVotes: 1850 }
  },
  {
    id: 'mlt_2',
    gameMode: 'most_likely_to',
    tier: 'pg',
    question: 'Who is most likely to whisper something shockingly naughty in public right when someone is walking past?',
    stats: { optionAPercent: 43, optionBPercent: 57, totalVotes: 2100 }
  },
  {
    id: 'mlt_3',
    gameMode: 'most_likely_to',
    tier: 'xxx',
    question: 'Who is most likely to pull the other person into the shower without asking first?',
    stats: { optionAPercent: 64, optionBPercent: 36, totalVotes: 2980 }
  }
];
