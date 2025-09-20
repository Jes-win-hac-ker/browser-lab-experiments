// AI Service for experiment analysis
// Note: This is a client-side implementation. In production, move to a proper backend.

// Gemini API integration
import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here'
);

export interface ExperimentData {
  actions: Array<{
    type: 'acid' | 'base' | 'indicator';
    volume: number;
    timestamp: Date;
  }>;
  result: 'acidic' | 'basic' | 'neutral' | 'none';
  acidVolume: number;
  baseVolume: number;
  indicatorAdded: boolean;
}

export const analyzeExperiment = async (data: ExperimentData) => {
  try {
    const prompt = `
You are a chemistry teacher analyzing a student's acid-base experiment. Here are the details:

Experiment Actions:
${data.actions.map(action => `- Added ${action.volume}mL of ${action.type}`).join('\n')}

Final State:
- Total acid volume: ${data.acidVolume}mL
- Total base volume: ${data.baseVolume}mL
- Indicator added: ${data.indicatorAdded ? 'Yes' : 'No'}
- Result: ${data.result}

Please provide:
1. A brief explanation (2-3 sentences) of what happened in the experiment and why the solution turned this color
2. A suggestion for improvement if needed (or praise if done well)

Keep it educational but encouraging, suitable for a student learning chemistry.
    `;

    // Gemini API call
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Simple parsing to separate explanation and suggestion
    const parts = response.split(/(?:suggestion|tip|try|next time)/i);
    
    return {
      explanation: parts[0].trim(),
      suggestion: parts.length > 1 ? parts.slice(1).join(' ').trim() : undefined
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Fallback responses based on the experiment result
    const fallbackResponses = {
      acidic: {
        explanation: 'Your solution turned red because you added more acid than base. The excess acid ions (H+) lowered the pH below 7, making it acidic.',
        suggestion: 'Try adding more base to neutralize the excess acid and observe how the color changes.'
      },
      basic: {
        explanation: 'Your solution turned blue because you added more base than acid. The excess hydroxide ions (OH-) raised the pH above 7, making it basic.',
        suggestion: 'Try adding more acid to neutralize the excess base and reach a neutral pH of 7.'
      },
      neutral: {
        explanation: 'Excellent! Your solution turned green because you achieved a nearly perfect balance between acid and base, resulting in a neutral pH around 7.',
        suggestion: 'Great job! You successfully performed an acid-base neutralization. Try experimenting with different volumes next time.'
      },
      none: {
        explanation: 'No color change occurred because you need to add an indicator to see the pH changes in your acid-base reaction.',
        suggestion: 'Add the indicator first, then try mixing different amounts of acid and base to see the color changes.'
      }
    };

    return fallbackResponses[data.result] || {
      explanation: 'Something went wrong with the analysis.',
      suggestion: 'Please try the experiment again.'
    };
  }
};
