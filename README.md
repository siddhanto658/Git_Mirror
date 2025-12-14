# GitGrade

GitGrade is a web application that provides an instant, AI-powered analysis of any public GitHub repository. It gives a score, a rating, a summary of the repository's health, and a personalized roadmap for improvement.

## How It Works

1.  **Enter a GitHub URL:** Paste the URL of a public GitHub repository.
2.  **Fetch Details:** The application fetches basic details from the GitHub API, such as the repository's name, description, star count, and fork count.
3.  **Grade Repository:** Upon confirmation, the application performs an analysis of the repository, including its file structure, commit history, and documentation.
4.  **Get Results:** The application displays a score out of 100, a rating (e.g., Beginner, Intermediate, Advanced), a summary of the analysis, and a personalized roadmap with suggestions for improvement.

## Features

*   **Repository Details:** Fetches and displays key information about a repository.
*   **AI-Powered Analysis:** Provides a detailed analysis of the repository's health. *(Note: The AI response is currently mocked in the proof-of-concept and does not connect to a live AI model.)*
*   **Scoring and Rating:** Quantifies the repository's quality with a score and a descriptive rating.
*   **Personalized Roadmap:** Offers actionable steps to improve the repository.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd gitgrade-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of the `gitgrade-app` directory and add the following environment variables.

```
GITHUB_TOKEN=<your-github-personal-access-token>
AI_API_KEY=<your-ai-api-key>
```

*   `GITHUB_TOKEN`: A GitHub personal access token is required to interact with the GitHub API. You can generate one [here](https://github.com/settings/tokens).
*   `AI_API_KEY`: Although the AI integration is currently mocked, the application is set up to require an AI API key for a future implementation with a large language model.

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Endpoints

*   `POST /api/fetch-details`: Fetches details of a GitHub repository.
    *   **Body:** `{ "url": "<github-repo-url>" }`
*   `POST /api/analyze`: Analyzes a GitHub repository.
    *   **Body:** `{ "owner": "<repo-owner>", "repo": "<repo-name>" }`

## Project Structure

```
/
├── public/               # Static assets
├── src/
│   └── app/              # Next.js App Router
│       ├── page.tsx      # Main application page
│       └── layout.tsx    # Root layout
├── api/                  # Serverless API routes
│   ├── fetch-details.ts  # Fetches repository details
│   └── analyze.ts        # Analyzes the repository
└── ...                   # Configuration files
```

## Future Improvements

*   **Implement Live AI Integration:** Replace the mocked AI response in `api/analyze.ts` with a connection to a real large language model (e.g., Google Gemini) to provide dynamic and accurate analysis.
*   **Deeper Analysis:** Expand the analysis to include factors such as:
    *   Code quality and complexity.
    *   Test coverage.
    *   Dependency freshness and security vulnerabilities.
    *   Issue and pull request activity.
*   **User Accounts:** Allow users to sign in with their GitHub account to track their repository grades over time.