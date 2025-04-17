
import React, { useState } from 'react';
import { useNotes } from '@/context/NoteContext';
import NoteCard from './NoteCard';
import { Plus, Search, Menu, FolderPlus, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import FolderManager from './FolderManager';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { notes, folders, currentNote, setCurrentNote, createNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showFolderManager, setShowFolderManager] = useState(false);
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  const filteredNotes = searchTerm 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;
  
  const sortedNotes = [...filteredNotes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  // Group notes by folder
  const unfilteredNotes = sortedNotes.filter(note => !note.folderId);
  const folderNotes: Record<string, typeof sortedNotes> = {};
  
  folders.forEach(folder => {
    folderNotes[folder.id] = sortedNotes.filter(note => note.folderId === folder.id);
  });
  
  return (
    <>
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
          {searchTerm && sortedNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
              <p className="mb-2">No notes found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
          
          {!searchTerm && (
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                Folders
              </div>
              <button 
                onClick={() => setShowFolderManager(true)}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                title="Manage folders"
              >
                <FolderPlus size={16} />
              </button>
            </div>
          )}
          
          {!searchTerm && folders.map(folder => (
            <Collapsible 
              key={folder.id}
              open={expandedFolders[folder.id]} 
              onOpenChange={() => toggleFolder(folder.id)}
              className="mb-1"
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-accent/50 rounded-md">
                <div className="flex items-center text-sm">
                  <Folder size={16} className="mr-2 text-primary" />
                  <span>{folder.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({folderNotes[folder.id]?.length || 0})
                  </span>
                </div>
                {expandedFolders[folder.id] ? (
                  <ChevronDown size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-1 space-y-1">
                {folderNotes[folder.id]?.length > 0 ? (
                  folderNotes[folder.id].map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={currentNote?.id === note.id}
                      onClick={() => setCurrentNote(note)}
                    />
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground p-2">
                    No notes in this folder
                  </div>
                )}
                <button
                  onClick={() => createNote(folder.id)}
                  className="w-full text-left text-xs p-2 text-muted-foreground hover:bg-accent/50 rounded-md flex items-center"
                >
                  <Plus size={14} className="mr-1" />
                  New note in this folder
                </button>
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          {!searchTerm && (
            <div className="mb-2 mt-4 flex justify-between items-center">
              <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                Unfiled Notes
              </div>
            </div>
          )}
          
          {searchTerm 
            ? sortedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={currentNote?.id === note.id}
                  onClick={() => setCurrentNote(note)}
                />
              ))
            : unfilteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={currentNote?.id === note.id}
                  onClick={() => setCurrentNote(note)}
                />
              ))
          }
          
          {!searchTerm && unfilteredNotes.length === 0 && (
            <div className="text-xs text-muted-foreground p-2">
              No unfiled notes
            </div>
          )}
        </div>
        
        <div className="p-3 border-t">
          <button
            onClick={() => createNote()}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" />
            New Note
          </button>
        </div>
      </div>
      
      {showFolderManager && (
        <FolderManager 
          isOpen={showFolderManager} 
          onClose={() => setShowFolderManager(false)} 
        />
      )}
    </>
  );
};

export default Sidebar;
