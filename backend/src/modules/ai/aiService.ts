import { openaiClient } from '../../config/openai';
import { logger } from '../../utils/logger';
import { PromptBuilder } from './promptBuilder';
import { AIGenerateRequest, AIGenerateResponse } from './types';
import { parseJsonStrict, parseJsonWithFallback, validateAIGenerateResponse } from './validators';
import { RAGService } from './rag/ragService';
import { generateMock } from './mockGenerator';

export class AIService {
  static async generateStructuredContent(input: AIGenerateRequest): Promise<AIGenerateResponse> {
    const rag = RAGService.retrieveForGeneration(input);

    const expectedLanguage = input.mode === 'translate' && input.translateTo ? input.translateTo : input.language;

    if (String(process.env.AI_USE_MOCK || '').toLowerCase() === 'true') {
      const mocked = generateMock(input, rag.contextText || undefined);
      return validateAIGenerateResponse(mocked, {
        language: expectedLanguage,
        gradeLevel: input.gradeLevel,
        minConfidence: Number(process.env.AI_MIN_CONFIDENCE || '0.6'),
      });
    }

    const { system, user, fewShot } = PromptBuilder.buildGeneratePrompt(input, {
      contextText: rag.used ? rag.contextText : undefined,
    });

    const promptForLog = {
      system,
      fewShotCount: fewShot.length,
      user,
    };

    logger.info('AI generate prompt', promptForLog);

    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const messages = [
      { role: 'system' as const, content: system },
      ...fewShot,
      { role: 'user' as const, content: user },
    ];

    let content = '';
    try {
      content = await openaiClient.generateChatContent(messages, {
        model,
        temperature: 0.8,
        maxTokens: 1200,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit');
      if (isQuota) {
        logger.warn('AI provider unavailable (quota/rate-limit). Using mock fallback.', { message: msg });
        const mocked = generateMock(input, rag.contextText || undefined);
        return validateAIGenerateResponse(mocked, {
          language: expectedLanguage,
          gradeLevel: input.gradeLevel,
          minConfidence: Number(process.env.AI_MIN_CONFIDENCE || '0.6'),
        });
      }
      throw err;
    }

    logger.info('AI raw response', { length: content.length, contentPreview: content.substring(0, 500) });

    let parsed;
    try {
      parsed = parseJsonStrict(content);
      logger.info('JSON parsing successful', { parsedKeys: Object.keys(parsed || {}) });
    } catch (err) {
      logger.warn('Failed to parse JSON response, falling back to relaxed parsing', { error: err, contentPreview: content.substring(0, 200) });
      parsed = parseJsonWithFallback(content);
      logger.info('Fallback parsing result', { parsedKeys: Object.keys(parsed || {}) });
    }

    const validated = validateAIGenerateResponse(parsed, {
      language: expectedLanguage,
      gradeLevel: input.gradeLevel,
      minConfidence: Number(process.env.AI_MIN_CONFIDENCE || '0.6'),
    });

    logger.info('AI validated response', { confidenceScore: validated.confidenceScore });

    return validated;
  }
}
