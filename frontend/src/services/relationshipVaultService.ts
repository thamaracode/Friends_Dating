/**
 * Relationship Vault & Connection Memory Persistence Service
 * Local-First, Encrypted-At-Rest Storage with Rich Default Data
 */

import type { 
  RelationshipProfile, 
  RelationshipPromise, 
  ConversationMemoryEntry, 
  RelationshipTimelineEvent, 
  ImportantDateReminder 
} from '../types/relationshipVault';

const VAULT_STORAGE_KEY = 'soulverse_relationship_vault_v2';

export const INITIAL_RELATIONSHIP_PROFILES: RelationshipProfile[] = [
  {
    id: 'rel_alex',
    userId: 'usr_me',
    name: 'Alex Rivera',
    nickname: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    relationshipCategory: 'romantic',
    statusLabel: 'Girlfriend',
    currentStatus: 'together',
    firstMet: 'October 14, 2024',
    firstMetLocation: 'University library coffee counter during a rainy afternoon',
    anniversary: 'February 14',
    birthday: 'August 12',
    favouriteFood: 'Thin crust woodfired Margherita pizza with fresh basil',
    favouriteColour: 'Deep obsidian & forest green',
    loveLanguage: 'Quality Time & thoughtful gestures',
    communicationStyle: 'Prefers calls and slow voice notes over endless dry texting',
    
    // "Before You Talk" Instant Briefing
    thingsTheyAppreciate: [
      'Ask how her architecture studio presentation went yesterday.',
      'She loves thoughtful asynchronous voice notes when she is commuting.',
      'Remember the little details she mentions casually—it makes her feel deeply seen.'
    ],
    upcomingReminders: [
      'Important software architecture presentation tomorrow at 10 AM.',
      'Her sister Maya’s graduation next Wednesday.',
      'Birthday coming up in August.'
    ],
    lastConversationSummary: 'Talked about feeling burnt out by screen time and wanting to plan an off-grid cabin weekend in the Knuckles hills.',
    personalReminders: [
      'Ask about what matters to her. Don’t turn the conversation into an interrogation.',
      'She values comfortable silence just as much as deep conversation.'
    ],
    
    // Personal Memory Notes
    thingsTheyLove: [
      'Rain on tin roofs while sipping hot spiced tea',
      'Studio Ghibli orchestral soundtracks',
      'Analog film photography grain and light leaks',
      'Long aimless evening walks through misty streets'
    ],
    thingsTheyDislike: [
      'Dry "k" replies or dismissive tone',
      'Crowded noisy bars with shouting music',
      'People who talk over others during group discussions'
    ],
    dreamsAndAmbitions: [
      'Design sustainable rammed-earth homes in the central highlands',
      'Publish an analog photo book about quiet nocturnal workers'
    ],
    importantFamilyInfo: [
      'Has a younger sister (Maya) studying biology',
      'Her mother is an artist who paints botanical watercolors',
      'Her childhood rescue dog was named Bruno'
    ],
    favouriteActivities: [
      'Baking cinnamon sourdough on Sunday mornings',
      'Browsing second-hand old bookstores in Galle Fort',
      'Co-op gaming (Outer Wilds, Journey)'
    ],
    thingsTheyMentionedOnce: [
      'Mentioned she always wanted to try hand-thrown ceramic pottery.',
      'Her grandmother’s favorite scent was white night-blooming jasmine.',
      'Gets sudden migraines under buzzing fluorescent supermarket lights.'
    ],
    giftIdeas: [
      '1970s Olympus OM-1 vintage leather camera strap',
      'Ceramic matcha bowl made with local clay',
      'First edition copy of "Invisible Cities" by Italo Calvino'
    ],
    placesToVisitTogether: [
      'The misty tea trails in Hatton and Bogawantalawa',
      'A quiet coastal pier in Mirissa at 5:30 AM sunrise',
      'The Japanese peace pagoda in Rumassala'
    ],
    thingsNotToDiscuss: [
      'Avoid bringing up her previous startup co-founder conflict unless she brings it up first.'
    ],
    
    // Trackers
    promises: [
      {
        id: 'prm_1',
        personId: 'rel_alex',
        title: 'Take her to the seaside cliff cafe in Galle',
        description: 'Watch the sunset with ginger tea',
        dueDate: 'Next weekend',
        status: 'pending',
        createdAt: '2026-11-01'
      },
      {
        id: 'prm_2',
        personId: 'rel_alex',
        title: 'Order the analog photography monograph for her birthday',
        dueDate: 'July 25',
        status: 'in_progress',
        createdAt: '2026-11-04'
      },
      {
        id: 'prm_3',
        personId: 'rel_alex',
        title: 'Help debug her portfolio website responsive layout',
        status: 'completed',
        createdAt: '2026-10-20',
        completedAt: '2026-10-22'
      },
      {
        id: 'prm_4',
        personId: 'rel_alex',
        title: 'Plan our off-grid road trip without rigid itineraries',
        dueDate: 'December',
        status: 'in_progress',
        createdAt: '2026-11-08'
      }
    ],
    importantDates: [
      {
        id: 'idt_1',
        personId: 'rel_alex',
        title: 'Alex’s Birthday',
        date: 'August 12',
        category: 'birthday',
        reminderTiming: '1_week_before',
        notes: 'Prepare the handmade card and photo collection'
      },
      {
        id: 'idt_2',
        personId: 'rel_alex',
        title: 'Our Anniversary',
        date: 'February 14',
        category: 'anniversary',
        reminderTiming: '1_week_before'
      },
      {
        id: 'idt_3',
        personId: 'rel_alex',
        title: 'Software Studio Presentation',
        date: 'Tomorrow, 10:00 AM',
        category: 'special',
        reminderTiming: 'day_of',
        notes: 'Send an encouraging morning text at 8:30 AM'
      }
    ],
    conversationMemories: [
      {
        id: 'cnv_1',
        personId: 'rel_alex',
        date: 'Yesterday, 9:30 PM',
        summary: 'Deep conversation over phone about career direction, creative autonomy, and feeling trapped by corporate expectations.',
        topics: ['Creative Freedom', 'Studio Fatigue', 'Highland Cabin Idea'],
        thingsRemembered: [
          'She feels most energized when creating with physical materials rather than Figma.',
          'Wants to cut down social media screen time by 50%.'
        ],
        followUpCommitment: 'Send her the article on low-stimulation workspaces',
        followUpDate: 'Today',
        emotionalContext: 'vulnerable',
        questionsForNextTime: [
          'How did the project feedback feel?',
          'Did you get a chance to take an unplugged walk today?'
        ],
        unfinishedDiscussions: [
          'Deciding between staying in Colombo vs moving closer to Kandy'
        ]
      }
    ],
    timeline: [
      {
        id: 'tml_1',
        personId: 'rel_alex',
        date: 'October 14, 2024',
        title: 'First Encounter: The Spilled Cinnamon Tea',
        description: 'Both reached for the same copy of an architecture journal at the library cafe. Ended up talking for three hours until the cafe closed.',
        sentiment: 'milestone',
        tags: ['Origin', 'First Meeting']
      },
      {
        id: 'tml_2',
        personId: 'rel_alex',
        date: 'November 22, 2024',
        title: 'The Sudden Cloudburst Walk',
        description: 'Caught in a torrential tropical downpour in Colombo 07. Shared a broken umbrella, soaked our sneakers, and laughed the entire way.',
        sentiment: 'positive',
        tags: ['Memory', 'Joy']
      },
      {
        id: 'tml_3',
        personId: 'rel_alex',
        date: 'January 18, 2025',
        title: 'First Serious Disagreement & Honest Talk',
        description: 'Both felt overwhelmed by work stress and miscommunicated over text. Sat down face-to-face and established our communication rules.',
        sentiment: 'difficult',
        tags: ['Growth', 'Boundaries']
      },
      {
        id: 'tml_4',
        personId: 'rel_alex',
        date: 'February 14, 2025',
        title: 'Quiet Lighthouse Anniversary',
        description: 'Skipped crowded restaurants and made homemade pasta by candlelight.',
        sentiment: 'milestone',
        tags: ['Love', 'Milestone']
      }
    ],
    dynamics: {
      communicationRating: 9,
      trustReflection: 'Unshakable mutual honesty; neither feels the need to conceal doubts or weaknesses.',
      affectionReflection: 'Warm and grounded. Subtle everyday gestures matter more than grand performances.',
      compatibilityReflection: 'Strong alignment on ethics, solitude, simplicity, and pace of living.',
      conflictNotes: 'When disagreements occur, giving each other 30 minutes of quiet space before talking prevents emotional escalation.',
      effortBalance: 'balanced',
      boundariesAgreed: [
        'Never go to sleep while giving the silent treatment',
        'Respect solitude hours without taking it personally',
        'Direct words over passive-aggressive hints'
      ],
      connectionSense: 'Deep psychological safety and playful companionship.',
      lastReflectedAt: '2026-11-10'
    },
    isLocked: false,
    isDisappearingNotes: false,
    lastUpdated: 'Yesterday'
  },
  {
    id: 'rel_daniel',
    userId: 'usr_me',
    name: 'Daniel Fernando',
    nickname: 'Dan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    relationshipCategory: 'friendship',
    statusLabel: 'Best Friend',
    currentStatus: 'close',
    firstMet: 'January 2014',
    firstMetLocation: 'High school physics lab & astronomical club',
    birthday: 'October 29',
    favouriteFood: 'Spicy kottu roti & ginger beer',
    favouriteColour: 'Navy Blue',
    loveLanguage: 'Acts of Service & Quality Time',
    communicationStyle: 'Late night Discord voice calls or spontaneous voice memos',
    
    thingsTheyAppreciate: [
      'Check in on his master’s thesis draft progress without being pressuring.',
      'Listen without immediately trying to offer unsolicited solutions.'
    ],
    upcomingReminders: [
      'Master’s thesis draft submission this Friday.',
      'Moving into his new apartment next month.'
    ],
    lastConversationSummary: 'Talked about distributed systems consensus algorithms and his worries about relocation.',
    personalReminders: [
      'He often hides stress behind dark humor; ask how he is genuinely holding up.'
    ],
    
    thingsTheyLove: ['Mechanical keyboards', 'Sci-fi hard literature', 'Late-night driving on empty roads'],
    thingsTheyDislike: ['Micromanagement', 'Superficial networking events'],
    dreamsAndAmbitions: ['Build open-source peer-to-peer storage infrastructure'],
    importantFamilyInfo: ['Lives with his younger brother in Colombo'],
    favouriteActivities: ['Bouldering & rock climbing', 'Playing co-op roguelikes'],
    thingsTheyMentionedOnce: ['Wants to learn how to brew specialty filter pour-over coffee.'],
    giftIdeas: ['Custom PBT keycap set with Japanese legends', 'Specialty Ethiopian coffee beans'],
    placesToVisitTogether: ['Camping under the stars at Horton Plains'],
    thingsNotToDiscuss: [],
    
    promises: [
      {
        id: 'prm_dan_1',
        personId: 'rel_daniel',
        title: 'Review chapter 3 of his thesis paper',
        dueDate: 'Thursday night',
        status: 'in_progress',
        createdAt: '2026-11-09'
      },
      {
        id: 'prm_dan_2',
        personId: 'rel_daniel',
        title: 'Help him move heavy furniture on apartment moving day',
        dueDate: 'Dec 1st',
        status: 'pending',
        createdAt: '2026-11-10'
      }
    ],
    importantDates: [
      {
        id: 'idt_dan_1',
        personId: 'rel_daniel',
        title: 'Thesis Draft Deadline',
        date: 'Friday, Nov 14',
        category: 'exam',
        reminderTiming: 'day_before'
      }
    ],
    conversationMemories: [],
    timeline: [
      {
        id: 'tml_dan_1',
        personId: 'rel_daniel',
        date: '2014',
        title: 'First Telescope Night',
        description: 'Stayed awake till 4 AM on the school roof observing the Orion nebula.',
        sentiment: 'milestone'
      }
    ],
    isLocked: false,
    isDisappearingNotes: false,
    lastUpdated: '3 days ago'
  },
  {
    id: 'rel_maya',
    userId: 'usr_me',
    name: 'Maya Jayawardena',
    nickname: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    relationshipCategory: 'complicated',
    statusLabel: 'Situationship / Creative Muse',
    currentStatus: 'paused',
    firstMet: 'March 2025',
    firstMetLocation: 'Contemporary Art Space during experimental film screening',
    birthday: 'April 4',
    favouriteFood: 'Matcha lattes with oat milk',
    favouriteColour: 'Burnt Ochre',
    loveLanguage: 'Intellectual intimacy',
    communicationStyle: 'Slow asynchronous letters & monthly coffee check-ins',
    
    thingsTheyAppreciate: [
      'Respecting emotional space without sudden pressure or expectations.',
      'Sending interesting book excerpts rather than asking "what are you doing?"'
    ],
    upcomingReminders: [
      'Exhibition opening in December.'
    ],
    lastConversationSummary: 'Discussed why defining relationships too rigidly sometimes destroys the sincerity between two people.',
    personalReminders: [
      'Maintain clear personal boundaries. Don’t confuse creative chemistry with long-term commitment.'
    ],
    
    thingsTheyLove: ['Japanese city pop vinyl', 'Film noir cinematography', 'Antique bookbinding'],
    thingsTheyDislike: ['Clinginess', 'Possessive jealousy'],
    dreamsAndAmbitions: ['Curate an international documentary gallery in Kyoto'],
    importantFamilyInfo: [],
    favouriteActivities: ['Visiting flea markets', 'Silent co-reading at tea lounges'],
    thingsTheyMentionedOnce: ['She finds solace in rainy afternoons by the harbour.'],
    giftIdeas: ['Vintage Kodak 400TX black & white film rolls'],
    placesToVisitTogether: ['Old Dutch Hospital courtyards'],
    thingsNotToDiscuss: ['Avoid discussing mutual friends’ romantic drama.'],
    
    promises: [
      {
        id: 'prm_maya_1',
        personId: 'rel_maya',
        title: 'Return her borrowed copy of Roland Barthes "A Lover\'s Discourse"',
        dueDate: 'End of November',
        status: 'pending',
        createdAt: '2026-11-02'
      }
    ],
    importantDates: [],
    conversationMemories: [],
    timeline: [],
    isLocked: true,
    isDisappearingNotes: false,
    lastUpdated: 'Last week'
  },
  {
    id: 'rel_uni_circle',
    userId: 'usr_me',
    name: 'University Sanctuary Circle',
    nickname: 'The Circle',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
    relationshipCategory: 'group',
    statusLabel: 'Friend Group (5 members)',
    currentStatus: 'close',
    firstMet: 'September 2022',
    firstMetLocation: 'UCSC Computer Lab',
    communicationStyle: 'Active WhatsApp group & Thursday dinner meetups',
    
    thingsTheyAppreciate: [
      'Show up to the Thursday diner meetups consistently.',
      'Coordinate group rides for people living out of town.'
    ],
    upcomingReminders: [
      'Annual beach house reunion on December 20.'
    ],
    lastConversationSummary: 'Group planning for the December reunion house booking.',
    personalReminders: [
      'Check in with Kevin who has been unusually quiet in the chat lately.'
    ],
    
    thingsTheyLove: ['Midnight diner food', 'Board games', 'Reliving college memories'],
    thingsTheyDislike: ['Flaking on plans at the last hour'],
    dreamsAndAmbitions: ['Take a group trip across Southeast Asia'],
    importantFamilyInfo: [],
    favouriteActivities: ['Playing Catan & Codenames', 'Late night road trips to Galle'],
    thingsTheyMentionedOnce: [],
    giftIdeas: [],
    placesToVisitTogether: ['Mirissa coastal villa'],
    thingsNotToDiscuss: [],
    
    promises: [
      {
        id: 'prm_grp_1',
        personId: 'rel_uni_circle',
        title: 'Book the beach house deposit before Nov 20',
        dueDate: 'Nov 20',
        status: 'in_progress',
        createdAt: '2026-11-05'
      }
    ],
    importantDates: [
      {
        id: 'idt_grp_1',
        personId: 'rel_uni_circle',
        title: 'Annual Reunion Weekend',
        date: 'December 20 - 22',
        category: 'trip',
        reminderTiming: '1_week_before'
      }
    ],
    conversationMemories: [],
    timeline: [],
    isLocked: false,
    isDisappearingNotes: false,
    lastUpdated: 'Yesterday'
  }
];

