import axios from 'axios';

interface CrawlResult {
  companies: string[];
  count: number;
}

const CRAWL4AI_URL = process.env.CRAWL4AI_URL || 'http://localhost:8000';

/**
 * Search for companies in a given market using Crawl4AI
 * This is a placeholder that can be extended with real Crawl4AI integration
 */
export const searchCompanies = async (
  query: string,
  market: string
): Promise<CrawlResult> => {
  try {
    // Placeholder implementation
    // In production, this would call the actual Crawl4AI API
    console.log(`[Crawl4AI] Searching for companies: "${query}" in market "${market}"`);

    // For now, return mock data
    // Replace with actual API call when Crawl4AI is available
    const mockCompanies = [
      `${query} Inc.`,
      `${query} Solutions`,
      `${query} Global`,
      `${query} Enterprises`,
      `${query} Group`,
    ];

    return {
      companies: mockCompanies,
      count: mockCompanies.length,
    };

    // Uncomment below when Crawl4AI API is ready
    /*
    const response = await axios.post(`${CRAWL4AI_URL}/search`, {
      query,
      market,
    });
    return response.data;
    */
  } catch (error) {
    console.error('[Crawl4AI] Search failed:', error);
    // Return empty results on error
    return {
      companies: [],
      count: 0,
    };
  }
};

/**
 * Batch search for companies across multiple markets
 */
export const searchCompaniesMultiMarket = async (
  query: string,
  markets: string[]
): Promise<Map<string, CrawlResult>> => {
  const results = new Map<string, CrawlResult>();

  for (const market of markets) {
    const result = await searchCompanies(query, market);
    results.set(market, result);
  }

  return results;
};
