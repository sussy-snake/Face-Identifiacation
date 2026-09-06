"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";

interface HeroProps {
  onUpload: (file: File) => void;
}

export default function Hero({ onUpload }: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
      
      <div className="relative z-10 w-full max-w-lg p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Face-to-Chain Identity
          </h1>
          <p className="text-zinc-400 text-lg">
            Verify human uniqueness. Mint to Sepolia.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="glass rounded-3xl p-8 flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-colors duration-500 cursor-pointer"
          onClick={handleScanClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 glow-green">
            <ScanFace className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">Initiate Scan</h3>
            <p className="text-sm text-zinc-500">Secure. Private. Irreversible.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
