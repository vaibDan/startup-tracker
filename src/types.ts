export type RoleRelevance = 'High' | 'Medium' | 'Low';
export type OutreachStatus = 'Not Started' | 'Messaged' | 'Replied' | 'Interviewing' | 'Closed';

export interface Startup {
  id: string;
  company: string;
  url: string;
  description: string;
  sector: string;
  investor: string;
  fundingStage: string;
  amount: string;
  teamSize: number;
  hiring: boolean;
  relevance: RoleRelevance;
  founderLinkedin: string;
  outreachStatus: OutreachStatus;
  lastContactDate: string;
  notes: string;
}
