"use client";

import React, { useState, useRef } from "react";
import { X, ArrowRight, UploadCloud } from "lucide-react";

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (githubUser: string, resumeFile: File | null, portfolioName: string) => void;
  defaultName?: string;
}

export function CreatePortfolioModal({ isOpen, onClose, onSubmit, defaultName = "" }: CreatePortfolioModalProps) {
  const [name, setName] = useState(defaultName);
  const [githubUser, setGithubUser] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedGithub = githubUser.trim();
    
    if (trimmedName.length >= 3 && trimmedName.length <= 60 && (trimmedGithub || resumeFile)) {
      onSubmit(trimmedGithub, resumeFile, trimmedName);
    }
  };

  const canSubmit = name.trim().length >= 3 && name.trim().length <= 60 && (githubUser.trim().length > 0 || resumeFile !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-border text-foreground">
        <div className="absolute top-4 right-4">
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-input-bg text-secondary hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Create Portfolio</h2>
            <p className="text-[13px] text-secondary">
              Provide your GitHub and/or a Resume to generate your portfolio.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* GitHub Input */}
            <div className="bg-input-bg rounded-lg border border-transparent focus-within:border-border transition-colors duration-200 p-3 flex flex-col justify-center">
              <label className="text-[9px] uppercase tracking-wider font-semibold text-secondary mb-1">GitHub Username</label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-secondary select-none">github.com/</span>
                <input 
                  type="text" 
                  placeholder="handle" 
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-foreground border-none outline-none p-0 focus:ring-0 placeholder:text-secondary/60"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-input-bg border rounded-lg p-3 flex flex-col justify-center cursor-pointer transition-all duration-200 ${
                isDragging ? "border-accent/40 bg-accent/5" : "border-transparent hover:border-border"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden" 
              />
              <label className="text-[9px] uppercase tracking-wider font-semibold text-secondary mb-1 cursor-pointer">Resume Upload</label>
              <div className="flex items-center gap-2 text-[13px] text-secondary">
                <UploadCloud className="w-3.5 h-3.5 flex-shrink-0 text-secondary" />
                <span className="truncate max-w-full">
                  {resumeFile ? resumeFile.name : "Click or drag to upload (.pdf or .docx)"}
                </span>
              </div>
            </div>

            {/* Portfolio Name */}
            <div className="bg-input-bg rounded-lg border border-transparent focus-within:border-border transition-colors duration-200 p-3 flex flex-col justify-center">
              <label className="text-[9px] uppercase tracking-wider font-semibold text-secondary mb-1">Portfolio Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Utkal's Developer Portfolio"
                minLength={3}
                maxLength={60}
                required
                className="w-full bg-transparent text-[13px] text-foreground border-none outline-none p-0 focus:ring-0 placeholder:text-secondary/60 transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              Generate Portfolio
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
