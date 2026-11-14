import crypto from 'crypto';
import { db } from '../db';
import { 
  GameType, 
  GameSession, 
  TruthOrDareItem, 
  QuestionGameItem, 
  DiceRollResult, 
  CoinFlipResult 
} from './types';

// =========================================================================
// CURATED CONTENT DECKS FOR EXTENSIBLE MINI-GAMES
// =========================================================================

export const TRUTH_OR_DARE_DECK: TruthOrDareItem[] = [
  // PG / Playful
  { id: 'tod_t_pg_1', type: 'truth', tier: 'pg', prompt: 'What is the most bizarre rabbit hole you fell into at 2 AM?' },
  { id: 'tod_t_pg_2', type: 'truth', tier: 'pg', prompt: 'What song is your ultimate guilty pleasure that nobody knows you listen to?' },
  { id: 'tod_d_pg_1', type: 'dare', tier: 'pg', prompt: 'Send a 5-second voice note saying the alphabet backwards as fast as you can.' },
  { id: 'tod_d_pg_2', type: 'dare', tier: 'pg', prompt: 'Take a photo of the nearest object to your left and invent a dramatic history for it.' },

  // Romantic
  { id: 'tod_t_rom_1', type: 'truth', tier: 'romantic', prompt: 'What subtle gesture from someone makes your heart skip a beat instantly?' },
  { id: 'tod_t_rom_2', type: 'truth', tier: 'romantic', prompt: 'Do you believe two people can fall in love through words alone before ever meeting?' },
  { id: 'tod_d_rom_1', type: 'dare', tier: 'romantic', prompt: 'Write a two-line poetic description of the sky outside your window right now and share it.' },
  { id: 'tod_d_rom_2', type: 'dare', tier: 'romantic', prompt: 'Record a gentle 10-second whisper sharing one sincere compliment for me.' },

  // Deep
  { id: 'tod_t_deep_1', type: 'truth', tier: 'deep', prompt: 'What is an emotional boundary you had to learn the hard way through heartbreak?' },
  { id: 'tod_t_deep_2', type: 'truth', tier: 'deep', prompt: 'If you could apologize to one person from your past with guaranteed forgiveness, who would it be?' },
  { id: 'tod_d_deep_1', type: 'dare', tier: 'deep', prompt: 'Share the unedited title of the last note in your phone that holds your raw thoughts.' },
  { id: 'tod_d_deep_2', type: 'dare', tier: 'deep', prompt: 'Tell the story of a defining crossroads in your life where you chose courage over safety.' },

  // Spicy / Intimate
  { id: 'tod_t_spicy_1', type: 'truth', tier: 'spicy', prompt: 'What is your most intense attraction trigger: intellect, voice, eye contact, or hands?' },
  { id: 'tod_t_spicy_2', type: 'truth', tier: 'spicy', prompt: 'What is the most memorable romantic tension you ever experienced in a quiet public room?' },
  { id: 'tod_d_spicy_1', type: 'dare', tier: 'spicy', prompt: 'Describe in three sensory words how you feel right now in this conversation.' },
  { id: 'tod_d_spicy_2', type: 'dare', tier: 'spicy', prompt: 'Send a photo of your eyes looking directly into the camera lens with no smile.' }
];

export const QUESTION_GAMES_DECK: QuestionGameItem[] = [
  // Would You Rather
  {
    id: 'wyr_1',
    category: 'would_you_rather',
    optionA: 'Spend a rainy night talking by a fireplace with no internet',
    optionB: 'Explore an unknown foreign city together at 3 AM with headphones',
    questionText: 'Would you rather have a sanctuary night or an midnight exploration?'
  },
  {
    id: 'wyr_2',
    category: 'would_you_rather',
    optionA: 'Have a partner who speaks your exact love language effortlessly',
    optionB: 'Have a partner who challenges your worldview and makes you think deeply',
    questionText: 'Would you rather effortless comfort or intellectual evolution?'
  },
  {
    id: 'wyr_3',
    category: 'would_you_rather',
    optionA: 'Know the exact date you will meet your forever soulmate',
    optionB: 'Let it happen as a complete organic surprise when least expecting it',
    questionText: 'Would you rather prophetic certainty or romantic serendipity?'
  },

  // Deep Chemistry
  {
    id: 'dc_1',
    category: 'deep_chemistry',
    questionText: 'When life feels overwhelming, do you pull inward to self-regulate, or do you crave physical closeness and conversation?',
    context: 'Attachment & Regulation Chemistry'
  },
  {
    id: 'dc_2',
    category: 'deep_chemistry',
    questionText: 'What is something you deeply care about that you rarely bring up because most people do not understand it?',
    context: 'Intellectual & Spiritual Resonance'
  }
];

