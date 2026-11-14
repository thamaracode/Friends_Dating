import type {
  DiscoveryProfile,
  ExplainableResonanceReport,
  MatchingDimensionScore
} from './types';

/**
 * Calculates Jaccard index similarity between two string arrays (0 to 100)
 */
function calculateJaccardScore(arrA: string[] = [], arrB: string[] = []): { score: number; intersection: string[] } {
  const setA = new Set(arrA.map(s => s.toLowerCase().trim()));
  const setB = new Set(arrB.map(s => s.toLowerCase().trim()));
  
  if (setA.size === 0 && setB.size === 0) {
    return { score: 50, intersection: [] }; // Neutral baseline if neither specified
  }
  
  const intersection = Array.from(setA).filter(item => setB.has(item));
  const union = new Set([...setA, ...setB]);
  
  const ratio = union.size === 0 ? 0 : intersection.length / union.size;
  // Scaled with a small curve to reward positive overlaps
  const score = Math.round(Math.min(100, ratio * 100 + (intersection.length > 0 ? 15 : 0)));
  
  return { score: Math.min(100, score), intersection };
}

/**
 * Evaluates intentional alignment between two profiles
 */
function evaluateIntentions(profileA: DiscoveryProfile, profileB: DiscoveryProfile): { score: number; explanation: string; matched: boolean } {
  const intentionsA = new Set(profileA.intentions || [profileA.primary_intention]);
  const intentionsB = new Set(profileB.intentions || [profileB.primary_intention]);
  
  const shared = Array.from(intentionsA).filter(i => intentionsB.has(i));
  const exactPrimary = profileA.primary_intention === profileB.primary_intention;
  
  if (exactPrimary) {
    return {
      score: 100,
      explanation: `Both individuals primarily seek ${profileA.primary_intention.replace(/_/g, ' ')}.`,
      matched: true
    };
  }
  
  if (shared.length > 0) {
    const formatted = shared.map(s => s.replace(/_/g, ' ')).join(', ');
    return {
      score: 85,
      explanation: `Shared relational intentions: ${formatted}.`,
      matched: true
    };
  }
  
  // If either is open to friendship or shared interests
  if (intentionsA.has('friendship') || intentionsB.has('friendship')) {
    return {
      score: 65,
      explanation: 'Open to organic friendship and mutual intellectual exchange.',
      matched: false
    };
  }
  
  return {
    score: 40,
    explanation: `Divergent primary intentions (${profileA.primary_intention} vs ${profileB.primary_intention}).`,
    matched: false
  };
}

/**
 * Evaluates communication style synergy and listening harmony
 */
function evaluateCommunication(profileA: DiscoveryProfile, profileB: DiscoveryProfile): { score: number; explanation: string; highlights: string[] } {
  let score = 70;
  const highlights: string[] = [];
  
  const commA = profileA.communication;
  const commB = profileB.communication;
  
  if (!commA || !commB) {
    return { score: 70, explanation: 'Standard communication baseline.', highlights };
  }
  
  // Cadence harmony
  if (commA.cadence === commB.cadence) {
    score += 15;
    highlights.push(`Shared communication cadence: ${commA.cadence.replace(/_/g, ' ')}`);
  } else if (
    (commA.cadence === 'balanced' && commB.cadence !== 'balanced') ||
    (commB.cadence === 'balanced' && commA.cadence !== 'balanced')
  ) {
    score += 5; // Compatible tolerance
  } else {
    score -= 10; // Frequent daily vs slow asynchronous can cause friction
  }
  
  // Style and listening synergy
  if (
    (commA.style === 'direct' && commB.listening_style === 'reflective') ||
    (commB.style === 'direct' && commA.listening_style === 'reflective')
  ) {
    score += 15;
    highlights.push('High synergy: Direct expressiveness balanced by reflective listening');
  } else if (commA.listening_style === 'validating' || commB.listening_style === 'validating') {
    score += 10;
    highlights.push('Emotionally safe validation present');
  }
  
  // Conflict approach harmony
  if (commA.conflict_approach === commB.conflict_approach) {
    score += 10;
    highlights.push(`Aligned conflict resolution approach (${commA.conflict_approach.replace(/_/g, ' ')})`);
  }
  
  const clampedScore = Math.max(30, Math.min(100, score));
  return {
    score: clampedScore,
    explanation: highlights.length > 0 ? highlights[0] : 'Compatible communication potential',
    highlights
  };
}

