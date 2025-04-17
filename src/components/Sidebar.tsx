
import React, { useState } from 'react';
import { useNotes } from '@/context/NoteContext';
import NoteCard from './NoteCard';
import { Plus, Search, Menu, FolderPlus, Folder, ChevronDown, ChevronRight, FileDown, Trash2, Pencil, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import FolderManager from './FolderManager';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { exportFolderAsPDF, exportNotesAsPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import MultiSelectActions from './MultiSelectActions';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { 
    notes, 
    folders, 
    currentNote, 
    setCurrentNote, 
    createNote, 
    deleteFolder, 
    updateFolder,
    selectAllNotes,
    selectedNotes
  } = useNotes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{id: string, name: string} | null>(null);
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder toggle
    if (window.confirm('Are you sure you want to delete this folder? Notes will be moved to Unfiled.')) {
      deleteFolder(folderId);
    }
  };
  
  const handleExportFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder toggle
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
      toast.error('Folder not found');
      return;
    }
    
    exportFolderAsPDF(folder, notes);
  };
  
  const handleExportAllNotes = () => {
    if (notes.length === 0) {
      toast.error('No notes to export');
      return;
    }
    
    exportNotesAsPDF(notes, 'All Notes');
  };

  const handleRenameFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder toggle
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setFolderToRename({ id: folder.id, name: folder.name });
    }
  };
  
  const handleRenameFolderSubmit = () => {
    if (folderToRename) {
      updateFolder(folderToRename.id, folderToRename.name);
      setFolderToRename(null);
    }
  };
  
  const handleSelectAllInFolder = (folderId: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder toggle
    selectAllNotes(folderId);
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
  
  // Handle drag and drop of files (for audio import)
  const handleFileDrop = (e: React.DragEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length > 0) {
      Promise.all(audioFiles.map(file => {
        return setCurrentNote(notes.find(note => note.id === noteId) || null);
      })).then(() => {
        toast.success(`${audioFiles.length} recording(s) ready for import`);
      });
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
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
        
        {selectedNotes.length > 0 && <MultiSelectActions />}
        
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
              <div className="flex space-x-1">
                <button
                  onClick={handleExportAllNotes}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                  title="Export all notes"
                >
                  <FileDown size={16} />
                </button>
                <button 
                  onClick={() => setShowFolderManager(true)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                  title="Manage folders"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
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
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => handleSelectAllInFolder(folder.id, e)}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                    title="Select all notes in this folder"
                  >
                    <CheckSquare size={14} />
                  </button>
                  <button
                    onClick={(e) => handleExportFolder(folder.id, e)}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                    title="Export folder"
                  >
                    <FileDown size={14} />
                  </button>
                  <button
                    onClick={(e) => handleRenameFolder(folder.id, e)}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                    title="Rename folder"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"
                    title="Delete folder"
                  >
                    <Trash2 size={14} />
                  </button>
                  {expandedFolders[folder.id] ? (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-1 space-y-1">
                {folderNotes[folder.id]?.length > 0 ? (
                  folderNotes[folder.id].map((note, index) => (
                    <div 
                      key={note.id}
                      onDrop={(e) => handleFileDrop(e, note.id)}
                      onDragOver={handleDragOver}
                    >
                      <NoteCard
                        note={note}
                        isActive={currentNote?.id === note.id}
                        onClick={() => setCurrentNote(note)}
                        index={index}
                      />
                    </div>
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
              <div className="flex space-x-1">
                <button
                  onClick={(e) => handleSelectAllInFolder(undefined, e)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                  title="Select all unfiled notes"
                >
                  <CheckSquare size={14} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                      title="Export unfiled notes"
                    >
                      <FileDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportNotesAsPDF(unfilteredNotes, 'Unfiled Notes')}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          
          {searchTerm 
            ? sortedNotes.map((note, index) => (
                <div 
                  key={note.id}
                  onDrop={(e) => handleFileDrop(e, note.id)} 
                  onDragOver={handleDragOver}
                >
                  <NoteCard
                    note={note}
                    isActive={currentNote?.id === note.id}
                    onClick={() => setCurrentNote(note)}
                    index={index}
                  />
                </div>
              ))
            : unfilteredNotes.map((note, index) => (
                <div 
                  key={note.id}
                  onDrop={(e) => handleFileDrop(e, note.id)}
                  onDragOver={handleDragOver}
                >
                  <NoteCard
                    note={note}
                    isActive={currentNote?.id === note.id}
                    onClick={() => setCurrentNote(note)}
                    index={index}
                  />
                </div>
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
        
        {/* Folder Rename Dialog */}
        <Dialog 
          open={folderToRename !== null} 
          onOpenChange={(open) => !open && setFolderToRename(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={folderToRename?.name || ''}
                onChange={(e) => setFolderToRename(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Folder name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFolderToRename(null)}>
                Cancel
              </Button>
              <Button onClick={handleRenameFolderSubmit}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {showFolderManager && (
        <FolderManager 
          isOpen={showFolderManager} 
          onClose={() => setShowFolderManager(false)} 
        />
      )}
    </DndProvider>
  );
};

export default Sidebar;
