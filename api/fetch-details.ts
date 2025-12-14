import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GitHubUrlPayload {
  url: string;
}

interface RepoDetails {
  name: string;
  full_name: string;
  description: string | null;
  stars: number;
  forks: number;
  html_url: string;
}

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ detail: 'Method Not Allowed' });
  }

  const { url } = request.body as GitHubUrlPayload;

  if (!url || !url.includes("github.com")) {
    return response.status(400).json({ detail: "Invalid GitHub URL format." });
  }

  const parts = url.split("github.com/");
  if (parts.length < 2) {
    return response.status(400).json({ detail: "Invalid GitHub URL format." });
  }

  const repoPath = parts[1].split("/");
  if (repoPath.length < 2) {
    return response.status(400).json({ detail: "Invalid GitHub URL format (owner/repo missing)." });
  }

  const owner = repoPath[0];
  const repo = repoPath[1].split(".git")[0]; // Remove .git if present

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return response.status(500).json({ detail: "GITHUB_TOKEN environment variable not set." });
  }

  const headers = {
    Authorization: `token ${githubToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const apiResponse = await fetch(githubApiUrl, { headers });
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) {
        return response.status(404).json({ detail: "Repository not found." });
      }
      if (apiResponse.status === 401) {
        return response.status(401).json({ detail: "GitHub token is invalid or expired." });
      }
      return response.status(apiResponse.status).json({ detail: `GitHub API error: ${data.message || 'Unknown error'}` });
    }

    const repoDetails: RepoDetails = {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      html_url: data.html_url,
    };

    return response.status(200).json(repoDetails);

  } catch (error: any) {
    return response.status(500).json({ detail: `Network error while connecting to GitHub: ${error.message || 'Unknown error'}` });
  }
}
