const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.API_BASE,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000', // Change to your deployed domain if needed
    'X-Title': 'LeetComment'
  }
});

class AICommentGenerator {
  constructor() {
    this.model = process.env.MODEL;
  }

  async analyzeCode(code, language) {
    try {
      const prompt = `Analyze this ${language} code and provide detailed insights:\n\nCode:\n${code}\n\nPlease provide:\n1. Algorithm type and approach\n2. Time and space complexity analysis\n3. Key strategic insights\n4. Optimization suggestions\n5. Detailed commented version of the code\n6. An optimized version of the code (with comments for clarity)\n7. A full analysis for the optimized code (algorithm type, time/space complexity, approach, key insights, etc.)\n8. If the code is already optimal, provide a message in the field 'optimizedMessage' indicating that the code is already optimal and cannot be further optimized.\n\nFormat the response as JSON with the following structure.\n\nIMPORTANT: Respond ONLY with a single valid JSON object, no markdown, no explanation, no preamble, no triple backticks, no text before or after. The output will be parsed by a machine.\nIf you cannot provide a field, set it to an empty string or empty array as appropriate.\n\nIf the code can be optimized, ALWAYS provide an improved version in optimizedCode (with comments). If the code is already optimal, return the same code in optimizedCode (with comments) and set optimizedMessage to a string explaining that the code is already optimal.\n\nFor example, given this code:\n\ndef add(a, b):\n    return a + b\n\nThe JSON output should look like:\n{\n  \"algorithmType\": \"Simple arithmetic\",\n  \"timeComplexity\": \"O(1)\",\n  \"spaceComplexity\": \"O(1)\",\n  \"approach\": \"Adds two numbers.\",\n  \"keyInsights\": [\"Direct addition\"],\n  \"optimizations\": [\"No further optimization possible\"],\n  \"commentedCode\": \"def add(a, b):\\n    # Add two numbers and return the result\\n    return a + b\",\n  \"optimizedCode\": \"def add(a, b):\\n    # Add two numbers and return the result\\n    return a + b\",\n  \"optimizedAnalysis\": {\n    \"algorithmType\": \"Simple arithmetic\",\n    \"timeComplexity\": \"O(1)\",\n    \"spaceComplexity\": \"O(1)\",\n    \"approach\": \"Adds two numbers.\",\n    \"keyInsights\": [\"Direct addition\"]\n  },\n  \"optimizedMessage\": \"The submitted code is already optimal and cannot be further optimized.\",\n  \"optimizationDetails\": {\n    \"improvements\": [],\n    \"complexityImprovement\": {\n      \"time\": \"O(1)\",\n      \"space\": \"O(1)\"\n    }\n  }\n}\n\nRespond ONLY with valid JSON, no extra text, no markdown, no triple backticks:\n{\n  \"algorithmType\": \"string\",\n  \"timeComplexity\": \"string\",\n  \"spaceComplexity\": \"string\", \n  \"approach\": \"string\",\n  \"keyInsights\": [\"string\"],\n  \"optimizations\": [\"string\"],\n  \"commentedCode\": \"string\",\n  \"optimizedCode\": \"string\",\n  \"optimizedAnalysis\": {\n    \"algorithmType\": \"string\",\n    \"timeComplexity\": \"string\",\n    \"spaceComplexity\": \"string\",\n    \"approach\": \"string\",\n    \"keyInsights\": [\"string\"]\n  },\n  \"optimizedMessage\": \"string\",\n  \"optimizationDetails\": {\n    \"improvements\": [\"string\"],\n    \"complexityImprovement\": {\n      \"time\": \"string\",\n      \"space\": \"string\"\n    }\n  }\n}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code analyst specializing in algorithm analysis and code optimization. Provide detailed, accurate analysis with practical insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const raw = response.choices[0].message.content;
      console.log('AI raw response:', raw);
      let analysis;
      try {
        analysis = JSON.parse(raw);
      } catch (e) {
        // Try to extract JSON from markdown/code block or extra text
        let cleaned = raw.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();
        // Remove trailing commas before } or ]
        cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
        // Replace single quotes with double quotes (if any)
        cleaned = cleaned.replace(/'/g, '"');
        try {
          analysis = JSON.parse(cleaned);
        } catch (e2) {
          // Try to extract JSON from anywhere in the string
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            let jsonStr = match[0].replace(/,\s*([}\]])/g, '$1').replace(/'/g, '"');
            try {
              analysis = JSON.parse(jsonStr);
            } catch (e3) {
              console.error('AI response JSON parse error:', e3, '\nRaw:', raw, '\nCleaned:', cleaned, '\nExtracted:', jsonStr);
              throw new Error('AI response was not valid JSON.');
            }
          } else {
            console.error('AI response did not contain valid JSON:', raw, '\nCleaned:', cleaned);
            throw new Error('AI response did not contain valid JSON.');
          }
        }
      }
      // Fallbacks for missing fields
      if (!analysis.commentedCode) {
        console.warn('AI response did not include commentedCode. Setting to empty string.');
        analysis.commentedCode = '';
      }
      if (!analysis.optimizedCode) {
        console.warn('AI response did not include optimizedCode. Setting to empty string.');
        analysis.optimizedCode = '';
      }
      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error('Failed to analyze code with AI: ' + error.message);
    }
  }

  async generateRealTimeInsights(code, language) {
    try {
      const prompt = `Quickly analyze this ${language} code snippet and provide real-time insights:

Code:
${code}

Provide a brief JSON response with:
{
  "algorithmType": "string",
  "timeComplexity": "string", 
  "spaceComplexity": "string",
  "approach": "string",
  "optimizations": ["string"]
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a real-time code analyzer. Provide quick, accurate insights for live code analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      const raw = response.choices[0].message.content;
      let insights;
      try {
        insights = JSON.parse(raw);
      } catch (e) {
        // Try to extract JSON from markdown/code block or extra text
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            insights = JSON.parse(match[0]);
          } catch (e2) {
            throw new Error('AI response was not valid JSON.');
          }
        } else {
          throw new Error('AI response did not contain valid JSON.');
        }
      }
      // Fallbacks for missing fields
      if (!insights.algorithmType) insights.algorithmType = '';
      if (!insights.timeComplexity) insights.timeComplexity = '';
      if (!insights.spaceComplexity) insights.spaceComplexity = '';
      if (!insights.approach) insights.approach = '';
      if (!insights.optimizations) insights.optimizations = [];
      return insights;
    } catch (error) {
      console.error('Real-time analysis error:', error);
      return null;
    }
  }

  async generateComment(code, language, context = '') {
    try {
      const prompt = `Generate a helpful comment for this ${language} code:

Code:
${code}

Context: ${context || 'General code review'}

Please provide a constructive comment that:
1. Explains the approach or logic
2. Suggests improvements if applicable
3. Is helpful and educational
4. Is concise but informative

Format as JSON:
{
  "comment": "string",
  "type": "explanation|suggestion|optimization|general"
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code reviewer. Provide constructive, educational comments that help developers understand and improve their code.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 300
      });

      const comment = JSON.parse(response.choices[0].message.content);
      return comment;
    } catch (error) {
      console.error('Comment generation error:', error);
      throw new Error('Failed to generate comment');
    }
  }

  async suggestOptimizations(code, language) {
    try {
      const prompt = `Analyze this ${language} code and suggest specific optimizations:

Code:
${code}

Provide optimization suggestions as JSON:
{
  "optimizations": ["string"],
  "optimizedCode": "string",
  "complexityImprovement": {
    "time": "string",
    "space": "string"
  },
  "explanation": "string"
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a code optimization expert. Provide specific, actionable optimization suggestions with improved code examples.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const optimizations = JSON.parse(response.choices[0].message.content);
      return optimizations;
    } catch (error) {
      console.error('Optimization suggestion error:', error);
      throw new Error('Failed to generate optimization suggestions');
    }
  }
}

module.exports = new AICommentGenerator(); 