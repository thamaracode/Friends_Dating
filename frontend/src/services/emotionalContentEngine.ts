/**
 * The Hidden Emotional Layer & Question Universe Content Engine
 * Architecture: Relational Atmosphere, Serendipitous Moments & The Inner Room
 */

import type { 
  EmotionalContentItem, 
  UnopenedLetter, 
  TwoPersonQuestion, 
  UnsentWord,
  TheMirrorObservation,
  ContentMood,
  TargetPage
} from '../types/emotionalUniverse';

export const EMOTIONAL_QUESTIONS_LIBRARY: EmotionalContentItem[] = [
  // =========================================================================
  // CATEGORY 1: LOVE & ROMANTIC PSYCHOLOGY
  // =========================================================================
  {
    id: 'eq_love_1',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'romantic',
    targetPage: 'discover',
    content: 'What makes you fall for someone’s personality rather than just their appearance?',
    subtext: 'Beyond surface attraction—what draws you into someone’s world?',
    tags: ['Attraction', 'Depth', 'Romance']
  },
  {
    id: 'eq_love_2',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'philosophical',
    targetPage: 'discover',
    content: 'Do you prefer being understood or being admired?',
    subtext: 'One offers vanity, the other offers safety.',
    tags: ['Vulnerability', 'Intimacy']
  },
  {
    id: 'eq_love_3',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'romantic',
    targetPage: 'inbox',
    content: 'What is more romantic to you: someone remembering little details or someone making grand gestures?',
    subtext: 'Small everyday consistency vs grand cinematic surprises.',
    tags: ['Romance', 'LoveLanguages']
  },
  {
    id: 'eq_love_4',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'vulnerable',
    targetPage: 'unspoken',
    content: 'Can you love someone and still know they aren’t right for your life?',
    subtext: 'Navigating the quiet grief of loving someone you cannot be with.',
    tags: ['Heartbreak', 'Maturity']
  },
  {
    id: 'eq_love_5',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'curious',
    targetPage: 'discover',
    content: 'What makes someone emotionally attractive to you?',
    subtext: 'The presence, tone, and empathy that creates a magnetic pull.',
    tags: ['Chemistry', 'EmotionalIQ']
  },
  {
    id: 'eq_love_6',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'comforting',
    targetPage: 'discover',
    content: 'Do you believe love should feel peaceful or should it feel exciting?',
    subtext: 'Calm sanctuary vs exhilarating spark.',
    tags: ['Sanctuary', 'Love']
  },
  {
    id: 'eq_love_7',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'hopeful',
    targetPage: 'profile',
    content: 'What is something you wish your future partner would naturally understand about you?',
    subtext: 'The part of you that usually requires long explanations.',
    tags: ['Understanding', 'Partnership']
  },
  {
    id: 'eq_love_8',
    contentType: 'question',
    category: 'love_psychology',
    mood: 'vulnerable',
    targetPage: 'unspoken',
    content: 'What makes you feel chosen rather than simply wanted?',
    subtext: 'Active devotion vs opportunistic affection.',
    tags: ['Commitment', 'Trust']
  },

  // =========================================================================
  // CATEGORY 2: THE THINGS PEOPLE RARELY ADMIT
  // =========================================================================
  {
    id: 'eq_rare_1',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'vulnerable',
    targetPage: 'discover',
    content: 'Do you miss someone, or do you miss who you were when you were with them?',
    subtext: 'Untangling nostalgia from genuine longing.',
    tags: ['Honesty', 'Nostalgia']
  },
  {
    id: 'eq_rare_2',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'vulnerable',
    targetPage: 'unspoken',
    content: 'Do you sometimes pretend not to care because caring feels embarrassing?',
    subtext: 'The shield we put up when we fear unreciprocated warmth.',
    tags: ['Vulnerability', 'SelfDefense']
  },
  {
    id: 'eq_rare_3',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'comforting',
    targetPage: 'inbox',
    content: 'Have you ever wanted someone to notice that you weren’t okay without you having to explain it?',
    subtext: 'The wish for intuitive, observant empathy.',
    tags: ['Belonging', 'Empathy']
  },
  {
    id: 'eq_rare_4',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'curious',
    targetPage: 'profile',
    content: 'What is something you secretly wish someone would ask you about?',
    subtext: 'The quiet passions or memories nobody ever thinks to inquire about.',
    tags: ['Curiosity', 'HiddenDepths']
  },
  {
    id: 'eq_rare_5',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'philosophical',
    targetPage: 'connect',
    content: 'Do you find it easier to give affection or to receive it?',
    subtext: 'Why receiving care sometimes feels uncomfortable.',
    tags: ['Affection', 'InnerWork']
  },
  {
    id: 'eq_rare_6',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'philosophical',
    targetPage: 'unspoken',
    content: 'Are you more afraid of being misunderstood, or being fully understood?',
    subtext: 'The safety of anonymity vs the terror of true exposure.',
    tags: ['Identity', 'Fear']
  },
  {
    id: 'eq_rare_7',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'comforting',
    targetPage: 'profile',
    content: 'What compliment would mean more to you than someone saying you look beautiful?',
    subtext: 'Words that reach the spirit rather than the mirror.',
    tags: ['SelfWorth', 'Warmth']
  },
  {
    id: 'eq_rare_8',
    contentType: 'question',
    category: 'rarely_admitted',
    mood: 'vulnerable',
    targetPage: 'unspoken',
    content: 'Have you ever felt lonely in a room surrounded by people you love?',
    subtext: 'The quiet solitude of carrying thoughts you cannot voice.',
    tags: ['Solitude', 'Realness']
  },

  // =========================================================================
  // CATEGORY 3: WOMEN'S PERSPECTIVES & EMOTIONAL EXPERIENCES
  // =========================================================================
  {
    id: 'eq_wom_1',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'comforting',
    targetPage: 'discover',
    content: 'When do you feel most respected in a relationship?',
    subtext: 'How real equality and genuine listening feel in practice.',
    tags: ['Respect', 'Safety']
  },
  {
    id: 'eq_wom_2',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'vulnerable',
    targetPage: 'profile',
    content: 'What makes you feel safe enough to let your guard down and be vulnerable?',
    subtext: 'The psychological safety that allows softness.',
    tags: ['Trust', 'Safety']
  },
  {
    id: 'eq_wom_3',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'philosophical',
    targetPage: 'unspoken',
    content: 'Do you feel appreciated for who you are, or primarily for what you do for others?',
    subtext: 'Breaking free from the emotional labor trap.',
    tags: ['Identity', 'SelfWorth']
  },
  {
    id: 'eq_wom_4',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'curious',
    targetPage: 'inbox',
    content: 'What does genuine consistency look like to you in everyday life?',
    subtext: 'Words backed by calm, predictable actions.',
    tags: ['Consistency', 'Reliability']
  },
  {
    id: 'eq_wom_5',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'romantic',
    targetPage: 'discover',
    content: 'What is a small, unexpected gesture that instantly makes you feel cherished?',
    subtext: 'The subtle things that prove someone was thinking of you.',
    tags: ['Romance', 'Attention']
  },
  {
    id: 'eq_wom_6',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'curious',
    targetPage: 'discover',
    content: 'What makes you lose romantic interest even when you are physically attracted to someone?',
    subtext: 'The subtle turn-offs in character, listening, or emotional pace.',
    tags: ['Standards', 'Attraction']
  },
  {
    id: 'eq_wom_7',
    contentType: 'question',
    category: 'womens_perspectives',
    mood: 'philosophical',
    targetPage: 'connect',
    content: 'What does emotional maturity look like to you in a partner?',
    subtext: 'Navigating disagreements with accountability rather than ego.',
    tags: ['Maturity', 'Partnership']
  },

  // =========================================================================
  // CATEGORY 4: MEN'S PERSPECTIVES & EMOTIONAL EXPERIENCES
  // =========================================================================
  {
    id: 'eq_men_1',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'vulnerable',
    targetPage: 'discover',
    content: 'When was the last time you felt comfortable expressing vulnerability without fear of judgment?',
    subtext: 'The rare moments where performance wasn’t required.',
    tags: ['Vulnerability', 'Safety']
  },
  {
    id: 'eq_men_2',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'comforting',
    targetPage: 'profile',
    content: 'Do the people around you give you enough space to talk about your quiet fears and doubts?',
    subtext: 'Carrying expectations vs having an open listener.',
    tags: ['MentalHealth', 'Listening']
  },
  {
    id: 'eq_men_3',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'hopeful',
    targetPage: 'inbox',
    content: 'What kind of appreciation means the most to you when you work hard for those you care about?',
    subtext: 'Feeling acknowledged for quiet effort.',
    tags: ['Appreciation', 'Respect']
  },
  {
    id: 'eq_men_4',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'philosophical',
    targetPage: 'unspoken',
    content: 'What do you wish people understood about the invisible weight of your responsibilities?',
    subtext: 'The pressure to always appear composed and capable.',
    tags: ['Duty', 'RealTalk']
  },
  {
    id: 'eq_men_5',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'comforting',
    targetPage: 'discover',
    content: 'What does a peaceful relationship look like to you?',
    subtext: 'Coming home to harmony rather than a second battlefield.',
    tags: ['Peace', 'Sanctuary']
  },
  {
    id: 'eq_men_6',
    contentType: 'question',
    category: 'mens_perspectives',
    mood: 'vulnerable',
    targetPage: 'connect',
    content: 'When was the last time someone genuinely listened to you without interrupting or offering quick fixes?',
    subtext: 'Pure human listening without judgment.',
    tags: ['Empathy', 'Connection']
  },

  // =========================================================================
  // CATEGORY 5: FRIENDSHIP & BELONGING
  // =========================================================================
  {
    id: 'eq_frd_1',
    contentType: 'question',
    category: 'friendship_belonging',
    mood: 'philosophical',
    targetPage: 'connect',
    content: 'What is the difference between a friend and someone who genuinely knows you?',
    subtext: 'Shared activity vs shared emotional reality.',
    tags: ['Friendship', 'Depth']
  },
  {
    id: 'eq_frd_2',
    contentType: 'question',
    category: 'friendship_belonging',
    mood: 'curious',
    targetPage: 'connect',
    content: 'Would you rather have one lifelong loyal confidant or a hundred fun acquaintances?',
    subtext: 'Depth over volume in human connection.',
    tags: ['Loyalty', 'Belonging']
  },
  {
    id: 'eq_frd_3',
    contentType: 'question',
    category: 'friendship_belonging',
    mood: 'nostalgic',
    targetPage: 'unspoken',
    content: 'What is a past friendship you wish you had fought harder to maintain?',
    subtext: 'The friends who drifted away without an argument, just life.',
    tags: ['Nostalgia', 'OldFriends']
  },
  {
    id: 'eq_frd_4',
    contentType: 'question',
    category: 'friendship_belonging',
    mood: 'comforting',
    targetPage: 'connect',
    content: 'When was the last time you felt completely comfortable being yourself around someone?',
    subtext: 'Zero performance, zero masking, completely ordinary.',
    tags: ['Authenticity', 'Safety']
  },
  {
    id: 'eq_frd_5',
    contentType: 'question',
    category: 'friendship_belonging',
    mood: 'philosophical',
    targetPage: 'inbox',
    content: 'Can two people remain deeply close without needing to speak every single day?',
    subtext: 'Quiet loyalty that picks up exactly where it left off.',
    tags: ['TrueBond', 'Maturity']
  },

  // =========================================================================
  // CATEGORY 6: SELF-DISCOVERY & INNER LIFE
  // =========================================================================
  {
    id: 'eq_self_1',
    contentType: 'question',
    category: 'self_discovery',
    mood: 'hopeful',
    targetPage: 'create',
    content: 'What version of yourself are you slowly and quietly trying to become?',
    subtext: 'The character you are cultivating away from social expectations.',
    tags: ['Growth', 'Evolution']
  },
  {
    id: 'eq_self_2',
    contentType: 'question',
    category: 'self_discovery',
    mood: 'vulnerable',
    targetPage: 'profile',
    content: 'What is something about you that people usually misunderstand when they first meet you?',
    subtext: 'The barrier between surface impression and who you are inside.',
    tags: ['Perception', 'InnerTruth']
  },
  {
    id: 'eq_self_3',
    contentType: 'question',
    category: 'self_discovery',
    mood: 'philosophical',
    targetPage: 'create',
    content: 'What do you naturally do when nobody expects anything from you?',
    subtext: 'Your soul’s resting state.',
    tags: ['Solitude', 'Rest']
  },
  {
    id: 'eq_self_4',
    contentType: 'question',
    category: 'self_discovery',
    mood: 'comforting',
    targetPage: 'unspoken',
    content: 'What are you slowly learning to forgive yourself for?',
    subtext: 'The past decisions, clumsy words, or lost years you are letting go.',
    tags: ['Forgiveness', 'Healing']
  },
  {
    id: 'eq_self_5',
    contentType: 'question',
    category: 'self_discovery',
    mood: 'hopeful',
    targetPage: 'create',
    content: 'What would you tell your younger self if you knew they would finally listen?',
    subtext: 'The reassurance you once needed so badly.',
    tags: ['Reflection', 'Compassion']
  }
];

