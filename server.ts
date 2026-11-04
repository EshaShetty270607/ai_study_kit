import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 35mb limit for document images
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface StudyKitRequest {
  text?: string;
  images?: Array<{
    mimeType: string;
    data: string; // base64 string
    name?: string;
  }>;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Robust model call helper that tries gemini-3.8-flash first, and if 503 (high demand)
 * or 429 occurs, gracefully falls back to gemini-flash-latest or gemini-3.1-flash-lite.
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    systemPrompt: string;
    contents: any;
    schema?: any;
  }
) {
  const candidateModels = [
    { name: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
    { name: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { name: 'gemini-flash-latest', thinkingLevel: undefined },
  ];

  let lastError: any = null;

  for (const candidate of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {
          systemInstruction: params.systemPrompt,
          responseMimeType: 'application/json',
        };

        if (params.schema) {
          config.responseSchema = params.schema;
        }

        if (candidate.thinkingLevel) {
          config.thinkingConfig = { thinkingLevel: candidate.thinkingLevel };
        }

        const response = await ai.models.generateContent({
          model: candidate.name,
          contents: params.contents,
          config,
        });

        if (response.text) {
          return { text: response.text, modelUsed: candidate.name };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] ${candidate.name} attempt ${attempt + 1} failed:`, err?.message || err);

        const errMsg = String(err?.message || '');
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('Resource has been exhausted') ||
          errMsg.includes('429');

        if (isTransient && attempt === 0) {
          // Small delay before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        // Move on to next candidate model
        break;
      }
    }
  }

  throw lastError || new Error('Unable to complete request across available models. Please try again.');
}

/**
 * Formats the exact layout matching user instructions:
 * ### 1. Key Concepts & Summaries
 * ### 2. Practice Exam Questions
 * ### 3. Flashcard Set (JSON Format)
 */
function formatRawMarkdown(data: {
  concepts: Array<{ title: string; summary: string }>;
  practiceQuestions: {
    mcq: {
      question: string;
      options: string[];
      correctOptionIndex: number;
      correctOptionLabel?: string;
      explanation: string;
    };
    shortAnswer: {
      question: string;
      sampleAnswer: string;
      keyGradingCriteria?: string[];
    };
    application: {
      question: string;
      keyConceptApplied?: string;
      sampleAnswer: string;
    };
  };
  flashcards: Array<{ front: string; back: string }>;
}): string {
  const optionLabels = ['A', 'B', 'C', 'D'];
  const correctLabel =
    data.practiceQuestions.mcq.correctOptionLabel ||
    optionLabels[data.practiceQuestions.mcq.correctOptionIndex] ||
    'A';

  const conceptsText = (data.concepts || [])
    .map((c) => `- **${c.title}:** ${c.summary}`)
    .join('\n\n');

  const mcqOptionsText = (data.practiceQuestions?.mcq?.options || [])
    .map((opt, i) => `  - **${optionLabels[i] || String.fromCharCode(65 + i)}:** ${opt}`)
    .join('\n');

  const flashcardsJson = JSON.stringify(
    (data.flashcards || []).map((f) => ({ front: f.front, back: f.back })),
    null,
    2
  );

  return `### 1. Key Concepts & Summaries

${conceptsText}

### 2. Practice Exam Questions

Generate 3 distinct questions based strictly on the source material:
- **Multiple Choice Question (MCQ):** ${data.practiceQuestions?.mcq?.question || ''}
${mcqOptionsText}
  - **Correct Answer:** Option ${correctLabel}
  - **Explanation:** ${data.practiceQuestions?.mcq?.explanation || ''}

- **Short Answer Question:** ${data.practiceQuestions?.shortAnswer?.question || ''}
  - **Sample High-Scoring Answer:** ${data.practiceQuestions?.shortAnswer?.sampleAnswer || ''}
${
  data.practiceQuestions?.shortAnswer?.keyGradingCriteria?.length
    ? `  - **Examiner Grading Points:** ${data.practiceQuestions.shortAnswer.keyGradingCriteria.join('; ')}`
    : ''
}

- **Conceptual Application Question:** ${data.practiceQuestions?.application?.question || ''}
${
  data.practiceQuestions?.application?.keyConceptApplied
    ? `  - **Concept Applied:** ${data.practiceQuestions.application.keyConceptApplied}\n`
    : ''
}  - **Sample High-Scoring Answer:** ${data.practiceQuestions?.application?.sampleAnswer || ''}

### 3. Flashcard Set (JSON Format)

Format the key terms as a clean JSON array so the frontend can parse them into flashcards:
\`\`\`json
${flashcardsJson}
\`\`\``;
}

// POST /api/generate-kit
app.post('/api/generate-kit', async (req, res) => {
  try {
    const { text = '', images = [], difficulty = 'medium' } = req.body as StudyKitRequest;

    if (!text.trim() && (!images || images.length === 0)) {
      return res.status(400).json({
        error: 'Please provide study material text, notes, or uploaded document images.',
      });
    }

    const ai = getGeminiClient();

    // Prepare contents array for multimodal input
    const parts: any[] = [];

    // Add images if any
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.data && img.mimeType) {
          const base64Data = img.data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: base64Data,
            },
          });
        }
      }
    }

    // Keep within free tier and <30k token limits
    const safeText = text.slice(0, 25000);

    const difficultyInstruction = {
      easy: 'Target Difficulty: EASY. Focus on foundational terminology, direct recall, explicit facts, and straightforward distinctions.',
      medium: 'Target Difficulty: MEDIUM. Focus on conceptual understanding, cause-and-effect relationships, and comparing concepts.',
      hard: 'Target Difficulty: HARD. Focus on deep synthesis, challenging edge-case distinction, tricky plausible distractors in MCQ, and nuanced real-world scenario evaluation.',
    }[difficulty] || 'Target Difficulty: MEDIUM.';

    const systemPrompt = `You are an expert academic tutor and exam preparation assistant.
Your goal is to transform raw study materials (text, notes, or uploaded document images) into an actionable, structured study kit.

CRITICAL CONSTRAINTS:
1. Create questions and concepts from the provided study material ONLY. Do NOT reference external facts or the internet.
2. Do NOT hallucinate concepts. If a concept is not present in the material, do NOT include it.
3. Ensure the total number of flashcards is between five (5) and ten (10).
4. Difficulty Level: ${difficultyInstruction}
5. Keep explanations concise, plain-language, and high-impact.

Respond with a valid JSON object matching this structure:
- "title": A descriptive study guide title
- "subjectCategory": Subject name (e.g., Biology, Computer Science, Economics)
- "concepts": Array of 3 to 5 items:
  - "title": Concept title
  - "summary": 2 to 3 concise sentences explaining the concept in plain, easy-to-understand language
  - "importance": One sentence on why this concept is essential for exams
- "practiceQuestions":
  - "mcq":
    - "question": Question text based strictly on source material
    - "options": Array of exactly 4 strings
    - "correctOptionIndex": Integer from 0 to 3
    - "correctOptionLabel": "A" | "B" | "C" | "D"
    - "explanation": Brief explanation of the correct answer
  - "shortAnswer":
    - "question": Question text
    - "sampleAnswer": Sample high-scoring answer
    - "keyGradingCriteria": Array of 2-3 key points examiners look for
  - "application":
    - "question": Question asking how a key concept applies to a real-world scenario
    - "keyConceptApplied": The name of the concept being applied
    - "scenarioContext": Brief description of the real-world scenario
    - "sampleAnswer": Sample high-scoring answer
- "flashcards": Array of between 5 and 10 items:
  - "front": "Term or Question"
  - "back": "Definition or Answer"`;

    const userPrompt = `Source study material:
${safeText ? `\n--- SOURCE TEXT/NOTES ---\n${safeText}\n--- END SOURCE TEXT ---` : ''}
${images.length > 0 ? `\n[Analyze the ${images.length} attached document image(s) for handwritten notes, textbook diagrams, or slides]` : ''}

Generate the structured study kit now.`;

    parts.push({ text: userPrompt });

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subjectCategory: { type: Type.STRING },
        concepts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              importance: { type: Type.STRING },
            },
            required: ['title', 'summary'],
          },
        },
        practiceQuestions: {
          type: Type.OBJECT,
          properties: {
            mcq: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctOptionIndex: { type: Type.INTEGER },
                correctOptionLabel: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctOptionIndex', 'explanation'],
            },
            shortAnswer: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                sampleAnswer: { type: Type.STRING },
                keyGradingCriteria: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['question', 'sampleAnswer'],
            },
            application: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                keyConceptApplied: { type: Type.STRING },
                scenarioContext: { type: Type.STRING },
                sampleAnswer: { type: Type.STRING },
              },
              required: ['question', 'sampleAnswer'],
            },
          },
          required: ['mcq', 'shortAnswer', 'application'],
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ['front', 'back'],
          },
        },
      },
      required: ['title', 'concepts', 'practiceQuestions', 'flashcards'],
    };

    // Execute with multi-tier failover and retry
    const result = await generateWithFallback(ai, {
      systemPrompt,
      contents: { parts },
      schema,
    });

    let parsedData: any;
    try {
      parsedData = JSON.parse(result.text || '{}');
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', result.text);
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    // Enforce flashcards constraint: 5 to 10
    if (Array.isArray(parsedData.flashcards)) {
      if (parsedData.flashcards.length > 10) {
        parsedData.flashcards = parsedData.flashcards.slice(0, 10);
      } else if (parsedData.flashcards.length < 5 && parsedData.flashcards.length > 0) {
        // If fewer than 5, create extra flashcards from concepts if available
        if (Array.isArray(parsedData.concepts)) {
          for (const c of parsedData.concepts) {
            if (parsedData.flashcards.length >= 5) break;
            if (!parsedData.flashcards.some((f: any) => f.front === c.title)) {
              parsedData.flashcards.push({
                front: c.title,
                back: c.summary,
              });
            }
          }
        }
      }
    }

    // Assemble the complete raw Markdown strictly conforming to Section 1, 2, and 3 layout
    parsedData.rawMarkdown = formatRawMarkdown(parsedData);

    return res.json({
      success: true,
      data: parsedData,
      difficulty,
    });
  } catch (error: any) {
    console.error('Error generating study kit:', error);
    let errorMsg = error?.message || 'An error occurred while generating your study kit.';
    try {
      const parsedErr = JSON.parse(errorMsg);
      if (parsedErr?.error?.message) {
        errorMsg = parsedErr.error.message;
      }
    } catch {
      // not JSON
    }

    if (errorMsg.includes('high demand') || errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
      errorMsg = 'The AI model is experiencing a temporary spike in traffic. Please wait a few seconds and click Generate again.';
    }

    return res.status(500).json({ error: errorMsg });
  }
});

