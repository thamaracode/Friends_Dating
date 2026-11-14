import { QuoteProviderAdapter, Quote, QuoteCategoryKey } from '../types';

export class ZenQuotesAdapter implements QuoteProviderAdapter {
  public readonly providerId = 'zenquotes';
  public readonly displayName = 'ZenQuotes';
  public readonly baseUrl = 'https://zenquotes.io/api/quotes';

  private inferCategory(text: string): QuoteCategoryKey {
    const t = text.toLowerCase();
    if (t.includes('love') || t.includes('heart') || t.includes('passion')) return 'love_romance';
    if (t.includes('friend') || t.includes('companion')) return 'friendship';
    if (t.includes('relationship') || t.includes('together')) return 'relationships';
    if (t.includes('feel') || t.includes('emotion') || t.includes('empathy') || t.includes('mind')) return 'emotional_intelligence';
    if (t.includes('boundary') || t.includes('respect') || t.includes('dignity')) return 'self_respect_boundaries';
    if (t.includes('discipline') || t.includes('success') || t.includes('work') || t.includes('effort')) return 'motivation_discipline';
    if (t.includes('alone') || t.includes('heal') || t.includes('pain') || t.includes('sorrow')) return 'loneliness_healing';
    if (t.includes('courage') || t.includes('confidence') || t.includes('fear')) return 'confidence_identity';
    if (t.includes('happy') || t.includes('grateful') || t.includes('joy') || t.includes('peace')) return 'happiness_gratitude';
    if (t.includes('listen') || t.includes('speak') || t.includes('silence')) return 'communication';
    if (t.includes('commit') || t.includes('promise')) return 'marriage_commitment';
    if (t.includes('grow') || t.includes('change') || t.includes('become')) return 'personal_growth';
    if (t.includes('laugh') || t.includes('smile') || t.includes('joke')) return 'humor_playful';
    return 'life_philosophy';
  }

  public async fetchBatch(_limit: number = 25): Promise<Array<Omit<Quote, 'id' | 'createdAt'>>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(this.baseUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SoulverseQuoteDiscovery/2026'
        }
      });

      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`ZenQuotes responded with HTTP ${res.status}`);
      }

      const data: any = await res.json();
      if (!Array.isArray(data)) {
        return [];
      }

      const now = Date.now();
      return data.map((item: any) => {
        const cleanText = (item.q || '').trim().replace(/^["']|["']$/g, '');
        const cleanAuthor = (item.a || 'Unknown').trim();
        const category = this.inferCategory(cleanText);

        return {
          text: cleanText,
          author: cleanAuthor,
          category,
          tags: ['zenquotes', 'inspiration', category.replace(/_/g, '-')],
          language: 'en',
          provider: this.providerId,
          sourceUrl: 'https://zenquotes.io',
          attribution: 'Inspirational quotes provided by ZenQuotes API (zenquotes.io)',
          license: 'ZenQuotes Free Tier with Attribution',
          importedAt: now,
          isVerified: true,
          isModerated: true,
          isFeatured: false,
          reportCount: 0,
          likesCount: 0,
          savesCount: 0
        };
      });
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`ZenQuotesAdapter fetch failed: ${err.message}`);
      return [];
    }
  }
}
