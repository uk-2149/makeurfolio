"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export function CertificationsSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const certifications = portfolio.certifications || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      title: "",
      issuer: "",
      issueDate: null,
      credentialUrl: "",
    };
    updateField("certifications", [...certifications, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = certifications.map((cert: any) => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    updateField("certifications", updated);
  };

  const handleDelete = (id: string) => {
    const updated = certifications.filter((cert: any) => cert.id !== id);
    updateField("certifications", updated);
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
      {certifications.map((cert: any) => {
        const isEditing = editingId === cert.id;
        
        return (
          <div key={cert.id} className="bg-input-bg border border-border/40 rounded-xl overflow-hidden transition-all">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors"
              onClick={() => toggleEdit(cert.id)}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-secondary/40 cursor-grab active:cursor-grabbing" />
                <div>
                  <h3 className="font-medium text-foreground">{cert.title || "Certification Title"}</h3>
                  <p className="text-sm text-secondary">{cert.issuer || "Issuer Name"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(cert.id); }}
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
                  <label className="text-xs font-medium text-foreground">Certification Title</label>
                  <input
                    type="text"
                    value={cert.title || ""}
                    onChange={(e) => handleUpdate(cert.id, "title", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. AWS Certified Solutions Architect"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => handleUpdate(cert.id, "issuer", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Issue Date</label>
                  <input
                    type="date"
                    value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate(cert.id, "issueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Credential URL
                  </label>
                  <input
                    type="text"
                    value={cert.credentialUrl || ""}
                    onChange={(e) => handleUpdate(cert.id, "credentialUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                    placeholder="https://..."
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
        <span className="text-sm font-medium">Add Certification</span>
      </button>
    </div>
  );
}
