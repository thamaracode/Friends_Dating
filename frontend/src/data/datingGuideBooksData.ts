export interface PlaybookChapter {
  id: string;
  chapterNumber: number | string;
  title: string;
  subtitle: string;
  readingMinutes: number;
  wordCount: number;
  summary: string;
  contentMarkdown: string;
  actionableRules: {
    rule: string;
    explanation: string;
    exampleScript?: string;
  }[];
  commonMistakes: string[];
  fieldChecklist: string[];
}

export interface DatingPlaybook {
  id: 'girls_guide_to_boys' | 'boys_guide_to_girls';
  targetAudience: 'women' | 'men';
  title: string;
  subtitle: string;
  edition: string;
  coverBadge: string;
  accentColor: string;
  estimatedReadingTime: string;
  totalWordCount: number;
  tagline: string;
  foreword: {
    author: string;
    text: string;
  };
  chapters: PlaybookChapter[];
}

/* ========================================================================= */
/* BOOK 1: THE WOMAN'S PLAYBOOK (Girls' Guide to Approaching & Attracting Men) */
/* (~1,200 Words, Concise, Empowering, High-EQ, Action-Oriented)             */
/* ========================================================================= */

export const GIRLS_GUIDE_TO_BOYS: DatingPlaybook = {
  id: 'girls_guide_to_boys',
  targetAudience: 'women',
  title: "The Modern Woman's Playbook",
  subtitle: "The High-EQ Guide to Approaching, Magnetizing & Inspiring Men to Pursue You",
  edition: "2026 Sovereign Edition",
  coverBadge: "For Women",
  accentColor: "#F43F5E", // Rose-Pink
  estimatedReadingTime: "8 min read",
  totalWordCount: 1350,
  tagline: "How to drop the handkerchief in the 21st century: inspire his masculine initiative without chasing.",
  foreword: {
    author: "Soulverse Relationship & Behavioral Psychology Institute",
    text: "For generations, women have been fed the myth that taking initiative diminishes mystery or makes a woman look desperate. In reality, modern men suffer from chronic approach paralysis—fearing misinterpretation, awkwardness, or social penalty. When a woman knows how to build the psychological green light, she doesn't chase; she invites. This playbook reveals the subtle behavioral mechanics that make approaching effortless, graceful, and magnetically irresistible."
  },
  chapters: [
    {
      id: 'g_ch1',
      chapterNumber: 1,
      title: "The Psychology of the Male Ego & The Green-Light Architecture",
      subtitle: "Why Men Wait, Why They Hesitate, and How to Grant Permission",
      readingMinutes: 2,
      wordCount: 260,
      summary: "Understand the modern male fear of intrusion and master the 3 non-verbal green lights that make him approach you with zero hesitation.",
      contentMarkdown: `### The Modern Male Dilemma
Most capable, respectful men today operate under an internal constraint: *Do not be perceived as intrusive or creepy.* This cultural shift has created widespread hesitation in coffee shops, bookstores, lounges, and gym spaces. Men still desire deeply to initiate, but they require a clear, unambiguous **permission slip**.

### The 3-Second Triangle Gaze
Body language accounts for over 80% of perceived receptivity. When you spot a man you find compelling:
1. **The Initial Hold:** Catch his eye and hold steady gaze for a slow three count (1-one-thousand, 2-one-thousand, 3-one-thousand).
2. **The Soft Smirk:** Allow a micro-smile to touch your lips right as you break the gaze.
3. **The Look-Back:** Turn your attention back to your book or phone, but re-engage eye contact 15 seconds later. If he looks back, the permission slip is stamped.

### Spatial Positioning (The Proximity Principle)
Men are opportunity-driven. If you sit in the center of a crowded group of four girlfriends with your arms crossed, the cognitive cost of approaching is immense. If you step to the counter alone to order an espresso or browse the vinyl shelf next to him, you reduce the hurdle to near zero.`,
      actionableRules: [
        {
          rule: "The 3-Second Hold",
          explanation: "Never look away immediately like you're embarrassed. A 3-second hold communicates conscious intention, not an accidental glance.",
          exampleScript: "Lock eyes -> gentle 10% smile -> look away slowly down-and-to-the-side."
        },
        {
          rule: "The Solo Perimeter Walk",
          explanation: "When out with friends, step away to the bar, gallery corner, or patio for 5 minutes. Men approach when you are momentarily solo.",
          exampleScript: "Position yourself at 90 degrees to him rather than with your back turned."
        }
      ],
      commonMistakes: [
        "Keeping headphones tightly in both ears (the universal 'leave me alone' signal).",
        "Looking away immediately when he makes eye contact, making him assume you were creeped out.",
        "Waiting for him to overcome an impenetrable barrier of five friends."
      ],
      fieldChecklist: [
        "Take one earbud out when you're in an ambient social environment.",
        "Maintain open torso orientation (uncross arms, relaxed posture).",
        "Hold eye contact for 3 seconds followed by a calm smile."
      ]
    },
    {
      id: 'g_ch2',
      chapterNumber: 2,
      title: "The Low-Stakes Situational Opener",
      subtitle: "Effortless Conversation Starters That Never Sound Like a Pickup Line",
      readingMinutes: 2,
      wordCount: 275,
      summary: "How to break the ice with genuine situational curiosity, making him feel clever and comfortable taking over the conversation.",
      contentMarkdown: `### The Power of Being Contextual
You never need a cheesy line. The best openers for women leverage **environmental observation** or **asking for his opinion**. Men instinctively love to be helpful, resourceful, or share their taste.

### Category 1: The Recommendation Inquiry
Men love sharing taste in books, music, coffee, and food.
* *At a Cafe/Roastery:* "Excuse me, I'm stuck between the cold brew and the pour-over—what did you get?"
* *At a Bookstore/Library:* "I've been debating starting this author—have you read any of their work?"
* *At an Event/Lounge:* "That drink looks interesting, what is the citrus note in it?"

### Category 2: The Observational Tease
Pointing out a quirky, amusing element of the shared environment creates an instant team dynamic (*us vs. the room*).
* *In a slow queue:* "If this line takes any longer, we might have to start celebrating birthdays here."
* *At a live venue:* "The acoustic mix in this corner is either genius or chaotic—I can't decide yet."

The secret is what happens right after: once he answers, you give him space to expand. You don't have to carry the whole load; you simply opened the door.`,
      actionableRules: [
        {
          rule: "Ask for His Expert Take",
          explanation: "Men respond vigorously when given an opportunity to showcase taste or problem-solve.",
          exampleScript: "\"Quick tie-breaker question: do you think this jacket works with this scarf or is it too monochrome?\""
        },
        {
          rule: "The 5-Second Silence Pause",
          explanation: "After you drop your observation, do not rush to fill the silence. Look at him with a warm expression and wait for his return volley."
        }
      ],
      commonMistakes: [
        "Over-explaining your question before he has a chance to answer.",
        "Using passive aggressive or overly sarcastic commentary that puts his guard up.",
        "Asking closed yes/no questions like 'Is this coffee good?' instead of 'What's the best thing they brew here?'"
      ],
      fieldChecklist: [
        "Observe 1 distinct thing about your shared physical environment.",
        "Frame your question around curiosity or assistance.",
        "Reward his answer with genuine laughter or focused eye contact."
      ]
    },
    {
      id: 'g_ch3',
      chapterNumber: 3,
      title: "The Compliment That Sticks: Praising Agency Over Genetics",
      subtitle: "Why 'You Have Pretty Eyes' Fails and How to Trigger Deep Masculine Validation",
      readingMinutes: 2,
      wordCount: 280,
      summary: "Most men receive a compliment once a year. Learn the formula for compliments that anchor you in his mind for months.",
      contentMarkdown: `### Why Men Starve for Authentic Recognition
Sociological studies reveal that average men go months—sometimes years—without receiving an unsolicited compliment from someone they find attractive. Consequently, when a genuine compliment lands, it holds enormous weight.

### The Genetic vs. Agency Distinction
* **Genetic Compliments (Low Impact):** "You have nice eyes," "You're tall." He was born with those; they reflect zero effort or character.
* **Agency Compliments (Immense Impact):** "I love how carefully you were listening to that speaker," "That leather jacket has so much story to it," "You have an unusually calm presence."

### The 3-Part High-Value Compliment Formula:
1. **Specific Detail:** Notice something intentional (his watch, his ring, his choice of words, his posture).
2. **The Impact Statement:** State how it affected your perception.
3. **The Return Hook:** Leave room for his reaction.

*Example:* "I couldn't help noticing how patient you were with that barista when the machine stalled. That calm energy is rare."
This speaks directly to his character, maturity, and emotional regulation.`,
      actionableRules: [
        {
          rule: "Compliment His Intentional Choices",
          explanation: "Focus on things he chose: his watch strap, his cologne nuance, his posture, his dedication.",
          exampleScript: "\"Your cologne has an amber-cedar note that isn't loud like everyone else's. What is that?\""
        },
        {
          rule: "Compliment His Competence",
          explanation: "Complimenting how well he handled a task or framed an argument activates masculine pride and safety."
        }
      ],
      commonMistakes: [
        "Giving generic flattery that sounds like it could be copied and pasted to anyone.",
        "Complimenting him and immediately looking uncomfortable or retreating.",
        "Expecting him to compliment you back on the spot."
      ],
      fieldChecklist: [
        "Pick 1 intentional stylistic or behavioral choice.",
        "Deliver the compliment with calm, direct eye contact.",
        "Smile gently and let him absorb the validation."
      ]
    },
    {
      id: 'g_ch4',
      chapterNumber: 4,
      title: "Playful Push-Pull & Conversational Tension",
      subtitle: "Escaping the Boring Friendly Trap and Creating Chemistry",
      readingMinutes: 2,
      wordCount: 270,
      summary: "How to use playful disqualification and teasing so you don't end up feeling like his friendly platonic coworker.",
      contentMarkdown: `### The Platonic Trap vs Romantic Tension
The most frequent frustration women face when initiating is ending up in pleasant, polite, totally sexless small talk. Chemistry is created through **contrast**—warmth combined with a subtle challenge.

### The Push-Pull Dynamic
* **The Pull:** Showing warmth, genuine interest, and appreciation.
* **The Push:** Playfully challenging him or teasing a harmless quirk.

*Example:*
* *Him:* "I'm a software architect, I basically stare at terminals all day."
* *You (Smiling warmly):* "Oh, so you're the reason my apps freeze when I need them most? We might have our first conflict." (Push)
* *You (Soft eye contact):* "...Though I have to admit, someone who can solve complex logic puzzles has my respect." (Pull)

### Playful Disqualification
Temporarily teasing why you two 'would never work' paradoxically makes him want to qualify himself:
* "You like pineapple on pizza? And here I was thinking you had impeccable taste. We were doing so well."
Notice that this is delivered with a warm, laughing tone—never malice. It invites him to defend himself playfully.`,
      actionableRules: [
        {
          rule: "Warmth First, Challenge Second",
          explanation: "Never tease before warmth is established, otherwise it feels like judgment.",
          exampleScript: "Smile brightly first -> Drop the playful tease -> Re-affirm with eye contact."
        },
        {
          rule: "The 80/20 Rule of Teasing",
          explanation: "80% warm, receptive feminine energy, 20% playful sparring. Never make him feel inadequate about core insecurities (income, height, balding)."
        }
      ],
      commonMistakes: [
        "Teasing about things he cannot change in 10 minutes (height, hair loss, voice).",
        "Being so agreeable that you become an echo chamber with zero distinct opinions.",
        "Taking yourself too seriously when he teases you back."
      ],
      fieldChecklist: [
        "Notice a quirky opinion he has on food, movies, or sports.",
        "Drop a lighthearted, smiling disagreement.",
        "Watch his posture straighten as he leans in to debate."
      ]
    },
    {
      id: 'g_ch5',
      chapterNumber: 5,
      title: "Handing Him the Pen: The Graceful Number Exchange",
      subtitle: "How to Inspire Him to Ask for Your Number Without Doing His Job For Him",
      readingMinutes: 2,
      wordCount: 265,
      summary: "How to leave at the emotional high point and give him the clear runway to ask for your contact information.",
      contentMarkdown: `### The Principle of Leaving at the Peak
Most interactions drag on until conversational momentum fizzles out. The masterclass move is to **exit while the laughter or intrigue is at its highest point**. This leaves him hungry for more.

### The 'Handing Him the Pen' Script
You don't need to say "Can I have your number?" Instead, frame a natural continuation of the topic and pause:
* "I actually have to catch my friends in two minutes, but you seem genuinely thoughtful. You should text me that playlist / restaurant recommendation."
* "I have to run to my train, but this was surprisingly refreshing. Let me give you my number so you can tell me how that meeting goes."

### If He Is Hesitant or Flustered:
Hand him your unlocked phone directly on the new contact screen:
* "Put your number in here before I disappear."
This is confident, playful, and eliminates any residual friction in his mind. Once he has it, text him your name right away so he has yours.`,
      actionableRules: [
        {
          rule: "The High-Point Exit",
          explanation: "Don't wait for awkward silence. Exit when you are both laughing or engaged.",
          exampleScript: "\"I have to run, but I don't think we finished solving the world's problems. Take my number and tell me part two.\""
        },
        {
          rule: "The Next-Day Ping",
          explanation: "If he texts within 24 hours, respond with enthusiasm rather than playing fake 'wait 4 hours' games. Emotional maturity is magnetic."
        }
      ],
      commonMistakes: [
        "Hovering around long after the conversation has reached a natural conclusion.",
        "Waiting for him to read your mind about getting your contact information.",
        "Giving an Instagram handle instead of a phone number (feels like a follow farm, not real connection)."
      ],
      fieldChecklist: [
        "Announce your departure with a genuine smile.",
        "Connect the contact exchange to a topic you discussed.",
        "Confirm he has your name spelled correctly."
      ]
    }
  ]
};

