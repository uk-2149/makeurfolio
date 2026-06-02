import React from "react";
import { EditorContent } from "./editor-content";
import { EditorProvider } from "@/src/components/editor/editor-context";

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
