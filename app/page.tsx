"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import MockDashboard from "@/components/MockDashboard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<{
    matchName: string;
    matchUrl: string;
    txHash: string;
    confidenceScore: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setMatchData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use environment variable for the API URL, falling back to localhost for local dev
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Verification failed");
      }

      const data = await response.json();
      setMatchData({
        matchName: data.matchName,
        matchUrl: data.matchUrl,
        txHash: data.txHash,
        confidenceScore: data.confidenceScore,
      });

      // Scroll to dashboard after successful scan
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full flex flex-col bg-black text-white">
      <Hero onUpload={handleUpload} />
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-900/20 w-full">
          {error}
        </div>
      )}
      <PipelineVisualizer isLoading={isLoading} />
      {matchData && (
        <MockDashboard
          matchName={matchData.matchName}
          matchUrl={matchData.matchUrl}
          txHash={matchData.txHash}
          confidenceScore={matchData.confidenceScore}
        />
      )}
    </main>
  );
}
