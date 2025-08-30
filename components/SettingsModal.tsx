import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { CustomSelect } from './CustomSelect';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, loading, role } = useAuth();
  const [fullName, setFullName] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [primaryProvider, setPrimaryProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setFullName(profile?.full_name || '');
      setGeminiKey(profile?.gemini_api_key || '');
      setOpenRouterKey(profile?.openrouter_api_key || '');
      setPrimaryProvider(profile?.primary_provider || 'gemini');
      setYoutubeApiKey(profile?.youtube_api_key || '');
    }
  }, [isOpen, profile]);

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    try {
      const profileData: any = {
        full_name: fullName,
      };
      // Only admins can update API settings
      if (role === 'admin') {
        profileData.gemini_api_key = geminiKey;
        profileData.openrouter_api_key = openRouterKey;
        profileData.primary_provider = primaryProvider;
        profileData.youtube_api_key = youtubeApiKey;
      }
      await updateProfile(profileData);
      showToast('Settings saved successfully.');
      onClose();
    } catch(e) {
      console.error(e);
      showToast('Failed to save settings.');
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
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">Settings</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter your full name"
            />
          </div>
          
          {role === 'admin' && (
            <>
              <div className="border-t border-brand-bg my-4"></div>
              <h3 className="text-lg font-semibold text-brand-text">Script Generation Settings</h3>
              <div>
                <label htmlFor="primaryProvider" className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Primary AI Provider
                </label>
                <CustomSelect
                  value={primaryProvider}
                  onChange={(val) => setPrimaryProvider(val as 'gemini' | 'openrouter')}
                  options={[
                    { value: 'gemini', label: 'Google Gemini' },
                    { value: 'openrouter', label: 'OpenRouter (Fallback)' },
                  ]}
                />
                <p className="text-xs text-brand-text-secondary mt-2">
                    Select your main AI provider. If it fails, the app will automatically try the other provider.
                </p>
              </div>
              <div>
              <label htmlFor="geminiApiKey" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Gemini API Key
              </label>
              <input
                id="geminiApiKey"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter your API key here"
              />
              </div>
              <div>
              <label htmlFor="openrouterApiKey" className="block text-sm font-medium text-brand-text-secondary mb-2">
                OpenRouter API Key
              </label>
              <input
                id="openrouterApiKey"
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter your OpenRouter key here (starts with sk-or-)"
              />
               <p className="text-xs text-brand-text-secondary mt-2">
                Your keys are stored securely in the database, associated with your account.
              </p>
              </div>
              <div className="border-t border-brand-bg my-4"></div>
              <h3 className="text-lg font-semibold text-brand-text">Data & Performance Settings</h3>
               <div>
                <label htmlFor="youtubeApiKey" className="block text-sm font-medium text-brand-text-secondary mb-2">
                  YouTube API Key
                </label>
                <input
                  id="youtubeApiKey"
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter your YouTube Data API v3 key"
                />
                <p className="text-xs text-brand-text-secondary mt-2">
                  Used to fetch video performance statistics. This key is stored securely.
                </p>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-brand-bg pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-brand-text bg-brand-bg hover:bg-opacity-80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};