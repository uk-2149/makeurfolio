"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Star } from "lucide-react";

export function ProjectsSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const projects = portfolio.projects || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      title: "",
      description: "",
      githubUrl: "",
      liveUrl: "",
      featured: false,
      featuredOrder: projects.length,
    };
    updateField("projects", [...projects, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = projects.map((proj: any) => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    updateField("projects", updated);
  };

  const handleDelete = (id: string) => {
    const updated = projects.filter((proj: any) => proj.id !== id);
    updateField("projects", updated);
    if (editingId === id) setEditingId(null);
  };

  const toggleEdit = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((proj: any) => {
        const isEditing = editingId === proj.id;
        
        return (
          <div key={proj.id} className="bg-input-bg border border-border/40 rounded-xl overflow-hidden transition-all">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors"
              onClick={() => toggleEdit(proj.id)}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-secondary/40 cursor-grab active:cursor-grabbing" />
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    {proj.title || "Untitled Project"}
                    {proj.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-sm text-secondary line-clamp-1 max-w-md">
                    {proj.description || "No description provided."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(proj.id); }}
                  className="p-1.5 text-secondary/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-secondary/50 p-1.5">
                  {isEditing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="px-6 py-5 border-t border-border/40 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Project Title</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={proj.featured}
                      onChange={(e) => handleUpdate(proj.id, "featured", e.target.checked)}
                      className="rounded border-border/40 bg-background text-foreground focus:ring-foreground"
                    />
                    <span className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" /> Featured Project
                    </span>
                  </label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <input
                    type="text"
                    value={proj.title || ""}
                    onChange={(e) => handleUpdate(proj.id, "title", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. makeurfolio AI"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">GitHub URL</label>
                  <input
                    type="text"
                    value={proj.githubUrl || ""}
                    onChange={(e) => handleUpdate(proj.id, "githubUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="https://github.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Live URL</label>
                  <input
                    type="text"
                    value={proj.liveUrl || ""}
                    onChange={(e) => handleUpdate(proj.id, "liveUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="https://myproject.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <textarea
                    value={proj.description || ""}
                    onChange={(e) => handleUpdate(proj.id, "description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
                    placeholder="Explain what the project is about and the technologies used..."
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleAdd}
        className="w-full py-4 border border-dashed border-border/60 hover:border-foreground/50 rounded-xl flex flex-col items-center justify-center gap-2 text-secondary hover:text-foreground hover:bg-input-bg transition-all group"
      >
        <div className="p-2 rounded-full bg-border/40 group-hover:bg-foreground/10 transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Add Project</span>
      </button>
    </div>
  );
}
