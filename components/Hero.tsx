"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, Upload, X, ArrowLeft, Aperture } from "lucide-react";

interface HeroProps {
  onUpload: (file: File) => void;
}

export default function Hero({ onUpload }: HeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<"selection" | "camera">("selection");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleScanClick = () => {
    setIsModalOpen(true);
    setView("selection");
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    closeModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setView("camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setView("selection");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const snapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw image, mirroring if needed
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            onUpload(file);
            closeModal();
          }
        }, "image/jpeg", 0.95);
      }
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
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 glow-green">
            <ScanFace className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">Initiate Scan</h3>
            <p className="text-sm text-zinc-500">Secure. Private. Irreversible.</p>
          </div>
        </motion.div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 backdrop-blur-md bg-black/60"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass rounded-3xl border border-zinc-800/60 overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/60 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {view === "camera" && (
                    <button 
                      onClick={() => { stopCamera(); setView("selection"); }}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors text-zinc-400"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <h3 className="text-lg font-bold text-white">
                    {view === "selection" ? "Select Source" : "Camera Capture"}
                  </h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {view === "selection" ? (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleUploadClick}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium text-lg">Upload from Files</div>
                        <div className="text-zinc-500 text-sm">Select an existing photo</div>
                      </div>
                    </button>

                    <button 
                      onClick={startCamera}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium text-lg">Capture from Camera</div>
                        <div className="text-zinc-500 text-sm">Take a live photo</div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-zinc-800">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-emerald-500/30 rounded-full flex items-center justify-center relative animate-[pulse_3s_ease-in-out_infinite]">
                          <Aperture className="w-8 h-8 text-emerald-500/50 absolute" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[2px] bg-emerald-500/70" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-[2px] bg-emerald-500/70" />
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-[2px] bg-emerald-500/70" />
                          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 h-4 w-[2px] bg-emerald-500/70" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={snapPhoto}
                      className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Snap Photo
                    </button>
                    {/* Hidden canvas for extraction */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
