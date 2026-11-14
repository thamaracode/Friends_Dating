import type { 
  UserProfile, 
  SocialCircle, 
  SocialChallenge, 
  AnonymousQuestion,
  DailyHopeMessage,
  JourneyDay,
  AcademyLesson,
  FriendsEvent
} from './types';

export const MOCK_EVENTS: FriendsEvent[] = [
  {
    id: 'evt_1',
    title: 'The Friday Social: Rooftop Acoustic & Nuanced Debates',
    type: 'public_gathering',
    format: 'physical',
    date: 'Friday, Nov 14',
    time: '6:00 PM – 9:30 PM',
    locationName: 'Public Rooftop Pavilion (Colombo 07)',
    locationCity: 'Colombo',
    exactAddressHidden: true,
    coverImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    description: 'Good people, ambient acoustics, and conversations that do not end after three messages. Designed for people who want to meet new faces without alcohol-fueled club pressure.',
    hostName: 'Kavindu Senanayake',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hostVerified: true,
    category: 'Social & Music',
    tags: ['Acoustic', 'Philosophy', 'IntrovertFriendly'],
    capacity: 25,
    attendeesCount: 18,
    rsvpStatus: 'attending',
    rules: [
      'No unsolicited business pitching or pick-up artist behavior.',
      'Exact venue details sent to confirmed guests 6 hours prior.',
      'Introverts are welcome to listen without pressure to speak.'
    ]
  },
  {
    id: 'evt_2',
    title: 'Synchronized Movie Night: Studio Ghibli & Lo-Fi Lounge',
    type: 'watch_party',
    format: 'online',
    date: 'Saturday, Nov 15',
    time: '8:30 PM – 10:45 PM',
    locationName: 'FRIENDS Cinema Sanctuary (Online Room)',
    locationCity: 'Virtual',
    exactAddressHidden: false,
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    description: 'Watch together with synchronized playback and cozy live chat. Bring your tea and popcorn while we break down frame composition and nostalgia.',
    hostName: 'Tara Perera',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    hostVerified: true,
    category: 'Watch Together',
    tags: ['Anime', 'Cinema', 'WatchParty'],
    capacity: 40,
    attendeesCount: 29,
    rsvpStatus: 'none',
    watchPartyDetails: {
      mediaTitle: 'Spirited Away (1998)',
      mediaType: 'anime',
      synchronizedTime: '8:30 PM sharp',
      streamServiceAuthorized: 'Authorized Stream / Community Player'
    },
    rules: [
      'Text chat and voice room available. Voice is push-to-talk.',
      'No spoilers in the first 30 minutes.'
    ]
  },
  {
    id: 'evt_3',
    title: 'Knuckles Mountain Photography Walk & Misty Campfire',
    type: 'public_gathering',
    format: 'physical',
    date: 'Sunday, Nov 23',
    time: '6:30 AM – 4:00 PM',
    locationName: 'Knuckles Mountain Range Trailhead',
    locationCity: 'Kandy / Matale',
    exactAddressHidden: true,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'An analog & mobile photography hike through cloud forests. We pause often for viewpoints, nature sketches, and packed lunches.',
    hostName: 'Alex Rivera',
    hostAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    hostVerified: true,
    category: 'Adventure & Outdoors',
    tags: ['Hike', 'Photography', 'Nature'],
    capacity: 12,
    attendeesCount: 9,
    rsvpStatus: 'none',
    rules: [
      'Carpool coordinated inside the event chat.',
      'Safety check-in active via FRIENDS MEET integration.',
      'Leave No Trace ethics strictly enforced.'
    ]
  },
  {
    id: 'evt_4',
    title: 'Zero-Burnout Indie Hacker Co-Working & Demo Jam',
    type: 'online_party',
    format: 'online',
    date: 'Every Wednesday',
    time: '7:00 PM – 9:00 PM',
    locationName: 'Discord / Audio Lounge',
    locationCity: 'Virtual',
    exactAddressHidden: false,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Quiet co-working sprint for side project builders, followed by an informal 5-minute prototype show & tell. No hustle-culture toxic grind.',
    hostName: 'Kavindu Senanayake',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hostVerified: true,
    category: 'Tech & Projects',
    tags: ['IndieHacker', 'CoWorking', 'SideProjects'],
    capacity: 15,
    attendeesCount: 8,
    rsvpStatus: 'none',
    rules: [
      '30-minute silent focus sprints.',
      'Demos are supportive; constructive feedback only.'
    ]
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'usr_me',
  name: 'Kavindu Senanayake',
  username: 'kavindu',
  age: 23,
  location: 'Colombo, Sri Lanka',
  hometown: 'Kandy',
  pronouns: 'He/Him',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bannerImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  tagline: 'Coding human connection spaces. Seeking genuine conversation over small talk.',
  headline: 'Trying to experience more of life, build meaningful things, and have conversations that do not end after three messages.',
  status: 'Undergraduate & Indie Dev',
  customEmojiStatus: {
    id: '5172484558305625218',
    fallback: '⭐',
    name: 'Telegram Stars VIP'
  },
  languages: ['English', 'Sinhala', 'Basic Japanese'],
  website: 'https://kavindu.dev',
  aboutMeLong: `I spend my days architecting systems, drinking endless cups of spiced black tea, and wondering why modern social software makes everyone feel lonelier instead of more connected. 

I’m an introvert who loves deep, unstructured conversations at 1 AM about game design, human nature, or why people let go of childhood dreams. I would rather have 3 friends who know the real, unfiltered version of me than 3,000 polite followers who only know my highlight reel.`,
  personalQuote: {
    quote: "I would rather have three genuine people than a thousand familiar faces.",
    author: "Personal Life Philosophy"
  },
  intent: 'Friendship',
  energy: 'Introvert',
  conflictStyle: 'Direct Discussion',
  affectionStyle: 'Quality Time',
  socialEnergy: 'Recharge in Solitude',
  idealConversation: 'Philosophical debates at 1 AM or unpacking game lore',
  coreValues: ['Intellectual Honesty', 'Creative Agency', 'Loyalty', 'Curiosity'],
  interests: [
    'System Architecture', 
    'Indie Games', 
    'Cinematography', 
    'Psychology', 
    'Ambient Lo-Fi', 
    'Acoustic Guitar', 
    'Analog Photography', 
    'Philosophy'
  ],
  likes: ['Direct communicators', 'Late night tea', 'Nuanced opinions', 'People passionate about obscure things', 'Unstructured road trips'],
  dislikes: ['Dry "k" replies', 'Social posturing', 'Superficial flattery', 'People who ghost without explanation'],
  deepQuestion: {
    question: 'What kind of person makes you feel safe?',
    answer: 'Someone who listens to understand rather than to respond, and who does not judge awkward silence.'
  },
  profileStrength: 88,

  // Most Active Chat Window (Computed from usage analytics)
  activeTimeWindow: {
    periodLabel: 'Late Night (10:30 PM – 2:00 AM)',
    slotName: 'late_night',
    typicalDays: 'Every night & Sunday afternoons',
    onlineProbabilityPercent: 88,
    isCurrentlyInActiveWindow: true,
    timezone: 'GMT+5:30 (Sri Lanka Standard Time)',
    lastSeenDescription: 'Active now'
  },

  // Education Timeline
  education: [
    {
      id: 'edu_1',
      institution: 'University of Colombo (UCSC)',
      degree: 'BSc (Hons) in Computer Science',
      field: 'Software Engineering & Human-Computer Interaction',
      startYear: 2022,
      endYear: 2026,
      current: true,
      activities: 'ACM Student Chapter, Philosophy & Debate Society',
      visibility: 'public'
    },
    {
      id: 'edu_2',
      institution: 'Trinity College, Kandy',
      degree: 'GCE Advanced Level (Physical Science)',
      field: 'Mathematics, Physics, Chemistry',
      startYear: 2014,
      endYear: 2021,
      current: false,
      activities: 'Astronomical Society, Media Unit',
      visibility: 'public'
    }
  ],

  // Career & Ambitions
  career: [
    {
      id: 'car_1',
      role: 'Full-Stack Developer & Indie Creator',
      companyOrFreelance: 'Independent / Open Source',
      period: '2023 - Present',
      current: true,
      description: 'Building ethical software that fosters genuine psychological safety and human belonging.',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'System Design'],
      visibility: 'public'
    }
  ],

  // Lifestyle Details
  lifestyle: {
    circadian: 'Night Owl',
    weekendStyle: 'Home Sanctuary',
    coffeeOrTea: 'Tea',
    dietOrFood: 'Sri Lankan spicy curry, Kottu, Dark chocolate',
    socialBatteryRecharge: 'Alone in a quiet room with rain sounds and an indie game soundtrack',
    petAffinity: 'Cats & stray dogs lover',
    cleanOrMessy: 'Organized'
  },

  // Profile Prompts (Tinder/Hinge style with depth)
  prompts: [
    {
      id: 'p1',
      category: 'Classic',
      prompt: 'I will never shut up about...',
      answer: 'Why mechanical and environmental storytelling in games like Outer Wilds and Hollow Knight outclasses 99% of Hollywood cinema.',
      featured: true
    },
    {
      id: 'p2',
      category: 'Funny & Unhinged',
      prompt: 'My brain at 3 AM...',
      answer: 'Alternating between planning an off-grid solar-powered cabin and wondering if octopuses dream in color.',
      featured: true
    },
    {
      id: 'p3',
      category: 'Deep & Vulnerable',
      prompt: 'What makes you feel deeply understood?',
      answer: 'When someone notices the thought process behind an action rather than just reacting to the surface result.',
      featured: true
    }
  ],

  // Life Stories (Mini digital museum)
  stories: [
    {
      id: 'st_1',
      title: 'The Night the Power Went Out in Kandy',
      prompt: 'A moment that changed my perspective',
      content: 'During an unexpected blackout in the hills, the whole neighborhood stepped out into the dark verandahs. Without screens or noise, people who hadn’t exchanged words in years shared candle wax, tea, and stories under the clearest milky way I have ever seen. That night proved to me that people aren’t naturally cold—we are just buried under artificial noise.',
      moodEmoji: '🌌',
      visibility: 'public',
      dateAdded: 'October 2026'
    }
  ],

  // Gallery
  gallery: [
    {
      id: 'gal_1',
      url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80',
      caption: 'Late night desk setup with warm filament lights and tea',
      category: 'everyday'
    },
    {
      id: 'gal_2',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      caption: 'Misty morning hike up Knuckles Mountain Range',
      category: 'places'
    },
    {
      id: 'gal_3',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      caption: 'My sleepy neighborhood cat who oversees code reviews',
      category: 'memories'
    }
  ],

  // Connection Preferences (Who are you looking for?)
  connectionPreferences: {
    openTo: ['Close friendships', 'Gaming friends', 'Deep conversations', 'Creative collaborators', 'Study/Co-working partners'],
    seekingQualities: ['Intellectually curious', 'Direct & honest communicator', 'Emotionally mature', 'Comfortable with comfortable silence'],
    enjoyTogether: ['Late night tea sessions', 'Playing cooperative indie games', 'Walking through old bookshops', 'Discussing philosophical paradoxes'],
    personalStatement: 'I am looking for people who care more about sincere human warmth and curiosity than status or small talk. I do not mind if our hobbies differ completely, as long as you love exploring things with an open mind.',
    preferredLanguages: ['English', 'Sinhala'],
    communicationStylePreference: 'Asynchronous thoughtful messages over dry rapid-fire texting.'
  },

  socialLinks: [
    { platform: 'GitHub', handle: 'kavindu-s', url: 'https://github.com', verified: true, visibility: 'public' },
    { platform: 'Spotify', handle: 'kavindu_sounds', url: 'https://spotify.com', verified: false, visibility: 'public' },
    { platform: 'Instagram', handle: '@kavindu.visuals', url: 'https://instagram.com', verified: false, followersCount: '420', visibility: 'public' },
    { platform: 'LinkedIn', handle: 'kavindu-senanayake', url: 'https://linkedin.com', verified: false, visibility: 'members_only' }
  ]
};

