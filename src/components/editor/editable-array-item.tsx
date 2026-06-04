import React, { useState } from "react";
import { Trash2 } from "lucide-react";

interface EditableArrayItemProps {
  arrayPath: string;
  index: number;
  isEditMode: boolean;
  children: React.ReactNode;
  className?: string;
}

export function EditableArrayItem({ arrayPath, index, isEditMode, children, className = "" }: EditableArrayItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this item?")) {
      window.parent.postMessage({
        type: "ARRAY_ITEM_DELETED",
        arrayPath,
        index
      }, "*");
    }
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button that appears on hover */}
      {isHovered && (
        <div className="absolute -top-3 -right-3 z-50">
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Subtle border to indicate the item boundary on hover */}
      <div className={`transition-all duration-200 ${isHovered ? 'ring-2 ring-red-500/20 rounded-lg bg-red-500/5' : ''}`}>
        {children}
      </div>
    </div>
  );
}
