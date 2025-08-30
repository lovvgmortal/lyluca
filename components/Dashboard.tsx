import React, { useState, useMemo, useCallback } from 'react';
import { useScripts } from '../contexts/ScriptsContext';
import { useFolders } from '../contexts/FoldersContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ScriptCard } from './ScriptCard';
import { FolderCard } from './FolderCard';
import { Icon } from './Icon';
import { Link } from 'react-router-dom';
import type { Folder, Script } from '../types';
import { FolderModal } from './FolderModal';
import Spinner from './Spinner';

export const Dashboard: React.FC = () => {
  const { scripts, loading: scriptsLoading } = useScripts();
  const { folders, addFolder, updateFolder, loading: foldersLoading } = useFolders();
  const { showToast } = useToast();
  const { role } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  
  const canCreate = useMemo(() => ['admin', 'manager', 'editor', 'content_creator'].includes(role || ''), [role]);

  const folderMap = useMemo(() => new Map(folders.map(f => [f.id, f])), [folders]);
  const currentFolder = useMemo(() => currentFolderId ? folderMap.get(currentFolderId) : null, [currentFolderId, folderMap]);

  const filteredAndSortedItems = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // Filter folders based on parent_id and search term
    const filteredFolders = folders.filter(f => 
        f.name.toLowerCase().includes(lowercasedTerm) && f.parent_id === currentFolderId
    );
      
    // Filter scripts based on folder_id and search term
    const filteredScripts = scripts.filter(s => 
        (s.title.toLowerCase().includes(lowercasedTerm) || (s.summary && s.summary.toLowerCase().includes(lowercasedTerm))) &&
        s.folderId === currentFolderId
    );
      
    return [...filteredFolders, ...filteredScripts];

  }, [scripts, folders, searchTerm, currentFolderId]);

  const handleCreateFolder = () => {
    if (!canCreate) return;
    setFolderToEdit(null);
    setFolderModalOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setFolderToEdit(folder);
    setFolderModalOpen(true);
  };
  
  const handleSaveFolder = useCallback(async (name: string, id?: string) => {
    if (!canCreate && !id) return; // Block creation if not manager
    try {
      if (id) {
        await updateFolder(id, name);
        showToast("Folder renamed.");
      } else {
        await addFolder(name, currentFolderId);
        showToast("Folder created.");
      }
      setFolderModalOpen(false);
    } catch(err) {
      showToast("Failed to save folder.");
      console.error(err);
    }
  }, [addFolder, updateFolder, showToast, currentFolderId, canCreate]);

  const breadcrumbs = useMemo(() => {
    const path: Folder[] = [];
    let folder = currentFolder;
    while(folder) {
        path.unshift(folder);
        folder = folder.parent_id ? folderMap.get(folder.parent_id) : null;
    }
    return path;
  }, [currentFolder, folderMap]);


  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-brand-text-secondary text-sm mb-4 flex-wrap">
      <button onClick={() => setCurrentFolderId(null)} className="hover:text-brand-text transition-colors">
        Dashboard
      </button>
      {breadcrumbs.map(folder => (
        <React.Fragment key={folder.id}>
          <span>/</span>
          <button 
            onClick={() => setCurrentFolderId(folder.id)} 
            className={`hover:text-brand-text transition-colors ${folder.id === currentFolderId ? 'font-semibold text-brand-text' : ''}`}
            aria-current={folder.id === currentFolderId ? 'page' : undefined}
            >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  const isLoading = scriptsLoading || foldersLoading;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <h1 className="text-3xl font-bold text-brand-text flex-shrink-0">Dashboard</h1>
        <div className="relative flex-grow max-w-lg">
           <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
           <input
                type="text"
                placeholder="Search everything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-surface border border-brand-bg rounded-lg pl-10 pr-4 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
           />
        </div>
        {canCreate && (
          <div className="flex gap-2">
              <button 
                  onClick={handleCreateFolder}
                  className="flex items-center gap-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
              >
                  <Icon name="folder" className="w-5 h-5" />
                  Create Folder
              </button>
              <Link 
                  to="/edit" 
                  className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
              >
                  <Icon name="edit" className="w-5 h-5" />
                  New Script
              </Link>
          </div>
        )}
      </div>
      
      {renderBreadcrumbs()}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface rounded-lg">
          <Icon name={searchTerm ? "search" : (currentFolder ? "folder" : "book")} className="mx-auto w-16 h-16 text-brand-text-secondary mb-4" />
          <h2 className="text-2xl font-semibold text-brand-text">
            {searchTerm ? 'No Results Found' : (currentFolder ? 'This Folder is Empty' : 'No Scripts Yet')}
          </h2>
          <p className="text-brand-text-secondary mt-2">
            {searchTerm ? `Your search for "${searchTerm}" did not match any items.` : (currentFolder ? 'Add a script or sub-folder here.' : 'Get started by creating a new script or folder.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedItems.map(item => 
            'summary' in item ? ( // It's a Script
              <ScriptCard key={item.id} script={item as Script} />
            ) : ( // It's a Folder
              <FolderCard key={item.id} folder={item as Folder} onClick={() => setCurrentFolderId((item as Folder).id)} onEdit={() => handleEditFolder(item as Folder)} />
            )
          )}
        </div>
      )}
      <FolderModal 
        isOpen={isFolderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleSaveFolder}
        folderToEdit={folderToEdit}
      />
    </div>
  );
};