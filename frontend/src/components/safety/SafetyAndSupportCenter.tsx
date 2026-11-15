import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  PhoneCall, 
  BookOpen, 
  Globe2, 
  Heart, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  AlertTriangle, 
  Lock, 
  MessageCircle, 
  LifeBuoy,
  FileText,
  UserCheck,
  Compass,
  Wind
} from 'lucide-react';

/* ========================================================================= */
/* 1. TYPES & DATA STRUCTURES                                                */
/* ========================================================================= */

export interface SafetyArticle {
  id: string;
  category: 'dating_irl' | 'privacy' | 'consent' | 'red_flags' | 'reporting';
  title: string;
  readTime: string;
  summary: string;
  icon: string;
  content: {
    introduction: string;
    keyRules: { title: string; explanation: string }[];
    practicalChecklist: string[];
    emergencyTip: string;
  };
}

export interface HelplineItem {
  id: string;
  region: 'global' | 'sri_lanka' | 'us_ca' | 'uk_ie' | 'aus_nz' | 'india' | 'europe';
  name: string;
  organization: string;
  number: string;
  smsText?: string;
  is24x7: boolean;
  isFree: boolean;
  languages: string[];
  specialty: string;
  website: string;
  description: string;
}

/* ========================================================================= */
/* 2. COMPREHENSIVE SAFETY DOCUMENTS & ARTICLES                              */
/* ========================================================================= */