export const MOCK_DAILY_HOPE: DailyHopeMessage = {
  id: 'hope_1',
  theme: 'Hope',
  headline: 'You are not running out of time.',
  message: 'Some of the best people in your life are still strangers. You haven’t missed your chance to meet them. Your story is still being written.',
  actionPrompt: 'Make one small attempt to connect today. A warm greeting, a genuine compliment, or asking someone what book they are reading is enough.'
};

export const MOCK_JOURNEY_DAYS: JourneyDay[] = [
  {
    day: 1,
    stage: 1,
    stageTitle: 'Stage 1: Understand Yourself',
    title: 'Your Social Energy Blueprint',
    lesson: 'Introversion is not a handicap; it is a way of absorbing the world. Discover what recharges you before forcing yourself into loud rooms.',
    challenge: 'Write down what makes someone a genuinely safe presence for you.',
    reflectionPrompt: 'When was the last time you felt truly comfortable in your own skin around others?',
    completed: true
  },
  {
    day: 2,
    stage: 1,
    stageTitle: 'Stage 1: Understand Yourself',
    title: 'Recognizing Unconscious Social Fears',
    lesson: 'Most social hesitation is the fear of being seen as awkward. But awkwardness is just human sincerity with clumsy edges.',
    challenge: 'Notice when your brain tells you "they probably don’t want to talk to me" and gently question it.',
    reflectionPrompt: 'What assumption do you make about strangers that holds you back?',
    completed: true
  },
  {
    day: 3,
    stage: 1,
    stageTitle: 'Stage 1: Understand Yourself',
    title: 'The Power of Low-Stakes Curiosity',
    lesson: 'You don’t have to impress people. People are drawn to people who are genuinely interested in them.',
    challenge: 'Ask someone in your environment about a topic they know a lot about.',
    reflectionPrompt: 'What is one topic you could listen to someone talk about for hours?',
    completed: true
  },
  {
    day: 4,
    stage: 2,
    stageTitle: 'Stage 2: Break the Silence',
    title: 'The Art of the Open-Ended Opener',
    lesson: 'Closed questions ("How are you?" -> "Good") end conversations. Situational observations ("Have you tried their ginger tea yet?") start dialogues.',
    challenge: 'Start one conversation using an observation about your shared environment.',
    reflectionPrompt: 'How did it feel to step into the dialogue without waiting for them?',
    completed: false
  },
  {
    day: 5,
    stage: 2,
    stageTitle: 'Stage 2: Break the Silence',
    title: 'Comfort With Silence',
    lesson: 'Silence in a conversation does not mean failure. Rushing to fill every second creates anxiety; letting a thought breathe shows grounded presence.',
    challenge: 'During your next conversation, pause for two full seconds before responding to show you processed what they said.',
    reflectionPrompt: 'Did slowing down make you feel more in control?',
    completed: false
  }
];

