"use client";

import { motion } from "framer-motion";
import { CheckCircle, AtSign, Hash } from "lucide-react";

interface DashboardProps {
  matchName: string;
  matchUrl: string;
  txHash: string;
  confidenceScore: number;
}

export default function MockDashboard({ matchName, matchUrl, txHash, confidenceScore }: DashboardProps) {
  return (
    <section className="py-32 min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Profile Match */}
        <div className="glass rounded-3xl p-6 md:col-span-2 relative overflow-hidden flex items-center gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
              <span className="text-4xl text-zinc-500">?</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium text-sm">{confidenceScore}% Match Found</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 truncate" title={matchName}>{matchName}</h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <AtSign className="w-4 h-4 shrink-0" />
              <a href={matchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors truncate">
                {matchUrl !== "N/A" ? matchUrl : "Found on Web"}
              </a>
            </div>
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between group">
          <div>
            <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Network Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse glow-green" />
              <span className="text-white font-medium">Verified on Sepolia</span>
            </div>
          </div>
          
          <div className="mt-8 bg-black/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs uppercase">
              <Hash className="w-3 h-3 shrink-0" />
              <span>Tx Hash</span>
            </div>
            <p className="text-emerald-400 font-mono text-sm truncate opacity-80 group-hover:opacity-100 transition-opacity" title={txHash}>
              {txHash}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
