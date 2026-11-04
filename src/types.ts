export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Concept {
  title: string;
  summary: string;
  importance?: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  correctOptionLabel?: string;
  explanation: string;
}

export interface ShortAnswerQuestion {
  question: string;
  sampleAnswer: string;
  keyGradingCriteria?: string[];
}

export interface ApplicationQuestion {
  question: string;
  keyConceptApplied?: string;
  scenarioContext?: string;
  sampleAnswer: string;
}

export interface PracticeQuestions {
  mcq: MCQQuestion;
  shortAnswer: ShortAnswerQuestion;
  application: ApplicationQuestion;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyKit {
  id: string;
  createdAt: number;
  title: string;
  subjectCategory?: string;
  difficulty: Difficulty;
  rawMarkdown: string;
  concepts: Concept[];
  practiceQuestions: PracticeQuestions;
  flashcards: Flashcard[];
  sourceSummary?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl: string;
  size: number;
}

export interface AnswerEvaluation {
  scoreOutOf5: number;
  status: string;
  praise: string;
  missingPoints: string;
  tutorTip: string;
}
