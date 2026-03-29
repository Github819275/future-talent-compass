# Future Talent Compass

An AI-powered talent evaluation and recruitment platform that analyzes candidates' competencies, trajectories, and team compatibility using intelligent agent reasoning.

## Features

- **Candidate Analysis**: Evaluate candidate profiles with AI-powered insights
- **Competency Heatmap**: Visualize competency levels across multiple dimensions
- **Team Compatibility**: Assess how well candidates fit within existing teams
- **Career Trajectory Tracking**: Analyze and project candidate career paths
- **Agent Pipeline**: Multi-agent reasoning system for comprehensive candidate evaluation
- **Interactive Dashboard**: Real-time insights and recommendations
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **UI Components**: shadcn/ui
- **Backend**: Supabase with TypeScript functions
- **Testing**: Vitest + Playwright
- **Package Manager**: Bun

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── ui/           # shadcn/ui component library
│   ├── AgentPipeline.tsx
│   ├── CandidateCards.tsx
│   ├── CompetencyHeatmap.tsx
│   ├── TeamCompatibility.tsx
│   └── TrajectoryChart.tsx
├── pages/            # Page components
│   ├── InputPage.tsx
│   ├── DashboardPage.tsx
│   ├── AnalysisPage.tsx
│   └── NotFound.tsx
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and types
├── integrations/     # External service integrations
│   └── supabase/     # Supabase client and types
└── test/             # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (for backend services)

### Development

Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
bun run build
```

## Key Components

### AgentPipeline
Orchestrates multi-agent reasoning for candidate evaluation and analysis.

### CompetencyHeatmap
Visualizes candidate competencies across different skill dimensions.

### CandidateCards
Displays candidate information in an easy-to-scan card layout.

### TeamCompatibility
Analyzes and presents candidate-team fit assessment.

### TrajectoryChart
Visualizes career progression and trajectory insights.

### AgentReasoningPanel
Shows the reasoning process and insights from the AI agent pipeline.

## Supabase Integration

The application uses Supabase for:
- Backend logic via edge functions
- Real-time data synchronization
- Authentication (if configured)

### Edge Functions

- `futureproof-agent`: Main agent function for talent evaluation

## Configuration

- **Tailwind CSS**: Configured via `tailwind.config.ts`
- **TypeScript**: Strict mode enabled with multiple tsconfig files
- **Vite**: Configured with React plugin and optimizations
- **ESLint**: Code quality rules in `eslint.config.js`

## License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Support

For issues and questions, please open an issue in the repository.

