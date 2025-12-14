import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Interfaces for Request/Response ---

interface AnalyzePayload {
  owner: string;
  repo: string;
}

interface AnalysisReport {
  score: number;
  rating: string;
  summary: string;
  roadmap: { title: string; explanation: string }[];
}

// --- GitHub API Helpers ---

async function callGitHubApi<T>(path: string, githubToken: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown GitHub API error' }));
    throw new Error(`GitHub API error (${response.status}): ${errorData.message}`);
  }
  return response.json() as Promise<T>;
}

interface GitHubTreeItem { path: string; type: 'blob' | 'tree'; }
interface GitHubTreeResponse { tree: GitHubTreeItem[]; }
async function fetchRepoTree(owner: string, repo: string, githubToken: string): Promise<GitHubTreeItem[]> {
  const branchInfo = await callGitHubApi<{ default_branch: string }>(`${owner}/${repo}`, githubToken);
  const treeResponse = await callGitHubApi<GitHubTreeResponse>(
    `${owner}/${repo}/git/trees/${branchInfo.default_branch}?recursive=1`,
    githubToken
  );
  return treeResponse.tree;
}

async function fetchFileContent(owner: string, repo: string, path: string, githubToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3.raw' },
    });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    return null;
  }
}

interface GitHubCommit { commit: { message: string; }; }
async function fetchCommits(owner: string, repo: string, githubToken: string): Promise<GitHubCommit[]> {
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
  const aiApiKey = process.env.AI_API_KEY;

  if (!githubToken || !aiApiKey) {
    return response.status(500).json({ detail: "Required environment variables are not set." });
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
    const hasReadme = !!readmeContent;
    const readmeLength = readmeContent?.length || 0;
    const commitCount = commits.length;
    const commitMessages = commits.map(c => c.commit.message).slice(0, 20); // First 20 messages for prompt

    const analysisData = {
      fileCount,
      hasReadme,
      readmeLength,
      commitCount,
      commitMessages,
    };

    // --- AI Integration ---
    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert software engineering mentor reviewing a student's GitHub repository.
      Analyze the following repository data and provide a constructive evaluation.

      Repository Data:
      - Total Files: ${analysisData.fileCount}
      - README exists: ${analysisData.hasReadme}
      - README length (characters): ${analysisData.readmeLength}
      - Recent Commits (last 100): ${analysisData.commitCount}
      - Sample Commit Messages: ${analysisData.commitMessages.join(", ")}

      Based on this data, perform the following tasks:
      1.  Provide a **score** from 0 to 100 that reflects the project's quality against the standards of a strong student portfolio piece. A short README (< 500 chars) or few commits (< 10) should result in a lower score.
      2.  Provide a **rating** (e.g., "Beginner", "Intermediate", "Advanced").
      3.  Write a concise **summary** (3-4 sentences) that highlights one key strength and one major area for improvement.
      4.  Generate a **roadmap** of exactly 3 personalized, high-impact action items. For each item, provide a "title" and a one-sentence "explanation".

      Your entire output must be a single, valid JSON object with the keys "score", "rating", "summary", and "roadmap". Do not include any other text or markdown.
    `;

    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    
    // Clean the AI response to ensure it's valid JSON
    const cleanedResponse = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const aiReport: AnalysisReport = JSON.parse(cleanedResponse);

    return response.status(200).json(aiReport);

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return response.status(500).json({ detail: error.message || "An unexpected error occurred during analysis." });
  }
}