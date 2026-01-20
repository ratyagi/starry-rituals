import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SaveRitualProps {
  onSave: () => void;
  completedCount: number;
  totalCount: number;
}

export function SaveRitual({ onSave, completedCount, totalCount }: SaveRitualProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const messages = [
    "Your constellation shines brighter",
    "Another night preserved",
    "Stars aligned",
    "Progress flows gently",
    "The sky remembers",
  ];

  const getMessage = () => {
    if (completedCount === 0) return "Rest is part of the journey";
    if (completedCount === totalCount) return "A complete constellation ✦";
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave();
    
    setTimeout(() => {
      setShowMessage(true);
      setTimeout(() => {
        setIsSaving(false);
        setShowMessage(false);
      }, 2000);
    }, 300);
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={cn(
          'relative px-8 py-4 rounded-full font-medium transition-all duration-300',
          'bg-secondary hover:bg-secondary/80 text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-swirl focus:ring-offset-2 focus:ring-offset-background',
          isSaving && 'pointer-events-none'
        )}
      >
        {/* Ripple effect */}
        {isSaving && (
          <span className="absolute inset-0 rounded-full bg-star/30 animate-save-ripple" />
        )}
        
        <span className={cn(
          'relative transition-opacity duration-300',
          isSaving && 'opacity-50'
        )}>
          Save Today
        </span>
      </button>

      {/* Completion status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {totalCount > 0 ? (
          <>
            <span className={cn(
              'font-medium transition-colors duration-300',
              completedCount === totalCount ? 'text-star' : 'text-foreground'
            )}>
              {completedCount}
            </span>
            <span>/</span>
            <span>{totalCount}</span>
            <span className="ml-1">stars lit</span>
          </>
        ) : (
          <span>Add habits to begin</span>
        )}
      </div>

      {/* Success message */}
      <div
        className={cn(
          'absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap',
          'text-sm text-star font-medium transition-all duration-500',
          showMessage
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none'
        )}
      >
        {getMessage()}
      </div>
    </div>
  );
}
