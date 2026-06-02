"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export function ExperienceSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const experiences = portfolio.experiences || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      company: "",
      role: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      currentlyWorking: true,
      description: "",
      sortOrder: experiences.length,
    };
    updateField("experiences", [...experiences, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = experiences.map((exp: any) => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateField("experiences", updated);
  };

  const handleDelete = (id: string) => {
    const updated = experiences.filter((exp: any) => exp.id !== id);
    updateField("experiences", updated);
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
      {experiences.map((exp: any) => {
        const isEditing = editingId === exp.id;
        
        return (
          <div key={exp.id} className="bg-input-bg border border-border/40 rounded-xl overflow-hidden transition-all">
            {/* Header / Summary */}
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors"
              onClick={() => toggleEdit(exp.id)}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-secondary/40 cursor-grab active:cursor-grabbing" />
                <div>
                  <h3 className="font-medium text-foreground">{exp.role || "Untitled Role"}</h3>
                  <p className="text-sm text-secondary">{exp.company || "Company Name"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                  className="p-1.5 text-secondary/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-secondary/50 p-1.5">
                  {isEditing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="px-6 py-5 border-t border-border/40 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Role / Title</label>
                  <input
                    type="text"
                    value={exp.role || ""}
                    onChange={(e) => handleUpdate(exp.id, "role", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Company</label>
                  <input
                    type="text"
                    value={exp.company || ""}
                    onChange={(e) => handleUpdate(exp.id, "company", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-foreground">Location</label>
                  <input
                    type="text"
                    value={exp.location || ""}
                    onChange={(e) => handleUpdate(exp.id, "location", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. San Francisco, CA (Remote)"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate(exp.id, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    End Date
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={(e) => {
                          handleUpdate(exp.id, "currentlyWorking", e.target.checked);
                          if (e.target.checked) handleUpdate(exp.id, "endDate", null);
                        }}
                        className="rounded border-border/40 bg-background text-foreground focus:ring-foreground"
                      />
                      <span className="text-[10px] font-normal text-secondary uppercase tracking-wider">Present</span>
                    </label>
                  </label>
                  <input
                    type="date"
                    disabled={exp.currentlyWorking}
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate(exp.id, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <textarea
                    value={exp.description || ""}
                    onChange={(e) => handleUpdate(exp.id, "description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
                    placeholder="Describe your responsibilities and achievements..."
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
        <span className="text-sm font-medium">Add Experience</span>
      </button>
    </div>
  );
}
