# INDISIGHT — Personal Startup Intelligence & Outreach Tracker

**INDISIGHT** is a clean, premium, client-side spreadsheet-style web application built in React and TypeScript. It is designed to act as your personal "Moody's Manual" for tracking early-stage Indian DevOps/MLOps startups, their funding rounds, hiring statuses, and your personalized founder/CTO hiring outreach pipeline.

---

## Key Features

- **Dual-Tab Architecture**:
  - **🏢 Startups Tab**: Tracks high-level company info, investors, funding stages, team size, active hiring flags, and role relevance.
  - **👤 Contacts & Outreach Tab**: Tracks relationships with individual founders, CTOs, and engineering leads.
- **Outreach Pipelines**:
  - Company-level status tracking: *Not Started / Messaged / Replied / Interviewing / Closed*.
  - Contact-level connection tracking: *Not Connected / Request Sent / Connected*.
  - Contact-level DM tracking: *Not Messaged / Pitch Sent / Replied / Followed Up*.
- **Premium Aesthetics & Light/Dark Theme**:
  - Dynamic visual accents (emerald-green left borders for **High** relevance targets; amber-yellow for **Medium** relevance).
  - Responsive, interactive spreadsheets with full sorting (ascending/descending) on any column.
  - Glassmorphic card metrics panel summarizing KPIs for startups and contacts dynamically.
- **Zero Backend Setup (`localStorage`)**:
  - All data is instantly persisted to browser storage.
  - Light/Dark mode preference is saved across sessions.
- **Data Portability**:
  - Export startups and contacts to separate formatted `.csv` files.
  - Single-click **Backup JSON** exports your entire local database.
  - **Restore JSON** imports and recovers your full tracker state on any machine or browser.

---

## Technical Stack

- **Core**: React 19, TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla CSS (custom design system supporting variable-based dark/light modes)
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd "startup tracker"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install win32 MSVC native dependencies (required for the Vite build engine on Windows environments):
   ```bash
   npm install @rolldown/binding-win32-x64-msvc
   ```

### Running Locally

To spin up the local development hot-reloaded server:
```bash
npm run dev
```
Open your browser and navigate to the printed URL (default: `http://localhost:5173`).

### Production Build

To compile TypeScript and bundle assets for production hosting (distributable in the `/dist` folder):
```bash
npm run build
```

---

## Data Models

The core data schemas are located in [src/types.ts](file:///c:/Users/VAIBHAV/Downloads/startup%20tracker/src/types.ts):

### Startup Entity
```typescript
interface Startup {
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
  relevance: 'High' | 'Medium' | 'Low';
  founderLinkedin: string;
  outreachStatus: 'Not Started' | 'Messaged' | 'Replied' | 'Interviewing' | 'Closed';
  lastContactDate: string;
  notes: string;
}
```

### Contact Entity
```typescript
interface Contact {
  id: string;
  name: string;
  title: string;
  companyId: string; // Foreign key linking to Startup.id
  linkedin: string;
  connectionStatus: 'Not Connected' | 'Request Sent' | 'Connected';
  dmStatus: 'Not Messaged' | 'Pitch Sent' | 'Replied' | 'Followed Up';
  lastInteractionDate: string;
  notes: string;
}
```

---

## Backing Up & Restoring Data

Since all data lives in your browser's local storage, clearing your browser cache or cookies can wipe your workspace. 

### How to protect your data:
1. **To Backup**: Click the **Backup JSON** button on the toolbar. This will generate and download a file named `indisight_full_backup_YYYY-MM-DD.json`.
2. **To Restore**: Click the **Restore JSON** button, choose your downloaded backup file, and confirm. All records will be imported and saved back into local storage immediately.