export const MOCK_ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'acad_1',
    title: 'How to Start a Conversation with a Stranger',
    category: 'Starting Conversations',
    scenario: 'You are sitting in a campus cafe or bookstore next to someone wearing a badge of an indie game or band you love.',
    question: 'How do you open the interaction without coming off as intrusive or aggressive?',
    options: [
      {
        id: 'opt_1',
        text: 'Immediately ask: "Hey, can I get your Instagram? You look cool."',
        feedback: 'Too rushed. Jumping to social media handles before establishing conversational comfort triggers defensiveness.',
        isRecommended: false
      },
      {
        id: 'opt_2',
        text: 'Say nothing and wait until they hopefully notice you looking and speak first.',
        feedback: 'Passive waiting leaves both of you isolated. Most people are also shy and hoping someone else takes the lead.',
        isRecommended: false
      },
      {
        id: 'opt_3',
        text: 'Make a casual, low-pressure observation: "Excuse me, I couldn’t help but notice that pin—did you catch their latest release?"',
        feedback: 'Recommended! It is low-pressure, acknowledges a shared passion, gives them an easy out if busy, and opens room for genuine talk.',
        isRecommended: true
      },
      {
        id: 'opt_4',
        text: 'Start debating them loudly on why their favorite band is overrated.',
        feedback: 'Hostile debate right out of the gate creates friction and signals emotional insecurity.',
        isRecommended: false
      }
    ]
  },
  {
    id: 'acad_2',
    title: 'Saving a Dry Conversation from "I\'m Good, WBU?"',
    category: 'Conversational Flow',
    scenario: 'You texted an acquaintance to see how they are doing, and they respond with the classic conversation killer: "Good wbu".',
    question: 'What is the most effective way to turn this into a real conversation?',
    options: [
      {
        id: 'opt_a',
        text: 'Reply with just "Good" or "Same".',
        feedback: 'This permanently buries the dialogue in a mutual cemetery.',
        isRecommended: false
      },
      {
        id: 'opt_b',
        text: 'Reply: "Pretty good! I’ve been trying to find something new to get obsessed with lately. What’s taking up most of your free time this week?"',
        feedback: 'Recommended! It answers playfully and gives them a specific, interesting hook to anchor onto without feeling like an interrogation.',
        isRecommended: true
      },
      {
        id: 'opt_c',
        text: 'Leave them on read for 3 days to test their interest.',
        feedback: 'Playing mind games creates distrust and reinforces avoidant habits.',
        isRecommended: false
      }
    ]
  }
];

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    username: 'alex_r',
    age: 22,
    location: 'Kandy / Remote',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    tagline: 'Game designer & amateur astronomer. Looking for people who think deeply.',
    headline: 'Exploring cosmology, procedural generation, and quiet hillside spots.',
    status: 'Game Designer',
    languages: ['English'],
    aboutMeLong: 'Creating independent interactive experiences and stargazing when the clouds clear.',
    personalQuote: {
      quote: 'Somewhere, something incredible is waiting to be known.',
      author: 'Carl Sagan'
    },
    intent: 'Friendship',
    energy: 'Ambivert',
    conflictStyle: 'Need Space First',
    affectionStyle: 'Shared Experiences',
    socialEnergy: 'Context Dependent',
    idealConversation: 'Space exploration, game mechanics, and what makes art last',
    coreValues: ['Creative Agency', 'Intellectual Honesty', 'Kindness'],
    interests: ['Indie Games', 'Astronomy', 'Psychology', 'Synthesizers'],
    likes: ['Random midnight deep dives', 'People who get lost in side projects', 'Dark humor'],
    dislikes: ['Small talk about the weather', 'Performative positivity'],
    deepQuestion: {
      question: 'What makes you feel deeply appreciated?',
      answer: 'When a friend remembers a tiny detail I mentioned months ago about a project I care about.'
    },
    compatibilityScore: 89,
    matchReasons: [
      'Both enjoy deep, asynchronous conversations',
      'High overlap in Indie Games & Psychology',
      'Complementary social energy balance (Introvert + Ambivert)'
    ],
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1229-large.mp4',
    voiceIntroUrl: '#',
    relationshipStage: 'Stranger',
    likesYou: true,
    socialLinks: [
      { platform: 'Discord', handle: 'alex_stargazer', url: '#', verified: true, visibility: 'public' },
      { platform: 'Instagram', handle: '@alex.skies', url: '#', verified: false, followersCount: '630', visibility: 'public' }
    ],
    activeTimeWindow: {
      periodLabel: 'Midnight & Late Night (11:00 PM – 3:30 AM)',
      slotName: 'late_night',
      typicalDays: 'Thursday to Sunday nights',
      onlineProbabilityPercent: 91,
      isCurrentlyInActiveWindow: true,
      timezone: 'GMT+5:30 (Kandy / Sri Lanka)',
      lastSeenDescription: 'Active 12m ago'
    }
  },
  {
    id: 'usr_tara',
    name: 'Tara Perera',
    username: 'tara_p',
    age: 24,
    location: 'Colombo, Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    tagline: 'Documentary photographer & literature nerd. Let us skip the surface chatter.',
    headline: 'Documenting human stories through film grain and honest moments.',
    status: 'Photographer & Writer',
    languages: ['English', 'Sinhala'],
    aboutMeLong: 'Capturing moments people forget to look at twice.',
    personalQuote: {
      quote: 'Photography is an immediate reaction, drawing is a meditation.',
      author: 'Henri Cartier-Bresson'
    },
    intent: 'Dating',
    energy: 'Introvert',
    conflictStyle: 'Direct Discussion',
    affectionStyle: 'Quality Time',
    socialEnergy: 'Recharge in Solitude',
    idealConversation: 'Analyzing human nature through photography and memoirs',
    coreValues: ['Loyalty', 'Intellectual Honesty', 'Vulnerability', 'Curiosity'],
    interests: ['Cinematography', 'Literature', 'Psychology', 'Ambient Lo-Fi', 'Film Noir'],
    likes: ['Sincere storytelling', 'Film grain', 'Spontaneous walks without agendas'],
    dislikes: ['Ghosting', 'People who only talk about material status', 'Dishonesty'],
    deepQuestion: {
      question: 'What do you wish people understood about you?',
      answer: 'My quietness is not disinterest—it is how I absorb and genuinely appreciate what is around me.'
    },
    compatibilityScore: 93,
    matchReasons: [
      '93% Human Compatibility Index',
      'Shared values: Intellectual Honesty & Curiosity',
      'Shared obsessions with Cinematography and Ambient music'
    ],
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1229-large.mp4',
    voiceIntroUrl: '#',
    relationshipStage: 'Stranger',
    likesYou: true,
    socialLinks: [
      { platform: 'Instagram', handle: '@tara.grain', url: '#', verified: true, followersCount: '1.2k', visibility: 'public' }
    ],
    activeTimeWindow: {
      periodLabel: 'Golden Hour & Evening (5:30 PM – 9:00 PM)',
      slotName: 'evening',
      typicalDays: 'Weekdays after photography shoots',
      onlineProbabilityPercent: 84,
      isCurrentlyInActiveWindow: false,
      timezone: 'GMT+5:30 (Colombo / Sri Lanka)',
      lastSeenDescription: 'Active 2h ago'
    }
  },
  {
    id: 'usr_dinuk',
    name: 'Dinuk Fernando',
    username: 'dinuk_f',
    age: 25,
    location: 'Galle, Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tagline: 'Marine biology student. Always up for late-night coffee and honest chats.',
    headline: 'Researching coral reefs by day, listening to ocean waves by night.',
    status: 'Student & Volunteer Listener',
    languages: ['English', 'Sinhala'],
    aboutMeLong: 'Always ready to offer an empathetic listening ear.',
    personalQuote: {
      quote: 'In the end, we only conserve what we love.',
      author: 'Baba Dioum'
    },
    intent: 'Talk & Support',
    energy: 'Ambivert',
    conflictStyle: 'Direct Discussion',
    affectionStyle: 'Acts of Care',
    socialEnergy: 'Always Available',
    idealConversation: 'Listening to how people survived their hardest years',
    coreValues: ['Kindness', 'Loyalty', 'Empathy'],
    interests: ['Marine Biology', 'Ocean Conservation', 'Acoustic Guitar', 'Philosophy'],
    likes: ['Being a listening ear', 'Calm sea breezes', 'Authentic emotion'],
    dislikes: ['Judgmental attitudes', 'Unsolicited cynical advice'],
    deepQuestion: {
      question: 'What does a meaningful friendship mean to you?',
      answer: 'A place where you never have to put on a mask or pretend you have everything figured out.'
    },
    compatibilityScore: 84,
    matchReasons: [
      'Empathetic listener availability',
      'Shares direct discussion and thoughtful conflict handling'
    ],
    activeTimeWindow: {
      periodLabel: 'Early Morning & Afternoon (7:00 AM – 11:30 AM)',
      slotName: 'morning',
      typicalDays: 'Daily before & after marine fieldwork',
      onlineProbabilityPercent: 79,
      isCurrentlyInActiveWindow: false,
      timezone: 'GMT+5:30 (Galle / Sri Lanka)',
      lastSeenDescription: 'Active this morning'
    }
  }
];

