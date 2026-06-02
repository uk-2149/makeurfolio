"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { X, Plus } from "lucide-react";

export function SkillsSection() {
  const { portfolio, updateField } = useEditor();
  const [newSkill, setNewSkill] = useState("");

  if (!portfolio) return null;

  const skills = portfolio.skills || [];

  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSkill.trim()) return;

    // Check if skill already exists
    if (skills.some((s: any) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      setNewSkill("");
      return;
    }

    const updatedSkills = [
      ...skills, 
      { name: newSkill.trim(), category: "OTHER" } // Default category
    ];
    
    updateField("skills", updatedSkills);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillName: string) => {
    const updatedSkills = skills.filter((s: any) => s.name !== skillName);
    updateField("skills", updatedSkills);
  };

  return (
    <div className="bg-input-bg border border-border/40 rounded-xl p-6">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Add Skills</label>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="e.g. React, Node.js, Python..."
            />
            <button
              type="submit"
              disabled={!newSkill.trim()}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill: any, idx: number) => (
            <div 
              key={idx} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/60 rounded-full text-sm font-medium text-foreground group"
            >
              {skill.name}
              <button
                onClick={() => handleRemoveSkill(skill.name)}
                className="text-secondary/50 hover:text-red-500 transition-colors rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-secondary/60 italic">No skills added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
