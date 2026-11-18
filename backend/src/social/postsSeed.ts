export interface SeedPostData {
  id: string;
  user_id: string;
  post_type: 'thought' | 'quote' | 'question' | 'story' | 'image' | 'multi_image' | 'poll' | 'reflection';
  title?: string;
  content: string;
  summary?: string;
  media_urls?: string[];
  attachment_json?: any;
  tags: string[];
  visibility: 'public' | 'connections';
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  shares_count: number;
  created_at_offset_hours: number;
}

export const SEED_EDITORIAL_POSTS: SeedPostData[] = [
  {
    id: 'post_elena_01',
    user_id: 'usr_elena',
    post_type: 'thought',
    title: 'The Pacing of Human Attention',
    content: 'We live in an era that treats patience as an inefficiency. But the most memorable frames in cinema — and the most authentic conversations between two people — require dead air. Moments where nothing is performed, and everything is allowed to settle. #cinema #slowliving #presence #humanity',
    summary: 'A meditation on cinematic pacing and unhurried human connection.',
    tags: ['#cinema', '#slowliving', '#presence', '#humanity'],
    visibility: 'public',
    likes_count: 42,
    comments_count: 8,
    bookmarks_count: 19,
    shares_count: 5,
    created_at_offset_hours: 2
  },
  {
    id: 'post_priya_01',
    user_id: 'usr_priya',
    post_type: 'quote',
    title: 'On Cognitive Courage',
    content: '\"Vulnerability is not winning or losing; it’s having the courage to show up when you can’t control the outcome.\" — Brené Brown\n\nIn neural terms, real intimacy requires dampening the amygdala’s threat response long enough to let the prefrontal cortex experience another human being without defense mechanisms. #psychology #neuroscience #vulnerability #truth',
    summary: 'Neural perspective on courage and uncalculated openness.',
    attachment_json: {
      quote_author: 'Brené Brown',
      quote_source: 'Daring Greatly',
      category: 'Psychology'
    },
    tags: ['#psychology', '#neuroscience', '#vulnerability', '#truth'],
    visibility: 'public',
    likes_count: 67,
    comments_count: 14,
    bookmarks_count: 38,
    shares_count: 12,
    created_at_offset_hours: 5
  },
  {
    id: 'post_marcus_01',
    user_id: 'usr_marcus',
    post_type: 'poll',
    title: 'Sanctuary of Mental Clarity',
    content: 'When the noise of modern life becomes overwhelming, which environment restores your mental equilibrium and interior stillness the fastest? #nature #architecture #mindfulness #restoration',
    attachment_json: {
      poll_id: 'poll_marcus_restoration',
      question: 'Which environment restores your interior stillness fastest?',
      options: [
        { id: 'opt_1', text: 'High mountain ridges above the tree line', votes: 84 },
        { id: 'opt_2', text: 'Dense temperate pine forests with wet earth', votes: 61 },
        { id: 'opt_3', text: 'Solitary coastal cliffs facing open ocean', votes: 112 },
        { id: 'opt_4', text: 'An ancient silent stone library', votes: 73 }
      ],
      total_votes: 330,
      user_voted_option_id: null
    },
    tags: ['#nature', '#architecture', '#mindfulness', '#restoration'],
    visibility: 'public',
    likes_count: 89,
    comments_count: 27,
    bookmarks_count: 41,
    shares_count: 9,
    created_at_offset_hours: 9
  },
  {
    id: 'post_dinuk_01',
    user_id: 'usr_dinuk',
    post_type: 'image',
    title: 'The Great Carina Nebula from 3,200m',
    content: 'Captured over four hours of narrow-band exposure from the high-altitude observatory in the central highlands. What looks like fiery dust clouds are ionized stellar nurseries spanning 300 light years across. It is impossible to gaze at this and remain trapped in petty self-importance. #astrophotography #cosmos #nightsky #wonder',
    media_urls: [
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['#astrophotography', '#cosmos', '#nightsky', '#wonder'],
    visibility: 'public',
    likes_count: 145,
    comments_count: 31,
    bookmarks_count: 92,
    shares_count: 28,
    created_at_offset_hours: 14
  },
  {
    id: 'post_tara_01',
    user_id: 'usr_tara',
    post_type: 'story',
    title: 'The Golden Seam: A Lesson from Kyoto Kintsugi',
    content: 'Three years ago in a small studio in north Kyoto, an eighty-year-old potter named Master Kenji watched me accidentally drop a raku tea cup I had spent two days shaping. My instinct was anger and disappointment. He gently took the three shattered fragments, set them on the wooden workbench, and said: \"Now its true life begins.\"\n\nIn kintsugi, lacquer mixed with powdered gold does not disguise the fracture — it illuminates it. The broken vessel becomes more precious and resilient than the intact one because it carries evidence of its endurance. We spend so much energy hiding our fault lines from potential friends and partners, forgetting that our scars are often the only genuine proof that we have lived and healed. #ceramics #kintsugi #philosophy #wabisabi #healing',
    summary: 'A master potter’s reflection on illuminated fractures and authentic vulnerability.',
    media_urls: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['#ceramics', '#kintsugi', '#philosophy', '#wabisabi', '#healing'],
    visibility: 'public',
    likes_count: 198,
    comments_count: 45,
    bookmarks_count: 120,
    shares_count: 36,
    created_at_offset_hours: 22
  },
  {
    id: 'post_sora_01',
    user_id: 'usr_sora',
    post_type: 'thought',
    title: 'Room Resonance & The Sound of Silence',
    content: 'Every room has an inherent resonant fundamental frequency determined by its ceiling height and wall density. When you sit in complete stillness with closed eyes, what you hear is not absolute silence, but the architectural tuning fork of the room breathing around you. #acoustics #soundscapes #ambient #deeplistening',
    attachment_json: {
      audio_track: {
        title: 'Shallow Waters (Tape Loop in F# Minor)',
        artist: 'Sora Tanaka',
        duration_seconds: 248,
        preview_url: 'https://cdn.freesound.org/previews/512/512498_6687700-lq.mp3'
      }
    },
    tags: ['#acoustics', '#soundscapes', '#ambient', '#deeplistening'],
    visibility: 'public',
    likes_count: 73,
    comments_count: 11,
    bookmarks_count: 54,
    shares_count: 16,
    created_at_offset_hours: 30
  },
  {
    id: 'post_alex_01',
    user_id: 'usr_alex',
    post_type: 'question',
    title: 'Craft Over Haste',
    content: 'What is something you make or do by hand solely for the tactile pleasure of doing it, with zero intention of monetizing or broadcasting it to an audience? #craft #creativity #tactile #solitude',
    summary: 'A question exploring uncommodified creative expression.',
    tags: ['#craft', '#creativity', '#tactile', '#solitude'],
    visibility: 'public',
    likes_count: 112,
    comments_count: 39,
    bookmarks_count: 63,
    shares_count: 18,
    created_at_offset_hours: 40
  },
  {
    id: 'post_elena_02',
    user_id: 'usr_elena',
    post_type: 'image',
    title: 'Morning Fog on the Kamogawa River (35mm Portra 400)',
    content: 'Early dawn before the city wakes. Film has a distinct organic imperfection that digital sensors cannot replicate — chemical grain doesn’t pixelate; it dissolves like memories. #35mm #filmphotography #analog #kyoto',
    media_urls: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['#35mm', '#filmphotography', '#analog', '#kyoto'],
    visibility: 'public',
    likes_count: 156,
    comments_count: 19,
    bookmarks_count: 88,
    shares_count: 22,
    created_at_offset_hours: 50
  },
  {
    id: 'post_marcus_02',
    user_id: 'usr_marcus',
    post_type: 'thought',
    title: 'Granite and Silence: Alpine Vernacular Architecture',
    content: 'Traditional stone huts in the Valais Alps were built using dry masonry with zero mortar. By allowing mountain winds to pass through the seams, the structure relieves internal pressure during winter blizzards. In architecture as in human psychology: rigid structures shatter; breathable structures endure. #architecture #alpine #resilience #design',
    summary: 'Lessons in structural and emotional flexibility from alpine masonry.',
    tags: ['#architecture', '#alpine', '#resilience', '#design'],
    visibility: 'public',
    likes_count: 84,
    comments_count: 15,
    bookmarks_count: 49,
    shares_count: 14,
    created_at_offset_hours: 65
  }
];
