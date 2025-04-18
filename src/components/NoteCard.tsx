
import React from 'react';
import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Mic, FileText } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick }) => {
  const hasRecordings = note.recordings.length > 0;
  
  return (
    <div 
      className={`p-4 rounded-lg mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'bg-card hover:bg-accent/50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="truncate">
          <h3 className={`font-medium truncate ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
            {note.title || 'Untitled Note'}
          </h3>
          <p className={`text-sm truncate mt-1 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {note.content.substring(0, 60) || 'No content'}
            {note.content.length > 60 ? '...' : ''}
          </p>
        </div>
        <div className={`flex items-center space-x-1 text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {hasRecordings && <Mic size={14} className="mr-1" />}
          {!hasRecordings && <FileText size={14} className="mr-1" />}
          <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
