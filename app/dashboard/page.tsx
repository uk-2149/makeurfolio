"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, react-hooks/immutability */

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sun, 
  Moon, 
  LogOut, 
  Search, 
  Copy, 
  Plus, 
  ExternalLink, 
  Eye, 
  Calendar, 
  Check,
  Sparkles,
  LayoutTemplate,
  Globe,
  Settings,
  BarChart3,
  Edit3,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { 
  stashGenerationState, 
  restoreStashedState, 
  clearStashedState, 
  setActiveGenerationId, 
  getActiveGenerationId, 
  clearActiveGenerationId, 
  setActiveGenerationMetadata, 
  clearActiveGenerationMetadata 
} from "@/src/lib/storage";

// Modals for Create Flow
import { AuthModal } from "@/src/components/auth-modal";
import { CreatePortfolioModal } from "@/src/components/create-portfolio-modal";
import { GenerationOverlay } from "@/src/components/generation-overlay";

interface Portfolio {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  status: string;
  _count: {
    portfolioViews: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isSessionPending, setIsSessionPending] = useState(true);
  
  // Local States
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Generation Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize theme, session, and fetch portfolios on mount
  useEffect(() => {
    setMounted(true);

    // Fetch session manually to avoid SSR hook issues with better-auth client
    authClient.getSession().then(res => {
      setSession(res.data);
      setIsSessionPending(false);
    }).catch(err => {
      console.error(err);
      setIsSessionPending(false);
    });

    // Initial Theme Sync
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") || localStorage.theme === "dark";
      setTheme(isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Check if we came back with active generation ID
      const activeGenId = getActiveGenerationId();
      if (activeGenId) {
        setGenerationId(activeGenId);
      }
    }
  }, []);

  // Fetch Portfolios once authenticated
  useEffect(() => {
    if (session?.user) {
      fetchPortfolios();
    } else if (!isSessionPending && !session?.user && mounted) {
      // Not logged in, redirect to home
      router.replace("/");
    }
  }, [session, isSessionPending, mounted]);

