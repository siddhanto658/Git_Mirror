import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  const { url } = (await request.json()) as GitHubUrlPayload;

  if (!url || !url.includes("github.com")) {
    return NextResponse.json({ detail: "Invalid GitHub URL format." }, { status: 400 });
  }

  const parts = url.split("github.com/");
  if (parts.length < 2) {
    return NextResponse.json({ detail: "Invalid GitHub URL format." }, { status: 400 });
  }

  const repoPath = parts[1].split("/");
  if (repoPath.length < 2) {
    return NextResponse.json({ detail: "Invalid GitHub URL format (owner/repo missing)." }, { status: 400 });
  }

  const owner = repoPath[0];
  const repo = repoPath[1].split(".git")[0]; // Remove .git if present

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return NextResponse.json({ detail: "GITHUB_TOKEN environment variable not set." }, { status: 500 });
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
        return NextResponse.json({ detail: "Repository not found." }, { status: 404 });
      }
      if (apiResponse.status === 401) {
        return NextResponse.json({ detail: "GitHub token is invalid or expired." }, { status: 401 });
      }
      return NextResponse.json({ detail: `GitHub API error: ${data.message || 'Unknown error'}` }, { status: apiResponse.status });
    }

    const repoDetails: RepoDetails = {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      html_url: data.html_url,
    };

    return NextResponse.json(repoDetails, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ detail: `Network error while connecting to GitHub: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
