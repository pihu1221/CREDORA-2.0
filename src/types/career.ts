
export type CareerField = 'Software Engineer' | 'Hardware Engineer' | 'Civil Engineer' | 'Mechanical Engineer' | 'Investment Banking' | 'Asset Management' | 'Markets' | 'Retail Banking' | 'Risk Management' | 'General Medicine' | 'Bio-Medicine' | 'Medical Research';

export interface CompanyPrep {
  name: string;
  requirements: string[];
  interviewProcess: string[];
  questions: string[]; // This will represent the 100+ questions
}

export type ExperienceLevel = '1st Year' | '2nd Year' | '3rd Year' | 'Final Year' | 'Job Ready';

export interface Topic {
  id: string;
  title: string;
  description: string;
  lectures: Lecture[];
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'interactive';
  contentUrl?: string;
  youtubeVideoId?: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  codeSnippet?: string | null;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  solutionAnalysis?: string;
  writtenSolution?: string;
  youtubeSearchQuery?: string;
}

export interface CareerPath {
  field: CareerField;
  description: string;
  topics: Topic[];
}
