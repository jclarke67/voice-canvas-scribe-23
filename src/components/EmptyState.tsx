
import React from 'react';
import { FileText, Mic, BookOpen } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';

const EmptyState: React.FC = () => {
  const { createNote } = useNotes();
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="mb-6">
        <BookOpen size={48} className="mx-auto text-primary opacity-80" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-3">Welcome to Voice Canvas</h2>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        Create notes with both text and voice recordings. A digital canvas for all your thoughts.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8">
        <div className="border rounded-lg p-4 bg-card/50">
          <FileText size={24} className="mb-2 text-primary" />
          <h3 className="font-medium mb-1">Write</h3>
          <p className="text-sm text-muted-foreground">
            Type your thoughts, ideas, and notes in a clean interface
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card/50">
          <Mic size={24} className="mb-2 text-primary" />
          <h3 className="font-medium mb-1">Record</h3>
          <p className="text-sm text-muted-foreground">
            Capture voice memos alongside your text notes
          </p>
        </div>
      </div>
      
      <button
        onClick={createNote}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Create Your First Note
      </button>
    </div>
  );
};

export default EmptyState;
