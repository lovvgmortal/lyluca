import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { Script } from '../types';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import { fetchYouTubeStats, parseVideoId } from '../services/youtubeService';
import { useAuth } from '../contexts/AuthContext';

interface YouTubeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
}

export const YouTubeLinkModal: React.FC<YouTubeLinkModalProps> = ({ isOpen, onClose, script }) => {
  const [link, setLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { updateScript } = useScripts();
  const { showToast } = useToast();
  const { profile } = useAuth();
  
  useEffect(() => {
    if(isOpen) {
        setLink(script.youtubeLink || '');
        setIsSaving(false);
    }
  }, [isOpen, script]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isSaving) return;
    const trimmedLink = link.trim();
    
    // If link is being cleared
    if (!trimmedLink) {
        setIsSaving(true);
        try {
            await updateScript(script.id, { 
                youtubeLink: null,
                youtubeTitle: null,
                youtubeViews: null,
                youtubeLikes: null,
                youtubeComments: null,
                youtubeStatsLastUpdated: null,
                youtubeThumbnailUrl: null,
            });
            showToast('YouTube link removed.');
            onClose();
        } catch (e) {
            showToast('Failed to remove link.');
        } finally {
            setIsSaving(false);
        }
        return;
    }

    const videoId = parseVideoId(trimmedLink);
    if (!videoId) {
        showToast('Please enter a valid YouTube URL.');
        return;
    }

    if (!profile?.youtube_api_key) {
        showToast('YouTube API Key is not configured. Please ask an admin to set it in Settings.');
        return;
    }

    setIsSaving(true);
    try {
        const stats = await fetchYouTubeStats(videoId, profile.youtube_api_key);
        await updateScript(script.id, { 
            youtubeLink: trimmedLink,
            youtubeTitle: stats.title,
            youtubeViews: stats.views,
            youtubeLikes: stats.likes,
            youtubeComments: stats.comments,
            youtubeThumbnailUrl: stats.thumbnailUrl,
            youtubeStatsLastUpdated: new Date().toISOString(),
        });
        showToast('YouTube link and stats updated.');
        onClose();
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        showToast(`Error: ${errorMessage}`);
    } finally {
        setIsSaving(false);
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
          <h2 className="text-xl font-bold text-brand-text">YouTube Link</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div>
          <label htmlFor="youtubeLink" className="block text-sm font-medium text-brand-text-secondary mb-2">
            Video URL for "{script.title}"
          </label>
          <input
            id="youtubeLink"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoFocus
            placeholder="https://www.youtube.com/watch?v=..."
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-brand-text bg-brand-bg hover:bg-opacity-80 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 w-36 text-sm font-medium rounded-md text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 disabled:opacity-50 transition-colors flex justify-center items-center">
            {isSaving ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : 'Save Link'}
          </button>
        </div>
      </div>
    </div>
  );
};