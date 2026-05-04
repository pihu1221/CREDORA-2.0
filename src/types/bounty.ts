export interface BountyChallenge {
  id: string;
  source: 'GitHub' | 'Credora' | 'Partner';
  title: string;
  description: string;
  prize: number;
  currency: string;
  difficulty: 'Mid' | 'High' | 'Extreme';
  techStack: string[];
  repoUrl?: string;
  issueNumber?: number;
  status: 'Open' | 'Claimed' | 'Solved';
  complexityAnalysis: string;
}

export interface BountyMatch {
  challenges: BountyChallenge[];
  analysisReason: string;
  potentialEarnings: number;
}
