"use client";

import React, { useEffect, useRef } from "react";
import { useEditor } from "./editor-context";
import { Loader2 } from "lucide-react";

export function LivePreviewIframe({ slug }: { slug: string }) {
  const { portfolio } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send portfolio updates to the iframe whenever they change
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Small delay to ensure iframe is ready, though it handles its own sync too
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_PORTFOLIO", data: portfolio },
        "*"
      );
    }
  }, [portfolio]);

  return (
    <div className="w-full h-full relative bg-card-bg">
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <Loader2 className="w-6 h-6 animate-spin text-secondary/50" />
      </div>
      <iframe
        ref={iframeRef}
        src={`/portfolio/${slug}?mode=edit`}
        className="w-full h-full border-none z-10 relative bg-white"
        title="Live Preview"
      />
    </div>
  );
}
