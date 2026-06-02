"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export function EducationSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const educations = portfolio.educations || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: null,
      endDate: null,
      description: "",
      sortOrder: educations.length,
    };
    updateField("educations", [...educations, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = educations.map((edu: any) => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateField("educations", updated);
  };

  const handleDelete = (id: string) => {
    const updated = educations.filter((edu: any) => edu.id !== id);
    updateField("educations", updated);
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
      {educations.map((edu: any) => {
        const isEditing = editingId === edu.id;
        
        return (
          <div key={edu.id} className="bg-input-bg border border-border/40 rounded-xl overflow-hidden transition-all">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors"
              onClick={() => toggleEdit(edu.id)}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-secondary/40 cursor-grab active:cursor-grabbing" />
                <div>
                  <h3 className="font-medium text-foreground">{edu.degree || "Degree"}</h3>
                  <p className="text-sm text-secondary">{edu.institution || "Institution Name"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(edu.id); }}
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
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Degree / Certificate</label>
                  <input
                    type="text"
                    value={edu.degree || ""}
                    onChange={(e) => handleUpdate(edu.id, "degree", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Institution</label>
                  <input
                    type="text"
                    value={edu.institution || ""}
                    onChange={(e) => handleUpdate(edu.id, "institution", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate(edu.id, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate(edu.id, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <textarea
                    value={edu.description || ""}
                    onChange={(e) => handleUpdate(edu.id, "description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
                    placeholder="Describe your studies, activities, or societies..."
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
        <span className="text-sm font-medium">Add Education</span>
      </button>
    </div>
  );
}
