import { QuoteProviderAdapter, Quote, QuoteCategoryKey } from '../types';

export class DummyJSONQuoteAdapter implements QuoteProviderAdapter {
  public readonly providerId = 'dummyjson';
  public readonly displayName = 'DummyJSON Quotes';
  public readonly baseUrl = 'https://dummyjson.com/quotes';

  private inferCategory(text: string): QuoteCategoryKey {
    const t = text.toLowerCase();
    if (t.includes('love') || t.includes('heart') || t.includes('passion')) return 'love_romance';
    if (t.includes('friend') || t.includes('companion')) return 'friendship';
    if (t.includes('relationship') || t.includes('together') || t.includes('partner')) return 'relationships';
    if (t.includes('feel') || t.includes('emotion') || t.includes('empathy') || t.includes('mind')) return 'emotional_intelligence';
    if (t.includes('boundary') || t.includes('respect') || t.includes('dignity') || t.includes('no')) return 'self_respect_boundaries';
    if (t.includes('action') || t.includes('discipline') || t.includes('success') || t.includes('work')) return 'motivation_discipline';
    if (t.includes('alone') || t.includes('heal') || t.includes('pain') || t.includes('hurt')) return 'loneliness_healing';
    if (t.includes('brave') || t.includes('courage') || t.includes('confidence') || t.includes('self')) return 'confidence_identity';
    if (t.includes('happy') || t.includes('grateful') || t.includes('joy') || t.includes('peace')) return 'happiness_gratitude';
    if (t.includes('talk') || t.includes('listen') || t.includes('word') || t.includes('speak')) return 'communication';
    if (t.includes('marry') || t.includes('marriage') || t.includes('commit') || t.includes('promise')) return 'marriage_commitment';
    if (t.includes('grow') || t.includes('change') || t.includes('learn') || t.includes('become')) return 'personal_growth';
    if (t.includes('laugh') || t.includes('joke') || t.includes('funny') || t.includes('humor')) return 'humor_playful';
    return 'life_philosophy';
  }

  public async fetchBatch(limit: number = 30): Promise<Array<Omit<Quote, 'id' | 'createdAt'>>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const skip = Math.floor(Math.random() * 40); // Random offset for variety
      const res = await fetch(`${this.baseUrl}?limit=${limit}&skip=${skip}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SoulverseQuoteDiscovery/2026'
        }
      });

      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`DummyJSON responded with HTTP ${res.status}`);
      }

      const data: any = await res.json();
      if (!data.quotes || !Array.isArray(data.quotes)) {
        return [];
      }

      const now = Date.now();
      return data.quotes.map((item: any) => {
        const cleanText = (item.quote || '').trim().replace(/^["']|["']$/g, '');
        const cleanAuthor = (item.author || 'Unknown').trim();
        const category = this.inferCategory(cleanText);

        return {
          text: cleanText,
          author: cleanAuthor,
          category,
          tags: ['curated', category.replace(/_/g, '-')],
          language: 'en',
          provider: this.providerId,
          sourceUrl: 'https://dummyjson.com/quotes',
          attribution: 'DummyJSON Quotes API',
          license: 'CC0 Public Domain',
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
      console.warn(`DummyJSONQuoteAdapter fetch failed: ${err.message}`);
      return [];
    }
  }
}
