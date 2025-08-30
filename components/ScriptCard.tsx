import React, { useState } from 'react';
import type { Script } from '../types';
import { Icon } from './Icon';
import { useScripts } from '../contexts/ScriptsContext';
import { Link } from 'react-router-dom';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { MoveToFolderModal } from './MoveToFolderModal';
import { useAuth } from '../contexts/AuthContext';

interface ScriptCardProps {
  script: Script;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({ script }) => {
  const { updateScript, deleteScript } = useScripts();
  const { showToast } = useToast();
  const { role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(script.title);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);

  const canEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin' || role === 'manager';

  const handleEditToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      if (title.trim() && title.trim() !== script.title) {
        try {
            await updateScript(script.id, { title: title.trim() });
            showToast("Title updated.");
        } catch (error) {
            showToast("Failed to update title.");
            setTitle(script.title); // Revert on error
        }
      } else {
        setTitle(script.title); // Reset if title is empty or unchanged
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModalOpen(true);
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMoveModalOpen(true);
  };

  const handleSendToWork = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        await updateScript(script.id, { status: 'todo' });
        showToast(`"${script.title}" sent to To Do list.`);
    } catch (err) {
        showToast("Failed to send script to work pipeline.");
        console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
        await deleteScript(script.id);
        showToast(`"${script.title}" deleted.`);
        setConfirmModalOpen(false);
    } catch(err) {
        showToast("Failed to delete script.");
        console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleEditToggle(e as any);
    } else if (e.key === 'Escape') {
        setTitle(script.title);
        setIsEditing(false);
    }
  }

  return (
    <>
      <Link to={`/edit/${script.id}`} className="block group">
          <div className="bg-brand-surface rounded-lg p-3 shadow-lg hover:shadow-brand-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                  {isEditing && canEdit ? (
                      <input
                          type="text"
                          value={title}
                          onChange={handleInputChange}
                          onKeyDown={handleInputKeyDown}
                          onBlur={(e) => isEditing && handleEditToggle(e as any)}
                          className="w-full bg-brand-bg text-brand-text text-lg font-bold p-2 rounded-md border border-brand-primary focus:outline-none"
                          autoFocus
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      />
                  ) : (
                      <h3 className="text-lg font-bold text-brand-text mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">{script.title}</h3>
                  )}

                  <p className="text-brand-text-secondary my-2 line-clamp-2 text-sm">{script.summary}</p>
              </div>
              <div className="text-xs text-brand-text-secondary mt-3 pt-3 border-t border-brand-surface/50 flex justify-between items-center">
                  <span>Created: {new Date(script.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center">
                        {(!script.status && canEdit) && (
                            <button onClick={handleSendToWork} className="text-brand-text-secondary hover:text-brand-primary p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label='Send to work pipeline'>
                                <Icon name="briefcase" className="w-4 h-4" />
                            </button>
                        )}
                        {canEdit && (
                          <>
                            <button onClick={handleMoveClick} className="text-brand-text-secondary hover:text-brand-primary p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label='Move script'>
                              <Icon name="folder" className="w-4 h-4" />
                            </button>
                            <button onClick={handleEditToggle} className="text-brand-text-secondary hover:text-brand-primary p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label={isEditing ? 'Save title' : 'Edit title'}>
                                <Icon name={isEditing ? 'check' : 'edit'} className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button onClick={handleDeleteClick} className="text-brand-text-secondary hover:text-red-500 dark:hover:text-red-500 p-2 rounded-full hover:bg-brand-bg/50 transition-colors" aria-label="Delete script">
                              <Icon name="trash" className="w-4 h-4" />
                          </button>
                        )}
                    </div>
              </div>
          </div>
      </Link>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete "${script.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
       <MoveToFolderModal
        isOpen={isMoveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        script={script}
      />
    </>
  );
};