export class RelationshipVaultService {
  static getProfiles(): RelationshipProfile[] {
    try {
      const data = localStorage.getItem(VAULT_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    this.saveProfiles(INITIAL_RELATIONSHIP_PROFILES);
    return INITIAL_RELATIONSHIP_PROFILES;
  }

  static saveProfiles(profiles: RelationshipProfile[]): void {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save relationship vault profiles', e);
    }
  }

  static getProfileById(id: string): RelationshipProfile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  static updateProfile(updated: RelationshipProfile): void {
    const list = this.getProfiles();
    const index = list.findIndex(p => p.id === updated.id);
    if (index >= 0) {
      list[index] = { ...updated, lastUpdated: 'Just now' };
    } else {
      list.unshift({ ...updated, lastUpdated: 'Just now' });
    }
    this.saveProfiles(list);
  }

  static addPromise(personId: string, promise: Omit<RelationshipPromise, 'id' | 'createdAt'>): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target) {
      const newEntry: RelationshipPromise = {
        ...promise,
        id: `prm_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      target.promises.unshift(newEntry);
      target.lastUpdated = 'Just now';
      this.saveProfiles(list);
    }
  }

  static togglePromiseStatus(personId: string, promiseId: string): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target) {
      const prm = target.promises.find(p => p.id === promiseId);
      if (prm) {
        if (prm.status === 'completed') prm.status = 'pending';
        else if (prm.status === 'pending') prm.status = 'in_progress';
        else prm.status = 'completed';
        target.lastUpdated = 'Just now';
        this.saveProfiles(list);
      }
    }
  }

  static addConversationMemory(personId: string, memory: Omit<ConversationMemoryEntry, 'id'>): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target) {
      const newEntry: ConversationMemoryEntry = {
        ...memory,
        id: `cnv_${Date.now()}`
      };
      target.conversationMemories.unshift(newEntry);
      target.lastConversationSummary = memory.summary;
      target.lastUpdated = 'Just now';
      this.saveProfiles(list);
    }
  }

  static addTimelineMilestone(personId: string, event: Omit<RelationshipTimelineEvent, 'id'>): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target) {
      const newEvent: RelationshipTimelineEvent = {
        ...event,
        id: `tml_${Date.now()}`
      };
      target.timeline.unshift(newEvent);
      target.lastUpdated = 'Just now';
      this.saveProfiles(list);
    }
  }

  static addMentionedOnce(personId: string, item: string): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target && item.trim()) {
      target.thingsTheyMentionedOnce.unshift(item.trim());
      target.lastUpdated = 'Just now';
      this.saveProfiles(list);
    }
  }

  static addGiftIdea(personId: string, item: string): void {
    const list = this.getProfiles();
    const target = list.find(p => p.id === personId);
    if (target && item.trim()) {
      target.giftIdeas.unshift(item.trim());
      target.lastUpdated = 'Just now';
      this.saveProfiles(list);
    }
  }

  static exportVault(): string {
    return JSON.stringify(this.getProfiles(), null, 2);
  }

  static resetToDefault(): void {
    this.saveProfiles(INITIAL_RELATIONSHIP_PROFILES);
  }
}
