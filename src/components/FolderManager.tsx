
import React, { useState } from 'react';
import { useNotes } from '@/context/NoteContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Note } from '@/types';
import { FolderPlus, Edit2, Trash2 } from 'lucide-react';

interface FolderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FolderManager: React.FC<FolderManagerProps> = ({ isOpen, onClose }) => {
  const { folders, notes, createFolder, updateFolder, deleteFolder, updateNote } = useNotes();
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };
  
  const handleUpdateFolder = () => {
    if (editingFolder && editingFolder.name.trim()) {
      updateFolder(editingFolder.id, editingFolder.name.trim());
      setEditingFolder(null);
    }
  };
  
  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Notes will be moved to Unfiled.')) {
      deleteFolder(folderId);
    }
  };
  
  const getNoteCountInFolder = (folderId: string): number => {
    return notes.filter(note => note.folderId === folderId).length;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Manage Folders</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex space-x-2 mb-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1"
            />
            <Button onClick={handleCreateFolder}>
              <FolderPlus size={16} className="mr-2" />
              Create
            </Button>
          </div>
          
          {folders.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No folders created yet. Create your first folder to organize your notes.
            </div>
          ) : (
            <div className="space-y-3">
              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center justify-between bg-accent/20 rounded-lg p-3">
                  {editingFolder?.id === folder.id ? (
                    <div className="flex-1 flex space-x-2">
                      <Input
                        value={editingFolder.name}
                        onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                        placeholder="Folder name"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdateFolder}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingFolder(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium">{folder.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getNoteCountInFolder(folder.id)} notes
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingFolder(folder)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderManager;
