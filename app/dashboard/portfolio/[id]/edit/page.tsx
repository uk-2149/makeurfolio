import React from "react";
import type { Metadata } from "next";
import { EditorContent } from "./editor-content";
import { EditorProvider } from "@/src/components/editor/editor-context";

export const metadata: Metadata = {
  title: "Edit Portfolio",
  description: "Edit and customize your developer portfolio content, projects, skills, and theme.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortfolioEditorPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EditorProvider portfolioId={resolvedParams.id}>
        <EditorContent />
      </EditorProvider>
    </div>
  );
}
