export interface PromptQuestion {
  id: string;
  category: 'cinematic' | 'hypothetical' | 'deep' | 'humour' | 'flirty';
  pack: 'men' | 'women' | 'universal';
  question: string;
  placeholder: string;
  answerType: 'text' | 'choice' | 'voice' | 'image';
  options?: string[];
}

export interface UserCharacterUniverse {
  lifeMovieTitle: string;
  playedByActor: string;
  lifeGenre: string;
  openingScene: string;
  villainOriginStory: string;
  endingScene: string;
  hiddenSuperpower: string;
  fictionalUniverse: string;
  selectedQuote: {
    text: string;
    authorOrMood: string;
  };
  hypotheticalAnswers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}

export const GENDER_PROMPT_PACKS: {
  men: PromptQuestion[];
  women: PromptQuestion[];
  universal: PromptQuestion[];
} = {
  men: [
    {
      id: 'm_1',
      category: 'cinematic',
      pack: 'men',
      question: "If I were a movie character, I'd probably be...",
      placeholder: "The quiet strategist in the back of the room who knows how to fix anything.",
      answerType: 'text'
    },
    {
      id: 'm_2',
      category: 'deep',
      pack: 'men',
      question: "My greatest strength is something you won't notice immediately...",
      placeholder: "How fiercely loyal I stay when everyone else checks out.",
      answerType: 'text'
    },
    {
      id: 'm_3',
      category: 'humour',
      pack: 'men',
      question: "My unexpected soft side...",
      placeholder: "I will drop whatever I am doing to rescue a stray kitten or make you hot ginger tea.",
      answerType: 'text'
    },
    {
      id: 'm_4',
      category: 'flirty',
      pack: 'men',
      question: "The adventure I'd take someone on without any warnings...",
      placeholder: "A 4 AM drive up to the misty hills to watch the sunrise with two thermoses of coffee.",
      answerType: 'text'
    },
    {
      id: 'm_5',
      category: 'deep',
      pack: 'men',
      question: "One thing I will never compromise on...",
      placeholder: "Honesty when things get difficult. No silent treatments, no mind games.",
      answerType: 'text'
    }
  ],
  women: [
    {
      id: 'w_1',
      category: 'cinematic',
      pack: 'women',
      question: "My life would be an indie movie called...",
      placeholder: "Overthinking in Coffee Shops and Buying Books I Won't Finish",
      answerType: 'text'
    },
    {
      id: 'w_2',
      category: 'cinematic',
      pack: 'women',
      question: "My fictional alter ego would be...",
      placeholder: "A mix of Hermione Granger's discipline and Fleabag's internal commentary.",
      answerType: 'text'
    },
    {
      id: 'w_3',
      category: 'humour',
      pack: 'women',
      question: "The fastest way to make me smile without trying...",
      placeholder: "Sending me an absurdly specific meme about my exact hyperfixation of the week.",
      answerType: 'text'
    },
    {
      id: 'w_4',
      category: 'deep',
      pack: 'women',
      question: "My most unexpected personality trait...",
      placeholder: "I appear introverted and soft-spoken until you bring up game lore or film directing.",
      answerType: 'text'
    },
    {
      id: 'w_5',
      category: 'flirty',
      pack: 'women',
      question: "My kind of happily-ever-after...",
      placeholder: "A sunny kitchen, slow Saturday mornings with vinyl records, and zero conversational masks.",
      answerType: 'text'
    }
  ],
  universal: [
    {
      id: 'u_1',
      category: 'cinematic',
      pack: 'universal',
      question: "My villain origin story would be...",
      placeholder: "Somebody talking through the climax of a movie after I explicitly told them to watch.",
      answerType: 'text'
    },
    {
      id: 'u_2',
      category: 'hypothetical',
      pack: 'universal',
      question: "If I disappeared for 24 hours, you'd probably find me...",
      placeholder: "In an obscure secondhand bookstore or an off-grid cabin listening to rain.",
      answerType: 'text'
    },
    {
      id: 'u_3',
      category: 'hypothetical',
      pack: 'universal',
      question: "If we were the last two people on Earth, I'd...",
      placeholder: "Raid the best art gallery in the city and challenge you to a Mario Kart tournament.",
      answerType: 'text'
    },
    {
      id: 'u_4',
      category: 'deep',
      pack: 'universal',
      question: "My brain at 3 AM is usually wondering...",
      placeholder: "Why do humans feel so alone on a planet packed with 8 billion people?",
      answerType: 'text'
    },
    {
      id: 'u_5',
      category: 'hypothetical',
      pack: 'universal',
      question: "If you could live inside one fictional universe, which one?",
      placeholder: "Studio Ghibli's coastal town in Kiki's Delivery Service.",
      answerType: 'text'
    }
  ]
};

export const ORIGINAL_QUOTES = [
  { text: "Some stories are better when you don't know the ending.", authorOrMood: "Cinema Philosophy" },
  { text: "I'm not mysterious. You just haven't asked the right questions yet.", authorOrMood: "Quiet Chemistry" },
  { text: "A little chaos makes an unforgettable story.", authorOrMood: "Spontaneous Wanderer" },
  { text: "I look calm because my imagination is somewhere in the cosmos.", authorOrMood: "Dreamer State" },
  { text: "I'd rather have three genuine people than a thousand polite acquaintances.", authorOrMood: "Deep Connection" },
  { text: "The right person makes you feel safe enough to be clumsy.", authorOrMood: "Vulnerability" },
  { text: "My heart has a high entrance exam, but once you're in, you have lifetime membership.", authorOrMood: "Fierce Loyalty" },
  { text: "Find someone who notices the quiet moments people forget to photograph.", authorOrMood: "Cinematography" }
];