export const SAFETY_ARTICLES: SafetyArticle[] = [
  {
    id: 'dating_irl_safety',
    category: 'dating_irl',
    title: 'Meeting in Person Safely: The Complete Real-World Protocol',
    readTime: '4 min read',
    summary: 'Essential guidelines for transitioning from digital conversation to meeting in physical reality.',
    icon: '📍',
    content: {
      introduction: 'Meeting someone new in person should feel exciting, comfortable, and dignified. Your safety is always the highest priority—above politeness, convenience, or social awkwardness.',
      keyRules: [
        {
          title: 'Always Meet in Populated, Neutral Public Spaces',
          explanation: 'Choose busy coffee shops, museums, public art galleries, or bustling restaurants. Avoid private residences, hotel rooms, secluded beaches, or private cars for at least the first 2-3 meetings.'
        },
        {
          title: 'Control Your Own Transportation',
          explanation: 'Never accept a ride from your date on the first meeting. Drive yourself, take a verified ride-share (Uber/PickMe), or use public transit so you maintain complete autonomy to leave at any moment.'
        },
        {
          title: 'Share Your Live Location with a Trusted Friend',
          explanation: 'Tell at least one close friend or family member exactly where you are going, who you are meeting, and share your live GPS location. Set up a scheduled check-in text at an agreed time.'
        },
        {
          title: 'Guard Your Drink & Personal Belongings',
          explanation: 'Never leave food or beverages unattended. If you visit the restroom, order a fresh drink upon return. Keep your phone, bag, and keys with you at all times.'
        },
        {
          title: 'Give Yourself Complete Permission to Leave',
          explanation: 'If intuition flags discomfort, if their behavior diverges from their profile, or if you simply do not feel safe, leave immediately. You do not owe anyone an excuse or debate.'
        }
      ],
      practicalChecklist: [
        'Confirm venue address and ensure your phone is at least 80% charged.',
        'Keep emergency cash and an independent transport app ready.',
        'Agree on an "SOS Safe Word" with your check-in buddy.',
        'Stay sober or keep alcohol consumption minimal to protect your instincts.'
      ],
      emergencyTip: 'If you feel threatened in a venue, approach the bartender or manager and ask for help or an "Angel Shot"—hospitality staff are trained to escort you safely.'
    }
  },
  {
    id: 'digital_privacy_security',
    category: 'privacy',
    title: 'Digital Privacy & Financial Scam Prevention',
    readTime: '5 min read',
    summary: 'Protecting your personal data, detecting catfishing, and preventing romance or financial fraud.',
    icon: '🔒',
    content: {
      introduction: 'Modern intimacy happens across digital networks. Guarding your private identity and finances allows authentic vulnerability without exposing yourself to malicious actors.',
      keyRules: [
        {
          title: 'Never Send Money, Crypto, or Gift Cards',
          explanation: 'Under NO circumstances should you ever transfer funds, wire money, buy cryptocurrency, or provide gift card codes to someone you met online, regardless of how urgent their sob story seems.'
        },
        {
          title: 'Keep Personal Contact Details Private Early On',
          explanation: 'Use the in-app chat until mutual trust and verification have been earned. Avoid giving out your home address, workplace, personal email, or private phone number on day one.'
        },
        {
          title: 'Inspect Photo Metadata & Reverse Image Search',
          explanation: 'Scammers frequently steal photos from influencers or models. If a profile looks unrealistically polished or refuses audio/video verification, run a reverse image search on Google or TinEye.'
        },
        {
          title: 'Beware of Attempts to Migrate Off-Platform Instantly',
          explanation: 'Scammers often pressure users to immediately switch to WhatsApp, Telegram, or encrypted external apps to evade platform moderation and safety detection.'
        }
      ],
      practicalChecklist: [
        'Disable GPS location geotagging in your camera settings before sharing photos.',
        'Never disclose bank accounts, national ID numbers, or mother\'s maiden name.',
        'Report any user who introduces investment schemes, crypto trading, or emergency financial requests.'
      ],
      emergencyTip: 'If someone attempts to blackmail you with private photos (sextortion), DO NOT PAY. Cut contact immediately, preserve screenshots, and report them to law enforcement and platform moderation.'
    }
  },
  {
    id: 'consent_boundaries',
    category: 'consent',
    title: 'Consent, Healthy Boundaries & Non-Violent Communication',
    readTime: '4 min read',
    summary: 'The foundations of respectful human connection, ongoing affirmative consent, and emotional autonomy.',
    icon: '🤝',
    content: {
      introduction: 'True connection cannot exist without emotional and physical safety. Consent is not a one-time transaction; it is an ongoing, enthusiastic, and reversible dialogue.',
      keyRules: [
        {
          title: 'The FRIES Model of Consent',
          explanation: 'Consent must be Freely given (no coercion), Reversible (can stop at any second), Informed (honest intentions), Enthusiastic (wanted, not settled for), and Specific.'
        },
        {
          title: 'Boundary Setting Without Guilt',
          explanation: 'Healthy boundaries sound like: "I am not comfortable sharing that yet," or "I prefer to take things slow." Anyone who respects you will welcome your boundaries with ease.'
        },
        {
          title: 'Recognizing Coercion vs. Agreement',
          explanation: 'If you say "yes" only because someone wore you down, begged, or made you feel guilty, that is coercion—not consent.'
        }
      ],
      practicalChecklist: [
        'Check in periodically: "Is this pacing comfortable for you?"',
        'Respect a "No" immediately without demanding an essay explaining why.',
        'Remember that consent for one activity or conversation does not imply consent for another.'
      ],
      emergencyTip: 'You have the sovereign right to change your mind at any point in any interaction.'
    }
  },
  {
    id: 'red_flags_directory',
    category: 'red_flags',
    title: 'Spotting Red Flags & Manipulative Behavioral Patterns',
    readTime: '3 min read',
    summary: 'Recognize love bombing, gaslighting, boundary erosion, and predatory relational behaviors.',
    icon: '🚩',
    content: {
      introduction: 'Intuition often senses danger before the conscious mind can articulate it. Learn to recognize the common patterns of manipulative personalities.',
      keyRules: [
        {
          title: 'Love Bombing & Fast-Paced Intimacy',
          explanation: 'Excessive affection, declarations of "soulmates" in the first 48 hours, and smothering attention are often used to manufacture artificial dependence.'
        },
        {
          title: 'Boundary Testing',
          explanation: 'Predators often test small boundaries first (e.g., showing up uninvited or insisting after you said "maybe later") to see if you will defend your autonomy.'
        },
        {
          title: 'Passive Aggression & Guilt-Tripping',
          explanation: 'Becoming sullen, cold, or hostile when you take time to reply or decline an invitation indicates an inability to respect independent human agency.'
        }
      ],
      practicalChecklist: [
        'Notice if they ever take accountability when a misunderstanding occurs.',
        'Watch how they treat service staff, waiters, and drivers during dates.',
        'Trust your gut: if someone gives you an unsettled feeling, honor that reaction.'
      ],
      emergencyTip: 'You do not have to "prove" someone is bad before walking away. Your discomfort alone is sufficient justification.'
    }
  },
  {
    id: 'reporting_blocking_protocol',
    category: 'reporting',
    title: 'Reporting, Anonymous Blocking & Our Safety Commitment',
    readTime: '3 min read',
    summary: 'How Soulverse investigates incidents, protects your identity, and enforces community standards.',
    icon: '🛡️',
    content: {
      introduction: 'We maintain zero tolerance for predatory behavior, harassment, hate speech, non-consensual content, and fraud. Here is how our protection system works.',
      keyRules: [
        {
          title: 'Anonymous Blocking',
          explanation: 'When you block a user, they are never notified. Their profile, chat history, and identity disappear from your universe completely.'
        },
        {
          title: 'Confidential Incident Reports',
          explanation: 'Reports are handled directly by our trust & safety team. The reported individual is never shown who submitted the report.'
        },
        {
          title: 'Preservation of Evidence',
          explanation: 'If you experience severe harassment or threats, take screenshots before blocking so our moderation team can review the full context.'
        }
      ],
      practicalChecklist: [
        'Use the "Three Dots" menu in any chat to access "Block User" or "Report".',
        'Provide concise details when reporting to expedite investigations.',
        'Reach out to our dedicated Trust & Safety email: safety@soulverse.im'
      ],
      emergencyTip: 'In situations of immediate physical danger, contact your local emergency services (119/911/999/112) immediately.'
    }
  }
];

