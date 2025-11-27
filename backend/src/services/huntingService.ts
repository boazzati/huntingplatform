import OpenAI from 'openai';
import { searchCompaniesMultiMarket } from './crawl4aiClient.js';
import { IHunt, IAccount, IStep } from '../models/index.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HuntParams {
  subChannel: string;
  markets: string[];
  focusBrands: string[];
  maxAccounts?: number;
}

export interface HuntResult {
  huntResult: {
    summary: string;
    totalAccounts: number;
  };
  accounts: IAccount[];
}

const HUNTING_SYSTEM_PROMPT = `You are an expert business development strategist for PepsiCo's AFH (Away From Home) division.

Your task is to apply the 10-step hunting model to identify and qualify potential business opportunities:

1. Define opportunity – Clarify sub-channel, markets, target customer type, and AFH occasions.
2. Scan universe – Build a long-list of potential customers in those markets (real companies where possible).
3. Prioritise & score – Rank targets on scale, multi-market reach, AFH relevance, and ease/speed to pilot.
4. Insight & hypothesis – Form hypotheses on their shopper/consumer needs, current gaps, and decision-makers.
5. PepsiCo value proposition – Design 1–2 platform ideas per top target (brands, occasions, commercial logic).
6. Internal/bottler alignment – Identify which BU, bottler(s), and functions must be engaged and why.
7. Approach plan – Define the route in (RFP, C-suite, operator HQ), key messages, and meeting objectives.
8. Discovery & qualification – First contact, key questions, and signals to qualify or deprioritise the lead.
9. Proposal & negotiation – Shape of proposal, value drivers, investment asks, and potential trade-offs.
10. Pilot & learn – Recommended pilot design, simple KPIs, and how learning will feed the next wave of hunts.

For each account, provide:
- Name
- Markets served
- Segment classification
- Score (0-100) based on opportunity size, multi-market reach, AFH relevance, and ease to pilot
- Current step (1-10, typically starting at 1)
- Rationale for the score
- 1-2 platform ideas
- Stage (Prospect, Qualified, In Discussion, Pilot, etc.)
- For each of the 10 steps, provide a short note (1-2 sentences max)

Return ONLY valid JSON with no markdown formatting.`;

/**
 * Run the 10-step hunting model for a given opportunity
 */
export const runHunt = async (params: HuntParams): Promise<HuntResult> => {
  const { subChannel, markets, focusBrands, maxAccounts = 10 } = params;

  try {
    // Step 1: Scan universe using Crawl4AI
    console.log(`[Hunting] Scanning universe for: ${subChannel} in markets: ${markets.join(', ')}`);

    const crawlResults = await searchCompaniesMultiMarket(subChannel, markets);

    // Collect all unique companies from crawl results
    const allCompanies = new Set<string>();
    crawlResults.forEach((result) => {
      result.companies.forEach((company) => allCompanies.add(company));
    });

    const companyList = Array.from(allCompanies).slice(0, maxAccounts * 2);

    // Step 2: Build prompt with context
    const userPrompt = `
Apply the 10-step hunting model for the following opportunity:

Sub-Channel: ${subChannel}
Markets: ${markets.join(', ')}
Focus Brands: ${focusBrands.join(', ')}
Max Accounts to Identify: ${maxAccounts}

Potential Companies Found (from market scan):
${companyList.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Please analyze these companies and any others you think are relevant. For each of the top ${maxAccounts} opportunities:
1. Provide all required fields (name, markets, segment, score, rationale, ideas, stage)
2. For each of the 10 steps, provide a short note

Return as JSON array with structure:
{
  "huntResult": {
    "summary": "Brief summary of hunting findings",
    "totalAccounts": number
  },
  "accounts": [
    {
      "name": "Company Name",
      "markets": ["market1", "market2"],
      "segment": "segment type",
      "score": 85,
      "currentStep": 1,
      "rationale": "Why this company scores well",
      "ideas": [
        {"title": "Idea 1", "description": "Description"}
      ],
      "stage": "Prospect",
      "steps": [
        {"step": 1, "name": "Define opportunity", "note": "Short note"},
        ...
      ]
    }
  ]
}
`;

    // Step 3: Call OpenAI API
    console.log('[Hunting] Calling ChatGPT API...');

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: HUNTING_SYSTEM_PROMPT,
    });

    // Step 4: Parse response
    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    console.log('[Hunting] Parsing ChatGPT response...');

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const huntData = JSON.parse(jsonStr);

    // Step 5: Validate and transform response
    const accounts: IAccount[] = (huntData.accounts || []).map((acc: any) => ({
      name: acc.name || 'Unknown',
      markets: acc.markets || [],
      segment: acc.segment || 'Unknown',
      score: Math.min(100, Math.max(0, acc.score || 0)),
      currentStep: Math.min(10, Math.max(1, acc.currentStep || 1)),
      rationale: acc.rationale || '',
      ideas: acc.ideas || [],
      stage: acc.stage || 'Prospect',
      steps: generateSteps(acc.steps),
    }));

    const result: HuntResult = {
      huntResult: {
        summary: huntData.huntResult?.summary || 'Hunt completed',
        totalAccounts: accounts.length,
      },
      accounts,
    };

    console.log(`[Hunting] Hunt completed: ${accounts.length} accounts identified`);
    return result;
  } catch (error) {
    console.error('[Hunting] Error during hunt:', error);
    throw new Error(`Hunting service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate 10-step structure with default values
 */
function generateSteps(providedSteps?: any[]): IStep[] {
  const stepNames = [
    'Define opportunity',
    'Scan universe',
    'Prioritise & score',
    'Insight & hypothesis',
    'PepsiCo value proposition',
    'Internal/bottler alignment',
    'Approach plan',
    'Discovery & qualification',
    'Proposal & negotiation',
    'Pilot & learn',
  ];

  return stepNames.map((name, index) => {
    const step = index + 1;
    const provided = providedSteps?.find((s: any) => s.step === step);
    return {
      step,
      name,
      note: provided?.note || 'Pending',
    };
  });
}
