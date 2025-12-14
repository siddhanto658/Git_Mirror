import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // Vercel's Node.js runtime includes fetch globally, but good practice for clarity

// --- Interfaces for Request/Response ---

interface AnalyzePayload {
  owner: string;
  repo: string;
}

interface AnalysisReport {
  score: number;
  rating: string; // e.g., Beginner, Intermediate, Advanced
  summary: string;
  roadmap: { title: string; explanation: string }[];
}

// --- GitHub API Helpers ---

async function callGitHubApi<T>(path: string, githubToken: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository or resource not found on GitHub.');
    if (response.status === 401) throw new Error('GitHub token is invalid or unauthorized.');
    const errorData = await response.json().catch(() => ({ message: 'Unknown GitHub API error' }));
    throw new Error(`GitHub API error (${response.status}): ${errorData.message}`);
  }

  return response.json() as Promise<T>;
}

// --- Core Analysis Logic (Partial - will be expanded) ---

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree'; // blob for file, tree for directory
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

async function fetchRepoTree(owner: string, repo: string, githubToken: string): Promise<GitHubTreeItem[]> {
  const branchInfo = await callGitHubApi<{ default_branch: string }>(`${owner}/${repo}`, githubToken);
  const defaultBranch = branchInfo.default_branch;

  const treeResponse = await callGitHubApi<GitHubTreeResponse>(
    `${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    githubToken
  );
  return treeResponse.tree;
}

async function fetchFileContent(owner: string, repo: string, path: string, githubToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3.raw', // Request raw content
      },
    });

    if (response.status === 404) return null; // File not found is acceptable
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown GitHub API error' }));
      throw new Error(`GitHub API error (${response.status}) fetching ${path}: ${errorData.message}`);
    }

    return response.text();
  } catch (error) {
    console.error(`Error fetching file content for ${path}:`, error);
    return null;
  }
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string; };
  };
}

async function fetchCommits(owner: string, repo: string, githubToken: string): Promise<GitHubCommit[]> {
  // Fetch up to 100 recent commits for basic analysis
  return callGitHubApi<GitHubCommit[]>(`${owner}/${repo}/commits?per_page=100`, githubToken);
}

// --- Main Serverless Function ---

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ detail: 'Method Not Allowed' });
  }

  const { owner, repo } = request.body as AnalyzePayload;

  if (!owner || !repo) {
    return response.status(400).json({ detail: "Owner and repository name are required." });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return response.status(500).json({ detail: "GITHUB_TOKEN environment variable not set." });
  }

  const aiApiKey = process.env.AI_API_KEY; // We'll need this soon
  if (!aiApiKey) {
    return response.status(500).json({ detail: "AI_API_KEY environment variable not set." });
  }

  try {
    // --- Data Collection ---
    const [tree, readmeContent, commits] = await Promise.all([
      fetchRepoTree(owner, repo, githubToken),
      fetchFileContent(owner, repo, 'README.md', githubToken),
      fetchCommits(owner, repo, githubToken),
    ]);

    // --- Basic Analysis ---
    const fileCount = tree.filter(item => item.type === 'blob').length;
    const directoryCount = tree.filter(item => item.type === 'tree').length;
    const hasReadme = !!readmeContent;
    const readmeLength = readmeContent?.length || 0;
    const commitCount = commits.length;
    
    const languageStats: { [key: string]: number } = {};
    tree.filter(item => item.type === 'blob').forEach(file => {
      const parts = file.path.split('.');
      if (parts.length > 1) {
        const ext = parts[parts.length - 1];
        languageStats[ext] = (languageStats[ext] || 0) + 1;
      }
    });

    const analysisData = {
      owner,
      repo,
      fileCount,
      directoryCount,
      hasReadme,
      readmeLength,
      commitCount,
      languageStats,
      // Add more sophisticated analysis here:
      // - Commit message quality (parse messages)
      // - Branching strategy (e.g., check for multiple branches, PRs via another API call)
      // - Test file detection (look for common test file patterns in tree)
    };
    
    // --- AI Integration (Placeholder for now) ---
    // In a real scenario, this is where you'd construct a detailed prompt
    // and send it to an LLM like Google Gemini.
    console.log("Analysis Data for AI:", JSON.stringify(analysisData, null, 2));

    // Mock AI response for testing
    const mockAiResponse: AnalysisReport = {
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-99
      rating: "Intermediate",
      summary: `This is a mock summary for ${owner}/${repo}. It indicates good progress with ${fileCount} files and ${commitCount} commits. However, the AI recommends further improvements in test coverage and commit message consistency.`,
      roadmap: [
        { title: "Improve Test Coverage", explanation: "Add more unit and integration tests to ensure code reliability and prevent regressions." },
        { title: "Refine Commit Messages", explanation: "Adopt a conventional commit style to make your commit history more readable and informative." },
        { title: "Enhance README Documentation", explanation: "Expand your README.md to include usage examples, setup instructions, and project architecture details." },
      ],
    };

    return response.status(200).json(mockAiResponse);

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return response.status(500).json({ detail: error.message || "An unexpected error occurred during analysis." });
  }
}