export class InteractiveGamesEngine {
  /**
   * Starts or resumes a server-authoritative game session in a conversation
   */
  public static startGameSession(
    conversationId: string, 
    gameType: GameType, 
    userId: string
  ): GameSession {
    const id = `game_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    let initialState: Record<string, any> = {};

    switch (gameType) {
      case 'truth_or_dare':
        initialState = {
          tier: 'romantic',
          history: [],
          turnUser: userId,
          pendingAction: null
        };
        break;

      case 'would_you_rather':
      case 'compatibility_quiz':
        const initialQuestion = QUESTION_GAMES_DECK[crypto.randomInt(0, QUESTION_GAMES_DECK.length)];
        initialState = {
          currentQuestionId: initialQuestion.id,
          question: initialQuestion,
          answers: {},
          score: null
        };
        break;

      case 'lucky_dice':
        initialState = {
          rollsHistory: [],
          lastRoll: null
        };
        break;

      case 'coin_flip':
        initialState = {
          flipsHistory: [],
          lastFlip: null
        };
        break;

      case 'collaborative_challenge':
        initialState = {
          challengeType: 'story_chain',
          prompt: 'The clock struck 3:17 AM when an unexpected signal illuminated the screen...',
          turns: [{ userId, text: 'The clock struck 3:17 AM when an unexpected signal illuminated the screen...', timestamp: now }],
          maxTurns: 10
        };
        break;

      case 'icebreaker_prompt':
        initialState = {
          prompt: 'If tonight were our only conversation, what is one truth you would want me to understand about you?',
          responses: {}
        };
        break;

      default:
        initialState = { turn: userId };
    }

    db.prepare(`
      INSERT INTO game_sessions (
        id, conversation_id, game_type, current_turn_user_id, state_json, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(id, conversationId, gameType, userId, JSON.stringify(initialState), now, now);

    return {
      id,
      conversationId,
      gameType,
      currentTurnUserId: userId,
      state: initialState,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Draws a card for Truth or Dare with tier filtering
   */
  public static drawTruthOrDareCard(
    type: 'truth' | 'dare',
    tier: 'pg' | 'romantic' | 'deep' | 'spicy' = 'romantic'
  ): TruthOrDareItem {
    const pool = TRUTH_OR_DARE_DECK.filter(item => item.type === type && item.tier === tier);
    const chosen = pool.length > 0 
      ? pool[crypto.randomInt(0, pool.length)]
      : TRUTH_OR_DARE_DECK[crypto.randomInt(0, TRUTH_OR_DARE_DECK.length)];

    return chosen;
  }

  /**
   * Performs a cryptographically fair dice roll with 1, 2, or 3 dice
   */
  public static rollDice(count: number = 2): DiceRollResult {
    const safeCount = Math.max(1, Math.min(count, 3));
    const values: number[] = [];

    for (let i = 0; i < safeCount; i++) {
      values.push(crypto.randomInt(1, 7)); // 1 to 6
    }

    const sum = values.reduce((a, b) => a + b, 0);

    const actions = [
      'Whisper an authentic secret',
      'Share a playlist track that represents this feeling',
      'Exchange a 15-second voice note',
      'Answer the next question without any deflection',
      'Send a high-definition candid photo of your environment',
      'Grant a free question pass to the other person'
    ];

    const actionText = actions[(sum - safeCount) % actions.length];

    return {
      diceCount: safeCount,
      values,
      sum,
      actionText,
      timestamp: Date.now()
    };
  }

  /**
   * Performs a cryptographically fair coin flip
   */
  public static flipCoin(): CoinFlipResult {
    const randomByte = crypto.randomBytes(1)[0];
    const outcome = (randomByte % 2 === 0) ? 'heads' : 'tails';
    const flipSeed = crypto.randomBytes(8).toString('hex');

    return {
      outcome,
      flipSeed,
      timestamp: Date.now()
    };
  }

  /**
   * Submits a move/response to a game session and updates server state
   */
  public static submitGameTurn(
    gameId: string, 
    userId: string, 
    actionPayload: Record<string, any>
  ): GameSession {
    const row = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(gameId) as any;
    if (!row) {
      throw new Error('Game session not found');
    }

    const currentState = JSON.parse(row.state_json);
    const now = Date.now();

    // Process action per game type
    if (row.game_type === 'truth_or_dare') {
      if (actionPayload.action === 'draw') {
        const card = this.drawTruthOrDareCard(actionPayload.type || 'truth', actionPayload.tier || currentState.tier);
        currentState.pendingAction = card;
        currentState.history.push({ action: 'draw', userId, card, timestamp: now });
      } else if (actionPayload.action === 'complete') {
        currentState.history.push({ action: 'completed', userId, note: actionPayload.note || 'Done', timestamp: now });
        currentState.pendingAction = null;
      }
    } else if (row.game_type === 'collaborative_challenge') {
      if (actionPayload.text) {
        currentState.turns.push({ userId, text: actionPayload.text.trim(), timestamp: now });
        if (currentState.turns.length >= (currentState.maxTurns || 10)) {
          row.status = 'completed';
        }
      }
    } else if (row.game_type === 'would_you_rather') {
      currentState.answers[userId] = actionPayload.choice;
    } else if (row.game_type === 'lucky_dice') {
      const roll = this.rollDice(actionPayload.diceCount || 2);
      currentState.lastRoll = roll;
      currentState.rollsHistory.push({ userId, roll, timestamp: now });
    } else if (row.game_type === 'coin_flip') {
      const flip = this.flipCoin();
      currentState.lastFlip = flip;
      currentState.flipsHistory.push({ userId, flip, timestamp: now });
    }

    db.prepare(`
      UPDATE game_sessions 
      SET state_json = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(currentState), row.status, now, gameId);

    return {
      id: row.id,
      conversationId: row.conversation_id,
      gameType: row.game_type,
      currentTurnUserId: userId,
      state: currentState,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: now
    };
  }
}
