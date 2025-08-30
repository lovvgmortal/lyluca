import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Script } from '../types';
import { Icon } from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UsersContext';
import { YouTubeLinkModal } from './YouTubeLinkModal';

interface WorkCardProps {
  script: Script;
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export const WorkCard: React.FC<WorkCardProps> = ({ script }) => {
  const { user, role } = useAuth();
  const { startContentCreation, completeContent, startEditing, completeEditing, publishScript } = useScripts();
  const { showToast } = useToast();
  const { getUserById } = useUsers();
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  
  const creator = script.createdBy ? getUserById(script.createdBy) : null;
  const contentCreator = script.contentCreatorId ? getUserById(script.contentCreatorId) : null;
  const editor = script.editorId ? getUserById(script.editorId) : null;
  
  const isMyTask = script.assignedTo === user?.id;
  const currentStatus = script.status || 'todo';
  const canManageLink = role === 'admin' || role === 'manager';

  // --- Button Visibility ---
  const showStartContentBtn = currentStatus === 'todo' && (role === 'content_creator' || role === 'manager' || role === 'admin');
  const showCompleteContentBtn = currentStatus === 'content_creation' && isMyTask;
  const showStartEditingBtn = currentStatus === 'ready_for_edit' && (role === 'editor' || role === 'manager' || role === 'admin');
  const showCompleteEditingBtn = currentStatus === 'editing' && isMyTask;
  const showPublishBtn = currentStatus === 'ready_to_publish' && (role === 'admin' || role === 'manager');
  
  const showActionArea = showStartContentBtn || showCompleteContentBtn || showStartEditingBtn || showCompleteEditingBtn || showPublishBtn;

  // --- Action Handlers ---
  const handleAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
    try {
      await action();
      showToast(successMessage);
    } catch (error) {
      const err = error as Error;
      showToast(`${errorMessage}: ${err.message}`);
    }
  };

  const handleStartContent = () => handleAction(
    () => startContentCreation(script.id), 
    'Task claimed.', 
    'Failed to start'
  );

  const handleCompleteContent = () => handleAction(
    () => completeContent(script.id),
    'Content completed.',
    'Failed to complete'
  );

  const handleStartEditing = () => handleAction(
    () => startEditing(script.id),
    'Editing claimed.',
    'Failed to start editing'
  );
  
  const handleCompleteEditing = () => handleAction(
    () => completeEditing(script.id),
    'Editing completed.',
    'Failed to complete edit'
  );

  const handlePublish = () => handleAction(
    () => publishScript(script.id),
    'Script published.',
    'Failed to publish'
  );