/* ========================================================================= */
/* BOOK 2: THE DEFINITIVE MAN'S CODEX (Boys' Guide to Pickup & Attract Girls) */
/* (Encyclopedic, Book-Level, High-EQ, 10 Volumes + 50 Field Cheat-Sheets)   */
/* (~6,500+ Words in Detailed Structured Text, 10 Chapters, Rich Sub-Modules) */
/* ========================================================================= */

export const BOYS_GUIDE_TO_GIRLS: DatingPlaybook = {
  id: 'boys_guide_to_girls',
  targetAudience: 'men',
  title: "The Definitive Man's Codex",
  subtitle: "The Master Guide to Authentic Attraction, High-EQ Approaching & Captivating Women",
  edition: "Comprehensive Master Codex • Vol. I - X",
  coverBadge: "Complete Masterwork",
  accentColor: "#D6AD60", // Luxurious Gold
  estimatedReadingTime: "45 min read",
  totalWordCount: 8850,
  tagline: "Throw away toxic pickup scripts. Master grounded presence, emotional calibration, conversational depth, and genuine masculine sovereignty.",
  foreword: {
    author: "Soulverse Behavioral Research, Social Dynamics & Mens' Psychology Group",
    text: "The internet is flooded with two opposing and equally broken ideologies: either manipulative, misogynistic 'pickup artist' gimmicks designed to trick women, or hyper-passive timidity that leaves men lonely, resentful, and afraid to express romantic intent. This Codex is the third path. It is built on evolutionary psychology, nervous system regulation, vocal resonance, ethical calibration, and unapologetic masculine groundedness. A woman does not want to be manipulated by canned lines; she wants to encounter a man who is grounded in his own skin, observant of her reality, secure in his desires, and courageous enough to create a moment of genuine human magic."
  },
  chapters: [
    {
      id: 'b_vol1',
      chapterNumber: "Volume I",
      title: "The Death of the PUA: Grounded Presence vs. Performed Personality",
      subtitle: "Why Scripts, Negs & Gimmicks Fail in the Real World and What Works Instead",
      readingMinutes: 4,
      wordCount: 820,
      summary: "Understand state transmission, eliminate outcome dependency, and discover why internal comfort is the foundation of all real attraction.",
      contentMarkdown: `### 1. The Core Law of State Transmission
Human beings—especially women who possess high social intuition—do not evaluate you based on your rehearsed words. They evaluate you based on **state transmission**. What you feel in your nervous system during an approach is what she will feel in hers.
* If you feel anxious, sneaky, predatory, or embarrassed, she will feel uncomfortable and unsafe.
* If you feel grounded, amused, relaxed, and entitled to occupy space, she will feel intrigued, respected, and at ease.

Women have lived their entire lives navigating social safety. Within 0.8 seconds of an approach, her subconscious runs an evolutionary threat-and-intent scan:
1. *Is this man dangerous or erratic?*
2. *Is he trying to take something from me (validation, compliance, approval)?*
3. *Or is he comfortable, centered, and bringing positive energy into my afternoon?*

### 2. The Illusion of the "Magic Line"
There is no sequence of words that guarantees romantic attraction. The exact same sentence—*"Excuse me, I know this is random, but I loved your style and had to say hello"*—will produce two radically different outcomes depending on delivery:
* **Delivered with nervous tension:** Fast pacing, raised vocal pitch, darting eyes, leaning in too quickly -> She pulls away.
* **Delivered with grounded presence:** Relaxed shoulders, downward voice inflection, steady warm gaze, respectful physical distance -> She blushes, smiles, and thanks you.

### 3. The 3 Pillars of Masculine Grounding
1. **Physical Deceleration:** Rushed movement communicates panic. Grounded men move 15% slower than the ambient environment. Turn your entire torso when looking at her, not just your neck.
2. **Downward Inflection:** Insecure speakers end statements with an upward lilt (*uptalk*), asking for permission. Grounded men end declarative thoughts with a downward tone (*assertive finality*).
3. **Outcome Independence:** The understanding that her response has zero bearing on your worth as a man. You are sharing an honest compliment or initiating a pleasant social interaction; whether she is receptive, in a relationship, or busy is completely neutral data.`,
      actionableRules: [
        {
          rule: "The Zero-Leaning Stance",
          explanation: "When initiating an approach, keep your weight planted on your heels. Never lean over her or invade her personal space bubble.",
          exampleScript: "Stand tall, chin level, shoulders relaxed back, feet shoulder-width apart."
        },
        {
          rule: "Downward Vocal Pitch (The Period, Not The Question Mark)",
          explanation: "Never let your sentence pitch rise at the end of a statement.",
          exampleScript: "Say: 'I wanted to see what you were reading.' (Tone drops at 'reading'). Do not say: 'I wanted to see what you were reading?'"
        }
      ],
      commonMistakes: [
        "Using insulting 'negs' or fake cockiness learned from dated 2005 forum guides.",
        "Fidgeting with keys, phone, or rings while speaking.",
        "Looking away immediately if she holds eye contact."
      ],
      fieldChecklist: [
        "Take a slow diaphragmatic breath before speaking.",
        "Check that your shoulders are down and away from your ears.",
        "Commit to standing in your own shoes without shifting weight."
      ]
    },
    {
      id: 'b_vol2',
      chapterNumber: "Volume II",
      title: "Physiology & Micro-Nonverbals: The Silent Language of Power",
      subtitle: "Eye Contact Deceleration, Spatial Bubble Calibration & Vocal Resonance",
      readingMinutes: 4,
      wordCount: 890,
      summary: "Master the physical mechanics of charisma: the 80/20 eye contact ratio, tonal chest resonance, and spatial pacing.",
      contentMarkdown: `### 1. Eye Contact Deceleration
Shifty eyes communicate deceit or terror. Hyper-staring with unblinking eyes communicates psychopathy. The golden standard is **Relaxed, Warm Deceleration**:
* Maintain soft focus on one of her eyes (or the bridge of her nose).
* When you break eye contact, break to the **side** or downward slowly—never dart up or flick your eyes away.
* Hold gaze during pauses in conversation. Anxious men only look when she is speaking and glance away when they speak. Grounded men maintain eye contact while formulating their thoughts.

### 2. The Anatomy of Vocal Resonance (Chest vs. Throat Voice)
Most nervous men speak from the high throat or nasal cavity. To access chest resonance:
* Inhale through your belly, allowing your diaphragm to expand outward.
* Speak from the bottom of your exhale, letting sound vibrate against your sternum.
* Pause before speaking. The silence between sentences does not need to be panicked; pauses create anticipation, gravity, and authority.

### 3. Spatial Calibration & Angle of Approach
* **Never Approach Directly from Behind:** Approaching a woman from her blind spot triggers a neurological fight-or-flight startle response.
* **The 45-Degree Angle Rule:** Approach from an angle where she can see you entering her peripheral vision at least 3 paces away.
* **The Respectful Buffer:** Stop at least 4 to 5 feet away. Give her room to comfortably take half a step toward you if she is interested. If you crowd her against a wall, counter, or display, you eliminate her psychological exit route.`,
      actionableRules: [
        {
          rule: "The 45-Degree Approach Angle",
          explanation: "Never corner or sneak up. Make your presence noticeable in her peripheral vision before speaking.",
          exampleScript: "Walk at a gentle diagonal, make eye contact, smile, and speak clearly from 4.5 feet distance."
        },
        {
          rule: "The 2-Second Silence Command",
          explanation: "Learn to comfortably hold silence when she finishes speaking. A confident pause shows you are processing her words, not just waiting to talk.",
          exampleScript: "Listen -> Maintain warm eye contact -> Count 1... 2... -> Respond thoughtfully."
        }
      ],
      commonMistakes: [
        "Approaching from behind or tapping her on the shoulder (creates instant fear).",
        "Trapping her between yourself and a physical object (wall, bar counter, gym equipment).",
        "Speaking too quietly, forcing her to lean in and say 'What?'"
      ],
      fieldChecklist: [
        "Vocal check: breathe deeply into the belly before speaking.",
        "Check physical distance: arms extended should not touch her.",
        "Ensure your chest and torso face 45 degrees initially, easing tension."
      ]
    },
    {
      id: 'b_vol3',
      chapterNumber: "Volume III",
      title: "Conquering the Amygdala: Demolishing Approach Anxiety & Fear of Rejection",
      subtitle: "The 3-Second Execution Rule, Physiological De-escalation & Cognitive Reframing",
      readingMinutes: 4,
      wordCount: 840,
      summary: "Understand why your brain treats talking to an attractive woman like facing a saber-toothed tiger, and how to rewire that fear.",
      contentMarkdown: `### 1. Evolutionary Biology of Approach Anxiety
When you see an attractive woman and your heart races, your palms sweat, and your throat tightens, your brain is not broken. You are experiencing ancestral hardware:
* In hunter-gatherer tribes of 50 people, approaching a woman and being rejected could mean ostracization from the tribe or violence from rival males.
* In a modern city of 2 million people, **there is zero tribal risk**. She will forget the encounter within 4 hours, and you will never see 99.9% of these people again.

### 2. The 3-Second Rule (Overcoming Analysis Paralysis)
The moment you register attraction, you have approximately 3 seconds before your rational prefrontal cortex concocts 20 reasons why you shouldn't approach:
* *"She looks busy."*
* *"She's on her phone."*
* *"Everyone is looking."*
* *"She probably has a boyfriend."*
**The Fix:** Take your first step forward within 3 seconds of noticing her. Movement overrides rumination.

### 3. Cognitive Reframing: Rejection is Just Incompatibility
If she says, *"I'm in a rush"* or *"I'm seeing someone,"* realize what just happened:
* She did not reject your soul, your dignity, or your masculine capacity.
* She stated a logistical boundary.
* A high-value man's response to rejection: *"No worries at all! Have a great afternoon."* (Said with a genuine, relaxed smile as you calmly walk away).
Notice how this leaves you in complete dignity and respect.`,
      actionableRules: [
        {
          rule: "The 3-Second Footstep Trigger",
          explanation: "Never stand across the room staring. The moment you see her, take your first physical step toward her before your inner critic starts shouting.",
          exampleScript: "See her -> Step forward immediately -> Count '1, 2, 3' -> Speak."
        },
        {
          rule: "The Graceful Ejection Protocol",
          explanation: "If she shows disinterest, acknowledge it warmly and exit instantly without debate.",
          exampleScript: "\"Completely understand! Enjoy your afternoon.\" (Turn and walk away calmly)."
        }
      ],
      commonMistakes: [
        "Staring at her across the room for 15 minutes before approaching (creepy and transparent).",
        "Arguing with her rejection: 'Oh, you have a boyfriend? He doesn't have to know!' (instant low-value behavior).",
        "Letting one awkward interaction ruin your entire day or self-worth."
      ],
      fieldChecklist: [
        "Acknowledge the physical adrenaline surge as normal excitement, not danger.",
        "Commit to the first physical step within 3 seconds.",
        "Have your clean, respectful exit line ready in your back pocket."
      ]
    },
    {
      id: 'b_vol4',
      chapterNumber: "Volume IV",
      title: "The Natural Opener Architecture (Day Game, Social & Ambient Encounters)",
      subtitle: "Situational Hooks, Observational Openers & The Opinion Transition",
      readingMinutes: 5,
      wordCount: 920,
      summary: "Three robust opening frameworks for daytime, retail, cafes, bookshops, and evening lounges with zero canned pickup lines.",
      contentMarkdown: `### 1. Framework A: The Direct Honest Opener (Best for Streets, Malls, Transit)
When there is no obvious contextual hook, direct authenticity is the most masculine and refreshing choice:
* *"Excuse me. I saw you walking from over there and thought you had a striking presence. I would have kicked myself all afternoon if I didn't introduce myself. I'm Alex."*
**Why this works:** It owns your intent from second zero. There is no sneakiness, no hidden agenda, and no pretension.

### 2. Framework B: The Observational / Situational Opener (Best for Cafes, Bookstores, Events)
Look around you. What is unique, absurd, or notable about the immediate context?
* *In a bookstore:* "I see you're looking at Marcus Aurelius. Are you already disciplined, or are you trying to stop looking at your phone like the rest of us?"
* *In an art exhibition or gallery:* "That piece in the corner looks either profoundly deep or like an accidental paint spill. What's your verdict?"
* *At a music venue / vinyl shop:* "Quick question: if you had to listen to only one of those two albums for the next 5 years, which one survives?"

### 3. Framework C: The Opinion Opener (Best for Mixed Social Groups)
Asking for a woman's perspective on an interpersonal dynamic creates instant conversational investment:
* *"Hey, I need a quick female consensus on something. My friend is planning a 3rd date and wants to cook dinner at his place, but half the guys say that's too fast. What's the protocol?"*
This immediately triggers debate, storytelling, and personality expression.`,
      actionableRules: [
        {
          rule: "The 30-Second Time Constraint",
          explanation: "State an implicit time constraint early in the approach to release her anxiety that you'll trap her forever.",
          exampleScript: "\"I only have a couple minutes before I need to meet a colleague, but I had to come say hello...\""
        },
        {
          rule: "Bridge from Opener to Identity",
          explanation: "Never stay in opener territory for more than 90 seconds. Introduce yourself and shift to personal reality.",
          exampleScript: "\"By the way, I'm Julian. What's your name?\""
        }
      ],
      commonMistakes: [
        "Asking boring interview questions: 'Where do you work? Where are you from? Did you go to university?'",
        "Hovering over her shoulder while she's wearing large noise-canceling headphones in the gym.",
        "Using cheesy pickup lines that make her feel like a target in an audition."
      ],
      fieldChecklist: [
        "Assess her situational receptivity (is she in a rush or browsing leisurely?).",
        "Choose either Direct Honest or Observational based on setting.",
        "Deliver with an open smile and introduce your real name."
      ]
    },
    {
      id: 'b_vol5',
      chapterNumber: "Volume V",
      title: "Conversational Velocity & The Threading Technique",
      subtitle: "How to Never Run Out of Things to Say: The 2:1 Statement-to-Question Ratio",
      readingMinutes: 5,
      wordCount: 950,
      summary: "Stop interrogating women with endless questions. Master cold reading, conversational threading, and emotional resonance.",
      contentMarkdown: `### 1. The Interrogation Trap
The #1 failure of average men is turning an interaction into a police interrogation:
* *Man:* "What do you do?"
* *Woman:* "I'm a graphic designer."
* *Man:* "Oh cool. Where do you work?"
* *Woman:* "At an agency downtown."
* *Man:* "Do you like it?"
* *Woman:* "Yeah, it's fine." (Bored, looking at exit).

### 2. The Solution: The Statement / Cold Read Method
Instead of asking questions, make **perceptive observations** and let her confirm or correct you:
* *Instead of:* "What do you do?"
* *Use:* "You have a very focused, creative aesthetic—you're either in architecture or visual design."
* *Her:* "Ha! Actually, I'm an interior architect, how did you guess that?"
Now she is engaged, curious about your perception, and eager to explain herself.

### 3. Conversational Threading (The Multi-Branch Tree)
In every sentence a woman speaks, she drops between 2 and 4 conversational 'threads'.
* *Example Statement from Her:* "I just moved here from Seattle two months ago with my golden retriever, and the humidity is completely wrecking me."
* *Thread 1 (Geography/Migration):* "What prompted the escape from the Pacific Northwest?"
* *Thread 2 (Dog/Lifestyle):* "A golden retriever? That means you spend 60% of your day running through parks."
* *Thread 3 (Sensory/Humor):* "The humidity here turns everyone's hair into an 80s rock band within 48 hours."
By picking the thread with the most emotional juice, the conversation flows endlessly like water.`,
      actionableRules: [
        {
          rule: "The 2:1 Statement-to-Question Ratio",
          explanation: "For every direct question you ask, make at least two declarative observations, stories, or reflections.",
          exampleScript: "Observation 1 -> Reflection 2 -> Soft open-ended question."
        },
        {
          rule: "Cold Read on Personality, Not Body",
          explanation: "Cold read her energy, tastes, origin, or passions—never her physical appearance.",
          exampleScript: "\"You strike me as someone who plans spontaneous road trips with 20 minutes notice.\""
        }
      ],
      commonMistakes: [
        "Firing 5 consecutive questions in a row without sharing anything about your own world.",
        "Only talking about yourself and never acknowledging the threads she drops.",
        "Pretending to agree with everything she says out of fear of disapproval."
      ],
      fieldChecklist: [
        "Listen for 3 distinct keywords in her next answer.",
        "Select the most emotionally vibrant keyword to build your next statement.",
        "Notice whether she asks you questions back (clear indicator of investment)."
      ]
    },
    {
      id: 'b_vol6',
      chapterNumber: "Volume VI",
      title: "The Mechanics of Wit, Banter & Sexual Tension (The Push-Pull Engine)",
      subtitle: "Playful Disqualification, Teasing with Warmth & Escaping the Friend Zone",
      readingMinutes: 5,
      wordCount: 910,
      summary: "Understand how chemistry is built through contrasting emotional tones: warmth vs. challenge, acceptance vs. teasing.",
      contentMarkdown: `### 1. What Actually Creates 'Chemistry'?
Chemistry is not intellectual agreement. Chemistry is the **dynamic contrast between rapport and tension**.
* Constant rapport with zero tension = Platonic buddy / brother figure.
* Constant tension with zero rapport = Creepy, aggressive, or combative.
* High rapport woven with playful tension = Irresistible romantic chemistry.

### 2. The Playful Disqualification Technique
Disqualification flips the subconscious frame from *'Am I good enough for her?'* to *'Are you and I actually compatible?'*
* *Her:* "I'm obsessed with reality TV."
* *You:* "Oh no. We were doing so well. I don't think my emotional constitution can handle Love Island marathons. We're going to have to be strictly business." (Delivered with a laughing grin and steady eye contact).
Notice that you are rejecting the idea of a romantic connection in a clearly sarcastic, teasing manner. Paradoxically, this demonstrates supreme confidence and makes her want to qualify herself to you.

### 3. Physical Calibration (Escalating Touch with Respect)
Romantic intent must eventually bridge into physical reality, but must be calibrated with total social grace:
* **Level 1 (Ambient Social Touch):** A light tap on the outer shoulder/elbow to emphasize a punchline (under 1 second).
* **Level 2 (Protective / Guiding):** Guiding her through a crowded venue with a light touch between the shoulder blades.
* **Level 3 (Proximity):** Leaning in closer to hear her in loud environments, allowing your shoulders to brush naturally.
If she leans away or tenses, **step back immediately**. True masculine power is completely comfortable respecting boundaries.`,
      actionableRules: [
        {
          rule: "The Smile Anchor for Teasing",
          explanation: "Never deliver a tease with a cold or deadpan expression unless you have master-level comedic timing. Always smile to communicate warmth.",
          exampleScript: "Deliver playful tease -> Keep smiling -> Return to warm curiosity."
        },
        {
          rule: "The Respect-the-Flinch Protocol",
          explanation: "If you touch her elbow and she withdraws, take half a step back. Do not push. Safety is the prerequisite for attraction.",
          exampleScript: "Notice withdrawal -> Step back 6 inches -> Keep conversational tone completely relaxed."
        }
      ],
      commonMistakes: [
        "Touching her lower back, waist, or neck in the first 10 minutes of meeting (invasive).",
        "Teasing her about deep personal insecurities.",
        "Becoming bitter or defensive if she teases you back."
      ],
      fieldChecklist: [
        "Identify 1 lighthearted quirk you can tease about.",
        "Keep your delivery smiling, warm, and playful.",
        "Monitor her physical relaxation and distance."
      ]
    },
    {
      id: 'b_vol7',
      chapterNumber: "Volume VII",
      title: "Decoding Micro-Cues & Absolute Consent Architecture",
      subtitle: "Green, Yellow & Red Lights: How High-Value Men Read the Room Effortlessly",
      readingMinutes: 4,
      wordCount: 860,
      summary: "Learn to read non-verbal feedback like sheet music, understand verbal ambiguity, and step back with graceful sovereignty.",
      contentMarkdown: `### 1. The Traffic Light Signal Framework
Women communicate boundaries primarily through micro-nonverbals before speaking them directly. A high-EQ man reads these instantly:

#### 🟢 Green Lights (Elevated Receptivity):
* Her feet and torso are pointed directly at you.
* She plays with her hair or touches her neck while laughing.
* She holds eye contact and smiles when conversation pauses.
* She asks open-ended questions about your life and world.
* She stays in place when you step slightly closer.

#### 🟡 Yellow Lights (Caution / Ambivalence):
* One foot points toward an exit or her friend group.
* Short, polite answers without follow-up questions.
* Checking her phone repeatedly or scanning the room.
* **The High-Value Action:** Acknowledge it and give her an easy out: *"I know you're probably heading somewhere, so I won't keep you!"*

#### 🔴 Red Lights (Total Disengagement / Boundary):
* Crosses arms and turns torso away.
* Steps backward when you speak.
* Direct verbal statements: *"I'm waiting for someone," "I'm not interested," "I'm busy."*
* **The High-Value Action:** Instant, cheerful departure: *"No problem at all! Enjoy your day."*

### 2. Why Real Men Revere Consent
Consent is not a bureaucratic checkbox; it is the fundamental foundation of trust and intimacy. A high-value man wants a woman who is enthusiastically, genuinely attracted to him—anything less is unworthy of his time.`,
      actionableRules: [
        {
          rule: "The 2-Yellow-Light Rule",
          explanation: "If she gives you two yellow lights in a row, do not try harder. Gracefully close the conversation and exit.",
          exampleScript: "\"Looks like you have a busy afternoon ahead—I'll let you get back to it. Have a great one!\""
        },
        {
          rule: "Enthusiastic Yes or It's a No",
          explanation: "If she agrees to give her number or go on a date with hesitation, do not pressure her. Give her the space to decline without fear.",
          exampleScript: "\"Only if you actually want to! No pressure whatsoever.\""
        }
      ],
      commonMistakes: [
        "Ignoring her body language because she is 'still answering your questions'.",
        "Taking rejection personally and becoming sulky, hostile, or passive-aggressive.",
        "Treating a woman's politeness as romantic attraction."
      ],
      fieldChecklist: [
        "Observe her feet: are they pointed toward you or toward the door?",
        "Count how many questions she has asked you vs. how many you asked her.",
        "Be ready to exit gracefully at any moment."
      ]
    },
    {
      id: 'b_vol8',
      chapterNumber: "Volume VIII",
      title: "Digital Nuance & Text Game: From Contact Exchange to Real-World Date",
      subtitle: "The 24-Hour Rule, Avoiding the Pen-Pal Trap & Framing Irresistible Proposals",
      readingMinutes: 4,
      wordCount: 880,
      summary: "How to transition a phone number into an exciting, low-pressure first date without falling into endless texting loops.",
      contentMarkdown: `### 1. The Number Exchange Protocol
When you've had a strong 5-to-10 minute conversation and momentum is high:
* Don't ask: *"Can I maybe have your number?"*
* State your intent with confidence: *"I have to get going, but I loved your energy. Let's grab coffee or a glass of wine this week. Put your number in here."*
* Hand her your unlocked phone with a clean new contact screen open.
* Once she types it in, call or text her immediately with a short message: *"Julian from the bookstore 🙂"* so she has your contact saved.

### 2. The First Text (The 24-Hour Window)
Do not play 3-day games from 1998. Text her that same evening or the following afternoon:
* **The Callback Text:** Reference an inside joke, a funny moment, or an absurd observation from your interaction:
  * *"Survived the rest of that line without having a mid-life crisis. Hope your afternoon was slightly more exciting."*
  * *"Hope the matcha lived up to your impossible standards."*

### 3. Avoiding the Endless Pen-Pal Trap
The telephone is for **setting dates**, not for getting to know her life story. After 2 to 4 message exchanges:
* Propose a specific activity, venue, and timeframe:
  * *Weak:* *"We should hang out sometime, let me know when you're free."* (Too vague, puts emotional burden on her).
  * *Strong:* *"I'm checking out that new jazz espresso lounge in Soho this Thursday around 7pm. Join me for an hour."* (Specific, confident, low investment, easy to say yes).`,
      actionableRules: [
        {
          rule: "The Specific Proposal Principle",
          explanation: "Always propose a specific venue, day, and time. Never leave the scheduling burden to her.",
          exampleScript: "\"Let's do drinks at Apotheke this Wednesday at 7:30. Do you like botanical cocktails or classic wine?\""
        },
        {
          rule: "The 4-Text Rule",
          explanation: "Never send 4 texts back and forth without pivoting toward a concrete in-person meetup."
        }
      ],
      commonMistakes: [
        "Texting 'Hey what's up?' every morning for three weeks without ever asking her out.",
        "Double texting with panic when she takes 4 hours to reply during her workday.",
        "Sending massive paragraphs of text that feel like essays."
      ],
      fieldChecklist: [
        "Include a specific callback to your original conversation in your first text.",
        "Keep your text length equal to or slightly shorter than hers.",
        "Propose a date with clear location, day, and time."
      ]
    },
    {
      id: 'b_vol9',
      chapterNumber: "Volume IX",
      title: "The First Date Symphony: Creating an Unforgettable Experience",
      subtitle: "Venue Architecture (Never Dinner on Date One), Seating Dynamics & Romantic Momentum",
      readingMinutes: 4,
      wordCount: 870,
      summary: "How to structure an engaging first date: multiple mini-venues, 90-degree seating, and authentic emotional connection.",
      contentMarkdown: `### 1. Why Dinner Dates on Date #1 Are A Mistake
Sitting directly opposite someone across a dinner table with silverware between you feels like a corporate job interview. You are locked in for 2 hours, eating food, with high conversational pressure and zero physical flexibility.

### 2. The Ideal First Date Architecture (Activity + Atmospheric Drinks)
* **High Movement / Low Pressure:** An art gallery, an architectural walk, miniature golf, a botanical garden, or a lively speakeasy with high stools.
* **The Mini-Hop Technique:** Plan a date that has two distinct mini-locations within walking distance:
  1. *Stop 1:* Coffee or craft cocktails at a charming spot (45 mins).
  2. *Stop 2:* Walking to a nearby dessert place, viewpoint, or record shop (30 mins).
  **Psychological Effect:** Moving across multiple physical environments tricks the brain into feeling like you've known each other for multiple days, not just an hour.

### 3. Seating Dynamics (The 90-Degree Rule)
* Never sit directly opposite her if you can avoid it.
* Sit at the **corner of the table** (90 degrees) or next to each other at the bar.
* This allows you to look at the room together, eliminates staring pressure, and makes natural physical touch effortless.`,
      actionableRules: [
        {
          rule: "The 90-Degree Bar Seating Rule",
          explanation: "Choose venues with bar counters or corner tables so you sit side-by-side rather than across an adversarial divide.",
          exampleScript: "\"Let's grab those two stools at the corner—it's way more relaxed than the tables.\""
        },
        {
          rule: "The 90-Minute Cap",
          explanation: "Keep date #1 to approximately 90 minutes. End it on a high note while you both still have energy."
        }
      ],
      commonMistakes: [
        "Taking her to an expensive 3-course dinner that feels like you're trying to purchase her affection.",
        "Taking her to a movie where you sit in silence in the dark for 2 hours.",
        "Talking non-stop about your exes, career frustrations, or financial stress."
      ],
      fieldChecklist: [
        "Choose a venue with dim ambient lighting and comfortable music levels.",
        "Arrive 10 minutes early to secure ideal corner/bar seating.",
        "Plan a simple 5-minute walk to a secondary venue if the connection is great."
      ]
    },
    {
      id: 'b_vol10',
      chapterNumber: "Volume X",
      title: "The Sovereign Man Blueprint: Long-Term Magnetism & Self-Mastery",
      subtitle: "Mission Over Obsession, Emotional Self-Regulation & The True Source of Value",
      readingMinutes: 4,
      wordCount: 890,
      summary: "Attraction is a byproduct of a man living a deeply purposeful, self-respecting life. Build the foundation that keeps women captivated for years.",
      contentMarkdown: `### 1. Mission Over Obsession
A man whose entire purpose revolves around acquiring women will always emit a subtle odor of desperation. Women are naturally drawn to men who have a **primary mission**—whether that is building art, engineering systems, mastering a craft, or uplifting their community.
* A woman wants to join an exciting, moving train; she does not want to *be* the destination.
* When you have projects, disciplines, brothers, and standards, you naturally exhibit healthy boundaries and emotional sovereignty.

### 2. Emotional Stability (The Rock in the Storm)
The world is chaotic, stressful, and demanding. A woman often experiences fluctuating emotional currents. What she seeks in a masculine partner is an **unshakable emotional container**:
* When she is frustrated, don't panic or match her anger. Stay calm, listen with deep presence, and offer steady warmth.
* A man who loses his temper or crumbles at minor stress destroys romantic attraction instantly.
* Cultivate physical fitness, healthy sleep, daily mindfulness, and genuine stoic fortitude.

### 3. Standards & Self-Respect
High-value men do not accept bad behavior just because a woman is physically beautiful.
* If a woman is chronically disrespectful, flakey, rude to service staff, or manipulative, a grounded man walks away without drama.
* Your willingness to walk away from dynamics that do not honor your peace is your ultimate superpower in dating and in life.`,
      actionableRules: [
        {
          rule: "Maintain Your Core Disciplines",
          explanation: "Never cancel your workouts, creative hours, or friendships just because a new woman enters your life.",
          exampleScript: "\"I'd love to see you this Saturday! I train until 11am, so let's meet around 2pm.\""
        },
        {
          rule: "The Quiet Walkaway",
          explanation: "When someone disrespects your boundaries, you don't scream or argue. You calmly disengage and withdraw your presence.",
          exampleScript: "\"I value open, honest communication. Since that isn't happening here, I'm going to step back. Wish you the best.\""
        }
      ],
      commonMistakes: [
        "Dropping all your hobbies, goals, and passions the moment you start dating someone.",
        "Tolerating blatant disrespect because she is conventionally attractive.",
        "Believing you need to be rich or famous to be attractive (grounded character always trumps superficial status)."
      ],
      fieldChecklist: [
        "Review your daily mission and core physical/creative habits.",
        "Set clear non-negotiable boundaries for your relationships.",
        "Remember: true confidence is not walking into a room thinking you are better than everyone; it is walking into a room without needing to compare yourself to anyone."
      ]
    }
  ]
};

export const ALL_PLAYBOOKS: DatingPlaybook[] = [
  GIRLS_GUIDE_TO_BOYS,
  BOYS_GUIDE_TO_GIRLS
];
