
import React from 'react';
import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface MultiSelectNoteCardProps {
  note: Note;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onSelect: (event: React.MouseEvent) => void;
  isDragging?: boolean;
}

const MultiSelectNoteCard: React.FC<MultiSelectNoteCardProps> = ({
  note,
  isActive,
  isSelected,
  onClick,
  onSelect,
  isDragging = false
}) => {
  const hasRecordings = note.recordings.length > 0;
  
  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(event);
  };
  
  return (
    <div
      className={cn(
        "p-2 mb-1 rounded-md cursor-pointer transition-colors flex items-center gap-2",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        isDragging ? "opacity-50" : "opacity-100",
        isSelected ? "border border-primary" : ""
      )}
      onClick={onClick}
    >
      <Checkbox
        checked={isSelected}
        onClick={handleCheckboxClick}
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm truncate flex-1">
            {note.title || 'Untitled Note'}
          </h3>
          {hasRecordings && (
            <Mic size={14} className="ml-1 shrink-0 text-muted-foreground" />
          )}
        </div>
        
        <div className="text-xs text-muted-foreground truncate">
          {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default MultiSelectNoteCard;
