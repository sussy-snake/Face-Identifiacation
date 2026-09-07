"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ExternalLink, Copy, User, Check, ShieldCheck, Hash, AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
  extractedIdentity?: string;
  matchName?: string;
  matchSnippet?: string;
  matchUrl?: string;
  txHash?: string;
  confidenceScore?: number;
  uploadedImage?: string | null;
  primaryThumbnail?: string;
  alternateMatches?: Array<{
    title: string;
    snippet: string;
    link: string;
    thumbnail: string;
    similarity_score: number;
  }>;
}

export default function MockDashboard({ extractedIdentity, matchName, matchSnippet, matchUrl, txHash, confidenceScore, uploadedImage, primaryThumbnail, alternateMatches }: DashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-32 min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
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
        className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6"
      >
        {/* Main Match Card - Identity Dossier */}
        <div className="glass rounded-[2rem] p-8 lg:w-2/3 relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.03)] border-zinc-800/60">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-10 relative z-10">
            {/* Avatar Slot */}
            <div className="shrink-0 flex flex-col items-center md:items-start pt-2">
              <div className="w-36 h-36 rounded-full border-[1px] border-zinc-700 bg-zinc-900/80 flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                {primaryThumbnail ? (
                  <img src={primaryThumbnail} alt="Matched Profile" className="w-full h-full object-cover rounded-full relative z-10" />
                ) : uploadedImage ? (
                  <img src={uploadedImage} alt="Scanned Face fallback" className="w-full h-full object-cover rounded-full relative z-10" />
                ) : (
                  <User className="w-12 h-12 text-zinc-600 relative z-10" />
                )}
                
                {/* Scanning reticle effect overlay */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/0 animate-[pulse_3s_ease-in-out_infinite] z-20"></div>
              </div>
            </div>

            {/* Content Slot */}
            <div className="flex-1">
              <div className="mb-6 text-center md:text-left">
                <h3 className="text-zinc-500 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Identity Dossier</h3>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  VERIFIED SOURCE PROFILE
                </h2>
              </div>

              <div className="rounded-3xl border border-zinc-800/60 bg-black/40 p-7 space-y-6">
                
                {extractedIdentity && (
                  <>
                    <div className="flex flex-col items-start pb-4 border-b border-zinc-800/60 w-full overflow-hidden">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        AI Swarm Extraction
                      </span>
                      <h3 className="text-lg md:text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)] uppercase break-words line-clamp-2 w-full">
                        VERIFIED SUBJECT: {extractedIdentity}
                      </h3>
                    </div>
                  </>
                )}

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
            </div>
          </div>
        </div>

        {/* Blockchain Status Card */}
        <div className="glass rounded-[2rem] p-8 lg:w-1/3 flex flex-col border-emerald-500/20 relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.03)]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-zinc-500 text-[11px] font-bold tracking-[0.2em] uppercase mb-8">Network Status</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-60"></div>
                <div className="relative w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Verified on Sepolia</span>
            </div>
            
            {uploadedImage && (
              <div className="flex flex-col items-center justify-center mb-8">
                <img src={uploadedImage} alt="Input Face Scan" className="w-20 h-20 mx-auto rounded-xl object-cover border border-white/20 shadow-inner my-3" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Input Face Scan</span>
              </div>
            )}
            
            <div className="bg-black/50 rounded-2xl border border-zinc-800/80 p-5 mb-8 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <Hash className="w-3 h-3" />
                  <span>Tx Hash</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-emerald-400/80 font-mono text-xs break-all leading-relaxed selection:bg-emerald-500/30">
                {txHash}
              </p>
            </div>

            <a href="#" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-400">
              <ExternalLink className="w-3.5 h-3.5" />
              View on SepoliaScan
            </a>
          </div>
        </div>
      </motion.div>

      {/* Alternate Candidates Section */}
      {alternateMatches && alternateMatches.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-8"
        >
          <h3 className="text-xs tracking-widest text-white/50 mb-3 uppercase">Alternate Candidates</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {alternateMatches.map((alt, idx) => (
              <div 
                key={idx} 
                className="flex flex-col justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                      {alt.thumbnail ? (
                        <img src={alt.thumbnail} alt={alt.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      alt.similarity_score >= 80 ? 'text-emerald-400 bg-emerald-400/10' : 
                      alt.similarity_score >= 60 ? 'text-yellow-400 bg-yellow-400/10' : 
                      'text-zinc-400 bg-zinc-800'
                    }`}>
                      {alt.similarity_score}% Match
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-white font-medium text-sm line-clamp-1 mb-1" title={alt.title}>{alt.title}</h4>
                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4">
                    {alt.snippet}
                  </p>
                </div>
                
                {/* Footer */}
                <a 
                  href={alt.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full py-1.5 text-xs text-center rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors mt-auto inline-block"
                >
                  View Source Post
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
