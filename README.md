# GitGrade

GitGrade is a web application that provides an instant, AI-powered analysis of any public GitHub repository. It gives a score, a rating, a summary of the repository's health, and a personalized roadmap for improvement.

## Project Links

*   **GitHub Repository:** [https://github.com/siddhanto658/Git_Mirror](https://github.com/siddhanto658/Git_Mirror)
*   **Live Demo:** [https://git-mirror.vercel.app/](https://git-mirror.vercel.app/)

---

## How It Works

1.  **Enter a GitHub URL:** Paste the URL of a public GitHub repository.
2.  **Fetch Details:** The application quickly fetches basic details from the GitHub API, such as the repository's name, description, star count, and fork count, and presents them for your confirmation.
3.  **Grade Repository:** Upon your confirmation, the application initiates a deeper analysis, including inspecting its file structure, README content, and commit history.
4.  **Get AI-Powered Report:** The application then displays a score out of 100, a rating (e.g., Beginner, Intermediate, Advanced), a summary of the analysis, and a personalized roadmap with actionable suggestions for improvement.

## Features

*   **Repository Details Fetcher:** Efficiently retrieves and displays key metadata about a GitHub repository.
*   **AI-Powered Analysis (Mocked):** Provides a detailed analysis of the repository's health, scoring, rating, and personalized roadmap. *(Note: The AI response is currently mocked in the proof-of-concept and does not connect to a live AI model.)*
*   **Intuitive User Interface:** A clear, multi-step interface guides users through the analysis process.
*   **Deployment Ready:** Configured for easy deployment on Vercel.

## Tech Stack

*   **Frontend Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend Runtime:** [Node.js](https://nodejs.org/) (Serverless Functions)
*   **Deployment Platform:** [Vercel](https://vercel.com/)

---

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/)

### Installation (Local Development)

1.  Clone the repository:
    ```bash
    git clone https://github.com/siddhanto658/Git_Mirror
    cd Git_Mirror # Navigate into the cloned repository
    cd gitgrade-app # Navigate into the Next.js project directory
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the `gitgrade-app` directory and add the following environment variables. These are essential for the application's functionality.

```
GITHUB_TOKEN=<your-github-personal-access-token>
AI_API_KEY=<your-gemini-api-key>
```

*   **`GITHUB_TOKEN`**: A GitHub Personal Access Token is required to interact with the GitHub API. You can generate one [here](https://github.com/settings/tokens). Ensure it has `repo` scope.
*   **`AI_API_KEY`**: Your API key for the generative AI model (e.g., Google Gemini). Get one from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## API Endpoints

*   `POST /api/fetch-details`: Fetches basic details of a GitHub repository.
    *   **Body:** `{ "url": "<github-repo-url>" }`
*   `POST /api/analyze`: Performs a deeper analysis of a GitHub repository and generates a report.
    *   **Body:** `{ "owner": "<repo-owner>", "repo": "<repo-name>" }`

---

## Project Structure

```
/
├── .git/                 # Git version control
├── .github/              # GitHub Actions or other configurations
├── gitgrade-app/         # Main Next.js application (Vercel Root Directory)
│   ├── public/           # Static assets
│   ├── src/
│   │   └── app/          # Next.js App Router
│   │       ├── page.tsx  # Main application page
│   │       └── layout.tsx # Root layout
│   ├── api/              # Serverless API routes
│   │   ├── fetch-details.ts # Fetches repository details
│   │   ├── analyze.ts    # Analyzes the repository
│   │   └── hello.ts      # Simple test endpoint
│   ├── .env.local        # Local environment variables (not committed)
│   ├── next.config.ts    # Next.js configuration
│   ├── package.json      # Project dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration
│   └── ...               # Other config files
├── README.md             # Project README (this file)
└── ...                   # Other root-level project files
```

---

## Future Improvements

*   **Implement Live AI Integration:** Replace the mocked AI response in `api/analyze.ts` with a real connection to a large language model (e.g., Google Gemini) to provide dynamic and accurate analysis.
*   **Deeper Analysis:** Expand the analysis to include factors such as:
    *   Code quality and complexity.
    *   Test coverage.
    *   Dependency freshness and security vulnerabilities.
    *   Issue and pull request activity.
*   **User Accounts:** Allow users to sign in with their GitHub account to track their repository grades over time.