// POST /api/evaluate-answer
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question, questionType, studentAnswer, sampleAnswer } = req.body;

    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'Please enter your answer before requesting evaluation.' });
    }

    const ai = getGeminiClient();

    const evalPrompt = `You are a supportive, rigorous academic exam tutor.
Evaluate the student's answer based STRICTLY on the source material and target sample answer.

Question: ${question}
Question Type: ${questionType}
Target High-Scoring Sample Answer: ${sampleAnswer}
Student's Response: "${studentAnswer}"

Provide constructive feedback with:
1. scoreOutOf5: Number between 1 and 5
2. status: "Excellent" | "Good Effort" | "Needs Review"
3. praise: What the student got right
4. missingPoints: What crucial points or keywords from the sample answer were missed (if any)
5. tutorTip: One concise tip to earn full marks on an exam.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        scoreOutOf5: { type: Type.INTEGER },
        status: { type: Type.STRING },
        praise: { type: Type.STRING },
        missingPoints: { type: Type.STRING },
        tutorTip: { type: Type.STRING },
      },
      required: ['scoreOutOf5', 'status', 'praise', 'missingPoints', 'tutorTip'],
    };

    const result = await generateWithFallback(ai, {
      systemPrompt: 'You are an expert exam grader.',
      contents: evalPrompt,
      schema,
    });

    const parsed = JSON.parse(result.text || '{}');
    return res.json({ success: true, evaluation: parsed });
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ error: error?.message || 'Evaluation failed.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AcademiaKit Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
