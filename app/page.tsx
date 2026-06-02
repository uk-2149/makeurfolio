"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/src/components/auth-modal";
import { NamingModal } from "@/src/components/naming-modal";
import { GenerationOverlay } from "@/src/components/generation-overlay";
import { stashGenerationState, restoreStashedState, clearStashedState, setActiveGenerationId, getActiveGenerationId, clearActiveGenerationId, setActiveGenerationMetadata, clearActiveGenerationMetadata } from "@/src/lib/storage";
import { authClient } from "@/src/lib/auth-client";

// Mock profiles data for custom generation
const MOCK_PROFILES: Record<string, {
  name: string;
  role: string;
  location: string;
  bio: string;
  skills: string[];
  projects: Array<{ title: string; desc: string; link: string; tags: string[] }>;
  experience: Array<{ role: string; company: string; period: string; desc: string }>;
}> = {
  default: {
    name: "Alexander Griffin",
    role: "Senior Systems Engineer",
    location: "San Francisco, CA",
    bio: "Building low-latency distributed databases and robust developer tooling. Obsessed with systems architecture, performance benchmarking, and clean typesetting.",
    skills: ["Rust", "Go", "TypeScript", "Next.js", "Redis", "Docker", "PostgreSQL", "Raft"],
    projects: [
      {
        title: "vertex-db",
        desc: "Designed and implemented a Raft-consensus key-value store in Rust. Achieved 250k+ write operations/sec by writing bespoke memory-mapped log segments and optimized ring-buffer network interfaces.",
        link: "github.com/griffin/vertex-db",
        tags: ["Rust", "Raft", "gRPC"]
      },
      {
        title: "hyper-query",
        desc: "A vector-parallelized SQL engine built in Go. Leveraged SIMD registers to execute analytical aggregations on nested JSON, delivering a 14x throughput improvement over PostgreSQL.",
        link: "github.com/griffin/hyper-query",
        tags: ["Go", "SIMD", "SQL"]
      }
    ],
    experience: [
      {
        role: "Staff Engineer",
        company: "Vercel",
        period: "2024 - Present",
        desc: "Architecting dynamic routing middlewares and edge caching strategies. Reduced TTFB globally by 14ms across the edge network."
      },
      {
        role: "Software Engineer",
        company: "Stripe",
        period: "2021 - 2024",
        desc: "Engineered zero-downtime card tokenization pipelines handling $2B+ in annual volume. Optimized cache locality configurations."
      }
    ]
  },
  custom: {
    name: "User Portfolio",
    role: "Full Stack Engineer",
    location: "Seattle, WA",
    bio: "Developing user-centric web applications and robust cloud native microservices. Dedicated to elegant interface design and clean, scalable codebases.",
    skills: ["TypeScript", "React", "Node.js", "Next.js", "PostgreSQL", "AWS", "GraphQL", "Tailwind"],
    projects: [
      {
        title: "pulse-sync",
        desc: "Built a high-throughput WebSocket microservice handling 50k+ real-time client updates. Integrated Redis Pub/Sub for distributed state coordination and auto-scaling group clustering.",
        link: "github.com/user/pulse-sync",
        tags: ["TypeScript", "Redis", "WebSockets"]
      },
      {
        title: "architect-ui",
        desc: "Created a decoupled, headless UI styling library with strict type-safety. Leveraged custom compilers to tree-shake unused component styles, reducing production bundle footprint by 40%.",
        link: "github.com/user/architect-ui",
        tags: ["React", "TypeScript", "Tailwind"]
      }
    ],
    experience: [
      {
        role: "Senior Engineer",
        company: "Microsoft",
        period: "2023 - Present",
        desc: "Leading frontend infrastructure teams. Standardized React server components frameworks, boosting page loading speeds by 30%."
      },
      {
        role: "Software Engineer",
        company: "Vercel",
        period: "2021 - 2023",
        desc: "Contributed to core CLI build engines. Optimised asset bundling processes and implemented dynamic route compilation rules."
      }
    ]
  }
};

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [githubUser, setGithubUser] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  
  // Real Generation States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTriggerSource, setAuthTriggerSource] = useState<"navbar" | "generation">("generation");
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const isGenerating = generationId !== null;
  const generationStep = 0;
  const logs: string[] = [];

  const [renderedProfile] = useState(MOCK_PROFILES.default);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // Initialize theme and check for restored state
  useEffect(() => {
    setMounted(true);
    
    // Fetch session manually to avoid SSR hook issues with better-auth client
    authClient.getSession().then(res => {
      setSession(res.data);
    });

    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      requestAnimationFrame(() => {
        setTheme(isDark ? "dark" : "light");
      });

      // Check if we have an active generation overlay
      const activeGenId = getActiveGenerationId();
      if (activeGenId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGenerationId(activeGenId);
        return; // Don't try to pop naming modal if we are already generating
      }

      // Check if we came back from OAuth
      restoreStashedState().then(stashed => {
        if (stashed && session?.user) {
          setGithubUser(stashed.githubUsername);
          if (stashed.resumeFile) setResumeFile(stashed.resumeFile);
          setIsNamingModalOpen(true); // Pop the next step
        }
      });
    }
  }, [session?.user]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const typedUser = githubUser.trim();
    if (!typedUser && !resumeFile) return;

    // Stash state regardless
    await stashGenerationState({ githubUsername: typedUser, resumeFile: resumeFile || undefined });

    if (!session?.user) {
      setAuthTriggerSource("generation");
      setIsAuthModalOpen(true);
    } else {
      setIsNamingModalOpen(true);
    }
  };

  const executeRealGeneration = async (portfolioName: string) => {
    setIsNamingModalOpen(false);
    
    // 1. Read state from current vars or stashed state first
    const stashed = await restoreStashedState();
    const finalGithubUser = stashed?.githubUsername || githubUser.trim();
    const finalResumeFile = stashed?.resumeFile || resumeFile;

    // 2. Set the active metadata in localStorage first so it's ready before overlay mounts
    setActiveGenerationMetadata(!!finalGithubUser, !!finalResumeFile);

    // 3. Pre-generate a unique generation ID on the client side
    const clientGenId = "gen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    
    // 4. Immediately open overlay and save it in state/localStorage so polling starts instantly
    setGenerationId(clientGenId);
    setActiveGenerationId(clientGenId);

    const formData = new FormData();
    if (finalGithubUser) formData.append("githubUsername", finalGithubUser);
    if (finalResumeFile) formData.append("resume", finalResumeFile);
    formData.append("portfolioName", portfolioName);
    formData.append("generationId", clientGenId);

    // Clear stashed state early so we don't trigger duplicate calls on refresh
    await clearStashedState();

    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error?.message || "Failed to start generation");
        // Clear overlay on failure
        setGenerationId(null);
        clearActiveGenerationId();
        clearActiveGenerationMetadata();
      }
    } catch (err) {
      console.error(err);
      alert("Network error starting generation");
      // Clear overlay on error
      setGenerationId(null);
      clearActiveGenerationId();
      clearActiveGenerationMetadata();
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-accent/15 selection:text-accent dark:selection:bg-accent/20 dark:selection:text-accent">
      
      {mounted && (
        <>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => {
              setIsAuthModalOpen(false);
              clearStashedState();
            }} 
            triggerSource={authTriggerSource}
            onSuccess={async () => {
              setIsAuthModalOpen(false);
              
              // Immediately fetch updated session to refresh state and navbar dynamically
              const res = await authClient.getSession();
              setSession(res.data);

              if (authTriggerSource === "navbar") {
                router.push("/dashboard");
              } else {
                setIsNamingModalOpen(true);
              }
            }} 
          />
          
          <NamingModal 
            isOpen={isNamingModalOpen} 
            onClose={() => {
              setIsNamingModalOpen(false);
              clearStashedState();
            }} 
            onSubmit={executeRealGeneration} 
            defaultName={githubUser ? `${githubUser}'s Portfolio` : "My Portfolio"}
          />
          
          <GenerationOverlay 
            generationId={generationId} 
            onClose={() => {
              setGenerationId(null);
              clearActiveGenerationId();
              clearActiveGenerationMetadata();
            }} 
          />
        </>
      )}

      {/* Dynamic light structural grid line overlay */}
      <div className="absolute inset-0 pointer-events-none architectural-bg opacity-[0.8] z-0" />

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-medium tracking-tight">
            <div className="relative w-5 h-5 flex items-center justify-center border border-foreground rounded-[3px] bg-background overflow-hidden">
              <div className="absolute inset-[3px] bg-foreground rounded-[1px] rotate-45 transform transition-transform duration-500 hover:rotate-90" />
            </div>
            <span className="text-[14px] text-foreground tracking-tight font-medium">makeurfolio</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-[13px] text-secondary font-normal">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#showcase" className="hover:text-foreground transition-colors duration-200">Showcase</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
          </div>

          {/* Call to Actions & Theme toggle */}
          <div className="flex items-center gap-4.5">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-input-bg transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
                </svg>
              ) : (
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {session?.user ? (
              <a 
                href="/dashboard"
                className="text-[12px] font-medium border border-foreground bg-foreground text-background py-1.5 px-3 rounded-[4px] hover:bg-foreground/90 transition-all duration-200"
              >
                Dashboard
              </a>
            ) : (
              <>
                <span 
                  onClick={() => {
                    setAuthTriggerSource("navbar");
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden sm:inline text-[13px] text-secondary hover:text-foreground cursor-pointer transition-colors duration-200"
                >
                  Login
                </span>
                
                <a 
                  href="#generate"
                  className="text-[12px] font-medium border border-foreground bg-foreground text-background py-1.5 px-3 rounded-[4px] hover:bg-foreground/90 transition-all duration-200"
                >
                  Generate Portfolio
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10">
        
        {/* HERO SECTION */}
        <section id="generate" className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Developer badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card-bg text-[11px] font-medium text-secondary mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Built for developers</span>
          </div>

          {/* Headline */}
          <h1 className="text-[32px] sm:text-[44px] md:text-[52px] leading-[1.1] text-foreground tracking-tight font-normal max-w-2xl mb-6">
            Your GitHub already tells a story. <br/>
            <span className="text-secondary">Your portfolio should too.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[15px] sm:text-[17px] leading-relaxed text-secondary max-w-xl mb-12">
            Upload your resume. Connect your GitHub. We&apos;ll generate a highly structured, recruiter-optimized portfolio in 30 seconds. No manual updates, no code required.
          </p>

          {/* Premium Command Center Container */}
          <form 
            onSubmit={handleGenerate}
            className="w-full max-w-2xl bg-card-bg border border-border rounded-xl p-3 md:p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80 text-left mb-6"
          >
            <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-4 h-full">
              
              {/* GitHub Input */}
              <div className="flex-1 min-w-0 bg-input-bg rounded-lg border border-transparent focus-within:border-border transition-colors duration-200 p-3 flex flex-col justify-center">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-secondary mb-1">GitHub Username</label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-secondary select-none">github.com/</span>
                  <input 
                    type="text" 
                    placeholder="handle" 
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    disabled={isGenerating}
                    className="flex-1 bg-transparent text-[13px] text-foreground border-none outline-none p-0 focus:ring-0 placeholder:text-secondary/60"
                  />
                </div>
              </div>

              {/* Resume File Upload Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isGenerating && fileInputRef.current?.click()}
                className={`flex-1 min-w-0 bg-input-bg border rounded-lg p-3 flex flex-col justify-center cursor-pointer transition-all duration-200 ${
                  isDragging ? "border-accent/40 bg-accent/5" : "border-transparent hover:border-border"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden" 
                  disabled={isGenerating}
                />
                <label className="text-[9px] uppercase tracking-wider font-semibold text-secondary mb-1 cursor-pointer">Resume PDF</label>
                <div className="flex items-center gap-2 text-[13px] text-secondary">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="truncate max-w-[170px]">
                    {resumeFile ? resumeFile.name : "Select or drag PDF"}
                  </span>
                  {resumeFile && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                      className="ml-auto text-secondary hover:text-foreground"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button 
                type="submit"
                disabled={isGenerating}
                className="bg-foreground text-background border border-foreground font-medium text-[13px] py-3 md:py-0 px-6 rounded-lg hover:bg-foreground/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing...</span>
                  </>
                ) : (
                  <span>Generate</span>
                )}
              </button>

            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex items-center gap-8 text-[11px] text-secondary/80 font-normal">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              30 second setup
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Free subdomain
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              No credit card
            </span>
          </div>

        </section>

        {/* DYNAMIC TRANSFORMATION DEMO */}
        <section ref={demoSectionRef} className="px-6 pb-24 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative min-h-[580px]">
            
            {/* Left Side: Ingesting Raw Data */}
            <div className="lg:col-span-4 bg-card-bg border border-border rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">Raw Data Ingestor</h3>
                  <span className="text-[10px] bg-input-bg text-secondary px-2 py-0.5 rounded">PDF + git log</span>
                </div>

                <div className="space-y-4">
                  {/* Raw Resume Snippet */}
                  <div className="p-3 bg-input-bg/50 rounded border border-border/40 font-mono text-[11px] text-secondary leading-relaxed">
                    <div className="font-semibold text-foreground text-[12px] mb-1">resume_schema_v2.txt</div>
                    EDUCATION: BS, Computer Science<br/>
                    EXPERIENCE: Staff Eng at Vercel (Routing Engine)<br/>
                    PROJECTS: vertex-db (Raft consensus in Rust), hyper-query (Go SIMD SQL query parsing, fast JSON throughput)<br/>
                    SKILLS: Rust, Go, TypeScript, PostgreSQL, Raft, SIMD
                  </div>

                  {/* Git commit stream mockup */}
                  <div className="p-3 bg-input-bg/50 rounded border border-border/40 font-mono text-[11px] text-secondary leading-relaxed space-y-1">
                    <div className="font-semibold text-foreground text-[12px] mb-1">git_commit_log.json</div>
                    <div>$ git log -n 3 --oneline</div>
                    <div className="text-accent/80">* a3b81c2 - impl MappedLogSegments for vertex-db</div>
                    <div className="text-secondary">* f9d10c2 - optimize vector registers for SIMD</div>
                    <div className="text-secondary">* 2e19a84 - merge main & configure Edge middleware</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Log Parser output */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-secondary mb-2">Extraction Engine Terminal</div>
                <div className="bg-[#111111] dark:bg-black rounded-lg p-3 font-mono text-[10px] text-zinc-400 space-y-1.5 min-h-[140px] flex flex-col justify-end">
                  {logs.length === 0 ? (
                    <div className="text-zinc-500 italic">Command Center idle. Ready for generation...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="animate-fade-in text-emerald-400 dark:text-emerald-300">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Center Side: Active Scanning Divider Line */}
            <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-2">
              <div className="h-[2px] w-8 lg:w-[2px] lg:h-24 bg-border" />
              <div className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center bg-card-bg">
                <div className={`w-3.5 h-3.5 rounded-full bg-accent ${isGenerating ? "animate-ping" : ""}`} />
              </div>
              <div className="h-[2px] w-8 lg:w-[2px] lg:h-full bg-border flex-1" />
            </div>

            {/* Right Side: Generated Beautiful Portfolio Mockup */}
            <div className="lg:col-span-7 bg-card-bg border border-border rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm transition-all duration-300 relative overflow-hidden">
              
              {/* Dynamic scan line effect when generating */}
              {isGenerating && (
                <div className="absolute inset-x-0 h-1 bg-accent/40 blur-[1px] animate-sweep z-20 pointer-events-none" />
              )}

              {/* Overlay loader state */}
              {isGenerating && generationStep < 4 && (
                <div className="absolute inset-0 bg-card-bg/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[12px] font-medium text-secondary">Structuring dynamic schema...</span>
                  </div>
                </div>
              )}

              {/* Handcrafted Portfolio Frame */}
              <div className="space-y-8 animate-fade-in">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/60 pb-6 gap-4">
                  <div>
                    <h2 className="text-[20px] font-normal tracking-tight text-foreground">{renderedProfile.name}</h2>
                    <p className="text-[12px] text-secondary mt-0.5">{renderedProfile.role} • {renderedProfile.location}</p>
                  </div>
                  <span className="text-[10px] border border-border px-2 py-0.5 rounded text-secondary font-mono tracking-tight bg-input-bg/20">
                    {renderedProfile.name.toLowerCase().replace(/\s+/g, '')}.makeurfolio.com
                  </span>
                </div>

                {/* Profile Bio */}
                <p className="text-[13.5px] leading-relaxed text-secondary">
                  {renderedProfile.bio}
                </p>

                {/* Case Studies (Ingested Repos) */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Selected Work</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderedProfile.projects.map((proj, i) => (
                      <div key={i} className="p-4 rounded-lg border border-border/80 bg-input-bg/10 hover:border-border hover:bg-input-bg/20 transition-all duration-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] font-medium text-foreground font-mono">{proj.title}</span>
                          <span className="text-[10px] text-secondary hover:text-accent cursor-pointer flex items-center gap-0.5">
                            Code ↗
                          </span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-secondary mb-3">
                          {proj.desc}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[9px] bg-input-bg text-secondary px-1.5 py-0.5 rounded font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Experience</h3>
                  <div className="space-y-3.5">
                    {renderedProfile.experience.map((exp, i) => (
                      <div key={i} className="flex justify-between items-start text-[12.5px]">
                        <div className="max-w-md">
                          <div className="font-medium text-foreground">{exp.role} <span className="text-secondary font-normal">at {exp.company}</span></div>
                          <div className="text-[11.5px] text-secondary mt-0.5">{exp.desc}</div>
                        </div>
                        <span className="text-[10.5px] font-mono text-secondary/80 flex-shrink-0">{exp.period}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Skills */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Tech Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {renderedProfile.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] border border-border/80 px-2 py-0.5 rounded-full text-secondary font-mono bg-input-bg/10 hover:border-accent/30 hover:text-accent transition-colors duration-150 cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-secondary">
                <span>Updated 30s ago via automated Edge sync</span>
                <span className="text-accent font-medium hover:underline cursor-pointer">Download Verified Resume (PDF) →</span>
              </div>

            </div>

          </div>
        </section>

        {/* ALTERNATING EDITORIAL FEATURES SECTION */}
        <section id="features" className="border-t border-border bg-card-bg/40 py-24 transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-6 space-y-32">
            
            {/* Intro text */}
            <div className="max-w-md">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-3">Architected for high-signal impact</h2>
              <p className="text-[20px] text-foreground font-normal leading-snug">
                Recruiters don&apos;t have time to parse messy GitHub source files. We bridge that gap instantly.
              </p>
            </div>

            {/* Feature 1: Deduplicated & Enriched */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-[18px] text-foreground tracking-tight font-normal">Deduplicated & Enriched</h3>
                <p className="text-[14px] leading-relaxed text-secondary">
                  We combine resume text credentials and raw GitHub commits into a single source of truth. Repetitive items are merged, outdated fork repositories are filtered, and key active contributions are surfaced automatically.
                </p>
              </div>
              <div className="md:col-span-7 bg-background border border-border rounded-xl p-6 min-h-[220px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                  <span className="text-[11px] font-mono text-secondary">normalization_pipeline.py</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">Deduplicated</span>
                </div>
                <div className="space-y-3 text-[12px]">
                  <div className="flex items-center gap-3 p-2 bg-card-bg rounded border border-border/80">
                    <div className="w-5 h-5 rounded bg-accent/15 text-accent flex items-center justify-center font-mono text-[10px]">R</div>
                    <span className="text-foreground">Resume PDF:</span>
                    <span className="text-secondary font-mono truncate">&quot;Software Engineer at Stripe — Built core API routing...&quot;</span>
                  </div>
                  <div className="flex items-center justify-center text-secondary py-0.5">
                    <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-card-bg rounded border border-border/80">
                    <div className="w-5 h-5 rounded bg-accent/15 text-accent flex items-center justify-center font-mono text-[10px]">G</div>
                    <span className="text-foreground">GitHub commits:</span>
                    <span className="text-secondary font-mono truncate">&quot;stripe/api-router-v2: 43 commits, 1,200 LoC changed&quot;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: README to Case Study */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 bg-background border border-border rounded-xl p-6 min-h-[220px] order-last md:order-first flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
                  
                  {/* Before */}
                  <div className="p-3 bg-card-bg rounded border border-border/80 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-rose-500 font-semibold mb-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500" /> RAW README.MD
                      </div>
                      <div className="text-secondary line-clamp-6 leading-relaxed">
                        # db-project<br/>
                        This is a key-value store project in rust. You can run cargo run to start the listener on port 8080. It uses standard TCP socket code and a basic loop to store things in a hashmap. Memory compaction is still broken.
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-4 block">182 characters, raw</span>
                  </div>

                  {/* After */}
                  <div className="p-3 bg-card-bg rounded border border-accent/20 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <div className="text-[10px] text-accent font-semibold mb-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-accent" /> ENRICHED CASE STUDY
                      </div>
                      <div className="text-foreground font-sans leading-relaxed text-[11px]">
                        Designed a high-throughput key-value consensus store in Rust utilizing multi-threaded TCP socket multiplexing. Achieved reliable state distribution by implementing low-latency log segments, reducing active memory footprints by 32% under load.
                      </div>
                    </div>
                    <span className="text-[9px] text-accent font-medium mt-4 block">Optimized for Recruiter TTFB</span>
                  </div>

                </div>
              </div>
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-[18px] text-foreground tracking-tight font-normal">README to Case Study</h3>
                <p className="text-[14px] leading-relaxed text-secondary">
                  Transform cryptic technical files and README markdown headers into professional, structured case studies. Our LLM parses performance optimizations, structural bottlenecks, and architectural parameters to tell a high-impact engineering story.
                </p>
              </div>
            </div>

            {/* Feature 3: Automatic deployment */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-[18px] text-foreground tracking-tight font-normal">Automatic Edge Deployment</h3>
                <p className="text-[14px] leading-relaxed text-secondary">
                  Every portfolio is built as a static ISR asset and cached globally at the Edge layer via Vercel/Cloudflare. Custom dynamic routing middleware captures tenant subdomains instantly on the fly, yielding sub-millisecond loading speeds.
                </p>
              </div>
              <div className="md:col-span-7 bg-background border border-border rounded-xl p-5 font-mono text-[11px] text-secondary leading-relaxed">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] text-secondary/60 ml-2">https://griffin.makeurfolio.com</span>
                </div>
                <div className="bg-card-bg border border-border/80 rounded p-4 font-sans text-foreground">
                  <div className="flex items-center justify-between text-[11px] mb-4 border-b border-border/60 pb-2.5">
                    <span className="font-semibold text-secondary uppercase tracking-wider">Edge Request Interceptor</span>
                    <span className="text-accent flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Cached (2ms)
                    </span>
                  </div>
                  <pre className="font-mono text-[10px] text-secondary space-y-1">
                    <div>GET / HTTP/1.1</div>
                    <div>Host: griffin.makeurfolio.com</div>
                    <div className="text-emerald-500 dark:text-emerald-400">➜ Middleware intercepted: tenant_id=&quot;griffin&quot;</div>
                    <div className="text-emerald-500 dark:text-emerald-400">➜ Edge Cache Hit (served static bundle)</div>
                  </pre>
                </div>
              </div>
            </div>

            {/* Feature 4: Living portfolio */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 bg-background border border-border rounded-xl p-6 min-h-[220px] order-last md:order-first flex flex-col justify-center">
                <div className="p-4 bg-card-bg rounded-lg border border-border/80 space-y-3.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[12px] font-semibold text-foreground">Draft Created • 2m ago</span>
                    </div>
                    <span className="text-[10px] text-secondary font-mono">Auto-Sync</span>
                  </div>
                  <p className="text-[12px] text-secondary leading-relaxed">
                    Detected new Git repository <code className="bg-input-bg text-foreground px-1.5 py-0.5 rounded font-mono text-[11px]">raft-consensus</code>. We prepared a professional architectural project summary with 3 structural tech badges.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button className="text-[11px] font-medium border border-border bg-input-bg/60 text-foreground py-1 px-2.5 rounded hover:bg-input-bg transition-colors duration-150">
                      Ignore
                    </button>
                    <button className="text-[11px] font-medium border border-foreground bg-foreground text-background py-1 px-3 rounded hover:bg-foreground/90 transition-colors duration-150">
                      Publish Draft
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-[18px] text-foreground tracking-tight font-normal">Living Portfolio</h3>
                <p className="text-[14px] leading-relaxed text-secondary">
                  Never let your portfolio stagnate. As you commit code to GitHub, our system detects new high-signal repositories and generates publish-ready drafts. Review and deploy in one single tap from your micro-dashboard.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* PORTFOLIO SHOWCASE GALLERY */}
        <section id="showcase" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-border">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-3">Portfolio Design Showcase</h2>
            <p className="text-[24px] tracking-tight text-foreground font-normal">
              Portfolio frameworks crafted with visual restraint.
            </p>
            <p className="text-[13.5px] text-secondary mt-2">
              Every detail is meticulously typeset. No clutter, no heavy dashboards. Your code takes center stage.
            </p>
          </div>

          {/* Selector Navigation */}
          <div className="flex items-center justify-center gap-2 mb-10 text-[12px] text-secondary">
            {[
              "Elena Vance (Systems)",
              "Marcus Chen (Creative)",
              "Sophia Patel (Infrastructure)"
            ].map((name, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveShowcase(idx)}
                className={`py-1.5 px-3.5 rounded-full border transition-all duration-200 ${
                  activeShowcase === idx 
                    ? "bg-foreground text-background border-foreground font-medium" 
                    : "border-border hover:bg-input-bg text-secondary"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Interactive In-Page Mockup Render */}
          <div className="bg-card-bg border border-border rounded-xl p-8 min-h-[460px] shadow-sm flex flex-col justify-between transition-all duration-300">
            {activeShowcase === 0 && (
              <div className="space-y-6 animate-fade-in">
                {/* Elena Vance */}
                <div className="flex justify-between items-baseline border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-[18px] font-normal text-foreground">Elena Vance</h3>
                    <p className="text-[11px] text-secondary">Systems Engineer • Zurich, Switzerland</p>
                  </div>
                  <span className="text-[10px] font-mono text-secondary">elena.makeurfolio.com</span>
                </div>
                
                <p className="text-[13px] leading-relaxed text-secondary max-w-2xl font-mono">
                  &gt; Architecting safe concurrency layers, low-level compilers, and memory allocators.
                </p>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-secondary">Selected Publications & Software</div>
                  <div className="space-y-3.5 font-mono text-[12px]">
                    <div className="p-3 bg-input-bg/30 rounded border border-border/40">
                      <div className="font-semibold text-foreground">liballoc-rs ↗</div>
                      <div className="text-secondary text-[11px] mt-1">A custom non-blocking lockless memory allocator in Rust. Optimized thread-local arenas to eliminate global spinlocks, reducing garbage collection latencies in high-concurrency event loops by 4x.</div>
                    </div>
                    <div className="p-3 bg-input-bg/30 rounded border border-border/40">
                      <div className="font-semibold text-foreground">tether-net ↗</div>
                      <div className="text-secondary text-[11px] mt-1">Lightweight, eBPF-powered network monitoring utility designed for Kubernetes ingress routing layers. Dynamically parses packet payloads with near-zero OS context switching costs.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Marcus Chen */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-4 gap-2">
                  <div>
                    <h3 className="text-[22px] font-light tracking-tight text-foreground">Marcus Chen</h3>
                    <p className="text-[12px] text-secondary">Creative Technologist • New York, NY</p>
                  </div>
                  <span className="text-[10px] font-mono text-secondary">marcus.makeurfolio.com</span>
                </div>

                <p className="text-[14px] leading-relaxed text-secondary font-serif italic max-w-xl">
                  &quot;I develop digital physical layers, highly interactive design components, and custom rendering pipelines. Focused on the thin intersection between mathematics and screen art.&quot;
                </p>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-secondary">Interactive Works</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border/60 hover:border-accent/40 rounded p-4 transition-all duration-200">
                      <div className="text-[14px] font-medium text-foreground">fluid-canvas 🚀</div>
                      <p className="text-[12px] text-secondary mt-1">A high-fidelity WebGL simulation rendering 2 million fluid particles at constant 60fps. Leveraged custom vertex shader math to bypass heavy matrix-vector CPU constraints.</p>
                    </div>
                    <div className="border border-border/60 hover:border-accent/40 rounded p-4 transition-all duration-200">
                      <div className="text-[14px] font-medium text-foreground">vector-fonts 🚀</div>
                      <p className="text-[12px] text-secondary mt-1">Bespoke dynamic variable font-rendering engine mapping cubic bezier points inside raw Canvas contexts, permitting physics-based typography interaction.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === 2 && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Sophia Patel */}
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-[18px] font-semibold text-foreground">Sophia Patel</h3>
                    <p className="text-[12px] text-secondary">Infrastructure Architect • London, UK</p>
                  </div>
                  <span className="text-[10px] font-mono text-secondary">sophia.makeurfolio.com</span>
                </div>

                <p className="text-[13.5px] leading-relaxed text-secondary max-w-2xl">
                  Building fault-tolerant storage grids and low-latency API proxy gateways. Spearheading regional edge container scaling architectures and multi-region database replication protocols.
                </p>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-secondary">Core Infrastructure Built</div>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between text-[12px]">
                      <div>
                        <div className="font-semibold text-foreground">Consensus Gateway (Go)</div>
                        <div className="text-secondary text-[11px] mt-0.5">Designed high-throughput gRPC proxy layer parsing 300k+ parallel payload packets. Integrated optimized TCP connection pools.</div>
                      </div>
                      <span className="text-[10px] bg-input-bg text-secondary px-2 py-0.5 rounded font-mono">Go, gRPC</span>
                    </div>
                    <div className="flex items-start justify-between text-[12px]">
                      <div>
                        <div className="font-semibold text-foreground">Zero-Trust Virtual Private Networks (Rust)</div>
                        <div className="text-secondary text-[11px] mt-0.5">Implemented WireGuard-based overlay packet relays. Established mutual TLS dynamic certificate authorization routines on the edge node.</div>
                      </div>
                      <span className="text-[10px] bg-input-bg text-secondary px-2 py-0.5 rounded font-mono">Rust, TLS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] text-secondary">
              <span>Layout styles fully customizable via client dash</span>
              <span className="text-accent hover:underline cursor-pointer">View Elena&apos;s Live Portfolio ↗</span>
            </div>
          </div>

        </section>

        {/* PRICING SECTION (Discrete & Simple) */}
        <section id="pricing" className="py-24 px-6 border-t border-border bg-card-bg/20 transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-3">Honest, Calming Pricing</h2>
              <p className="text-[22px] tracking-tight text-foreground font-normal">
                Focus on your code. We&apos;ll handle the hosting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-2xl mx-auto">
              
              {/* Free Tier */}
              <div className="bg-card-bg border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground mb-1">Standard</h3>
                  <p className="text-[11px] text-secondary mb-4">Perfect for individual developers.</p>
                  <div className="text-[28px] font-normal text-foreground tracking-tight mb-6">
                    $0 <span className="text-[12px] text-secondary font-normal">/ forever</span>
                  </div>
                  <ul className="text-[12.5px] text-secondary space-y-2.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      1 Auto-Generated Portfolio
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Subdomain hosting (name.makeurfolio.com)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Deduplicated PDF + Git normalization
                    </li>
                    <li className="flex items-center gap-2 text-secondary/50 line-through">
                      Custom apex domains (e.g. name.com)
                    </li>
                  </ul>
                </div>
                <button className="w-full mt-8 py-2 border border-border hover:bg-input-bg text-[12px] font-medium rounded-lg transition-colors duration-200">
                  Get Started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-card-bg border border-accent/20 rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[14px] font-semibold text-foreground">Pro Engineer</h3>
                    <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 rounded font-mono">Recommended</span>
                  </div>
                  <p className="text-[11px] text-secondary mb-4">For engineers actively interviewing.</p>
                  <div className="text-[28px] font-normal text-foreground tracking-tight mb-6">
                    $8 <span className="text-[12px] text-secondary font-normal">/ month</span>
                  </div>
                  <ul className="text-[12.5px] text-secondary space-y-2.5">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Everything in Standard
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Custom apex domain support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Weekly automated silent GitHub updates
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Recruiter click-through tracking & analytics
                    </li>
                  </ul>
                </div>
                <button className="w-full mt-8 py-2 bg-foreground text-background border border-foreground hover:bg-foreground/90 text-[12px] font-medium rounded-lg transition-colors duration-200">
                  Upgrade to Pro
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* FINAL CTA (Exceptionally Minimal) */}
        <section className="py-32 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <h2 className="text-[24px] sm:text-[32px] tracking-tight font-normal text-foreground max-w-lg mb-4">
            Stop maintaining your portfolio manually.
          </h2>
          
          <p className="text-[14px] text-secondary max-w-sm mb-10">
            Your work already exists across repos and files. Make it immediately discoverable for recruiters.
          </p>

          <a 
            href="#generate"
            className="bg-foreground text-background border border-foreground font-medium text-[13px] py-2.5 px-6 rounded-lg hover:bg-foreground/90 active:scale-[0.98] transition-all duration-200"
          >
            Generate My Portfolio
          </a>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card-bg/25 py-12 px-6 text-[12px] text-secondary transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="font-semibold text-foreground">makeurfolio</div>
            <p className="text-[11px] text-secondary/80">Recruiter-optimized portfolio engine crafted with visual restraint.</p>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-normal">
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Terms</span>
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Security</span>
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Engineering Manifesto</span>
          </div>

          <div className="text-[11.5px] text-secondary/70">
            © {new Date().getFullYear()} makeurfolio. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