/* ========================================================================= */
/* 3. GLOBAL CRISIS & SUICIDE PREVENTION HELPLINES DIRECTORY                 */
/* ========================================================================= */

export const GLOBAL_HELPLINES: HelplineItem[] = [
  // GLOBAL
  {
    id: 'find_a_helpline',
    region: 'global',
    name: 'Find A Helpline',
    organization: 'ThroughLine / International Support Directory',
    number: 'Web Directory',
    is24x7: true,
    isFree: true,
    languages: ['Over 70+ Languages'],
    specialty: 'Suicide prevention & emotional crisis support in 130+ countries',
    website: 'https://findahelpline.com',
    description: 'Free, confidential crisis lines and text support for almost every country worldwide.'
  },
  {
    id: 'befrienders_worldwide',
    region: 'global',
    name: 'Befrienders Worldwide',
    organization: 'Befrienders Global Network',
    number: 'Global Center Locator',
    is24x7: true,
    isFree: true,
    languages: ['Multi-lingual'],
    specialty: 'Global suicide prevention and confidential emotional listening',
    website: 'https://www.befrienders.org',
    description: 'Volunteer emotional support centers operating across 32 countries.'
  },
  {
    id: 'iasp_global',
    region: 'global',
    name: 'International Association for Suicide Prevention (IASP)',
    organization: 'IASP Global Resource Center',
    number: 'Find Local Center',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Spanish', 'French'],
    specialty: 'Official global suicide prevention resources and emergency directory',
    website: 'https://www.iasp.info/resources/Crisis_Centres/',
    description: 'World-recognized authority in suicide prevention and emergency contacts.'
  },
  {
    id: 'seven_cups',
    region: 'global',
    name: '7 Cups of Tea',
    organization: '7 Cups Mental Health',
    number: 'Online 24/7 Chat',
    is24x7: true,
    isFree: true,
    languages: ['English', '140+ languages via translation'],
    specialty: 'Free 24/7 online chat with trained active listeners and peer support',
    website: 'https://www.7cups.com',
    description: 'Confidential 1-on-1 chat sanctuary for loneliness, anxiety, and heartbreak.'
  },

  // SRI LANKA
  {
    id: 'nimh_1926',
    region: 'sri_lanka',
    name: 'National Mental Health Helpline (NIMH)',
    organization: 'Ministry of Health, Sri Lanka',
    number: '1926',
    is24x7: true,
    isFree: true,
    languages: ['Sinhala', 'Tamil', 'English'],
    specialty: 'Mental health emergencies, suicide prevention, clinical distress',
    website: 'https://nimh.health.gov.lk',
    description: 'Official national psychiatric crisis hotline. Toll-free from any mobile or landline in Sri Lanka.'
  },
  {
    id: 'cccline_1333',
    region: 'sri_lanka',
    name: 'CCCline (Courage Compassion Commitment)',
    organization: 'CCC Foundation Sri Lanka',
    number: '1333',
    is24x7: true,
    isFree: true,
    languages: ['Sinhala', 'Tamil', 'English'],
    specialty: '24/7 crisis counseling and emotional distress management',
    website: 'https://cccline.org',
    description: 'Toll-free, non-judgmental professional crisis support across Sri Lanka.'
  },
  {
    id: 'sumithrayo_lk',
    region: 'sri_lanka',
    name: 'Sumithrayo Suicide Prevention Center',
    organization: 'Sumithrayo (Member of Befrienders Worldwide)',
    number: '011 269 6666',
    is24x7: false,
    isFree: true,
    languages: ['Sinhala', 'Tamil', 'English'],
    specialty: 'Confidential emotional support for loneliness, despair, and grief',
    website: 'https://www.sumithrayo.org',
    description: 'Open 9:00 AM – 8:00 PM every day of the year at 60 Horton Place, Colombo 07.'
  },
  {
    id: 'shanthi_maargam',
    region: 'sri_lanka',
    name: 'Shanthi Maargam Youth Counseling',
    organization: 'Shanthi Maargam NGO',
    number: '071 763 9898',
    is24x7: false,
    isFree: true,
    languages: ['Sinhala', 'Tamil', 'English'],
    specialty: 'Emotional counseling, relationship trauma, and youth safety',
    website: 'https://shanthimaargam.org',
    description: 'Safe emotional sanctuary tailored specifically for teens and young adults.'
  },

  // UNITED STATES & CANADA
  {
    id: 'us_988',
    region: 'us_ca',
    name: '988 Suicide & Crisis Lifeline',
    organization: 'SAMHSA / Vibrant Emotional Health',
    number: '988',
    smsText: '988',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Spanish', '240+ Languages via translation'],
    specialty: 'Immediate suicide crisis, emotional distress, and substance concerns',
    website: 'https://988lifeline.org',
    description: 'Free, confidential support across the US and Canada. Call or text 988 anytime.'
  },
  {
    id: 'crisis_text_line',
    region: 'us_ca',
    name: 'Crisis Text Line',
    organization: 'Crisis Text Line Org',
    number: '741741',
    smsText: 'HOME to 741741',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Spanish'],
    specialty: 'Free 24/7 crisis support via SMS text messaging',
    website: 'https://www.crisistextline.org',
    description: 'Text HOME to 741741 from anywhere in the US or Canada to connect with a crisis counselor.'
  },
  {
    id: 'trevor_project',
    region: 'us_ca',
    name: 'The Trevor Project (LGBTQ+ Youth)',
    organization: 'The Trevor Project',
    number: '1-866-488-7386',
    smsText: 'START to 678-678',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Spanish'],
    specialty: 'Suicide prevention and crisis counseling for LGBTQ young people',
    website: 'https://www.thetrevorproject.org',
    description: 'Trained, affirmative counselors available 24/7 via call or text.'
  },
  {
    id: 'veterans_crisis',
    region: 'us_ca',
    name: 'Veterans Crisis Line',
    organization: 'Department of Veterans Affairs',
    number: '988 (Press 1)',
    smsText: '838255',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Spanish'],
    specialty: 'Dedicated support for military veterans, service members, and families',
    website: 'https://www.veteranscrisisline.net',
    description: 'Dial 988 and press 1, or text 838255 for confidential veteran care.'
  },

  // UK & IRELAND
  {
    id: 'samaritans_uk',
    region: 'uk_ie',
    name: 'Samaritans (UK & Ireland)',
    organization: 'Samaritans Charity',
    number: '116 123',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Welsh'],
    specialty: 'Free 24/7 listening support for anyone struggling to cope',
    website: 'https://www.samaritans.org',
    description: 'Free to call from any phone in the UK or ROI. Does not show on phone bills.'
  },
  {
    id: 'nhs_111',
    region: 'uk_ie',
    name: 'NHS Mental Health Services (111)',
    organization: 'National Health Service UK',
    number: '111',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Translators available'],
    specialty: 'Urgent medical and psychiatric mental health assessment',
    website: 'https://111.nhs.uk',
    description: 'Free 24/7 guidance for immediate mental health concerns.'
  },
  {
    id: 'shout_85258',
    region: 'uk_ie',
    name: 'Shout 85258 Crisis Text Service',
    organization: 'Mental Health Innovations UK',
    number: '85258',
    smsText: 'SHOUT to 85258',
    is24x7: true,
    isFree: true,
    languages: ['English'],
    specialty: 'Free 24/7 confidential mental health support via SMS in the UK',
    website: 'https://giveusashout.org',
    description: 'Text SHOUT to 85258 for immediate anonymous text counseling.'
  },
  {
    id: 'pieta_house',
    region: 'uk_ie',
    name: 'Pieta House (Ireland)',
    organization: 'Pieta Crisis Prevention',
    number: '1800 247 247',
    smsText: 'HELP to 51444',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Irish'],
    specialty: 'Free professional therapy for suicidal distress and self-harm',
    website: 'https://www.pieta.ie',
    description: 'Free, compassionate 24/7 support throughout Ireland.'
  },

  // AUSTRALIA & NEW ZEALAND
  {
    id: 'lifeline_au',
    region: 'aus_nz',
    name: 'Lifeline Australia',
    organization: 'Lifeline Australia',
    number: '13 11 14',
    smsText: '0477 13 11 14',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Interpreter available'],
    specialty: 'National suicide prevention, crisis support, and emotional safety',
    website: 'https://www.lifeline.org.au',
    description: '24/7 crisis support and suicide prevention services across Australia.'
  },
  {
    id: 'beyond_blue',
    region: 'aus_nz',
    name: 'Beyond Blue Support Service',
    organization: 'Beyond Blue Australia',
    number: '1300 22 4636',
    is24x7: true,
    isFree: true,
    languages: ['English'],
    specialty: 'Anxiety, depression, and mental health recovery support',
    website: 'https://www.beyondblue.org.au',
    description: '24/7 phone support and online chat with mental health professionals.'
  },
  {
    id: 'nz_1737',
    region: 'aus_nz',
    name: '1737 Need to Talk? (New Zealand)',
    organization: 'National Telehealth Service NZ',
    number: '1737',
    smsText: '1737',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Māori', 'Samoan', 'Tongan'],
    specialty: 'Free call or text 24/7 with trained counselors in New Zealand',
    website: 'https://1737.org.nz',
    description: 'Free, confidential support from a registered counselor or peer.'
  },

  // INDIA
  {
    id: 'tele_manas',
    region: 'india',
    name: 'Tele-MANAS (Govt of India)',
    organization: 'Ministry of Health & Family Welfare, India',
    number: '14416',
    is24x7: true,
    isFree: true,
    languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', '20+ languages'],
    specialty: 'National tele-mental health programme across all Indian states',
    website: 'https://telemanas.mohfw.gov.in',
    description: 'Toll-free 24/7 crisis counseling and psychiatric guidance in regional languages.'
  },
  {
    id: 'vandrevala_foundation',
    region: 'india',
    name: 'Vandrevala Foundation Helpline',
    organization: 'Vandrevala Foundation India',
    number: '+91 9999 666 555',
    is24x7: true,
    isFree: true,
    languages: ['Hindi', 'English', 'Gujarati', 'Marathi', 'Regional languages'],
    specialty: '24/7 free mental health counseling, depression, and suicide support',
    website: 'https://www.vandrevalafoundation.com',
    description: 'Free, experienced clinical counselors supporting callers across India.'
  },
  {
    id: 'aasra_india',
    region: 'india',
    name: 'AASRA Crisis Line',
    organization: 'AASRA NGO (Befrienders Worldwide affiliate)',
    number: '+91 98204 66726',
    is24x7: true,
    isFree: true,
    languages: ['English', 'Hindi'],
    specialty: 'Suicide prevention and emotional distress sanctuary',
    website: 'http://www.aasra.info',
    description: 'Confidential crisis helpline for distressed or suicidal individuals.'
  },

  // EUROPE (EU)
  {
    id: 'eu_112',
    region: 'europe',
    name: 'European Emergency Number (112)',
    organization: 'European Union Emergency Services',
    number: '112',
    is24x7: true,
    isFree: true,
    languages: ['All EU National Languages'],
    specialty: 'Immediate life-threatening medical and emergency psychiatric dispatch',
    website: 'https://ec.europa.eu/digital-single-market/en/112',
    description: 'Toll-free emergency number accessible from any mobile or landline across all EU countries.'
  },
  {
    id: 'eu_116_123',
    region: 'europe',
    name: 'Emotional Support Helpline (116 123)',
    organization: 'European Federation for Emotional Support',
    number: '116 123',
    is24x7: true,
    isFree: true,
    languages: ['Local National Languages'],
    specialty: 'Free confidential emotional support and suicide prevention across EU',
    website: 'https://www.116123.info',
    description: 'Harmonized European helpline for people suffering from loneliness, distress, or depression.'
  }
];