// ===========================================================================
// SIGNATURE FEATURE: "THE UNSPOKEN" & MIDNIGHT THOUGHTS
// ===========================================================================
export const THE_UNSPOKEN_COLLECTION: EmotionalContentItem[] = [
  {
    id: 'unsp_1',
    contentType: 'thought',
    category: 'love_psychology',
    mood: 'comforting',
    targetPage: 'unspoken',
    content: 'What if someone loved the parts of you that you spend so much time trying to hide?',
    subtext: 'A quiet thought. No expectations. No need to answer.',
    tags: ['TheUnspoken', 'Acceptance']
  },
  {
    id: 'unsp_2',
    contentType: 'thought',
    category: 'rarely_admitted',
    mood: 'philosophical',
    targetPage: 'unspoken',
    content: 'Some connections don’t end because love died. They end because staying required you to become someone you didn’t respect.',
    subtext: 'A thought on dignity and painful growth.',
    tags: ['Dignity', 'Healing']
  },
  {
    id: 'unsp_3',
    contentType: 'thought',
    category: 'self_discovery',
    mood: 'comforting',
    targetPage: 'unspoken',
    content: 'You don’t have to become more interesting to deserve someone’s genuine attention.',
    subtext: 'Ordinary sincerity outlasts manufactured charisma.',
    tags: ['SelfWorth', 'Peace']
  },
  {
    id: 'unsp_4',
    contentType: 'thought',
    category: 'friendship_belonging',
    mood: 'nostalgic',
    targetPage: 'unspoken',
    content: 'The most heartbreaking part of growing up is realizing how easily two people who shared everything can become strangers with shared memories.',
    subtext: 'Honoring past connections without bitter resentment.',
    tags: ['Closure', 'Nostalgia']
  },
  {
    id: 'unsp_5',
    contentType: 'thought',
    category: 'self_discovery',
    mood: 'hopeful',
    targetPage: 'unspoken',
    content: 'You are not running out of time. You are simply on your own timeline.',
    subtext: 'Some of the best people in your life are still strangers.',
    tags: ['Patience', 'Hope']
  }
];