export const MOCK_CIRCLES: SocialCircle[] = [
  {
    id: 'cir_1',
    name: 'Midnight Philosophers',
    topic: 'Deep Thoughts & Life Questions',
    description: 'A cozy sanctuary for nocturnal thinkers to unpack books, consciousness, and quiet observations.',
    membersCount: 8,
    maxMembers: 10,
    avatarIcon: 'Moon',
    currentActivity: 'Prompt: What childhood dream did you let go of, and why?',
    activeVoiceRoom: true,
    tags: ['Philosophy', '1AM Chats', 'Introverts']
  },
  {
    id: 'cir_2',
    name: 'Zero-Burnout Coders',
    topic: 'Engineering & Creative Projects',
    description: 'Small group of developers building passion projects without hustle-culture toxic pressure.',
    membersCount: 6,
    maxMembers: 8,
    avatarIcon: 'Code',
    currentActivity: 'Show & Tell: Demoing side project prototypes',
    activeVoiceRoom: false,
    tags: ['Tech', 'Creative Agency', 'Indie Web']
  },
  {
    id: 'cir_3',
    name: 'Social Anxiety Safe Haven',
    topic: 'Micro-Social Experiments',
    description: 'Gentle step-by-step space to practice starting conversations and expressing yourself without judgment.',
    membersCount: 9,
    maxMembers: 10,
    avatarIcon: 'HeartHandshake',
    currentActivity: 'Challenge #2: Share one weird hobby you keep secret',
    activeVoiceRoom: false,
    tags: ['Growth', 'Safe Space', 'Anxiety Support']
  },
  {
    id: 'cir_4',
    name: 'Analog Cinema & Film Grain',
    topic: 'Movies & Visual Arts',
    description: 'Deconstructing frame composition, scriptwriting subtleties, and cinematography masterpieces.',
    membersCount: 7,
    maxMembers: 10,
    avatarIcon: 'Film',
    currentActivity: 'Reviewing: The psychological impact of Wong Kar-wai films',
    activeVoiceRoom: true,
    tags: ['Cinema', 'Art', 'Aesthetics']
  }
];

