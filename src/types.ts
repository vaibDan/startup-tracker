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

export type ConnectionStatus = 'Not Connected' | 'Request Sent' | 'Connected';
export type DMStatus = 'Not Messaged' | 'Pitch Sent' | 'Replied' | 'Followed Up';

export interface Contact {
  id: string;
  name: string;
  title: string;
  companyId: string; // Foreign key linking to Startup.id
  linkedin: string;
  connectionStatus: ConnectionStatus;
  dmStatus: DMStatus;
  lastInteractionDate: string; // YYYY-MM-DD
  notes: string;
}
