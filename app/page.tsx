"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import MockDashboard from "@/components/MockDashboard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<{
    primary_match?: {
      title: string;
      snippet: string;
      link: string;
      thumbnail: string;
      similarity_score: number;
    };
    alternate_matches?: Array<{
      title: string;
      snippet: string;
      link: string;
      thumbnail: string;
      similarity_score: number;
    }>;
    blockchain?: {
      tx_hash: string;
      data_hash: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setMatchData(null);
    
    // Create local preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

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
      setMatchData(data);

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
      {matchData && matchData.primary_match && matchData.blockchain && (
        <MockDashboard
          matchName={matchData.primary_match.title}
          matchSnippet={matchData.primary_match.snippet}
          matchUrl={matchData.primary_match.link}
          txHash={matchData.blockchain.tx_hash}
          confidenceScore={matchData.primary_match.similarity_score}
          alternateMatches={matchData.alternate_matches}
          uploadedImage={uploadedImage}
        />
      )}
    </main>
  );
}
