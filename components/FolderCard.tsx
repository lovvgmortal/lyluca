import React, { useState } from 'react';
import type { Folder } from '../types';
import { Icon } from './Icon';
import { useFolders } from '../contexts/FoldersContext';
import { useScripts } from '../contexts/ScriptsContext';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
  onEdit: (folder: Folder) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onEdit }) => {
  const { deleteFolder } = useFolders();
  const { fetchScripts } = useScripts();
  const { showToast } = useToast();
  const { role } = useAuth();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const canEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin' || role === 'manager';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await deleteFolder(folder.id);
      await fetchScripts(); // Manually refresh scripts state
      showToast(`Folder "${folder.name}" and all its content have been deleted.`);
      setConfirmModalOpen(false);
    } catch (err) {
      showToast("Failed to delete folder.");
      console.error(err);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(folder);
  };

  return (
    <>
      <div 
        onClick={onClick} 
        className="block group cursor-pointer"
      >
          <div className="bg-brand-surface rounded-lg p-4 shadow-lg hover:shadow-brand-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4">
              <Icon name="folder" className="w-10 h-10 text-brand-primary flex-shrink-0" />
              <h3 className="text-lg font-bold text-brand-text line-clamp-2 group-hover:text-brand-primary transition-colors flex-grow">
                {folder.name}
              </h3>
            </div>
            <div className="text-xs text-brand-text-secondary mt-4 pt-2 border-t border-brand-surface/50 flex justify-between items-center">
              <span>Created: {new Date(folder.created_at).toLocaleDateString()}</span>
               <div className="flex items-center gap-1">
                  {canEdit && (
                    <button onClick={handleEditClick} className="text-brand-text-secondary hover:text-brand-primary p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label='Rename folder'>
                        <Icon name='edit' className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={handleDeleteClick} className="text-brand-text-secondary hover:text-red-500 dark:hover:text-red-500 p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label="Delete folder">
                        <Icon name="trash" className="w-4 h-4" />
                    </button>
                  )}
              </div>
            </div>
          </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Folder Deletion"
        message={`Are you sure you want to permanently delete the folder "${folder.name}"? All scripts inside this folder will also be deleted. This action cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
};