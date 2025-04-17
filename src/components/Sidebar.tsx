
import React from 'react';
import { useNotes } from '@/context/NoteContext';
import NoteCard from './NoteCard';
import { Plus, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { notes, currentNote, setCurrentNote, createNote } = useNotes();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredNotes = searchTerm 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;
  
  const sortedNotes = [...filteredNotes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <div 
      className={cn(
        "h-full border-r bg-card transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="font-semibold text-lg">Voice Canvas</h1>
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-accent"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-2 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-8 pr-3 text-sm bg-accent/50 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {sortedNotes.length > 0 ? (
          sortedNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={currentNote?.id === note.id}
              onClick={() => setCurrentNote(note)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <p className="mb-2">No notes found</p>
            {searchTerm && <p className="text-sm">Try a different search term</p>}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t">
        <button
          onClick={createNote}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          <Plus size={16} className="mr-1" />
          New Note
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
