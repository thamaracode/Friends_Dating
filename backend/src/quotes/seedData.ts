import { QuoteCategoryKey } from './types';

export interface SeedQuoteItem {
  text: string;
  author: string;
  category: QuoteCategoryKey;
  tags: string[];
  attribution: string;
}

export const INITIAL_CURATED_QUOTES: SeedQuoteItem[] = [
  // 1. Love & Romance
  {
    text: "Whatever our souls are made of, his and mine are the same.",
    author: "Emily Brontë",
    category: "love_romance",
    tags: ["passion", "soulmates", "literature"],
    attribution: "Wuthering Heights"
  },
  {
    text: "To love and be loved is to feel the sun from both sides.",
    author: "David Viscott",
    category: "love_romance",
    tags: ["warmth", "devotion", "presence"],
    attribution: "How to Live with Another Person"
  },
  {
    text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
    category: "love_romance",
    tags: ["poetry", "devotion", "unconditional"],
    attribution: "Collected Poetry"
  },

  // 2. Relationships
  {
    text: "A great relationship doesn't happen because of the love you had in the beginning, but how well you continue building love until the end.",
    author: "Unknown",
    category: "relationships",
    tags: ["partnership", "effort", "endurance"],
    attribution: "Soulverse Archive"
  },
  {
    text: "The quality of your life is the quality of your relationships.",
    author: "Tony Robbins",
    category: "relationships",
    tags: ["connection", "life-design", "harmony"],
    attribution: "Awaken the Giant Within"
  },
  {
    text: "We are most alive when we're in love, and we are most whole when we are understood.",
    author: "John Mark Green",
    category: "relationships",
    tags: ["vulnerability", "understanding", "depth"],
    attribution: "Taste the Wild Wonder"
  },

  // 3. Friendship
  {
    text: "A real friend is one who walks in when the rest of the world walks out.",
    author: "Walter Winchell",
    category: "friendship",
    tags: ["loyalty", "companionship", "trust"],
    attribution: "Columns Archive"
  },
  {
    text: "Friendship is born at that moment when one person says to another: 'What! You too? I thought I was the only one.'",
    author: "C.S. Lewis",
    category: "friendship",
    tags: ["affinity", "connection", "shared-humanity"],
    attribution: "The Four Loves"
  },
  {
    text: "There is nothing on this earth more to be prized than true friendship.",
    author: "Thomas Aquinas",
    category: "friendship",
    tags: ["devotion", "honor", "timeless"],
    attribution: "Summa Theologiae"
  },

  // 4. Emotional Intelligence
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.",
    author: "Viktor E. Frankl",
    category: "emotional_intelligence",
    tags: ["mindfulness", "freedom", "self-control"],
    attribution: "Man's Search for Meaning"
  },
  {
    text: "Emotional intelligence is not the opposite of intelligence, it is not the triumph of heart over head—it is the unique intersection of both.",
    author: "David Caruso",
    category: "emotional_intelligence",
    tags: ["empathy", "cognition", "wisdom"],
    attribution: "The Emotionally Intelligent Manager"
  },
  {
    text: "When you listen with empathy to another person, you give that person psychological air.",
    author: "Stephen R. Covey",
    category: "emotional_intelligence",
    tags: ["empathy", "listening", "presence"],
    attribution: "The 7 Habits of Highly Effective People"
  },

  // 5. Self-Respect & Boundaries
  {
    text: "Daring to set boundaries is about having the courage to love ourselves even when we risk disappointing others.",
    author: "Brené Brown",
    category: "self_respect_boundaries",
    tags: ["boundaries", "courage", "self-worth"],
    attribution: "The Gifts of Imperfection"
  },
  {
    text: "Never allow someone to be your priority while allowing yourself to be their option.",
    author: "Mark Twain",
    category: "self_respect_boundaries",
    tags: ["dignity", "reciprocity", "self-respect"],
    attribution: "Literary Notebooks"
  },
  {
    text: "Your time is too valuable to spend proving yourself to people who are committed to misunderstanding you.",
    author: "Unknown",
    category: "self_respect_boundaries",
    tags: ["peace", "clarity", "boundaries"],
    attribution: "Soulverse Archive"
  },

  // 6. Psychology & Human Behaviour
  {
    text: "Everything that irritates us about others can lead us to an understanding of ourselves.",
    author: "Carl Gustav Jung",
    category: "psychology_human_behavior",
    tags: ["shadow-work", "introspection", "projection"],
    attribution: "Memories, Dreams, Reflections"
  },
  {
    text: "People do not seem to realize that their opinion of the world is also a confession of character.",
    author: "Ralph Waldo Emerson",
    category: "psychology_human_behavior",
    tags: ["perception", "character", "human-nature"],
    attribution: "Conduct of Life"
  },
  {
    text: "The paradox of trauma is that it has both the power to destroy and the power to transform and resurrect.",
    author: "Peter A. Levine",
    category: "psychology_human_behavior",
    tags: ["psychology", "transformation", "resilience"],
    attribution: "Waking the Tiger"
  },

  // 7. Motivation & Discipline
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "motivation_discipline",
    tags: ["focus", "delayed-gratification", "willpower"],
    attribution: "Collected Works"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    category: "motivation_discipline",
    tags: ["habits", "consistency", "mastery"],
    attribution: "The Story of Philosophy"
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "motivation_discipline",
    tags: ["momentum", "creativity", "action"],
    attribution: "Picasso on Art"
  },

  // 8. Loneliness & Healing
  {
    text: "The cure for pain is in the pain.",
    author: "Rumi",
    category: "loneliness_healing",
    tags: ["sanctuary", "healing", "poetry"],
    attribution: "The Masnavi"
  },
  {
    text: "Solitude is where I place my chaos to let it gently settle into stillness.",
    author: "Unknown",
    category: "loneliness_healing",
    tags: ["solitude", "inner-room", "calm"],
    attribution: "The Unspoken Sanctuary"
  },
  {
    text: "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
    author: "Akshay Dubey",
    category: "loneliness_healing",
    tags: ["healing", "recovery", "peace"],
    attribution: "Words of Sanctuary"
  },

  // 9. Confidence & Identity
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson",
    category: "confidence_identity",
    tags: ["individuality", "authenticity", "courage"],
    attribution: "Self-Reliance"
  },
  {
    text: "No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt",
    category: "confidence_identity",
    tags: ["self-worth", "dignity", "inner-strength"],
    attribution: "You Learn by Living"
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
    category: "confidence_identity",
    tags: ["grace", "identity", "growth"],
    attribution: "Public Address"
  },

  // 10. Life Philosophy
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    category: "life_philosophy",
    tags: ["meaning", "purpose", "stoicism"],
    attribution: "Twilight of the Idols"
  },
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    category: "life_philosophy",
    tags: ["stoicism", "integrity", "action"],
    attribution: "Meditations"
  },
  {
    text: "Life is not a problem to be solved, but a reality to be experienced.",
    author: "Søren Kierkegaard",
    category: "life_philosophy",
    tags: ["existentialism", "presence", "reality"],
    attribution: "Either/Or"
  },

  // 11. Happiness & Gratitude
  {
    text: "Gratitude turns what we have into enough, and more.",
    author: "Melody Beattie",
    category: "happiness_gratitude",
    tags: ["contentment", "gratitude", "peace"],
    attribution: "The Language of Letting Go"
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "happiness_gratitude",
    tags: ["compassion", "joy", "presence"],
    attribution: "The Art of Happiness"
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
    category: "happiness_gratitude",
    tags: ["mindset", "tranquility", "simplicity"],
    attribution: "Meditations"
  },

  // 12. Communication
  {
    text: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
    category: "communication",
    tags: ["clarity", "dialogue", "listening"],
    attribution: "Leadership Observations"
  },
  {
    text: "Speak in such a way that others love to listen to you. Listen in such a way that others love to speak to you.",
    author: "Anonymous",
    category: "communication",
    tags: ["attunement", "kindness", "grace"],
    attribution: "Soulverse Archive"
  },
  {
    text: "Words have energy and power with the ability to help, to heal, to hinder, to hurt, to harm, to humiliate and to humble.",
    author: "Yehuda Berg",
    category: "communication",
    tags: ["verbal-impact", "intentionality", "truth"],
    attribution: "The Power of Words"
  },

  // 13. Marriage & Commitment
  {
    text: "A successful marriage requires falling in love many times, always with the same person.",
    author: "Mignon McLaughlin",
    category: "marriage_commitment",
    tags: ["devotion", "long-term", "romance"],
    attribution: "The Second Neurotic's Notebook"
  },
  {
    text: "Chains do not hold a marriage together. It is threads, hundreds of tiny threads, which sew people together through the years.",
    author: "Simone Signoret",
    category: "marriage_commitment",
    tags: ["shared-life", "patience", "endurance"],
    attribution: "Nostalgia Isn't What It Used to Be"
  },
  {
    text: "Commitment is what transforms a promise into reality.",
    author: "Abraham Lincoln",
    category: "marriage_commitment",
    tags: ["fidelity", "trust", "dedication"],
    attribution: "Collected Works"
  },

  // 14. Heartbreak & Moving On
  {
    text: "Sometimes good things fall apart so better things can fall together.",
    author: "Marilyn Monroe",
    category: "heartbreak_moving_on",
    tags: ["renewal", "closure", "hope"],
    attribution: "Memoir Reflections"
  },
  {
    text: "The heart was made to be broken, and broken again, until it stays open.",
    author: "Oscar Wilde",
    category: "heartbreak_moving_on",
    tags: ["vulnerability", "expansion", "acceptance"],
    attribution: "De Profundis"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle Onassis",
    category: "heartbreak_moving_on",
    tags: ["perseverance", "healing", "light"],
    attribution: "Collected Sayings"
  },

  // 15. Personal Growth
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "personal_growth",
    tags: ["evolution", "self-creation", "agency"],
    attribution: "Essays"
  },
  {
    text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
    author: "Mandy Hale",
    category: "personal_growth",
    tags: ["courage", "transformation", "evolution"],
    attribution: "The Single Woman"
  },
  {
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl R. Rogers",
    category: "personal_growth",
    tags: ["self-compassion", "psychology", "transformation"],
    attribution: "On Becoming a Person"
  },

  // 16. Humour & Playful Quotes
  {
    text: "Before you marry a person, you should first make them use a computer with slow Internet to see who they really are.",
    author: "Will Ferrell",
    category: "humor_playful",
    tags: ["banter", "marriage", "wit"],
    attribution: "Public Interview"
  },
  {
    text: "I'm not arguing, I'm just explaining why I'm right.",
    author: "Anonymous",
    category: "humor_playful",
    tags: ["banter", "playful", "witty"],
    attribution: "Soulverse Archive"
  },
  {
    text: "I love being married. It's so great to find one special person you want to annoy for the rest of your life.",
    author: "Rita Rudner",
    category: "humor_playful",
    tags: ["humor", "affection", "irony"],
    attribution: "Comedy Archive"
  }
];
