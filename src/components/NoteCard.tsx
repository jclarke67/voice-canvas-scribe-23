
import React from 'react';
import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Mic } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

type DragItem = {
  type: string;
  id: string;
  index: number;
  folderId?: string;
};

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick, index }) => {
  const { toggleNoteSelection, isNoteSelected, reorderNotes } = useNotes();
  const isSelected = isNoteSelected(note.id);
  
  // Setup drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'NOTE',
    item: { 
      type: 'NOTE', 
      id: note.id, 
      index, 
      folderId: note.folderId 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [{ isOver }, drop] = useDrop({
    accept: 'NOTE',
    hover(item: DragItem, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      if (item.index === index) return;
      if (item.folderId !== note.folderId) return;
      
      // Reorder within the same folder
      reorderNotes(item.index, index, note.folderId);
      item.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const handleCardClick = (e: React.MouseEvent) => {
    // If holding Ctrl/Cmd key, toggle selection instead of opening
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleNoteSelection(note.id);
    } else {
      onClick();
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNoteSelection(note.id);
  };
  
  return (
    <div 
      ref={(node) => drag(drop(node))}
      onClick={handleCardClick}
      className={cn(
        "p-2 rounded-md cursor-pointer mb-1 hover:bg-accent/50 group relative",
        isActive && !isSelected && "bg-accent text-accent-foreground",
        isSelected && "bg-primary/20 hover:bg-primary/30 border border-primary/30",
        isDragging && "opacity-50",
        isOver && "border-t-2 border-primary"
      )}
    >
      <div className="flex items-start">
        <div 
          className="mr-2 mt-1 flex-shrink-0"
          onClick={handleCheckboxClick}
        >
          <div className={cn(
            "w-4 h-4 border rounded flex items-center justify-center",
            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
          )}>
            {isSelected && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="font-medium text-sm truncate">
            {note.title || 'Untitled Note'}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-1">
            {note.content.substring(0, 40) || 'No content'}
          </div>
          <div className="flex items-center mt-1">
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
            </div>
            
            {note.recordings.length > 0 && (
              <div className="flex items-center ml-2 text-xs text-muted-foreground">
                <Mic size={10} className="mr-1" />
                {note.recordings.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
