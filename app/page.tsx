"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import MockDashboard from "@/components/MockDashboard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<{
    extracted_identity?: string;
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

  // Initial State: Lock scroll on load
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setMatchData(null);
    
    // Create local preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    // Upload Transition: Unlock, scroll to pipeline, and lock again
    document.body.style.overflow = "auto";
    setTimeout(() => {
      const pipelineEl = document.getElementById("pipeline-section");
      if (pipelineEl) {
        pipelineEl.scrollIntoView({ behavior: "smooth" });
        // Lock scroll again after it arrives (approx 1000ms for smooth scroll)
        setTimeout(() => {
          document.body.style.overflow = "hidden";
        }, 1000);
      }
    }, 100);

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

      // Result Transition: Permanently unlock and scroll to dossier
      setTimeout(() => {
        document.body.style.overflow = "auto";
        const dashboardEl = document.getElementById("dashboard-section");
        if (dashboardEl) {
          dashboardEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during verification.");
      // Unlock if error occurs
      document.body.style.overflow = "auto";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <Hero onUpload={handleUpload} />
      
      {error && (
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center relative z-10">
          {error}
        </div>
      )}
      
      <div id="pipeline-section">
        <PipelineVisualizer isLoading={isLoading} />
      </div>

      <div id="dashboard-section">
        {matchData && matchData.primary_match && matchData.blockchain && (
          <MockDashboard
            extractedIdentity={matchData.extracted_identity}
            matchName={matchData.primary_match.title}
            matchSnippet={matchData.primary_match.snippet}
            matchUrl={matchData.primary_match.link}
            txHash={matchData.blockchain.tx_hash}
            confidenceScore={matchData.primary_match.similarity_score}
            alternateMatches={matchData.alternate_matches}
            uploadedImage={uploadedImage}
          />
        )}
      </div>
    </main>
  );
}
