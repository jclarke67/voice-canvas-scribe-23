
import React from 'react';
import { useNotes } from '@/context/NoteContext';
import { Button } from './ui/button';
import { Trash2, FolderOpen, FileDown, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { exportNotesAsPDF } from '@/lib/exportUtils';

interface MultiSelectActionsProps {
  folderId?: string;
}

const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({ folderId }) => {
  const { 
    selectedNotes, 
    clearNoteSelection, 
    moveNotesToFolder, 
    deleteNotes, 
    folders,
    notes
  } = useNotes();
  
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  
  if (selectedNotes.length === 0) return null;
  
  const selectedCount = selectedNotes.length;
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} note${selectedCount !== 1 ? 's' : ''}?`)) {
      deleteNotes(selectedNotes);
    }
  };
  
  const handleMove = (newFolderId: string) => {
    moveNotesToFolder(selectedNotes, newFolderId === "unfiled" ? undefined : newFolderId);
    setShowMoveDialog(false);
  };
  
  const handleExport = () => {
    const notesToExport = notes.filter(note => selectedNotes.includes(note.id));
    exportNotesAsPDF(notesToExport, `${selectedCount} Selected Notes`);
  };
  
  return (
    <div className="bg-sidebar-accent p-2 border-t border-b flex items-center justify-between mb-2">
      <div className="text-sm">
        {selectedCount} selected
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={handleExport} title="Export selected">
          <FileDown size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowMoveDialog(true)}
          title="Move to folder"
        >
          <FolderOpen size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete} 
          className="text-destructive hover:text-destructive"
          title="Delete selected"
        >
          <Trash2 size={16} />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={clearNoteSelection} title="Clear selection">
          <X size={16} />
        </Button>
      </div>
      
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={handleMove}
              defaultValue={folderId || "unfiled"}
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
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiSelectActions;
