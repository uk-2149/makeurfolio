"use client";

import React, { useRef, useEffect, useState } from "react";

interface EditableFieldProps {
  fieldKey: string;
  value: string;
  isEditMode?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  placeholder?: string;
}

/**
 * A wrapper component for rendering text in the portfolio.
 * When in `isEditMode=true` (inside the editor iframe preview), this field becomes `contentEditable`.
 * Changes are dispatched via `window.parent.postMessage` back to the EditorContext to trigger a global save.
 */
export function EditableField({
  fieldKey,
  value,
  isEditMode = false,
  className = "",
  as: Component = "span",
  placeholder = "Click to edit"
}: EditableFieldProps) {
  const contentRef = useRef<any>(null);

  const [initialValue] = useState(value || "");

  // If we receive a prop value update while NOT focused, update the inner text
  // (This handles live-sync from the Left pane to the Right iframe)
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerText !== value) {
        contentRef.current.innerText = value || "";
      }
    }
  }, [value]);

  if (!isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  const handleInput = () => {
    if (!contentRef.current) return;
    const newValue = contentRef.current.innerText;
    
    // Post message to parent window
    window.parent.postMessage({
      type: "FIELD_EDITED",
      field: fieldKey,
      value: newValue
    }, "*");
  };

  const Comp = Component as any;

  return (
    <Comp
      ref={contentRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      className={`outline-none transition-colors hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary focus:bg-background/50 rounded px-1 -ml-1 ${className} ${!value ? "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50" : ""}`}
      onBlur={handleInput}
      onInput={handleInput}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: initialValue }}
    />
  );
}
