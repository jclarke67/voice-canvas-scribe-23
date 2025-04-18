import React, { useState, useRef } from 'react';
import { useNotes } from '@/context/NoteContext';
import MultiSelectNoteCard from './MultiSelectNoteCard';
import { Plus, Search, Menu, FolderPlus, Folder, ChevronDown, ChevronRight, FileDown, Trash2, MoveRight, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import FolderManager from './FolderManager';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { exportFolderAsPDF, exportNotesAsPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { 
    notes, 
    folders, 
    currentNote, 
    selectedNotes,
    setCurrentNote, 
    createNote, 
    deleteFolder, 
    updateFolder,
    toggleNoteSelection,
    clearSelectedNotes,
    moveNotesToFolder,
    deleteNotes,
    reorderFolders
  } = useNotes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [showMoveToFolderDialog, setShowMoveToFolderDialog] = useState(false);
  
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
  
  const handleStartEditingFolder = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folderId);
    setEditingFolderName(folderName);
  };
  
  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFolderId && editingFolderName.trim()) {
      updateFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleNoteSelect = (noteId: string, event: React.MouseEvent) => {
    // if Shift key is pressed, select multiple notes
    if (event.shiftKey && currentNote) {
      const folderNotesToSelect = currentNote.folderId 
        ? folderNotes[currentNote.folderId] || []
        : unfilteredNotes;
      
      const currentNoteIndex = folderNotesToSelect.findIndex(note => note.id === currentNote.id);
      const targetNoteIndex = folderNotesToSelect.findIndex(note => note.id === noteId);
      
      if (currentNoteIndex !== -1 && targetNoteIndex !== -1) {
        const startIndex = Math.min(currentNoteIndex, targetNoteIndex);
        const endIndex = Math.max(currentNoteIndex, targetNoteIndex);
        
        const notesToSelect = folderNotesToSelect.slice(startIndex, endIndex + 1).map(note => note.id);
        
        // Clear previous selection and select the range
        clearSelectedNotes();
        notesToSelect.forEach(id => toggleNoteSelection(id));
      }
    } else {
      // Otherwise toggle single note
      toggleNoteSelection(noteId);
    }
  };

  const handleMoveSelectedNotes = (folderId?: string) => {
    if (selectedNotes.length === 0) return;
    
    moveNotesToFolder(selectedNotes, folderId);
    setShowMoveToFolderDialog(false);
  };

  const handleDeleteSelectedNotes = () => {
    if (selectedNotes.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} notes?`)) {
      deleteNotes(selectedNotes);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    // Handle folder reordering
    if (type === 'FOLDERS') {
      reorderFolders(result);
      return;
    }

    // Handle note reordering
    console.log('Note dragged:', result);
    // Implementation for note reordering would go here
  };

  // Sort folders by order property 
  const sortedFolders = [...folders].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={cn(
          "h-full border-r bg-card transition-all duration-300 flex flex-col",
          isOpen ? "flex-1" : "w-0 overflow-hidden"
        )}>
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
          
          {selectedNotes.length > 0 && (
            <div className="p-2 bg-primary/10 border-b flex justify-between items-center">
              <span className="text-sm font-medium">{selectedNotes.length} selected</span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => setShowMoveToFolderDialog(true)}
                >
                  <MoveRight size={14} className="mr-1" />
                  Move
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={handleDeleteSelectedNotes}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={clearSelectedNotes}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
          
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
            
            {!searchTerm && (
              <Droppable droppableId="folders" type="FOLDERS">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {sortedFolders.map((folder, index) => (
                      <Draggable key={folder.id} draggableId={folder.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(snapshot.isDragging ? "opacity-50" : "")}
                          >
                            <Collapsible 
                              key={folder.id}
                              open={expandedFolders[folder.id]} 
                              onOpenChange={() => toggleFolder(folder.id)}
                              className="mb-1"
                            >
                              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-accent/50 rounded-md">
                                <div className="flex items-center text-sm flex-1">
                                  <Folder size={16} className="mr-2 text-primary" />
                                  {editingFolderId === folder.id ? (
                                    <form onSubmit={handleSaveFolder} className="flex-1">
                                      <input
                                        type="text"
                                        value={editingFolderName}
                                        onChange={(e) => setEditingFolderName(e.target.value)}
                                        onBlur={handleSaveFolder}
                                        className="w-full bg-background px-2 py-1 rounded-md text-sm"
                                        autoFocus
                                      />
                                    </form>
                                  ) : (
                                    <>
                                      <span 
                                        onDoubleClick={(e) => handleStartEditingFolder(folder.id, folder.name, e)}
                                        className="flex-1"
                                      >
                                        {folder.name}
                                      </span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({folderNotes[folder.id]?.length || 0})
                                      </span>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => handleExportFolder(folder.id, e)}
                                    className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                                    title="Export folder"
                                  >
                                    <FileDown size={14} />
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
                                <Droppable droppableId={`folder-${folder.id}`} type="NOTES">
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className="space-y-1"
                                    >
                                      {folderNotes[folder.id]?.length > 0 ? (
                                        folderNotes[folder.id].map((note, index) => (
                                          <Draggable key={note.id} draggableId={note.id} index={index}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                              >
                                                <MultiSelectNoteCard
                                                  note={note}
                                                  isActive={currentNote?.id === note.id}
                                                  isSelected={selectedNotes.includes(note.id)}
                                                  onClick={() => setCurrentNote(note)}
                                                  onSelect={(e) => handleNoteSelect(note.id, e)}
                                                  isDragging={snapshot.isDragging}
                                                />
                                              </div>
                                            )}
                                          </Draggable>
                                        ))
                                      ) : (
                                        <div className="text-xs text-muted-foreground p-2">
                                          No notes in this folder
                                        </div>
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                                <button
                                  onClick={() => createNote(folder.id)}
                                  className="w-full text-left text-xs p-2 text-muted-foreground hover:bg-accent/50 rounded-md flex items-center"
                                >
                                  <Plus size={14} className="mr-1" />
                                  New note in this folder
                                </button>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            
            {!searchTerm && (
              <div className="mb-2 mt-4 flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                  Unfiled Notes
                </div>
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
            )}
            
            <Droppable droppableId="unfiled-notes" type="NOTES">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-1"
                >
                  {searchTerm 
                    ? sortedNotes.map((note, index) => (
                        <Draggable key={note.id} draggableId={note.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <MultiSelectNoteCard
                                note={note}
                                isActive={currentNote?.id === note.id}
                                isSelected={selectedNotes.includes(note.id)}
                                onClick={() => setCurrentNote(note)}
                                onSelect={(e) => handleNoteSelect(note.id, e)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    : unfilteredNotes.map((note, index) => (
                        <Draggable key={note.id} draggableId={note.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <MultiSelectNoteCard
                                note={note}
                                isActive={currentNote?.id === note.id}
                                isSelected={selectedNotes.includes(note.id)}
                                onClick={() => setCurrentNote(note)}
                                onSelect={(e) => handleNoteSelect(note.id, e)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                  }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
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
      </DragDropContext>
      
      {showFolderManager && (
        <FolderManager 
          isOpen={showFolderManager} 
          onClose={() => setShowFolderManager(false)} 
        />
      )}

      <Dialog open={showMoveToFolderDialog} onOpenChange={setShowMoveToFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move {selectedNotes.length} notes to folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={(value) => handleMoveSelectedNotes(value === "unfiled" ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unfiled">Unfiled</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveToFolderDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