/**
 * Evaluates lifestyle and social energy alignment
 */
function evaluateLifestyle(profileA: DiscoveryProfile, profileB: DiscoveryProfile): { score: number; explanation: string; highlights: string[] } {
  let score = 75;
  const highlights: string[] = [];
  
  const lifeA = profileA.lifestyle;
  const lifeB = profileB.lifestyle;
  
  if (!lifeA || !lifeB) {
    return { score: 75, explanation: 'Moderate lifestyle flexibility.', highlights };
  }
  
  // Sleep schedule
  if (lifeA.sleep_schedule && lifeB.sleep_schedule) {
    if (lifeA.sleep_schedule === lifeB.sleep_schedule) {
      score += 10;
      highlights.push(`Shared rhythm: Both are ${lifeA.sleep_schedule.replace(/_/g, ' ')}s`);
    } else if (lifeA.sleep_schedule === 'flexible' || lifeB.sleep_schedule === 'flexible') {
      score += 5;
    }
  }
  
  // Social energy balance
  if (lifeA.social_energy && lifeB.social_energy) {
    if (lifeA.social_energy === 'ambivert' || lifeB.social_energy === 'ambivert') {
      score += 10;
      highlights.push('Natural social balance (ambivert bridging)');
    } else if (lifeA.social_energy === lifeB.social_energy) {
      score += 10;
      highlights.push(`Aligned energy recharge needs (${lifeA.social_energy})`);
    } else {
      score += 5; // Introvert + Extrovert can work with communication
    }
  }
  
  // Pets harmony
  if (lifeA.pets && lifeB.pets) {
    if (lifeA.pets === lifeB.pets) {
      score += 5;
      highlights.push('Matching pet compatibility');
    }
  }
  
  return {
    score: Math.max(30, Math.min(100, score)),
    explanation: highlights.length > 0 ? highlights[0] : 'Flexible routine compatibility',
    highlights
  };
}

/**
 * Geographic proximity score
 */
function evaluateGeographic(profileA: DiscoveryProfile, profileB: DiscoveryProfile): { score: number; explanation: string } {
  if (profileA.city && profileB.city && profileA.city.toLowerCase() === profileB.city.toLowerCase()) {
    return { score: 100, explanation: `Both located in ${profileA.city}` };
  }
  if (profileA.country && profileB.country && profileA.country.toLowerCase() === profileB.country.toLowerCase()) {
    return { score: 80, explanation: `Same country (${profileA.country})` };
  }
  return { score: 65, explanation: 'Different locations (digital or travel compatible)' };
}

/**
 * Master Explainable Resonance Calculator
 * Computes a transparent, reproducible 7-dimension score with explicit breakdowns and disclaimer.
 */
