"use client";

import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, Copy, User, Check, ShieldCheck, Hash, AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
  status?: string;
  message?: string;
  matchName?: string;
  matchSnippet?: string;
  matchUrl?: string;
  txHash?: string;
  confidenceScore?: number;
  uploadedImage?: string | null;
  fallbacks?: Array<{
    title: string;
    snippet: string;
    link: string;
    thumbnail: string;
    similarity_score: number;
  }>;
}

export default function MockDashboard({ status = "exact_match", message, matchName, matchSnippet, matchUrl, txHash, confidenceScore, uploadedImage, fallbacks }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const [isFallbacksOpen, setIsFallbacksOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-32 min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background with CSS radial gradient mesh and grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]"></div>
      
      {/* Slow rotating CSS radial glow to simulate 3D mesh */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[800px] h-[800px] rounded-full border border-zinc-800/40 border-dashed animate-[spin_60s_linear_infinite] absolute"></div>
        <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/10 border-dashed animate-[spin_40s_linear_infinite_reverse] absolute glow-green"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-[120px] absolute"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative z-10 w-full max-w-6xl px-6 flex flex-col lg:flex-row gap-6"
      >
        {/* Main Match Card - Identity Dossier */}
        <div className="glass rounded-[2rem] p-8 lg:w-2/3 relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.03)] border-zinc-800/60">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-10 relative z-10">
            {/* Avatar Slot */}
            <div className="shrink-0 flex flex-col items-center md:items-start pt-2">
              <div className="w-36 h-36 rounded-full border-[1px] border-zinc-700 bg-zinc-900/80 flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Scanned Face" className="w-full h-full object-cover rounded-full relative z-10" />
                ) : (
                  <ShieldCheck className="w-14 h-14 text-zinc-600 relative z-10" />
                )}
              </div>
            </div>

            {/* Content Slot */}
            <div className="flex-1">
              <div className="mb-6 text-center md:text-left">
                <h3 className="text-zinc-500 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Identity Dossier</h3>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {status === "partial_match" ? "PARTIAL MATCH DETECTED" : "VERIFIED SOURCE PROFILE"}
                </h2>
              </div>

              {status === "partial_match" ? (
                <div className="rounded-3xl border border-yellow-500/30 bg-black/40 p-7 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 mt-1">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-medium text-lg mb-1">{message || "Couldn't find the exact data."}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        The facial similarity score was below the 80% threshold. The background or scenery matched, but we cannot cryptographically verify this exact identity.
                      </p>
                      
                      <button 
                        onClick={() => setIsFallbacksOpen(!isFallbacksOpen)}
                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm font-medium bg-white/5 py-2 px-4 rounded-lg border border-white/10"
                      >
                        Click here to find relevant data
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFallbacksOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isFallbacksOpen && fallbacks && fallbacks.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="h-px bg-zinc-800/60 w-full mb-4" />
                        {fallbacks.map((fallback, idx) => (
                          <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium truncate flex-1">{fallback.title}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md ml-2 shrink-0">
                                ~{fallback.similarity_score}% Contextual Match
                              </span>
                            </div>
                            <p className="text-zinc-400 text-xs line-clamp-2">{fallback.snippet}</p>
                            <a href={fallback.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-bold uppercase tracking-wider mt-1">
                              <ExternalLink className="w-3 h-3" />
                              View Source
                            </a>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl border border-zinc-800/60 bg-black/40 p-7 space-y-6">
                    
                    {/* Account Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0">
                        <User className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-sm shrink-0">Account Name:</span>
                          <span className="text-emerald-400 font-medium text-[15px] truncate" title={matchName}>{matchName}</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-800/60 w-full" />

                    {/* Profile Intro / Snippet */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em]">Post Details / Intro</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {matchSnippet}
                      </p>
                    </div>

                    <div className="h-px bg-zinc-800/60 w-full" />

                    {/* Source Link */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em]">Source</span>
                      </div>
                      <a href={matchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group break-all">
                        <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
                        {matchUrl && matchUrl !== "N/A" ? matchUrl : "Found on Web"}
                      </a>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden">
                    <div className="text-white font-bold text-[15px] bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200 truncate">
                      {confidenceScore}% Match Found: {matchName}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Status Card */}
        <div className={`glass rounded-[2rem] p-8 lg:w-1/3 flex flex-col relative overflow-hidden group ${status === "partial_match" ? "border-zinc-800/60 opacity-50 grayscale" : "border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.03)]"}`}>
          <div className={`absolute inset-0 bg-gradient-to-b ${status === "partial_match" ? "from-zinc-800/10" : "from-emerald-500/5"} to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-zinc-500 text-[11px] font-bold tracking-[0.2em] uppercase mb-8">Network Status</h3>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                {status === "partial_match" ? (
                  <div className="relative w-2.5 h-2.5 bg-zinc-600 rounded-full"></div>
                ) : (
                  <>
                    <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-60"></div>
                    <div className="relative w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                  </>
                )}
              </div>
              <span className={`font-bold text-xl tracking-tight ${status === "partial_match" ? "text-zinc-500" : "text-white"}`}>
                {status === "partial_match" ? "Minting Disabled" : "Verified on Sepolia"}
              </span>
            </div>
            
            <div className="bg-black/50 rounded-2xl border border-zinc-800/80 p-5 mb-8 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <Hash className="w-3 h-3" />
                  <span>Tx Hash</span>
                </div>
                <button 
                  onClick={handleCopy}
                  disabled={status === "partial_match"}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className={`font-mono text-xs break-all leading-relaxed ${status === "partial_match" ? "text-zinc-600" : "text-emerald-400/80 selection:bg-emerald-500/30"}`}>
                {status === "partial_match" ? "0x0000000000000000000000000000000000000000000000000000000000000000" : txHash}
              </p>
            </div>

            <a href="#" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-400">
              <ExternalLink className="w-3.5 h-3.5" />
              View on SepoliaScan
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
