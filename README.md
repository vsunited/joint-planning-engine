# Joint Planning Engine (JPE)

An AI-grounded planning engine designed to assist joint task forces and planning staffs executing the **Joint Planning Process (JPP)** per CJCS and Joint Doctrine (JP 5-0, JP 3-0, JP 1).

## Tech Stack
- **Web**: Next.js 14, Tailwind CSS, TypeScript
- **Mobile**: React Native (Expo SDK)
- **Backend & Cloud**: Firebase (Firestore, Storage, Hosting, Functions) & Google Cloud Platform (us-central1)
- **AI & RAG**: Google Gemini via Vertex AI
- **Monorepo**: Turborepo + pnpm workspaces

## Architecture & Structure
\`\`\`
├── apps/
│   ├── web/            # Next.js 14 web application
│   └── mobile/         # React Native (Expo) mobile client
├── packages/
│   ├── shared/         # Common TypeScript types, JPP schema validators & constants
│   ├── ui/             # Shared UI components & design system
│   └── ai/             # Vertex AI & Genkit integrations
├── functions/          # Firebase Cloud Functions (PDF RAG ingestion, Phase AI endpoints)
├── docs/
│   └── doctrine/       # Joint Planning Publications (JP 5-0, etc.)
└── scripts/            # Ingestion and helper utilities
\`\`\`