export const MIDNIGHT_THOUGHTS_COLLECTION: EmotionalContentItem[] = [
  {
    id: 'mid_1',
    contentType: 'thought',
    category: 'self_discovery',
    mood: 'comforting',
    targetPage: 'midnight',
    content: 'Some nights you don’t need advice. You just need permission to stop thinking for a while.',
    subtext: 'Breathe. The world will wait until morning.',
    tags: ['Midnight', 'Rest']
  },
  {
    id: 'mid_2',
    contentType: 'thought',
    category: 'self_discovery',
    mood: 'philosophical',
    targetPage: 'midnight',
    content: 'It is okay to rest without having accomplished everything on your list. Your worth is not a spreadsheet.',
    subtext: 'Give your nervous system a soft place to land.',
    tags: ['Sanctuary', 'Calm']
  },
  {
    id: 'mid_3',
    contentType: 'thought',
    category: 'love_psychology',
    mood: 'romantic',
    targetPage: 'midnight',
    content: 'The quietest moments—shared tea in comfortable silence—are often the ones you remember years later.',
    subtext: 'Not the speeches, but the stillness.',
    tags: ['Intimacy', 'Quiet']
  }
];

// ===========================================================================
// EASTER EGG: UNOPENED LETTERS (Warm serendipitous letters in quiet corners)
// ===========================================================================
export const UNOPENED_LETTERS_POOL: UnopenedLetter[] = [
  {
    id: 'let_1',
    previewPrompt: 'A letter from a quiet corner of the universe...',
    title: 'To the person who tries so hard',
    message: 'Someone out there is also hoping to meet a person they can be completely ordinary around. Someone who won’t judge their awkward silences, who appreciates thoughtful words, and who doesn’t demand a polished performance.',
    closing: 'Keep your warmth. It is rare.',
    mood: 'comforting',
    opened: false
  },
  {
    id: 'let_2',
    previewPrompt: 'You found an unopened letter...',
    title: 'On the days you feel invisible',
    message: 'Just because people haven’t told you lately doesn’t mean your presence hasn’t softened someone’s day. A gentle greeting, a sincere question, or your quiet loyalty leaves footprints people remember in secret.',
    closing: 'You matter more than you realize.',
    mood: 'hopeful',
    opened: false
  },
  {
    id: 'let_3',
    previewPrompt: 'A letter waiting for the right moment...',
    title: 'Permission to be unpolished',
    message: 'You don’t have to have your entire identity figured out by next Tuesday. The people who are truly right for you will enjoy watching you explore different versions of yourself.',
    closing: 'Allow yourself the grace to evolve.',
    mood: 'vulnerable',
    opened: false
  }
];

