"use client";

import { useState } from "react";
import Link from "next/link"; // Import Link for navigation

// Define types for repository details
interface RepoDetails {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  html_url: string;
}

// Define the different states for our application UI
type AppState = "initial" | "fetching" | "confirming" | "grading" | "results";

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("");
  const [appState, setAppState] = useState<AppState>("initial");
  const [error, setError] = useState<string | null>(null);
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);

  const handleFetch = async () => {
    // Basic URL validation
    if (!githubUrl || !githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setAppState("fetching");
    setError(null);

    try {
      const response = await fetch("/api/fetch-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: githubUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch repository details.");
      }

      const data: RepoDetails = await response.json();
      setRepoDetails(data);
      setAppState("confirming");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during fetch.");
      setAppState("initial");
    }
  };

  const handleGrade = async () => {
    if (!repoDetails || !githubUrl) return;

    setAppState("grading");
    setError(null);

    // This is where the actual /api/analyze call will go in the future
    console.log("Starting full analysis for:", githubUrl);
    
    // Simulate API call for grading
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    
    setAppState("results"); // For now, we'll simulate going to results
    console.log("Simulated grading complete.");
    // In a real scenario, you'd set the actual analysis report here.
  };

  const handleReset = () => {
    setGithubUrl("");
    setAppState("initial");
    setError(null);
    setRepoDetails(null);
  };

  const renderContent = () => {
    switch (appState) {
      case "initial":
      case "fetching":
        return (
          <div className="w-full flex flex-col items-center gap-4 mt-6">
            <input
              type="text"
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              placeholder="e.g., https://github.com/facebook/react"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setError(null); // Clear error on input change
              }}
              disabled={appState === "fetching"}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleFetch}
              className="w-full md:w-auto px-8 py-3 rounded-lg bg-teal-500 text-gray-900 font-bold text-lg hover:bg-teal-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={appState === "fetching" || !githubUrl}
            >
              {appState === "fetching" ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
                </>
              ) : (
                "Fetch"
              )}
            </button>
          </div>
        );

      case "confirming":
        if (!repoDetails) return null; // Should not happen

        return (
          <div className="w-full flex flex-col items-center gap-4 mt-6">
            <div className="bg-gray-700 p-6 rounded-lg w-full shadow-md">
              <h2 className="text-2xl font-bold text-teal-400">
                <Link href={repoDetails.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {repoDetails.full_name}
                </Link>
              </h2>
              {repoDetails.description && (
                <p className="text-gray-300 mt-2">{repoDetails.description}</p>
              )}
              <div className="flex items-center gap-4 text-gray-400 text-sm mt-4">
                {repoDetails.stars !== undefined && (
                  <span>⭐ {repoDetails.stars.toLocaleString()}</span>
                )}
                {repoDetails.forks !== undefined && (
                  <span>🍴 {repoDetails.forks.toLocaleString()}</span>
                )}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-4">
              <button
                onClick={handleGrade}
                className="flex-1 px-8 py-3 rounded-lg bg-teal-500 text-gray-900 font-bold text-lg hover:bg-teal-400 transition-colors duration-200"
              >
                Grade this Repository
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-8 py-3 rounded-lg border border-gray-600 text-gray-300 font-bold text-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Try a Different URL
              </button>
            </div>
          </div>
        );

      case "grading":
        return (
          <div className="w-full flex flex-col items-center gap-8 mt-6">
            <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-300">Grading repository... This can take up to a minute.</p>
          </div>
        );
      
      case "results":
          return (
            <div className="w-full flex flex-col items-center gap-8 mt-6">
                <h2 className="text-3xl font-bold text-teal-400">Analysis Complete!</h2>
                <p className="text-lg text-gray-300">Here would be the full report (Score, Summary, Roadmap).</p>
                <button
                    onClick={handleReset}
                    className="px-8 py-3 rounded-lg border border-gray-600 text-gray-300 font-bold text-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    Analyze Another Repository
                </button>
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-black text-white">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center gap-8 rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="text-5xl font-extrabold text-teal-400 mb-2">GitGrade</h1>
        <p className="text-xl text-gray-300 text-center max-w-md">
          Get an instant, AI-powered analysis of your GitHub repository.
        </p>
        {renderContent()}
      </main>
    </div>
  );
}