export function calculateExplainableResonance(
  viewer: DiscoveryProfile,
  candidate: DiscoveryProfile,
  hasMutualConsent: boolean = false
): ExplainableResonanceReport {
  // 1. Shared Values Dimension (weight 0.25)
  const valuesResult = calculateJaccardScore(viewer.core_values, candidate.core_values);
  const valuesScore: MatchingDimensionScore = {
    dimension: 'shared_values',
    label: 'Shared Values',
    score: valuesResult.score,
    weight: 0.25,
    explanation: valuesResult.intersection.length > 0
      ? `Shared ethical priorities: ${valuesResult.intersection.join(', ')}`
      : 'Different stated priorities, providing opportunities for perspective-taking',
    matchedItems: valuesResult.intersection
  };

  // 2. Intentions Alignment Dimension (weight 0.20)
  const intentionsResult = evaluateIntentions(viewer, candidate);
  const intentionsScore: MatchingDimensionScore = {
    dimension: 'intentions',
    label: 'Relationship Intentions',
    score: intentionsResult.score,
    weight: 0.20,
    explanation: intentionsResult.explanation
  };

  // 3. Common Interests Dimension (weight 0.15)
  const interestsResult = calculateJaccardScore(viewer.interests, candidate.interests);
  const interestsScore: MatchingDimensionScore = {
    dimension: 'common_interests',
    label: 'Common Interests',
    score: interestsResult.score,
    weight: 0.15,
    explanation: interestsResult.intersection.length > 0
      ? `Common hobbies & topics: ${interestsResult.intersection.slice(0, 4).join(', ')}`
      : 'Diverse interest profiles with room for reciprocal discovery',
    matchedItems: interestsResult.intersection
  };

  // 4. Communication Synergy Dimension (weight 0.15)
  const commResult = evaluateCommunication(viewer, candidate);
  const communicationScore: MatchingDimensionScore = {
    dimension: 'communication',
    label: 'Communication Synergy',
    score: commResult.score,
    weight: 0.15,
    explanation: commResult.explanation
  };

  // 5. Lifestyle Alignment Dimension (weight 0.10)
  const lifeResult = evaluateLifestyle(viewer, candidate);
  const lifestyleScore: MatchingDimensionScore = {
    dimension: 'lifestyle',
    label: 'Lifestyle Alignment',
    score: lifeResult.score,
    weight: 0.10,
    explanation: lifeResult.explanation
  };

  // 6. Activities Compatibility Dimension (weight 0.10)
  const activitiesResult = calculateJaccardScore(viewer.activities, candidate.activities);
  const activitiesScore: MatchingDimensionScore = {
    dimension: 'activities',
    label: 'Activity Compatibility',
    score: activitiesResult.score,
    weight: 0.10,
    explanation: activitiesResult.intersection.length > 0
      ? `Shared activities: ${activitiesResult.intersection.join(', ')}`
      : 'Different preferred pastimes',
    matchedItems: activitiesResult.intersection
  };

  // 7. Geographic Proximity Dimension (weight 0.05)
  const geoResult = evaluateGeographic(viewer, candidate);
  const geographicScore: MatchingDimensionScore = {
    dimension: 'geographic',
    label: 'Geographic Compatibility',
    score: geoResult.score,
    weight: 0.05,
    explanation: geoResult.explanation
  };

  const dimensions = [
    valuesScore,
    intentionsScore,
    interestsScore,
    communicationScore,
    lifestyleScore,
    activitiesScore,
    geographicScore
  ];

  // Weighted overall composite resonance calculation
  const composite = dimensions.reduce((acc, dim) => acc + (dim.score * dim.weight), 0);
  const overallResonanceScore = Math.round(Math.min(100, Math.max(10, composite)));

  // Distinction: Similarity vs Complementarity
  // Similarity is pure overlap in values, interests, and activities
  const similarityScore = Math.round((valuesResult.score + interestsResult.score + activitiesResult.score) / 3);
  
  // Complementarity is synergy between different communication styles and social energies
  const complementarityScore = Math.round((commResult.score + lifeResult.score) / 2);

  // Synergy highlights & growth friction points
  const synergyHighlights: string[] = [];
  if (valuesResult.intersection.length > 0) {
    synergyHighlights.push(`Strong value grounding in ${valuesResult.intersection[0]}`);
  }
  if (intentionsResult.matched) {
    synergyHighlights.push(intentionsResult.explanation);
  }
  if (commResult.highlights.length > 0) {
    synergyHighlights.push(commResult.highlights[0]);
  }
  if (interestsResult.intersection.length >= 2) {
    synergyHighlights.push(`Mutual fascination with ${interestsResult.intersection.slice(0, 2).join(' & ')}`);
  }

  const growthFrictionNotes: string[] = [];
  if (valuesResult.intersection.length === 0) {
    growthFrictionNotes.push('Different moral starting points require early curiosity and explicit questions.');
  }
  if (!intentionsResult.matched) {
    growthFrictionNotes.push('Check in early on relational goals to ensure mutual expectations remain clear.');
  }
  if (overallResonanceScore < 60) {
    growthFrictionNotes.push('High divergence across habits and communication styles may require extra patience.');
  }

  return {
    overallResonanceScore,
    similarityScore,
    complementarityScore,
    intentionsMatch: intentionsResult.matched,
    mutualConsentEstablished: hasMutualConsent,
    dimensions,
    sharedValues: valuesResult.intersection,
    sharedInterests: interestsResult.intersection,
    sharedActivities: activitiesResult.intersection,
    synergyHighlights: synergyHighlights.slice(0, 4),
    growthFrictionNotes: growthFrictionNotes.slice(0, 2),
    disclaimer: 'This resonance score reflects self-reported preference alignment across 7 transparent dimensions. It is not an algorithmic prediction of romantic love, chemistry, or future relationship outcomes.'
  };
}
