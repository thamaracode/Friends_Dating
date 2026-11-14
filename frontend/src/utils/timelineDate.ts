import type { TimelineDateNature } from '../types/identityUniverse';

export interface ParsedTimelineDate {
  numericYear: number;
  eraLabel: string;
  displayDate: string;
}

/**
 * Universal date parser and formatter supporting arbitrary historical years (-1500 BCE),
 * Year 0, CE, and future years without relying on browser input[type=date].
 */
export function parseTimelineDate(
  yearInput: string | number,
  _dateNature: TimelineDateNature = 'personal',
  customEra?: string,
  explicitDisplayDate?: string
): ParsedTimelineDate {
  const str = String(yearInput).trim();
  let numericYear = 2026;
  let eraLabel = customEra || 'CE';
  let displayDate = explicitDisplayDate || str;

  if (str.startsWith('-')) {
    const val = parseInt(str.slice(1), 10) || 0;
    numericYear = -val;
    eraLabel = 'BCE';
    if (!explicitDisplayDate) displayDate = `${val} BCE`;
  } else if (/bce|bc/i.test(str)) {
    const val = parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    numericYear = -val;
    eraLabel = 'BCE';
    if (!explicitDisplayDate) displayDate = `${val} BCE`;
  } else if (str === '0') {
    numericYear = 0;
    eraLabel = 'CE';
    if (!explicitDisplayDate) displayDate = 'Year 0 (Astronomical)';
  } else {
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed)) {
      numericYear = parsed;
      eraLabel = customEra || (parsed < 0 ? 'BCE' : 'CE');
      if (!explicitDisplayDate) {
        displayDate = parsed < 0 ? `${Math.abs(parsed)} BCE` : (parsed > 2100 ? `Year ${parsed} CE (Future)` : `${parsed} CE`);
      }
    }
  }

  return { numericYear, eraLabel, displayDate };
}

export const DATE_NATURE_CONFIG: Record<TimelineDateNature, {
  label: string;
  badge: string;
  color: string;
  bgClass: string;
  borderClass: string;
  description: string;
}> = {
  historical: {
    label: 'Historical Date',
    badge: 'Ancient / Real History',
    color: '#D97706',
    bgClass: 'bg-amber-500/10 text-amber-300',
    borderClass: 'border-amber-500/30',
    description: 'Actual documented human history, ancient eras, or historical civilizations.'
  },
  personal: {
    label: 'Personal Timeline',
    badge: 'Autobiographical',
    color: '#10B981',
    bgClass: 'bg-emerald-500/10 text-emerald-300',
    borderClass: 'border-emerald-500/30',
    description: 'Actual biographical life events experienced by the user.'
  },
  fictional: {
    label: 'Fictional Era',
    badge: 'Narrative World',
    color: '#8B5CF6',
    bgClass: 'bg-purple-500/10 text-purple-300',
    borderClass: 'border-purple-500/30',
    description: 'Imagined narrative calendar, sci-fi era, or fantasy timeline.'
  },
  hypothetical: {
    label: 'Hypothetical / What-If',
    badge: 'Alternative Path',
    color: '#0EA5E9',
    bgClass: 'bg-sky-500/10 text-sky-300',
    borderClass: 'border-sky-500/30',
    description: 'Alternative life paths, choices not made, and speculative scenarios.'
  }
};
