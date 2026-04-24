import { AIGenerateResponse, SupportedLanguage, GradeLevel } from './types';
import { logger } from '../../utils/logger';

export class AIValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIValidationError';
  }
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function isNonEmptyString(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

function normalizeLanguage(lang: string): SupportedLanguage | null {
  const v = lang.trim().toLowerCase();
  if (v === 'shona') return 'Shona';
  if (v === 'ndebele') return 'Ndebele';
  if (v === 'tonga') return 'Tonga';
  if (v === 'english' || v === 'en') return 'English';
  return null;
}

export function parseJsonStrict(text: string): unknown {
  try {
    const parsed = JSON.parse(text);
    // Validate that the response has the expected structure
    if (parsed && typeof parsed === 'object') {
      return parsed;
    } else {
      throw new AIValidationError('AI response is not a valid JSON object');
    }
  } catch (error) {
    // If JSON parsing fails, throw error to trigger fallback parsing
    throw new AIValidationError(`JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function parseJsonWithFallback(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    logger.warn('JSON parsing failed, attempting fallback extraction:', error);
    
    // Try to extract explanation and example from raw text with more flexible patterns
    const explanationMatch = text.match(/"explanation":\s*"([^"]+)"/i) || 
                           text.match(/explanation["\s]*:\s*"([^"]+)"/i) ||
                           text.match(/explanation:\s*"([^"]+)"/i);
                           
    const exampleMatch = text.match(/"example":\s*"([^"]+)"/i) || 
                       text.match(/example["\s]*:\s*"([^"]+)"/i) ||
                       text.match(/example:\s*"([^"]+)"/i);
                       
    const practiceMatch = text.match(/"practice_questions":\s*\[(.*?)\]/i) ||
                         text.match(/practice_questions["\s]*:\s*\[(.*?)\]/i);
    
    logger.info('Extracted fields from text:', {
      explanation: explanationMatch?.[1],
      example: exampleMatch?.[1],
      practice: practiceMatch?.[1]
    });
    
    // Construct a basic response object with extracted fields
    const fallback: any = {
      explanation: explanationMatch?.[1] || extractTextBetween(text, 'explanation', ',') || 'No explanation available',
      example: exampleMatch?.[1] || extractTextBetween(text, 'example', ',') || 'No example available',
      practice_questions: []
    };
    
    // Try to parse practice questions
    if (practiceMatch?.[1]) {
      try {
        const practiceQuestions = JSON.parse(practiceMatch[1]);
        if (Array.isArray(practiceQuestions)) {
          fallback.practice_questions = practiceQuestions;
        }
      } catch (e) {
        logger.warn('Failed to parse practice questions:', e);
      }
    }
    
    // Add required fields
    fallback.language = 'unknown';
    fallback.gradeLevel = 'unknown';
    fallback.confidenceScore = 0.5;
    
    return fallback;
  }
}

// Helper function to extract text between two markers
function extractTextBetween(text: string, startMarker: string, endMarker: string): string | null {
  const startIndex = text.toLowerCase().indexOf(startMarker.toLowerCase());
  if (startIndex === -1) return null;
  
  const afterStart = text.substring(startIndex + startMarker.length);
  const endIndex = afterStart.indexOf(endMarker);
  
  if (endIndex === -1) return null;
  
  const extracted = afterStart.substring(0, endIndex).trim();
  // Remove quotes, colons, and other common JSON artifacts
  return extracted.replace(/^["':\s]+|["':\s]+$/g, '');
}

export function validateAIGenerateResponse(
  data: unknown,
  expected: { language: SupportedLanguage; gradeLevel: GradeLevel; minConfidence: number }
): AIGenerateResponse {
  logger.info('Validating AI response', { 
    dataType: typeof data,
    dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
    fullData: data
  });

  if (!data || typeof data !== 'object') {
    throw new AIValidationError('AI response must be a JSON object');
  }

  const obj = data as Record<string, unknown>;

  logger.info('Checking required fields', {
    explanation: obj.explanation,
    example: obj.example,
    explanationType: typeof obj.explanation,
    exampleType: typeof obj.example,
    explanationEmpty: !isNonEmptyString(obj.explanation),
    exampleEmpty: !isNonEmptyString(obj.example)
  });

  if (!isNonEmptyString(obj.explanation)) {
    logger.error('Missing explanation field', { 
      explanation: obj.explanation,
      explanationType: typeof obj.explanation,
      allKeys: Object.keys(obj)
    });
    throw new AIValidationError('Missing explanation');
  }
  if (!isNonEmptyString(obj.example)) {
    logger.error('Missing example field', { 
      example: obj.example,
      exampleType: typeof obj.example,
      allKeys: Object.keys(obj)
    });
    throw new AIValidationError('Missing example');
  }

  if (!Array.isArray(obj.practice_questions)) {
    throw new AIValidationError('practice_questions must be an array');
  }

  const practice_questions = obj.practice_questions.map((q) => {
    if (!q || typeof q !== 'object') throw new AIValidationError('Each practice question must be an object');
    const qq = q as Record<string, unknown>;
    if (!isNonEmptyString(qq.question)) throw new AIValidationError('practice_questions.question missing');
    if (!isNonEmptyString(qq.hint)) throw new AIValidationError('practice_questions.hint missing');
    if (!isNonEmptyString(qq.answer)) throw new AIValidationError('practice_questions.answer missing');
    return {
      question: String(qq.question),
      hint: String(qq.hint),
      answer: String(qq.answer),
    };
  });

  const langRaw = obj.language;
  if (!isNonEmptyString(langRaw)) throw new AIValidationError('Missing language');
  const normalized = normalizeLanguage(langRaw);
  if (!normalized) throw new AIValidationError('Unsupported language value');
  if (normalized !== expected.language) throw new AIValidationError('Language mismatch');

  const gradeRaw = obj.gradeLevel;
  if (!isNonEmptyString(gradeRaw)) throw new AIValidationError('Missing gradeLevel');
  if (gradeRaw !== expected.gradeLevel) throw new AIValidationError('gradeLevel mismatch');

  const conf = obj.confidenceScore;
  if (!isFiniteNumber(conf)) throw new AIValidationError('confidenceScore must be a number');
  if (conf < 0 || conf > 1) throw new AIValidationError('confidenceScore must be between 0 and 1');
  if (conf < expected.minConfidence) throw new AIValidationError('Low confidence response');

  const combinedText = `${String(obj.explanation)} ${String(obj.example)} ${practice_questions
    .map((q) => `${q.question} ${q.hint} ${q.answer}`)
    .join(' ')}`.toLowerCase();
  const englishStopwords = [' the ', ' and ', ' is ', ' are ', ' of ', ' to ', ' in ', ' for ', ' with '];
  const englishHits = englishStopwords.reduce((acc, w) => acc + (combinedText.includes(w) ? 1 : 0), 0);
  if (expected.language !== 'English' && englishHits >= 4) {
    throw new AIValidationError('Language consistency check failed');
  }

  return {
    explanation: String(obj.explanation),
    example: String(obj.example),
    practice_questions,
    language: expected.language,
    gradeLevel: expected.gradeLevel,
    confidenceScore: conf,
  };
}
