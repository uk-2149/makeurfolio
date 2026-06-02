"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface EditorContextType {
  portfolio: any | null; // using any for now to handle nested relations
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  updateField: (field: string, value: any) => void;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (portfolioId) {
      fetchPortfolio();
    }
  }, [portfolioId]);

  // Check for unsaved changes whenever formData changes
  useEffect(() => {
    if (initialData && formData) {
      const isChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
      setHasUnsavedChanges(isChanged);
    }
  }, [initialData, formData]);

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
      return { ...prev, [field]: value };
    });
  }, []);

  const saveChanges = async () => {
    if (!hasUnsavedChanges || !formData) return;
    
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
        setHasUnsavedChanges(false);
      } else {
        setError(result.error?.message || "Failed to save changes");
      }
    } catch (err) {
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
        isLoading, 
        isSaving, 
        hasUnsavedChanges, 
        error, 
        updateField, 
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
