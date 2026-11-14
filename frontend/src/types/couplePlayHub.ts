export type IntimacyTier = 'vanilla' | 'pg' | 'xxx' | 'kinky';

export type CoupleGameId = 
  | 'sexy_dice'
  | 'sex_roulette'
  | 'truth_or_dare'
  | 'kama_sutra'
  | 'spin_bottle'
  | 'sexy_timer'
  | 'party_games';

export interface CoupleGameMeta {
  id: CoupleGameId;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: string;
  accentColor: string;
  minPlayers: number;
  maxPlayers: number;
  estDurationMinutes: number;
  tags: string[];
}

export interface DiceOption {
  id: string;
  label: string;
  tier: IntimacyTier;
  category: 'action' | 'body_part' | 'duration_style';
}

export interface DiceRollResult {
  action: string;
  bodyPart: string;
  durationOrStyle?: string;
  tier: IntimacyTier;
  diceValues: [number, number, number?];
  rolledAt: number;
}

export interface RouletteSlice {
  id: string;
  title: string;
  shortDesc: string;
  color: string;
  icon: string;
  tier: IntimacyTier;
  actionPrompt: string;
}

export interface TruthOrDareCard {
  id: string;
  type: 'truth' | 'dare';
  tier: IntimacyTier;
  prompt: string;
  chemistryPoints: number;
  category: string;
}

export interface KamaSutraPosition {
  id: string;
  title: string;
  sanskritName?: string;
  difficulty: 'Gentle' | 'Moderate' | 'Adventurous';
  mood: 'Romantic' | 'Passionate' | 'Sensual' | 'Erotic' | 'Playful';
  description: string;
  tips: string[];
  intimacyScore: number; // 1-10
  imageUrl?: string;
  favorite?: boolean;
}

export interface BottleChallenge {
  id: string;
  tier: IntimacyTier;
  target: 'initiator' | 'receiver' | 'mutual';
  prompt: string;
  timeLimitSeconds?: number;
}

export interface TimerChallenge {
  id: string;
  tier: IntimacyTier;
  durationSeconds: number;
  title: string;
  instructions: string;
  sensoryFocus: string;
}

export interface PartyGamePrompt {
  id: string;
  gameMode: 'would_you_rather' | 'never_have_i_ever' | 'most_likely_to';
  tier: IntimacyTier;
  question: string;
  optionA?: string;
  optionB?: string;
  stats?: { optionAPercent: number; optionBPercent: number; totalVotes: number };
}

export interface CoupleGameSession {
  sessionId: string;
  gameId: CoupleGameId;
  partner1Name: string;
  partner2Name: string;
  currentTurn: 'partner1' | 'partner2' | 'mutual';
  activeTier: IntimacyTier;
  score: {
    partner1: number;
    partner2: number;
  };
  roundsPlayed: number;
  recentResults: string[];
  lastUpdated: number;
}
