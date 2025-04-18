
import React, { useState, useEffect } from 'react';
import { NoteProvider, useNotes } from '@/context/NoteContext';
import Sidebar from '@/components/Sidebar';
import NoteEditor from '@/components/NoteEditor';
import EmptyState from '@/components/EmptyState';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import { Menu, Plus, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/App';

const NoteContainer = () => {
  const { notes, currentNote, createNote } = useNotes();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      
      // Toggle theme with Ctrl+T
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setTheme(theme === 'light' ? 'dark' : 'light');
      }
      
      // Show keyboard shortcuts with ?
      if (e.key === '?') {
        setShowKeyboardHelp(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setTheme, theme]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const handleCreateNote = () => {
    createNote();
  };
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {!sidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="absolute top-4 left-4 p-2 rounded-md bg-background border shadow-sm hover:bg-accent transition-colors z-10"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={() => setShowKeyboardHelp(true)}
              className="p-2 rounded-md bg-background border shadow-sm hover:bg-accent transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          
          {notes.length === 0 ? (
            <EmptyState />
          ) : (
            <NoteEditor />
          )}
          
          {isMobile && (
            <button
              onClick={handleCreateNote}
              className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors z-10"
              aria-label="Create new note"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>
      
      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  );
};

const Index = () => {
  return (
    <NoteProvider>
      <NoteContainer />
    </NoteProvider>
  );
};

export default Index;