  const fetchPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      if (json.success) {
        setPortfolios(json.data);
      }
    } catch (error) {
      console.error("Failed to load portfolios:", error);
    } finally {
      setLoadingPortfolios(false);
    }
  };

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

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const link = `https://${slug}.makeurfolio.dev`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Generation Modal Launch Flow
  const handleLaunchCreateFlow = () => {
    if (!session?.user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const executeRealGeneration = async (githubUsername: string, resumeFile: File | null, portfolioName: string) => {
    setIsCreateModalOpen(false);

    // 2. Set the active metadata in localStorage first
    setActiveGenerationMetadata(!!githubUsername, !!resumeFile);

    // 3. Pre-generate a unique generation ID on the client side
    const clientGenId = "gen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    
    // 4. Immediately open overlay and save it in state/localStorage
    setGenerationId(clientGenId);
    setActiveGenerationId(clientGenId);

    const formData = new FormData();
    if (githubUsername) formData.append("githubUsername", githubUsername);
    if (resumeFile) formData.append("resume", resumeFile);
    formData.append("portfolioName", portfolioName);
    formData.append("generationId", clientGenId);

    // Clear stashed state early
    await clearStashedState();

    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error?.message || "Failed to start generation");
        setGenerationId(null);
        clearActiveGenerationId();
        clearActiveGenerationMetadata();
      }
    } catch (err) {
      console.error(err);
      alert("Network error starting generation");
      setGenerationId(null);
      clearActiveGenerationId();
      clearActiveGenerationMetadata();
    }
  };

  const handleCloseGenerationOverlay = () => {
    setGenerationId(null);
    clearActiveGenerationId();
    clearActiveGenerationMetadata();
    // Refresh portfolio list locally instead of page reloads
    fetchPortfolios();
  };

  const handleDeleteClick = (id: string, name: string) => {
    setPortfolioToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!portfolioToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/editor/portfolio/${portfolioToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPortfolios(prev => prev.filter(p => p.id !== portfolioToDelete.id));
        setDeleteModalOpen(false);
        setPortfolioToDelete(null);
      } else {
        alert(data.error?.message || "Failed to delete portfolio");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting portfolio");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculations for metric stats
  const totalPortfolios = portfolios.length;
  const totalViews = portfolios.reduce((sum, p) => sum + (p._count?.portfolioViews || 0), 0);
  const publishedPortfolios = portfolios.filter(p => p.status === "PUBLISHED" || p.status === "DRAFT").length; // mapped to active status

  // Client-side search logic
  const filteredPortfolios = portfolios.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
  });

  if (!mounted || isSessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-border border-t-foreground rounded-full animate-spin mb-4" />
          <span className="text-xs font-mono text-secondary tracking-widest uppercase">Initializing...</span>
        </div>
      </div>
    );
  }

  // Get user details
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";
  const firstName = userName ? userName.split(" ")[0] : userEmail.split("@")[0];
  const userInitials = userName 
    ? userName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : userEmail.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 antialiased font-sans">
      
      {/* Modals for generation flow */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          clearStashedState();
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />

      <CreatePortfolioModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          clearStashedState();
        }}
        onSubmit={executeRealGeneration}
        defaultName={userName ? `${firstName}'s Portfolio` : "My Portfolio"}
      />

      {generationId && (
        <GenerationOverlay 
          generationId={generationId}
          onClose={handleCloseGenerationOverlay}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && portfolioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-card-bg rounded-xl border border-border shadow-xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Portfolio</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">{portfolioToDelete.name}</span>? This action cannot be undone and will permanently remove this portfolio from the internet.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-input-bg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Deleting...</>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-5 h-5 bg-foreground rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-background fill-current" />
            </div>
            <span className="text-sm font-semibold tracking-tight">makeurfolio</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Elegant Mini Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-input-bg text-secondary hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Profile Dropdown Mock / Sign Out Row */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-input-bg border border-border flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-secondary truncate max-w-[140px]" title={userEmail}>
                {userEmail}
              </span>
              <span className="text-secondary/40 select-none hidden sm:inline">|</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-secondary hover:text-foreground transition-colors hover:bg-input-bg rounded-md font-medium"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Welcome Section */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome back, {firstName}.
            </h1>
            <p className="text-sm text-secondary">
              Your portfolios are generated, hosted, and ready to share.
            </p>
          </div>
          <button
            onClick={handleLaunchCreateFlow}
            className="self-start sm:self-center flex items-center justify-center gap-2 py-2 px-4 bg-foreground text-background hover:bg-foreground/90 font-medium text-[13px] rounded-lg transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Portfolio
          </button>
        </section>

        {/* Metric Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary">Portfolios</span>
            <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
              {loadingPortfolios ? "—" : totalPortfolios}
            </span>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary">Total Views</span>
            <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
              {loadingPortfolios ? "—" : totalViews}
            </span>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary">Published</span>
            <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
              {loadingPortfolios ? "—" : publishedPortfolios}
            </span>
          </div>
        </section>

        {/* Search Bar */}
        <section className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-bg text-[13px] text-foreground border border-transparent focus:border-border rounded-lg outline-none focus:ring-0 placeholder:text-secondary/50 transition-colors"
          />
        </section>

        {/* Grid List / Empty State */}
        <section className="space-y-6">
          {loadingPortfolios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card-bg border border-border rounded-xl p-6 h-[200px] flex flex-col justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="h-5 w-2/3 bg-input-bg rounded" />
                    <div className="h-4 w-1/2 bg-input-bg rounded" />
                  </div>
                  <div className="h-4 w-full bg-input-bg rounded" />
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-20 bg-card-bg rounded-xl border border-border flex flex-col items-center justify-center max-w-3xl mx-auto shadow-sm">
              <LayoutTemplate className="w-10 h-10 text-secondary/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No portfolios yet.</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm">
                Generate your first recruiter-ready portfolio in under a minute.
              </p>
              <button
                onClick={handleLaunchCreateFlow}
                className="mt-6 flex items-center justify-center gap-2 py-2 px-5 bg-foreground text-background hover:bg-foreground/90 font-medium text-[13px] rounded-lg transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Portfolio
              </button>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="text-center py-16 text-secondary text-[13px]">
              No portfolios match your search &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios.map(p => (
                <div 
                  key={p.id} 
                  className="group bg-card-bg border border-border hover:border-border/80 rounded-xl p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-semibold tracking-tight text-foreground truncate max-w-[210px]" title={p.name}>
                        {p.name}
                      </h3>
                      {/* Active Status Pill */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Published
                        </span>
                        <button 
                          onClick={() => handleDeleteClick(p.id, p.name)}
                          className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete Portfolio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-secondary/80 bg-input-bg/50 px-2 py-1 rounded border border-border/40 select-all truncate max-w-full">
                      <Globe className="w-3 h-3 text-secondary/60 flex-shrink-0" />
                      <span>{p.slug}.makeurfolio.dev</span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] text-secondary/60 font-medium mt-6 pt-4 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-secondary/40" />
                      {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-secondary/40" />
                      {p._count?.portfolioViews || 0} views
                    </span>
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-border/40">
                    <Link
                      href={`/dashboard/portfolio/${p.id}/edit`}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-xs font-medium transition-colors shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-input-bg text-foreground hover:bg-border/60 rounded-lg text-xs font-medium transition-colors"
                    >
                      View
                      <ExternalLink className="w-3 h-3 text-secondary" />
                    </Link>

                    <button
                      onClick={() => handleCopyLink(p.slug)}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-input-bg text-foreground hover:bg-border/60 rounded-lg text-xs font-medium transition-colors"
                    >
                      {copiedSlug === p.slug ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-secondary" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Future extension placeholdings (Edit, Analytics) - fully disabled / design-focused */}
                  <div className="flex items-center justify-between mt-3 text-[10px] text-secondary/35 font-medium select-none cursor-not-allowed">
                    <span className="flex items-center gap-1 hover:text-secondary/35">
                      <Settings className="w-3 h-3" />
                      Settings
                    </span>
                    <span className="flex items-center gap-1 hover:text-secondary/35">
                      <BarChart3 className="w-3 h-3" />
                      Analytics
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}
