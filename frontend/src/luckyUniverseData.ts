export interface LuckyDiceRollResult {
  diceValue: 1 | 2 | 3 | 4 | 5 | 6;
  activityName: string;
  description: string;
  actionType: 'question' | 'secret' | 'mini_game' | 'compliment' | 'truth_or_dare' | 'challenge';
}

export const LUCKY_DICE_OUTCOMES: Record<number, LuckyDiceRollResult> = {
  1: {
    diceValue: 1,
    activityName: 'Ask a Random Question',
    description: 'Ask anything without overthinking. They have to answer sincerely.',
    actionType: 'question'
  },
  2: {
    diceValue: 2,
    activityName: 'Share a Harmless Secret',
    description: 'Confess one quirky habit, weird childhood fear, or guilty pleasure.',
    actionType: 'secret'
  },
  3: {
    diceValue: 3,
    activityName: 'Choose a Mini-Game',
    description: 'Pick Would You Rather or Two Truths and a Lie to play right now.',
    actionType: 'mini_game'
  },
  4: {
    diceValue: 4,
    activityName: 'Give a Thoughtful Compliment',
    description: 'Compliment something non-physical you noticed about their vibe or answers.',
    actionType: 'compliment'
  },
  5: {
    diceValue: 5,
    activityName: 'Truth or Dare',
    description: 'Launch an instant, consensual Truth or Dare round!',
    actionType: 'truth_or_dare'
  },
  6: {
    diceValue: 6,
    activityName: 'Conversation Challenge',
    description: 'Describe your perfect day in only 5 words or emojis.',
    actionType: 'challenge'
  }
};

export interface CollectibleCube {
  id: string;
  name: string;
  category: 'romance' | 'adventure' | 'deep' | 'mystery' | 'comedy';
  colorGradient: string;
  description: string;
  cardCount: number;
  samplePrompt: string;
  unlocked: boolean;
  costInCoins: number;
}

export const THEMED_CUBES: CollectibleCube[] = [
  {
    id: 'cube_romance',
    name: 'Romance Cube',
    category: 'romance',
    colorGradient: 'from-rose-500 to-pink-500',
    description: 'Tender questions, green flags, and romantic hypothetical scenarios.',
    cardCount: 25,
    samplePrompt: "What does genuine emotional safety look like in a relationship?",
    unlocked: true,
    costInCoins: 0
  },
  {
    id: 'cube_deep',
    name: 'Midnight Deep Talk Cube',
    category: 'deep',
    colorGradient: 'from-purple-600 to-indigo-600',
    description: 'Existential curiosities, life philosophies, and unsaid thoughts.',
    cardCount: 30,
    samplePrompt: "What is one belief you held strongly five years ago that you've let go of?",
    unlocked: true,
    costInCoins: 0
  },
  {
    id: 'cube_mystery',
    name: 'Mystery Mask Cube',
    category: 'mystery',
    colorGradient: 'from-amber-500 to-rose-600',
    description: 'Anonymous icebreakers and imaginative alter-ego challenges.',
    cardCount: 20,
    samplePrompt: "If nobody knew who you were for 24 hours, what would you create?",
    unlocked: false,
    costInCoins: 50
  },
  {
    id: 'cube_comedy',
    name: 'Unhinged Comedy Cube',
    category: 'comedy',
    colorGradient: 'from-emerald-400 to-teal-600',
    description: 'Wild dilemmas, terrible pickup lines, and funny villain origin stories.',
    cardCount: 28,
    samplePrompt: "What is the most ridiculous conspiracy theory you secretly want to be true?",
    unlocked: false,
    costInCoins: 75
  }
];

export interface WalletTransaction {
  id: string;
  idempotencyKey: string;
  type: 'earned' | 'spent';
  amount: number;
  reason: string;
  timestamp: string;
}

export interface UserWallet {
  balance: number;
  transactions: WalletTransaction[];
}

export const INITIAL_WALLET: UserWallet = {
  balance: 140,
  transactions: [
    {
      id: 'tx_1',
      idempotencyKey: 'idem_onboarding_001',
      type: 'earned',
      amount: 50,
      reason: 'Completed 8-Chapter Profile',
      timestamp: 'Yesterday'
    },
    {
      id: 'tx_2',
      idempotencyKey: 'idem_daily_icebreaker_002',
      type: 'earned',
      amount: 40,
      reason: 'Answered Daily Hypothetical Universe Question',
      timestamp: 'Today, 9:00 AM'
    },
    {
      id: 'tx_3',
      idempotencyKey: 'idem_first_match_003',
      type: 'earned',
      amount: 50,
      reason: 'First Mutual Connection Achievement',
      timestamp: 'Today, 11:30 AM'
    }
  ]
};