// ===========================================================================
// ENGINE LOCAL STORAGE PERSISTENCE & HELPERS
// ===========================================================================
const STORAGE_SAVED_THOUGHTS = 'soulverse_saved_emotional_thoughts';
const STORAGE_UNSENT_WORDS = 'soulverse_unsent_words';
const STORAGE_TWO_PERSON_QUESTIONS = 'soulverse_two_person_questions';

export class EmotionalContentEngine {
  // Get random contextual item for a page
  static getContextualItem(targetPage: TargetPage): EmotionalContentItem {
    const matching = EMOTIONAL_QUESTIONS_LIBRARY.filter(q => q.targetPage === targetPage);
    if (matching.length === 0) return EMOTIONAL_QUESTIONS_LIBRARY[0];
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // Get items filtered by user chosen reading mood (The Inner Room)
  static getItemsByMood(mood: ContentMood): EmotionalContentItem[] {
    const list = [...EMOTIONAL_QUESTIONS_LIBRARY, ...THE_UNSPOKEN_COLLECTION];
    const filtered = list.filter(item => item.mood === mood);
    return filtered.length > 0 ? filtered : list.slice(0, 4);
  }

  // Get Unopened Letters pool
  static getUnopenedLetters(): UnopenedLetter[] {
    return UNOPENED_LETTERS_POOL;
  }

  // Unsent Words CRUD
  static getUnsentWords(): UnsentWord[] {
    try {
      const data = localStorage.getItem(STORAGE_UNSENT_WORDS);
      if (data) return JSON.parse(data);
    } catch {}
    const defaults: UnsentWord[] = [
      {
        id: 'uns_1',
        recipientName: 'Someone from 2023',
        content: 'I never told you, but the way you stood up for that shy kid at the bookstore made me realize what kind of person you really were. I hope life is treating your kind heart well.',
        mood: 'nostalgic',
        createdAt: '2026-11-01'
      }
    ];
    this.saveUnsentWords(defaults);
    return defaults;
  }

  static saveUnsentWords(words: UnsentWord[]): void {
    try {
      localStorage.setItem(STORAGE_UNSENT_WORDS, JSON.stringify(words));
    } catch (e) {
      console.error(e);
    }
  }

  static addUnsentWord(word: Omit<UnsentWord, 'id' | 'createdAt'>): void {
    const list = this.getUnsentWords();
    list.unshift({
      ...word,
      id: `uns_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    this.saveUnsentWords(list);
  }

  static deleteUnsentWord(id: string): void {
    const list = this.getUnsentWords().filter(w => w.id !== id);
    this.saveUnsentWords(list);
  }

  // Two-Person Questions CRUD
  static getTwoPersonQuestions(): TwoPersonQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_TWO_PERSON_QUESTIONS);
      if (data) return JSON.parse(data);
    } catch {}
    const defaults: TwoPersonQuestion[] = [
      {
        id: 'tp_1',
        question: 'What is more romantic to you: remembering little details or making grand gestures?',
        category: 'love_psychology',
        partnerName: 'Alex Rivera',
        partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        userAnswer: 'Remembering little details. Anyone can buy flowers, but noticing that I get quiet when I am tired proves they are actually looking at me.',
        partnerAnswer: 'Remembering details. Grand gestures often feel like a show for the room. Little details are just for us.',
        userAnswered: true,
        partnerAnswered: true,
        isRevealed: true,
        createdAt: 'Yesterday'
      },
      {
        id: 'tp_2',
        question: 'What is something you wish your partner would naturally understand about your solitude?',
        category: 'rarely_admitted',
        partnerName: 'Alex Rivera',
        partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        userAnswer: 'That my silence is how I recharge my nervous system, not a passive withdrawal of love.',
        partnerAnswer: 'Waiting for partner to answer...',
        userAnswered: true,
        partnerAnswered: false,
        isRevealed: false,
        createdAt: 'Today'
      }
    ];
    this.saveTwoPersonQuestions(defaults);
    return defaults;
  }

  static saveTwoPersonQuestions(questions: TwoPersonQuestion[]): void {
    try {
      localStorage.setItem(STORAGE_TWO_PERSON_QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error(e);
    }
  }

  static answerTwoPersonQuestion(id: string, answer: string): void {
    const list = this.getTwoPersonQuestions();
    const item = list.find(q => q.id === id);
    if (item) {
      item.userAnswer = answer;
      item.userAnswered = true;
      // Simulate partner also answering if not already
      if (!item.partnerAnswered) {
        item.partnerAnswer = 'When we are comfortable in silence together, it feels like the deepest connection possible.';
        item.partnerAnswered = true;
      }
      this.saveTwoPersonQuestions(list);
    }
  }

  static revealTwoPersonQuestion(id: string): void {
    const list = this.getTwoPersonQuestions();
    const item = list.find(q => q.id === id);
    if (item && item.userAnswered && item.partnerAnswered) {
      item.isRevealed = true;
      this.saveTwoPersonQuestions(list);
    }
  }

  // Saved Thoughts
  static getSavedThoughts(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_SAVED_THOUGHTS);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      'What if someone loved the parts of you that you spend so much time trying to hide?',
      'You don’t have to become more interesting to deserve someone’s genuine attention.'
    ];
  }

  static saveThought(thoughtText: string): void {
    const list = this.getSavedThoughts();
    if (!list.includes(thoughtText)) {
      list.unshift(thoughtText);
      try {
        localStorage.setItem(STORAGE_SAVED_THOUGHTS, JSON.stringify(list));
      } catch {}
    }
  }
}
