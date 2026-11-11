export type GameType = 'truth_or_dare' | 'would_you_rather' | 'two_truths_one_lie' | 'question_roulette';

export type GameSessionStatus = 
  | 'CREATED'
  | 'INVITED'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface TruthOrDareItem {
  id: string;
  type: 'truth' | 'dare';
  category: 'funny' | 'deep' | 'romantic' | 'adventure' | 'flirty';
  prompt: string;
  difficulty: 'easy' | 'medium' | 'spicy';
}

export const TRUTH_OR_DARE_ITEMS: TruthOrDareItem[] = [
  {
    id: 'tod_1',
    type: 'truth',
    category: 'deep',
    prompt: "What is something people misunderstand about you before they get to know you?",
    difficulty: 'easy'
  },
  {
    id: 'tod_2',
    type: 'truth',
    category: 'romantic',
    prompt: "What was your very first thought when you looked at my profile / answers?",
    difficulty: 'medium'
  },
  {
    id: 'tod_3',
    type: 'truth',
    category: 'funny',
    prompt: "What is the most embarrassing song or artist you love without any guilt?",
    difficulty: 'easy'
  },
  {
    id: 'tod_4',
    type: 'dare',
    category: 'flirty',
    prompt: "Send a 10-second voice note saying something you find charming about me.",
    difficulty: 'medium'
  },
  {
    id: 'tod_5',
    type: 'dare',
    category: 'funny',
    prompt: "Describe your ideal first date using only three emojis and make me guess what it is.",
    difficulty: 'easy'
  },
  {
    id: 'tod_6',
    type: 'truth',
    category: 'deep',
    prompt: "What is a promise you made to yourself that you refuse to break?",
    difficulty: 'medium'
  }
];

export interface WouldYouRatherItem {
  id: string;
  optionA: string;
  optionB: string;
  category: 'funny' | 'romantic' | 'adventure' | 'mindset';
  votesCountA: number;
  votesCountB: number;
}

export const WOULD_YOU_RATHER_ITEMS: WouldYouRatherItem[] = [
  {
    id: 'wyr_1',
    optionA: "Travel 100 years into the future together for 1 hour",
    optionB: "Travel 100 years into the past with zero modern tech for 1 month",
    category: 'adventure',
    votesCountA: 64,
    votesCountB: 36
  },
  {
    id: 'wyr_2',
    optionA: "Have someone who instantly understands your humor without explaining",
    optionB: "Have someone who always knows when you need silence without asking",
    category: 'romantic',
    votesCountA: 48,
    votesCountB: 52
  },
  {
    id: 'wyr_3',
    optionA: "Live in an isolated beach cabin with a private library and rain every night",
    optionB: "Live in a bustling rooftop penthouse in Tokyo with neon city views",
    category: 'mindset',
    votesCountA: 72,
    votesCountB: 28
  }
];

export interface GameSession {
  gameId: string;
  sessionId: string;
  gameType: GameType;
  category: string;
  participantIds: string[];
  partnerName: string;
  currentTurnUserId: string;
  roundNumber: number;
  status: GameSessionStatus;
  lastActionSummary?: string;
}
