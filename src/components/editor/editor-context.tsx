"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface EditorContextType {
  portfolio: any | null; // using any for now to handle nested relations
  initialPortfolio: any | null;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  saveBlockers: Record<string, string>;
  setSaveBlocker: (id: string, reason: string | null) => void;
  updateField: (field: string, value: any) => void;
  removeArrayItem: (arrayPath: string, index: number) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ 
  children, 
  portfolioId 
}: { 
  children: React.ReactNode, 
  portfolioId: string 
}) {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveBlockers, setSaveBlockers] = useState<Record<string, string>>({});

  const hasUnsavedChanges = initialData && formData ? JSON.stringify(initialData) !== JSON.stringify(formData) : false;
  const canSave = hasUnsavedChanges && Object.keys(saveBlockers).length === 0;

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/editor/portfolio/${portfolioId}`);
        const result = await res.json();
        
        if (result.success) {
          setInitialData(result.data);
          setFormData(result.data);
        } else {
          setError(result.error?.message || "Failed to load portfolio");
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (portfolioId) {
      fetchPortfolio();
    }
  }, [portfolioId]);


  // Handle beforeunload to warn user of unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev: any) => {
      if (!prev) return prev;
      
      // Handle deep fields like "experiences.0.role"
      if (field.includes(".")) {
        const parts = field.split(".");
        const newObj = { ...prev };
        let current = newObj;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (Array.isArray(current[part])) {
            current[part] = [...current[part]];
          } else if (typeof current[part] === "object" && current[part] !== null) {
            current[part] = { ...current[part] };
          }
          current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
        return newObj;
      }
      
      return { ...prev, [field]: value };
    });
  }, []);

  const removeArrayItem = useCallback((arrayPath: string, index: number) => {
    setFormData((prev: any) => {
      if (!prev) return prev;
      
      const parts = arrayPath.split(".");
      const newObj = { ...prev };
      let current = newObj;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          if (Array.isArray(current[part])) {
            current[part] = current[part].filter((_: any, idx: number) => idx !== index);
          }
        } else {
          current[part] = Array.isArray(current[part]) ? [...current[part]] : { ...current[part] };
          current = current[part];
        }
      }
      return newObj;
    });
  }, []);

  // Handle messages from the iframe (Inline editing)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "FIELD_EDITED") {
        updateField(event.data.field, event.data.value);
      } else if (event.data?.type === "ARRAY_ITEM_DELETED") {
        removeArrayItem(event.data.arrayPath, event.data.index);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [updateField, removeArrayItem]);

  const setSaveBlocker = useCallback((id: string, reason: string | null) => {
    setSaveBlockers((prev) => {
      const next = { ...prev };
      if (reason === null) {
        delete next[id];
      } else {
        next[id] = reason;
      }
      return next;
    });
  }, []);

  const saveChanges = async () => {
    if (!canSave || !formData) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const res = await fetch(`/api/editor/portfolio/${portfolioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setInitialData(result.data);
        setFormData(result.data); // Update form data to match exactly what backend returned
      } else {
        setError(result.error?.message || "Failed to save changes");
      }
    } catch {
      setError("An unexpected error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = useCallback(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy to prevent reference issues
    }
  }, [initialData]);

  return (
    <EditorContext.Provider 
      value={{ 
        portfolio: formData, 
        initialPortfolio: initialData,
        isLoading, 
        isSaving, 
        hasUnsavedChanges, 
        error, 
        saveBlockers,
        setSaveBlocker,
        updateField, 
        removeArrayItem,
        saveChanges, 
        discardChanges 
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
