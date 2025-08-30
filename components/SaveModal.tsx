import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from './Icon';
import { useFolders } from '../contexts/FoldersContext';
import { CustomSelect } from './CustomSelect';
import type { Folder } from '../types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, folderId: string | null) => void;
  initialTitle?: string;
}

const buildFolderOptions = (folders: Folder[]) => {
  const folderMap = new Map(folders.map(f => [f.id, { ...f, children: [] as Folder[] }]));
  const rootFolders: Folder[] = [];

  folders.forEach(f => {
    if (f.parent_id && folderMap.has(f.parent_id)) {
      const parent = folderMap.get(f.parent_id);
      if (parent) {
        // Ensure children is an array before pushing
        if (!Array.isArray(parent.children)) {
            parent.children = [];
        }
        parent.children.push(f as any);
      }
    } else {
      rootFolders.push(f);
    }
  });

  const options: { value: string; label: string }[] = [{ value: 'root', label: 'Dashboard (No folder)' }];

  const traverse = (folder: Folder, depth: number) => {
    // Using a non-breaking space for indentation in the label
    const indentation = '\u00A0\u00A0'.repeat(depth);
    const prefix = depth > 0 ? '↳ ' : '';
    options.push({
      value: folder.id,
      label: `${indentation}${prefix}${folder.name}`
    });
    const children = (folderMap.get(folder.id) as any)?.children || [];
    children.sort((a: Folder, b: Folder) => a.name.localeCompare(b.name)).forEach((child: Folder) => traverse(child, depth + 1));
  };

  rootFolders.sort((a,b) => a.name.localeCompare(b.name)).forEach(f => traverse(f, 0));
  
  return options;
};


export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, initialTitle = 'Untitled Script' }) => {
  const [title, setTitle] = useState(initialTitle);
  const { folders } = useFolders();
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setSelectedFolderId('root');
    }
  }, [isOpen, initialTitle]);

  const folderOptions = useMemo(() => buildFolderOptions(folders), [folders]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), selectedFolderId === 'root' ? null : selectedFolderId);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSave();
    } else if (e.key === 'Escape') {
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">Save Script</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="scriptTitle" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Script Title
            </label>
            <input
              id="scriptTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div>
            <label htmlFor="folderSelect" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Save to Folder
            </label>
            <CustomSelect
              value={selectedFolderId}
              onChange={setSelectedFolderId}
              options={folderOptions}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-brand-text bg-brand-bg hover:bg-opacity-80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};