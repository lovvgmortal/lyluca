import React, { useMemo } from 'react';
import { Icon } from './Icon';
import { useFolders } from '../contexts/FoldersContext';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import type { Folder, Script } from '../types';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
}

interface HierarchicalFolderOption {
  value: string;
  label: string;
  depth: number;
}

const buildFolderOptions = (folders: Folder[]): HierarchicalFolderOption[] => {
  const folderMap = new Map(folders.map(f => [f.id, { ...f, children: [] as Folder[] }]));
  const rootFolders: Folder[] = [];

  folders.forEach(f => {
    if (f.parent_id && folderMap.has(f.parent_id)) {
      const parent = folderMap.get(f.parent_id);
      if (parent) {
         if (!Array.isArray(parent.children)) {
            parent.children = [];
        }
        parent.children.push(f as any);
      }
    } else {
      rootFolders.push(f);
    }
  });

  const options: HierarchicalFolderOption[] = [{ value: 'root', label: 'Dashboard (Root)', depth: 0 }];

  const traverse = (folder: Folder, depth: number) => {
    options.push({
      value: folder.id,
      label: folder.name,
      depth: depth
    });
    const children = (folderMap.get(folder.id) as any)?.children || [];
    children.sort((a: Folder, b: Folder) => a.name.localeCompare(b.name)).forEach((child: Folder) => traverse(child, depth + 1));
  };

  rootFolders.sort((a,b) => a.name.localeCompare(b.name)).forEach(f => traverse(f, 0));
  
  return options;
};

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({ isOpen, onClose, script }) => {
  const { folders } = useFolders();
  const { updateScript } = useScripts();
  const { showToast } = useToast();
  
  const folderOptions = useMemo(() => buildFolderOptions(folders), [folders]);

  const handleMove = async (folderId: string | null) => {
    if (script.folderId === folderId) {
      onClose();
      return;
    }
    try {
        await updateScript(script.id, { folderId });
        showToast(`Script moved successfully.`);
        onClose();
    } catch (err) {
        showToast('Failed to move script.');
        console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">Move Script</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-brand-text-secondary mb-4">Move "<span className="font-semibold">{script.title}</span>" to:</p>
        <div className="max-h-60 overflow-y-auto space-y-2 border border-brand-bg rounded-md p-2">
            {folderOptions.map(option => (
                <button
                    key={option.value}
                    onClick={() => handleMove(option.value === 'root' ? null : option.value)}
                    className="w-full text-left p-2.5 rounded-md transition-colors bg-brand-bg/50 hover:bg-brand-primary/10 flex items-center gap-3 disabled:opacity-50"
                    style={{ paddingLeft: `${12 + (option.depth > 0 ? option.depth * 20 : 0)}px` }}
                    disabled={(option.value === 'root' ? null : option.value) === script.folderId}
                >
                    <Icon name={option.value === 'root' ? 'dashboard' : 'folder'} className="w-5 h-5 text-brand-text-secondary flex-shrink-0"/>
                    <span className="truncate">{option.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};