export const MOCK_CHALLENGES: SocialChallenge[] = [
  {
    level: 1,
    title: 'Self-Reflection Pulse',
    description: 'Answer today’s deep self-discovery question to illuminate your communication archetype.',
    targetAction: 'Answer 1 Daily Question',
    xp: 50,
    completed: true
  },
  {
    level: 2,
    title: 'Appreciate a Stranger’s Passion',
    description: 'Leave a thoughtful comment on someone’s unique interest or project on the global board.',
    targetAction: 'Comment on 1 Profile Interest',
    xp: 100,
    completed: true
  },
  {
    level: 3,
    title: 'Break the Surface Barrier',
    description: 'Start a conversation using an open-ended question instead of a generic "hey".',
    targetAction: 'Initiate 1 Meaningful Dialogue',
    xp: 150,
    completed: false
  },
  {
    level: 4,
    title: 'Circle Gathering',
    description: 'Join a Social Circle of 5–10 members and introduce your favorite obsession.',
    targetAction: 'Participate in a Micro-Circle',
    xp: 200,
    completed: false
  },
  {
    level: 5,
    title: 'The Real-Time Voice Step',
    description: 'Listen or speak in a cozy audio lounge for at least 5 minutes.',
    targetAction: 'Enter a Voice Sanctuary Room',
    xp: 300,
    completed: false
  }
];

export const MOCK_ANON_QUESTIONS: AnonymousQuestion[] = [
  {
    id: 'q1',
    question: 'What is something you have always wanted to tell me, but never felt the timing was right?',
    authorNote: 'Share this link on your Instagram Story or WhatsApp to invite anonymous thoughts.',
    responses: [
      {
        id: 'r1',
        text: 'You give the calmest advice when everyone else is panicking. You don’t give yourself enough credit for that.',
        timestamp: '2 hours ago'
      },
      {
        id: 'r2',
        text: 'I admire how unapologetically you dive into niche topics without caring if it’s mainstream.',
        timestamp: 'Yesterday'
      }
    ]
  }
];
