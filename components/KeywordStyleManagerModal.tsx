import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { useKeywordStyles } from '../contexts/KeywordStylesContext';
import { useToast } from '../contexts/ToastContext';
import type { KeywordStyle } from '../types';

interface KeywordStyleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_STYLE: Omit<KeywordStyle, 'id'> = { name: '', prompt: '' };

export const KeywordStyleManagerModal: React.FC<KeywordStyleManagerModalProps> = ({ isOpen, onClose }) => {
  const { keywordStyles, addKeywordStyle, updateKeywordStyle, deleteKeywordStyle } = useKeywordStyles();
  const { showToast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<KeywordStyle | null>(null);
  const [formData, setFormData] = useState(EMPTY_STYLE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedStyle) {
      setFormData({ name: selectedStyle.name, prompt: selectedStyle.prompt });
    } else {
      setFormData(EMPTY_STYLE);
    }
  }, [selectedStyle]);

  if (!isOpen) return null;
  
  const handleSelectStyle = (style: KeywordStyle) => {
    setSelectedStyle(style);
  };
  
  const handleAddNew = () => {
    setSelectedStyle(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
        showToast("Style name and prompt cannot be empty.");
        return;
    }
    setIsSaving(true);
    try {
        if (selectedStyle) {
          await updateKeywordStyle(selectedStyle.id, formData);
          showToast("Keyword style updated successfully!");
        } else {
          await addKeywordStyle(formData);
          showToast("Keyword style added successfully!");
        }
        setFormData(EMPTY_STYLE);
        setSelectedStyle(null);
    } catch(err) {
        showToast("Failed to save keyword style.");
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDelete = async (styleId: string) => {
    try {
        await deleteKeywordStyle(styleId);
        if (selectedStyle?.id === styleId) {
            setSelectedStyle(null);
        }
        showToast("Keyword style deleted.");
    } catch (err) {
        showToast("Failed to delete keyword style.");
        console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl w-full max-w-4xl m-4 h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-bg">
          <h2 className="text-xl font-bold text-brand-text">Manage Keyword Styles</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text p-1 rounded-full">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-grow min-h-0">
          {/* Left Panel: Style List */}
          <div className="w-1/3 border-r border-brand-bg p-2 flex flex-col">
            <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 text-sm bg-brand-primary/10 text-brand-primary font-medium py-2 px-3 rounded-md hover:bg-brand-primary/20 transition-colors mb-2">
                <Icon name="plus" className="w-4 h-4"/>
                Add New Style
            </button>
            <div className="flex-grow overflow-y-auto pr-1">
                {keywordStyles.length === 0 ? (
                    <p className="text-center text-sm text-brand-text-secondary mt-8">No custom keyword styles yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {keywordStyles.map(style => (
                            <li key={style.id}>
                                <button 
                                    onClick={() => handleSelectStyle(style)} 
                                    className={`w-full text-left p-2 rounded-md text-sm truncate transition-colors ${selectedStyle?.id === style.id ? 'bg-brand-primary text-brand-text-inverse' : 'hover:bg-brand-bg'}`}
                                >
                                    {style.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
          
          {/* Right Panel: Editor */}
          <div className="w-2/3 p-4 flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">{selectedStyle ? 'Edit Style' : 'Add New Style'}</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">Style Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., 'SEO Keywords' or 'Thematic Tags'"
                className="w-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="flex-grow flex flex-col">
              <label htmlFor="prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">Style Prompt (Instructions for AI)</label>
              <textarea
                name="prompt"
                id="prompt"
                value={formData.prompt}
                onChange={handleFormChange}
                placeholder="e.g., 'Extract keywords for search engine optimization. Focus on long-tail keywords.'"
                className="w-full h-full bg-brand-bg text-brand-text p-2 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                {selectedStyle && (
                    <button onClick={() => handleDelete(selectedStyle.id)} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 text-sm font-medium flex items-center gap-1.5">
                        <Icon name="trash" className="w-4 h-4"/> Delete this style
                    </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 w-32 text-sm font-medium rounded-md text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 disabled:opacity-50 transition-colors">
                  {isSaving ? <div className="w-5 h-5 border-2 mx-auto border-dashed rounded-full animate-spin"></div> : (selectedStyle ? 'Update Style' : 'Save Style')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};