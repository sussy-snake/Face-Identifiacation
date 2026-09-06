"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Fingerprint, Link as LinkIcon, Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: <Fingerprint className="w-6 h-6" />,
    title: "Face Upload & Processing",
    desc: "Extracting 128-point biometric map",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "OSINT Verification",
    desc: "Cross-referencing global social graphs",
  },
  {
    icon: <LinkIcon className="w-6 h-6" />,
    title: "Blockchain Minting",
    desc: "Creating zero-knowledge proof on Sepolia",
  },
];

export default function PipelineVisualizer({ isLoading = false }: { isLoading?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !lineRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });

      tl.to(lineRef.current, {
        height: "100%",
        ease: "none",
      });

      stepRefs.current.forEach((step, index) => {
        if (!step) return;
        gsap.fromTo(
          step,
          { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: step,
              start: "top 75%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <section ref={containerRef} className="relative py-32 min-h-screen bg-black">
      {isLoading && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-emerald-400 z-50">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-mono text-sm animate-pulse">Running Neural Pipeline...</p>
        </div>
      )}
      <div className={`max-w-4xl mx-auto px-6 relative transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />
        <div 
          ref={lineRef} 
          className={`absolute left-1/2 top-0 w-px bg-gradient-to-b from-emerald-500 via-blue-500 to-emerald-500 -translate-x-1/2 glow-green ${isLoading ? 'h-full animate-pulse' : 'h-0'}`} 
        />

        <div className="space-y-32 mt-20">
          {steps.map((step, index) => (
            <div 
              key={index}
              ref={(el) => { stepRefs.current[index] = el }}
              className={`flex items-center gap-8 ${
                index % 2 === 0 ? "flex-row-reverse" : "flex-row"
              } ${isLoading ? 'opacity-100' : ''}`}
            >
              <div className="w-1/2 flex justify-end">
                {index % 2 !== 0 && (
                  <div className={`glass p-6 rounded-2xl w-full max-w-sm ${isLoading ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                    <h4 className="text-xl font-semibold mb-2 text-white">{step.title}</h4>
                    <p className="text-zinc-400 text-sm">{step.desc}</p>
                  </div>
                )}
              </div>
              
              <div className={`relative z-10 w-14 h-14 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${isLoading ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-zinc-900 border-zinc-700'}`}>
                <div className={`${isLoading ? 'text-emerald-300 animate-pulse' : 'text-emerald-400'}`}>{step.icon}</div>
              </div>

              <div className="w-1/2 flex justify-start">
                {index % 2 === 0 && (
                  <div className={`glass p-6 rounded-2xl w-full max-w-sm ${isLoading ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                    <h4 className="text-xl font-semibold mb-2 text-white">{step.title}</h4>
                    <p className="text-zinc-400 text-sm">{step.desc}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
