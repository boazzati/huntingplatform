import OpenAI from 'openai';
import { Hunt, IHunt } from '../models/index.js';
import { Playbook } from '../models/playbook.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PLAYBOOK_SYSTEM_PROMPT = `You are an expert business development strategist creating comprehensive playbooks for PepsiCo's AFH (Away From Home) division.

Your task is to synthesize hunting results into a structured, actionable playbook using the 10-step hunting model.

The playbook should include:
1. Executive Summary
2. Market Overview
3. Top Opportunities (ranked by score)
4. For each opportunity, detailed guidance on all 10 steps
5. Key Insights & Patterns
6. Recommended Next Steps
7. Resource Requirements

Format the playbook as professional markdown with clear sections, bullet points, and tables where appropriate.`;

/**
 * Generate a playbook for a given sub-channel
 */
export const generatePlaybook = async (subChannel: string): Promise<string> => {
  try {
    console.log(`[Playbook] Generating playbook for sub-channel: ${subChannel}`);

    // Fetch all hunts for this sub-channel
    const hunts = await Hunt.find({ subChannel }).sort({ createdAt: -1 }).limit(10);

    if (hunts.length === 0) {
      throw new Error(`No hunts found for sub-channel: ${subChannel}`);
    }

    // Prepare hunt data for summarization
    const huntSummary = hunts
      .map((hunt: IHunt) => {
        const topAccounts = hunt.accounts
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return `
Hunt from ${hunt.createdAt.toLocaleDateString()}:
Markets: ${hunt.markets.join(', ')}
Focus Brands: ${hunt.focusBrands.join(', ')}

Top Accounts:
${topAccounts
  .map(
    (acc) => `
- ${acc.name} (Score: ${acc.score}/100)
  Markets: ${acc.markets.join(', ')}
  Segment: ${acc.segment}
  Stage: ${acc.stage}
  Rationale: ${acc.rationale}
  Ideas: ${acc.ideas.map((i) => i.title).join(', ')}
  Current Step: ${acc.currentStep}/10
`
  )
  .join('\n')}
`;
      })
      .join('\n---\n');

    // Call OpenAI to generate playbook
    console.log('[Playbook] Calling ChatGPT API to generate playbook...');

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Generate a comprehensive playbook for the ${subChannel} sub-channel based on these hunting results:

${huntSummary}

Please create a professional, actionable playbook in markdown format.`,
        },
      ],
      system: PLAYBOOK_SYSTEM_PROMPT,
    });

    const playbookContent =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Save or update playbook in database
    const existingPlaybook = await Playbook.findOne({ subChannel });

    if (existingPlaybook) {
      existingPlaybook.version += 1;
      existingPlaybook.contentMd = playbookContent;
      existingPlaybook.updatedAt = new Date();
      await existingPlaybook.save();
      console.log(`[Playbook] Updated playbook v${existingPlaybook.version}`);
    } else {
      const newPlaybook = new Playbook({
        subChannel,
        version: 1,
        contentMd: playbookContent,
      });
      await newPlaybook.save();
      console.log('[Playbook] Created new playbook v1');
    }

    return playbookContent;
  } catch (error) {
    console.error('[Playbook] Error generating playbook:', error);
    throw new Error(
      `Playbook generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