  const renderActionButton = () => {
    // Standard user buttons
    if (showStartContentBtn) {
      return (
        <button onClick={handleStartContent} className="w-full flex items-center justify-center gap-2 text-sm bg-purple-500/10 text-purple-500 font-medium py-1.5 px-3 rounded-md hover:bg-purple-500/20 transition-colors">
          <Icon name="play-circle" className="w-4 h-4"/> Start Content
        </button>
      );
    }
    if (showCompleteContentBtn) {
      return (
        <button onClick={handleCompleteContent} className="w-full flex items-center justify-center gap-2 text-sm bg-blue-500/10 text-blue-500 font-medium py-1.5 px-3 rounded-md hover:bg-blue-500/20 transition-colors">
          <Icon name="check-circle" className="w-4 h-4"/> Content Done
        </button>
      );
    }
    if (showStartEditingBtn) {
      return (
        <button onClick={handleStartEditing} className="w-full flex items-center justify-center gap-2 text-sm bg-orange-500/10 text-orange-500 font-medium py-1.5 px-3 rounded-md hover:bg-orange-500/20 transition-colors">
          <Icon name="play-circle" className="w-4 h-4"/> Start Editing
        </button>
      );
    }
    if (showCompleteEditingBtn) {
       return (
        <button onClick={handleCompleteEditing} className="w-full flex items-center justify-center gap-2 text-sm bg-teal-500/10 text-teal-500 font-medium py-1.5 px-3 rounded-md hover:bg-teal-500/20 transition-colors">
          <Icon name="check-circle" className="w-4 h-4"/> Editing Done
        </button>
      );
    }
    if (showPublishBtn) {
      return (
        <button onClick={handlePublish} className="w-full flex items-center justify-center gap-2 text-sm bg-green-500/10 text-green-500 font-medium py-1.5 px-3 rounded-md hover:bg-green-500/20 transition-colors">
          <Icon name="check-circle" className="w-4 h-4"/> Confirm Publish
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-brand-surface rounded-lg p-3 shadow-md border border-brand-bg flex flex-col gap-3">
        <Link to={`/edit/${script.id}`} className="block group">
            <h4 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors truncate">{script.title}</h4>
        </Link>
        
        <div className="text-xs text-brand-text-secondary space-y-1.5">
            {creator && (
                <div className="flex items-center gap-2">
                    <Icon name="user" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span className="truncate">Created by: <strong>{creator.fullName || creator.email}</strong></span>
                </div>
            )}
            {contentCreator && (
                <div className="flex items-center gap-2">
                    <Icon name="file-text" className="w-3.5 h-3.5 flex-shrink-0 text-purple-500"/>
                    <span className="truncate">Content: <strong>{contentCreator.fullName || contentCreator.email}</strong></span>
                </div>
            )}
            {editor && (
                <div className="flex items-center gap-2">
                    <Icon name="edit" className="w-3.5 h-3.5 flex-shrink-0 text-orange-500"/>
                    <span className="truncate">Editor: <strong>{editor.fullName || editor.email}</strong></span>
                </div>
            )}
        </div>
        
        <div className="text-xs text-brand-text-secondary space-y-1.5">
            {script.contentAssignedAt && (
                 <div className="flex items-center gap-2 text-purple-500">
                    <Icon name="clock" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>Content Start: {formatDate(script.contentAssignedAt)}</span>
                </div>
            )}
            {script.contentCompletedAt && (
                <div className="flex items-center gap-2 text-blue-500">
                    <Icon name="check-circle" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>Content End: {formatDate(script.contentCompletedAt)}</span>
                </div>
            )}
            {script.editAssignedAt && (
                <div className="flex items-center gap-2 text-orange-500">
                    <Icon name="clock" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>Edit Start: {formatDate(script.editAssignedAt)}</span>
                </div>
            )}
            {script.editCompletedAt && (
                 <div className="flex items-center gap-2 text-teal-500">
                    <Icon name="check-circle" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>Edit End: {formatDate(script.editCompletedAt)}</span>
                </div>
            )}
            {script.publishedAt && (
                 <div className="flex items-center gap-2 text-green-500">
                    <Icon name="check-circle" className="w-3.5 h-3.5 flex-shrink-0"/>
                    <span>Published: {formatDate(script.publishedAt)}</span>
                </div>
            )}
        </div>

        {currentStatus === 'published' && (
          <div className="border-t border-brand-bg pt-2 mt-1 flex justify-between items-center gap-2">
              {script.youtubeLink ? (
                  <a href={script.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors truncate">
                      <Icon name="youtube" className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">View on YouTube</span>
                  </a>
              ) : (
                  <span className="text-xs text-brand-text-secondary">No video link.</span>
              )}
              {canManageLink && (
                   <button onClick={() => setLinkModalOpen(true)} className="text-xs flex-shrink-0 text-brand-text-secondary hover:text-brand-primary font-medium p-1 rounded hover:bg-brand-bg/50 transition-colors">
                       {script.youtubeLink ? 'Edit Link' : 'Add Link'}
                   </button>
              )}
          </div>
        )}

        {showActionArea && (
          <div className="mt-1 min-h-[30px] flex items-center">
              {renderActionButton()}
          </div>
        )}
      </div>
      {canManageLink && (
        <YouTubeLinkModal
            isOpen={isLinkModalOpen}
            onClose={() => setLinkModalOpen(false)}
            script={script}
        />
      )}
    </>
  );
};