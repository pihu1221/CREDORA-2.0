export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  topic: string;
}

export interface LineFeedback {
  lineNumber: number;
  issue: string;
  correction: string;
  explanation: string;
}

export interface CodeEvaluation {
  isCorrect: boolean;
  score: number;
  executionOutput: string;
  feedback: string;
  lineByLine: LineFeedback[];
  conceptualGaps: string[];
  topicInsights?: {
    weakTopic: string;
    advice: string;
  };
  optimizedCode: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}
