import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runDeterministicDecisionAnalysis } from './src/utils/calculations';
import { FinancialProfile } from './src/types/finance';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Deterministic & AI-Assisted Decision Analysis Endpoint
app.post('/api/ai/decision', async (req, res) => {
  try {
    const { query, profile, parameters } = req.body as {
      query: string;
      profile: FinancialProfile;
      parameters?: any;
    };

    if (!query || !profile) {
      return res.status(400).json({ error: 'Missing query or profile in request body' });
    }

    // 1. Run deterministic calculations first to guarantee 100% numerical accuracy
    const deterministicReport = runDeterministicDecisionAnalysis(profile, query, parameters);

    // 2. If Gemini is available, leverage it to personalize and enrich the response with grounded calculations
    if (aiClient) {
      try {
        const prompt = `
You are the SpendSense AI Financial Decision Agent — an elite, friendly, realistic personal financial strategist.
Your role is to help the user evaluate this specific financial question: "${query}".

Here is the user's verified financial profile and deterministic calculations:
- Monthly Income: ₹${profile.monthlyIncome.toLocaleString('en-IN')}
- Current Category Allocations:
  * Essentials: ${profile.allocations.essentials}% (₹${Math.round((profile.monthlyIncome * profile.allocations.essentials) / 100).toLocaleString('en-IN')})
  * Emergency Fund: ${profile.allocations.emergency}% (₹${Math.round((profile.monthlyIncome * profile.allocations.emergency) / 100).toLocaleString('en-IN')})
  * Savings: ${profile.allocations.savings}% (₹${Math.round((profile.monthlyIncome * profile.allocations.savings) / 100).toLocaleString('en-IN')})
  * Travel Fund: ${profile.allocations.travel}% (₹${Math.round((profile.monthlyIncome * profile.allocations.travel) / 100).toLocaleString('en-IN')})
  * Financial Goals: ${profile.allocations.goals}% (₹${Math.round((profile.monthlyIncome * profile.allocations.goals) / 100).toLocaleString('en-IN')})
  * Lifestyle: ${profile.allocations.lifestyle}% (₹${Math.round((profile.monthlyIncome * profile.allocations.lifestyle) / 100).toLocaleString('en-IN')})
- Monthly Rent: ₹${(profile.monthlyRent || 0).toLocaleString('en-IN')}
- Existing EMI: ₹${(profile.existingEMI || 0).toLocaleString('en-IN')}
- Emergency Fund: ₹${(profile.emergencyFund.currentBalance || 0).toLocaleString('en-IN')} saved (Target: ${profile.emergencyFund.targetMonths} months)

GROUNDED FINANCIAL ENGINE RESULTS (DO NOT FABRICATE OR ALTER NUMBERS):
- Category: ${deterministicReport.category}
- Upfront Cost: ₹${deterministicReport.estimatedImpact.upfrontCost.toLocaleString('en-IN')}
- Monthly Commitment / EMI: ₹${deterministicReport.estimatedImpact.monthlyCommitment.toLocaleString('en-IN')}
- Total Ownership Cost: ₹${deterministicReport.estimatedImpact.totalOwnershipCost.toLocaleString('en-IN')}
- Total Interest (if loan): ₹${(deterministicReport.estimatedImpact.totalInterestPaid || 0).toLocaleString('en-IN')}
- Savings Impact: ${deterministicReport.estimatedImpact.savingsRateChange}
- EMI to Income Ratio: ${deterministicReport.estimatedImpact.emiToIncomeRatio || 0}%
- Recommended Verdict: "${deterministicReport.verdict}"

Instructions:
Generate a structured JSON response matching the exact schema below. Use the exact mathematical numbers provided above. DO NOT invent fake interest rates or change the calculated numbers. Provide sharp, thoughtful, compassionate insights.

JSON Schema to return:
{
  "finalRecommendation": "Clear, direct strategist recommendation text with reasons",
  "benefitsPractical": ["bullet 1", "bullet 2"],
  "benefitsFinancial": ["bullet 1", "bullet 2"],
  "risks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "actionPlan": ["Step 1", "Step 2", "Step 3", "Step 4"]
}
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.finalRecommendation) {
            deterministicReport.finalRecommendation = parsed.finalRecommendation;
          }
          if (Array.isArray(parsed.benefitsPractical) && parsed.benefitsPractical.length) {
            deterministicReport.benefits.practical = parsed.benefitsPractical;
          }
          if (Array.isArray(parsed.benefitsFinancial) && parsed.benefitsFinancial.length) {
            deterministicReport.benefits.financial = parsed.benefitsFinancial;
          }
          if (Array.isArray(parsed.risks) && parsed.risks.length) {
            deterministicReport.risks = parsed.risks;
          }
          if (Array.isArray(parsed.actionPlan) && parsed.actionPlan.length) {
            deterministicReport.actionPlan = parsed.actionPlan;
          }

          return res.json({
            report: deterministicReport,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini enrichment error, falling back to deterministic calculations:', geminiError);
      }
    }

    // Return deterministic report
    return res.json({
      report: deterministicReport,
      source: 'deterministic-engine',
    });
  } catch (error) {
    console.error('Error generating decision report:', error);
    res.status(500).json({ error: 'Failed to process financial decision report' });
  }
});

// Setup Vite middlewares for dev or static for prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpendSense AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
