import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { Folder } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, id?: string) => Promise<void>;
  folderToEdit?: Folder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onSave, folderToEdit }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if(isOpen) {
        setName(folderToEdit?.name || '');
        setIsSaving(false);
    }
  }, [isOpen, folderToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (name.trim() && !isSaving) {
      setIsSaving(true);
      try {
        await onSave(name.trim(), folderToEdit?.id);
      } catch (e) {
        // Error is handled by parent, but we should re-enable the button
        setIsSaving(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">{folderToEdit ? 'Rename Folder' : 'Create New Folder'}</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div>
          <label htmlFor="folderName" className="block text-sm font-medium text-brand-text-secondary mb-2">
            Folder Name
          </label>
          <input
            id="folderName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-brand-text bg-brand-bg hover:bg-opacity-80 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim() || isSaving} className="px-4 py-2 w-36 text-sm font-medium rounded-md text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 disabled:opacity-50 transition-colors flex justify-center items-center">
            {isSaving ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : (folderToEdit ? 'Save Changes' : 'Create Folder')}
          </button>
        </div>
      </div>
    </div>
  );
};