
import React from 'react';
import { useNotes } from '@/context/NoteContext';
import { Button } from './ui/button';
import { Mic, Pen, Plus } from 'lucide-react';

const EmptyState = () => {
  const { createNote } = useNotes();
  
  const handleCreateNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    createNote();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Mic size={32} className="text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold tracking-tight">
          Your Voice Canvas is empty
        </h2>
        
        <p className="text-muted-foreground">
          Start by creating your first note. You can type text and add voice recordings to capture your thoughts.
        </p>
        
        <div className="flex flex-col space-y-2 pt-4">
          <Button 
            onClick={handleCreateNote}
            className="w-full"
          >
            <Plus size={18} className="mr-2" />
            Create a new note
          </Button>
        </div>
        
        <div className="flex flex-col gap-3 pt-6">
          <div className="flex items-start">
            <Pen size={18} className="mt-0.5 mr-2 text-muted-foreground" />
            <div className="text-sm text-left">
              <p className="font-medium">Type and organize</p>
              <p className="text-muted-foreground">Create notes and organize them in folders.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Mic size={18} className="mt-0.5 mr-2 text-muted-foreground" />
            <div className="text-sm text-left">
              <p className="font-medium">Record your voice</p>
              <p className="text-muted-foreground">Add voice recordings to your notes with a single click.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