/* ========================================================================= */
/* 4. MAIN SAFETY & SUPPORT CENTER COMPONENT                                 */
/* ========================================================================= */

interface SafetyAndSupportCenterProps {
  initialTab?: 'articles' | 'helplines' | 'grounding';
  onClose?: () => void;
}

export const SafetyAndSupportCenter: React.FC<SafetyAndSupportCenterProps> = ({
  initialTab = 'articles',
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'articles' | 'helplines' | 'grounding'>(initialTab);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Calming Breathing Exercise State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  // Trigger 4-7-8 Breathing Loop
  React.useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      if (breathPhase === 'Inhale') {
        timer = setTimeout(() => {
          setBreathPhase('Hold');
          setBreathSeconds(7);
        }, 4000);
      } else if (breathPhase === 'Hold') {
        timer = setTimeout(() => {
          setBreathPhase('Exhale');
          setBreathSeconds(8);
        }, 7000);
      } else if (breathPhase === 'Exhale') {
        timer = setTimeout(() => {
          setBreathPhase('Inhale');
          setBreathSeconds(4);
        }, 8000);
      }
    }
    return () => clearTimeout(timer);
  }, [isBreathingActive, breathPhase]);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const selectedArticle = SAFETY_ARTICLES.find(a => a.id === selectedArticleId);

  const filteredHelplines = GLOBAL_HELPLINES.filter(h => {
    if (selectedRegion === 'all') return true;
    return h.region === selectedRegion;
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      
      {/* 1. TOP HEADER & NAVIGATION SWITCHER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-indigo-950/30 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
                Safety, Sanctuary & Global Support
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono uppercase font-bold">
                  24/7 Verified
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Documents for safe dating, digital security protocols, and 24/7 global crisis helplines.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 transition-colors"
            >
              Back to Settings
            </button>
          )}
        </div>

        {/* 3 Main Tabs: Safety Documents vs Global Helplines vs Calming Grounding */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveSection('articles');
              setSelectedArticleId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSection === 'articles'
                ? 'bg-white text-[#090A0E] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Safety Documents ({SAFETY_ARTICLES.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('helplines')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSection === 'helplines'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-rose-300" />
            <span>Global Crisis & Suicide Helplines</span>
          </button>

          <button
            onClick={() => setActiveSection('grounding')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSection === 'grounding'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-300" />
            <span>Calm in the Moment</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: SAFETY DOCUMENTS & ARTICLES                              */}
      {/* =================================================================== */}
      {activeSection === 'articles' && (
        <div className="space-y-4">
          {selectedArticle ? (
            /* DETAILED ARTICLE READER VIEW */
            <div className="p-6 rounded-3xl dark-glass border border-white/15 space-y-6 shadow-2xl animate-fadeIn">
              <button
                onClick={() => setSelectedArticleId(null)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Safety Documents</span>
              </button>

              <div className="space-y-2 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedArticle.icon}</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Official Safety Document • {selectedArticle.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                  {selectedArticle.title}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedArticle.content.introduction}
                </p>
              </div>

              {/* Key Rules List */}
              <div className="space-y-4">
                <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-zinc-400">
                  Key Safety Principles
                </h3>
                <div className="space-y-3">
                  {selectedArticle.content.keyRules.map((rule, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5"
                    >
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span>{rule.title}</span>
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                        {rule.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Actionable Safety Checklist</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-200">
                  {selectedArticle.content.practicalChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emergency Protocol Box */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Emergency Action Protocol</h4>
                  <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">
                    {selectedArticle.content.emergencyTip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ARTICLE CARDS LIST */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-zinc-400">
                  Official Safety Guides & Policies
                </h3>
                <span className="text-xs text-zinc-500">{SAFETY_ARTICLES.length} Articles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SAFETY_ARTICLES.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticleId(article.id)}
                    className="p-5 rounded-2xl dark-glass border border-white/10 hover:border-white/25 hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          {article.icon}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                      <span>Read Full Document</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 2: GLOBAL CRISIS & SUICIDE PREVENTION HELPLINES             */}
      {/* =================================================================== */}
      {activeSection === 'helplines' && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* URGENT CRISIS NOTICE BANNER */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/60 via-red-950/40 to-slate-900 border border-rose-500/40 shadow-2xl relative overflow-hidden space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-heading font-black text-white tracking-tight">
                  You Don't Have to Carry This Alone
                </h3>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  If you are experiencing suicidal thoughts, self-harm urges, overwhelming despair, or acute crisis, 
                  please reach out to a verified crisis lifeline below. They are <strong>free, confidential, and available 24/7</strong>. 
                  Trained professionals are ready to listen without judgment.
                </p>
              </div>
            </div>
          </div>

          {/* REGION FILTER BAR */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Regions' },
              { id: 'global', label: '🌐 International (130+ Countries)' },
              { id: 'sri_lanka', label: '🇱🇰 Sri Lanka (1926 / 1333)' },
              { id: 'us_ca', label: '🇺🇸 🇨🇦 US & Canada (988 / 741741)' },
              { id: 'uk_ie', label: '🇬🇧 🇮🇪 UK & Ireland (116 123 / 111)' },
              { id: 'aus_nz', label: '🇦🇺 🇳🇿 Australia & NZ (13 11 14 / 1737)' },
              { id: 'india', label: '🇮🇳 India (14416 / Vandrevala)' },
              { id: 'europe', label: '🇪🇺 Europe (112 / 116 123)' },
            ].map(reg => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`h-9 px-3.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedRegion === reg.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                    : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <span>{reg.label}</span>
              </button>
            ))}
          </div>

          {/* HELPLINES DIRECTORY LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredHelplines.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl dark-glass border border-white/10 flex flex-col justify-between space-y-3.5 shadow-lg relative overflow-hidden"
              >
                <div className="space-y-2">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      {item.specialty}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.is24x7 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          24/7 Available
                        </span>
                      )}
                      {item.isFree && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{item.name}</h4>
                    <p className="text-xs text-zinc-400">{item.organization}</p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
                    <Globe2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Languages: {item.languages.join(', ')}</span>
                  </div>
                </div>

                {/* Call & Web Actions Cluster */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 flex-wrap">
                  {/* If number is dialable */}
                  {item.number !== 'Web Directory' && item.number !== 'Global Center Locator' && item.number !== 'Find Local Center' && item.number !== 'Online 24/7 Chat' ? (
                    <a
                      href={`tel:${item.number.replace(/\s+/g, '')}`}
                      className="flex-1 h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {item.number}</span>
                    </a>
                  ) : null}

                  {/* Copy Button */}
                  {item.number.length < 20 && !item.number.includes('Web') && !item.number.includes('Center') ? (
                    <button
                      onClick={() => handleCopyNumber(item.number)}
                      className="h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Copy Number"
                    >
                      {copiedNumber === item.number ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedNumber === item.number ? 'Copied' : 'Copy'}</span>
                    </button>
                  ) : null}

                  {/* SMS Text Option */}
                  {item.smsText && (
                    <span className="text-[11px] font-mono text-amber-300 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      SMS: {item.smsText}
                    </span>
                  )}

                  {/* Official Website Link */}
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                      title="Visit Official Helpline Site"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 3: CALM IN THE MOMENT (4-7-8 GROUNDING & PANIC RELIEF)      */}
      {/* =================================================================== */}
      {activeSection === 'grounding' && (
        <div className="p-6 sm:p-8 rounded-3xl dark-glass border border-indigo-500/30 space-y-6 shadow-2xl animate-fadeIn text-center">
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
              <span>4-7-8 Nervous System Regulation</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
              Take a Slow Breath With Us
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              When emotion feels overwhelming, slow, rhythmic breathing physically engages the vagus nerve, reducing cortisol and bringing your heart rate back into balance.
            </p>
          </div>

          {/* Interactive Breathing Sphere */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div 
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 relative ${
                !isBreathingActive 
                  ? 'border-white/20 bg-white/5' 
                  : breathPhase === 'Inhale' 
                    ? 'scale-125 border-sky-400 bg-sky-500/20 shadow-[0_0_50px_rgba(56,189,248,0.4)]' 
                    : breathPhase === 'Hold' 
                      ? 'scale-125 border-amber-400 bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.4)]' 
                      : 'scale-90 border-indigo-400 bg-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
              }`}
            >
              <span className="text-2xl font-black text-white tracking-tight font-heading">
                {isBreathingActive ? breathPhase : 'Ready'}
              </span>
              <span className="text-xs font-mono text-zinc-300 mt-1">
                {isBreathingActive ? `${breathSeconds}s` : 'Tap to start'}
              </span>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`h-11 px-6 rounded-2xl text-xs font-heading font-bold cursor-pointer transition-all shadow-lg ${
                  isBreathingActive 
                    ? 'bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20' 
                    : 'bg-white text-[#090A0E] hover:bg-zinc-200'
                }`}
              >
                {isBreathingActive ? 'Pause Exercise' : 'Begin 4-7-8 Breathing'}
              </button>
            </div>
          </div>

          {/* 5-4-3-2-1 Sensory Grounding Guide */}
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2.5">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300">
              The 5-4-3-2-1 Grounding Rule (During Acute Anxiety or Panic)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              <div><strong>5 things</strong> you can see around you right now</div>
              <div><strong>4 things</strong> you can physically touch or feel</div>
              <div><strong>3 things</strong> you can clearly hear</div>
              <div><strong>2 things</strong> you can smell in the air</div>
              <div className="sm:col-span-2"><strong>1 thing</strong> you can taste, or one kind thought for yourself</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SafetyAndSupportCenter;
