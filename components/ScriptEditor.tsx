import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScripts } from '../contexts/ScriptsContext';
import { useToast } from '../contexts/ToastContext';
import { useStyles } from '../contexts/StylesContext';
import { useAuth } from '../contexts/AuthContext';
import {
  generateTitleSummaryAndTimeline,
  rewriteScript,
  generateOutline,
  generateScriptFromOutline,
  generateKeywordsAndSplitScript,
  analyzeScriptPacing,
  ProviderConfig,
} from '../services/geminiService';
import type { Chapter, KeywordStyle, ScriptChunk, PacingPoint } from '../types';
import Spinner from './Spinner';
import { Icon } from './Icon';
import { SaveModal } from './SaveModal';
import { StyleManagerModal } from './StyleManagerModal';
import { CustomSelect } from './CustomSelect';
import { KeywordStyleManagerModal } from './KeywordStyleManagerModal';
import { useKeywordStyles } from '../contexts/KeywordStylesContext';
import PacingChart from './PacingChart';

type Mode = 'rewrite' | 'generate' | 'keyword' | 'note';
type ResultTab = 'script' | 'analysis' | 'pacing';

interface ResultState {
    aiTitle: string;
    summary: string;
    script: string;
    timeline: Chapter[];
    splitScript: ScriptChunk[];
    pacing: PacingPoint[];
}

export const ScriptEditor: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [originalScript, setOriginalScript] = useState('');
  
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [generatedOutline, setGeneratedOutline] = useState('');
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [note, setNote] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<ResultState> | null>(null);

  const [isGenerating, setIsGenerating] = useState(false); // For main AI script/outline generation
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false); // For title/summary/timeline
  const [isAnalyzingPacing, setIsAnalyzingPacing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // For DB calls

  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isStyleManagerOpen, setStyleManagerOpen] = useState(false);
  const [isKeywordStyleManagerOpen, setKeywordStyleManagerOpen] = useState(false);

  const [selectedStyleId, setSelectedStyleId] = useState<string>('default');
  const [selectedKeywordStyleId, setSelectedKeywordStyleId] = useState<string>('default');
  const [isEditingAiTitle, setIsEditingAiTitle] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('script');

  const { scriptId } = useParams<{ scriptId: string }>();
  const { addScript, updateScript, getScriptById, loading } = useScripts();
  const { showToast } = useToast();
  const { styles } = useStyles();
  const { keywordStyles } = useKeywordStyles();
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  
  const script = scriptId ? getScriptById(scriptId) : null;
  const canCreateNew = ['admin', 'manager', 'editor', 'content_creator'].includes(role || '');
  // Lock content editing and AI functions for content creators and editors.
  const isContentLocked = false;


  const handleClear = (isNewSession = false) => {
    setOriginalScript('');
    setIdeaPrompt('');
    setGeneratedOutline('');
    setScriptPrompt('');
    setNote('');
    setResult(null);
    setError(null);
    setActiveResultTab('script');
    if (scriptId && !isNewSession) {
      navigate('/edit', { replace: true });
    }
  };

  const getProviderConfig = (): ProviderConfig => {
      const geminiApiKey = profile?.gemini_api_key;
      const openRouterApiKey = profile?.openrouter_api_key;
      const primaryProvider = profile?.primary_provider || 'gemini';
      if (!geminiApiKey && primaryProvider === 'gemini') {
          throw new Error("Your primary provider is Gemini, but the API key is not set. Please update it in Settings.");
      }
      if (!openRouterApiKey && (primaryProvider === 'openrouter' || !geminiApiKey)) {
          throw new Error("OpenRouter API key is not set, which is required as a primary or fallback provider. Please update it in Settings.");
      }
      return { geminiApiKey, openRouterApiKey, primaryProvider };
  };

  useEffect(() => {
    if (scriptId) {
      const scriptToEdit = getScriptById(scriptId);
      if (scriptToEdit) {
        setMode(scriptToEdit.mode || 'generate');
        setIdeaPrompt(scriptToEdit.ideaPrompt || '');
        setGeneratedOutline(scriptToEdit.generatedOutline || '');
        setScriptPrompt(scriptToEdit.scriptPrompt || '');
        setOriginalScript(scriptToEdit.originalScript || scriptToEdit.script || '');
        setNote(scriptToEdit.note || '');
        
        if (scriptToEdit.script || scriptToEdit.aiTitle || scriptToEdit.splitScript?.length) {
            setResult({
              aiTitle: scriptToEdit.aiTitle || scriptToEdit.title,
              summary: scriptToEdit.summary,
              script: scriptToEdit.script,
              timeline: scriptToEdit.timeline,
              splitScript: scriptToEdit.splitScript || [],
              pacing: scriptToEdit.pacing || [],
            });
        } else {
            setResult(null);
        }
        setError(null);
        setActiveResultTab('script');
      } else if (!loading) { // Check loading state to avoid false "not found"
        setError(`Script with ID "${scriptId}" not found.`);
        navigate('/edit', { replace: true });
      }
    } else {
      handleClear(true);
    }
  }, [scriptId, getScriptById, navigate, loading]);

  if (!scriptId && !canCreateNew) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center p-8 text-center">
        <div className="bg-brand-surface p-8 rounded-lg shadow-lg max-w-lg">
          <Icon name="alert-triangle" className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-brand-text">Access Denied</h1>
          <p className="text-brand-text-secondary mt-2">
            Your role does not have permission to create new scripts. Please select an assigned task from the 'Work' board to begin.
          </p>
        </div>
      </div>
    );
  }


  const handleSaveOrUpdate = async () => {
    if (isContentLocked && mode !== 'note') return;
    try {
        setIsSaving(true);
        if (scriptId) {
            const scriptData = getScriptById(scriptId);
            const dataToSave = {
                title: scriptData?.title || 'Untitled Script',
                aiTitle: result?.aiTitle || scriptData?.aiTitle || scriptData?.title,
                summary: result?.summary || '',
                script: result?.script || originalScript,
                timeline: result?.timeline || [],
                splitScript: result?.splitScript || [],
                pacing: result?.pacing || [],
                note,
                mode,
                ideaPrompt,
                generatedOutline,
                scriptPrompt,
                originalScript,
            };
            await updateScript(scriptId, dataToSave);
            showToast('Script updated successfully!');
        } else {
            setSaveModalOpen(true);
        }
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfirmSave = async (title: string, folderId: string | null) => {
    if (isContentLocked && mode !== 'note') return;
    try {
        setIsSaving(true);
        const dataToSave = {
            title,
            aiTitle: result?.aiTitle || title,
            summary: result?.summary || '',
            script: result?.script || originalScript,
            timeline: result?.timeline || [],
            splitScript: result?.splitScript || [],
            pacing: result?.pacing || [],
            folderId,
            note,
            mode,
            ideaPrompt,
            generatedOutline,
            scriptPrompt,
            originalScript,
        };

        const newScript = await addScript(dataToSave);
        setSaveModalOpen(false);
        navigate(`/edit/${newScript.id}`, { replace: true });
        showToast('Script saved successfully!');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleRewrite = async () => {
    if (isContentLocked) return;
    if (!originalScript) {
      setError("Please enter the script to rewrite.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const selectedStyle = styles.find(s => s.id === selectedStyleId);
      const stylePrompt = selectedStyle?.prompt;
      const rewritten = await rewriteScript(providerConfig, originalScript, stylePrompt);
      const scriptData = scriptId ? getScriptById(scriptId) : null;

      setResult({ 
        script: rewritten,
        aiTitle: scriptData?.aiTitle || 'Rewritten Script',
        summary: scriptData?.summary || '',
        timeline: scriptData?.timeline || [],
        splitScript: scriptData?.splitScript || [],
        pacing: scriptData?.pacing || [],
       });
       setActiveResultTab('script');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (isContentLocked) return;
    if (!originalScript) {
      setError("Please enter the script to generate keywords from.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const selectedStyle = keywordStyles.find(s => s.id === selectedKeywordStyleId);
      const stylePrompt = selectedStyle?.prompt;
      const analyzedChunks = await generateKeywordsAndSplitScript(providerConfig, originalScript, stylePrompt);
      
      const scriptData = scriptId ? getScriptById(scriptId) : null;
      setResult({
        script: originalScript,
        aiTitle: scriptData?.aiTitle || 'Script Analysis',
        summary: scriptData?.summary || '',
        timeline: scriptData?.timeline || [],
        splitScript: analyzedChunks,
        pacing: scriptData?.pacing || [],
      })

    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateOutline = async () => {
    if (isContentLocked) return;
    if (!ideaPrompt) {
      setError("Please enter an idea to generate an outline.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedOutline('');
    try {
      const providerConfig = getProviderConfig();
      const outline = await generateOutline(providerConfig, ideaPrompt);
      setGeneratedOutline(outline);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the outline.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async () => {
    if (isContentLocked) return;
    if (!scriptPrompt || !generatedOutline) {
      setError("Please generate an outline and provide instructions to write the script.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResult(null);
    try {
      const providerConfig = getProviderConfig();
      const finalScript = await generateScriptFromOutline(providerConfig, generatedOutline, scriptPrompt);
      setResult({ 
        script: finalScript,
        aiTitle: 'AI Generated Script',
        summary: '',
        timeline: [],
        splitScript: [],
        pacing: [],
      });
      setActiveResultTab('script');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the script.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDetails = async () => {
    if (isContentLocked || !result || !result.script) return;

    setIsGeneratingDetails(true);
    setError(null);
    try {
        const providerConfig = getProviderConfig();
        const details = await generateTitleSummaryAndTimeline(providerConfig, result.script);
        setResult(prevResult => ({
            ...prevResult!,
            ...details,
        }));
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while generating details.');
    } finally {
        setIsGeneratingDetails(false);
    }
  };

  const handleAnalyzePacing = async () => {
    if (isContentLocked || !result || !result.script) return;

    setIsAnalyzingPacing(true);
    setError(null);
    try {
        const providerConfig = getProviderConfig();
        const pacingData = await analyzeScriptPacing(providerConfig, result.script);
        setResult(prevResult => ({
            ...prevResult!,
            pacing: pacingData,
        }));
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while analyzing pacing.');
    } finally {
        setIsAnalyzingPacing(false);
    }
  };

  const handlePacingTabClick = () => {
    setActiveResultTab('pacing');
  };

  const handleCopy = (content: string, type: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        showToast(`${type} copied to clipboard!`);
    }).catch(err => {
        console.error(`Failed to copy ${type}:`, err);
        setError(`Failed to copy ${type} to clipboard.`);
    });
  };

  const renderInputs = () => {
    if (mode === 'note') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div className="flex flex-col flex-grow min-h-0">
            <label htmlFor="note" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">
              Collaborative Notes (Editable by everyone)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-brand-bg border border-brand-surface rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition flex-grow resize-none"
              placeholder="Add feedback, ideas, or to-do items related to this script..."
            />
          </div>
        </div>
      );
    }

    if (mode === 'rewrite') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div>
              <label htmlFor="rewriteStyle" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Rewrite Style
              </label>
              <div className="flex gap-2">
                <CustomSelect
                  value={selectedStyleId}
                  onChange={setSelectedStyleId}
                  options={[
                    { value: 'default', label: 'Default Style' },
                    ...styles.map((style) => ({ value: style.id, label: style.name })),
                  ]}
                />
                <button 
                  onClick={() => setStyleManagerOpen(true)}
                  disabled={isContentLocked}
                  className="flex-shrink-0 border border-brand-secondary text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Manage Styles
                </button>
              </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <label htmlFor="originalScript" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Paste the original script here</label>
            <textarea
              id="originalScript"
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              readOnly={isContentLocked}
              className="w-full bg-brand-bg border border-brand-surface rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition flex-grow resize-none"
              placeholder="Example: Scene 1. Interior. Coffee Shop - Day..."
            />
          </div>
          <button onClick={handleRewrite} disabled={isGenerating || isContentLocked} className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="sparkles" />
            Rewrite Script
          </button>
        </div>
      );
    }

    if (mode === 'keyword') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div>
              <label htmlFor="keywordStyle" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Analysis & Split Style
              </label>
              <div className="flex gap-2">
                <CustomSelect
                  value={selectedKeywordStyleId}
                  onChange={setSelectedKeywordStyleId}
                  options={[
                    { value: 'default', label: 'Default Analysis' },
                    ...keywordStyles.map((style) => ({ value: style.id, label: style.name })),
                  ]}
                />
                <button 
                  onClick={() => setKeywordStyleManagerOpen(true)}
                  disabled={isContentLocked}
                  className="flex-shrink-0 border border-brand-secondary text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Manage Styles
                </button>
              </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <label htmlFor="originalScript" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Paste the script to analyze</label>
            <textarea
              id="originalScript"
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              readOnly={isContentLocked}
              className="w-full bg-brand-bg border border-brand-surface rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition flex-grow resize-none"
              placeholder="Paste your script to split it and extract keywords for each section..."
            />
          </div>
          <button onClick={handleGenerateKeywords} disabled={isGenerating || !originalScript || isContentLocked} className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="tag" />
            Analyze Script
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex-1 flex flex-col min-h-0">
          <label htmlFor="ideaPrompt" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Step 1: Enter Your Main Idea</label>
          <textarea
            id="ideaPrompt"
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            readOnly={isContentLocked}
            className="w-full bg-brand-bg border border-brand-surface rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-none flex-grow"
            placeholder="Example: A military analyst with 20 years of experience..."
          />
          <button onClick={handleGenerateOutline} disabled={isGenerating || !ideaPrompt || isContentLocked} className="mt-2 w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="sparkles" />
            {generatedOutline ? 'Regenerate Outline' : 'Generate Outline'}
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Generated Outline (Editable):</h3>
          <div className="bg-brand-bg/50 rounded-md border border-brand-surface flex-grow flex flex-col">
            <textarea
              value={generatedOutline}
              onChange={(e) => setGeneratedOutline(e.target.value)}
              readOnly={isContentLocked}
              className="w-full h-full bg-transparent p-3 font-sans text-brand-text text-sm focus:outline-none resize-none"
              placeholder="AI will generate the outline here. You can edit it directly."
              disabled={isGenerating && !generatedOutline}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <label htmlFor="scriptPrompt" className="block text-sm font-medium text-brand-text-secondary mb-2 flex-shrink-0">Step 2: Provide Detailed Instructions</label>
          <textarea
            id="scriptPrompt"
            value={scriptPrompt}
            onChange={(e) => setScriptPrompt(e.target.value)}
            readOnly={isContentLocked}
            className="w-full bg-brand-bg border border-brand-surface rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition disabled:opacity-50 disabled:cursor-not-allowed resize-none flex-grow"
            placeholder="Example: Write in a thrilling, action-packed style..."
            disabled={!generatedOutline || isGenerating}
          />
          <button onClick={handleGenerateScript} disabled={isGenerating || !generatedOutline || !scriptPrompt || isContentLocked} className="mt-2 w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-brand-text-inverse font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            <Icon name="edit" />
            {result?.script ? 'Regenerate Full Script' : 'Generate Full Script'}
          </button>
        </div>
      </div>
    );
  };
  
  const renderResult = () => {
    // Keyword Mode has a unique table view
    if (mode === 'keyword') {
      if (isGenerating && !result) return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
      if (error && !result) return <div className="text-brand-text bg-brand-surface border border-brand-secondary p-4 rounded-md">{error}</div>;
      if (!result || !result.splitScript?.length) {
        return <div className="flex-grow flex items-center justify-center text-center text-brand-text-secondary p-8">The script analysis table will be displayed here.</div>;
      }

      return (
        <div className="space-y-4 h-full flex flex-col">
          <h2 className="text-2xl font-bold text-brand-text flex-shrink-0 pb-3 border-b border-brand-surface">Script Analysis</h2>
          {error && <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded-md text-sm flex-shrink-0 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/50">{error}</div>}

          <div className="flex-grow overflow-auto">
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text uppercase bg-brand-bg sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 w-16">Index</th>
                  <th scope="col" className="px-6 py-3">Content</th>
                  <th scope="col" className="px-6 py-3 w-48">Keyword</th>
                </tr>
              </thead>
              <tbody>
                {result.splitScript.map((chunk, index) => (
                  <tr key={index} className="bg-brand-surface border-b border-brand-bg hover:bg-brand-bg/30">
                    <td className="px-6 py-4 font-medium text-brand-text text-center">{index + 1}</td>
                    <td className="px-6 py-4">{chunk.content}</td>
                    <td className="px-6 py-4">
                      <span className="text-brand-primary font-medium text-xs">
                        {chunk.keyword}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    // Standard view for Generate/Rewrite modes
    if (isGenerating && !result) return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
    if (error && !result) return <div className="text-brand-text bg-brand-surface border border-brand-secondary p-4 rounded-md">{error}</div>;
    if (!result) return <div className="flex-grow flex items-center justify-center text-center text-brand-text-secondary p-8">Generate or load a script to see the results and analysis tools here.</div>;
    
    const wordCount = result.script ? result.script.trim().split(/\s+/).filter(Boolean).length : 0;
    const tabButtonClass = (tab: ResultTab) => 
      `py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors ${
        activeResultTab === tab 
        ? 'border-brand-primary text-brand-text' 
        : 'border-transparent text-brand-text-secondary hover:text-brand-text'
      }`;


    return (
      <div className="h-full flex flex-col">
        {/* Header (Title & Tabs) */}
        <div className="flex-shrink-0">
            <div className="flex justify-between items-start gap-4">
                {isEditingAiTitle && !isContentLocked ? (
                    <input
                        type="text"
                        value={result.aiTitle || ''}
                        onChange={(e) => setResult(prev => prev ? { ...prev, aiTitle: e.target.value } : null)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingAiTitle(false); }}
                        onBlur={() => setIsEditingAiTitle(false)}
                        className="text-2xl font-bold bg-brand-bg text-brand-text w-full p-1 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none flex-grow"
                        autoFocus
                    />
                ) : (
                    <h2 
                        className={`text-2xl font-bold text-brand-text flex-grow p-1 -m-1 rounded-md transition-colors ${!isContentLocked && 'cursor-pointer hover:bg-brand-bg/50'}`}
                        onClick={() => !isContentLocked && setIsEditingAiTitle(true)}
                        title={!isContentLocked ? "Click to edit title" : ""}
                    >
                        {result.aiTitle || 'AI Generated Title'}
                    </h2>
                )}
            </div>
            
            {error && <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded-md text-sm flex-shrink-0 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/50 mt-2">{error}</div>}

            {/* Tabs */}
            <div className="border-b border-brand-surface mt-4">
                <nav className="flex gap-6" aria-label="Result Tabs">
                    <button onClick={() => setActiveResultTab('script')} className={tabButtonClass('script')}><Icon name="book" className="w-4 h-4" />Script</button>
                    <button onClick={() => setActiveResultTab('analysis')} className={tabButtonClass('analysis')}><Icon name="clipboard-list" className="w-4 h-4" />Analysis</button>
                    <button onClick={handlePacingTabClick} className={tabButtonClass('pacing')}><Icon name="trending-up" className="w-4 h-4" />Pacing</button>
                </nav>
            </div>
        </div>

        {/* Tab Content */}
        <div className="flex-grow min-h-0 pt-4 flex flex-col">
          {activeResultTab === 'script' && (
             <div className="flex-grow flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2 text-brand-text flex-shrink-0 pr-2">
                <span className="text-xs font-mono text-brand-text-secondary bg-brand-bg px-2 py-0.5 rounded-full">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                <button onClick={() => handleCopy(result.script || '', 'Script')} className="flex items-center gap-1.5 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                  <Icon name="copy" className="w-4 h-4"/>
                  Copy
                </button>
              </div>
              <div className="bg-brand-bg/50 rounded-md overflow-hidden flex-grow flex relative">
                {isGenerating ? <div className="w-full h-full flex items-center justify-center"><Spinner/></div> : 
                <textarea 
                    className="w-full h-full bg-transparent p-3 pb-8 font-mono text-sm text-brand-text focus:outline-none resize-none"
                    value={result.script || ''}
                    onChange={(e) => setResult(prev => prev ? ({...prev, script: e.target.value}) : null)}
                    readOnly={isContentLocked}
                    placeholder="The final script will appear here. You can edit it directly."
                />}
                {!isGenerating && result.script && (
                    <div className="absolute bottom-2 right-3 text-xs font-mono text-brand-text-secondary bg-brand-surface/80 backdrop-blur-sm px-2 py-1 rounded-full pointer-events-none">
                        {(result.script || '').length.toLocaleString()} characters
                    </div>
                )}
              </div>
            </div>
          )}
          {activeResultTab === 'analysis' && (
            <div className="flex flex-col gap-4 h-full">
              {(!result.summary && !result.timeline?.length) && !isGeneratingDetails && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-brand-bg/50 rounded-lg">
                    <Icon name="sparkles" className="w-12 h-12 text-brand-text-secondary mb-4"/>
                    <h3 className="text-lg font-semibold">Generate Script Analysis</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Create a title, summary, and chapter timeline.</p>
                    <button 
                        onClick={handleGenerateDetails}
                        disabled={isContentLocked}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-brand-primary text-brand-text-inverse hover:bg-brand-secondary font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="sparkles" className="w-4 h-4" />
                      Generate Analysis
                    </button>
                 </div>
              )}
              {(result.summary || result.timeline?.length || isGeneratingDetails) && (
                <>
                  <div className="space-y-2 flex flex-col flex-1 min-h-0">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-brand-text">Summary</h3>
                          <button onClick={() => handleCopy(result.summary || '', 'Summary')} disabled={!result.summary} className="text-brand-text-secondary hover:text-brand-text transition-colors p-1 disabled:opacity-50" aria-label="Copy summary">
                            <Icon name="copy" className="w-4 h-4"/>
                          </button>
                      </div>
                      <div className="bg-brand-bg/50 rounded-md p-3 flex-grow flex flex-col">
                          {isGeneratingDetails && !result.summary ? (
                              <div className="flex-grow flex items-center justify-center"><p className="text-brand-text-secondary text-sm">Generating summary...</p></div>
                          ) : (
                             <textarea
                                className="w-full h-full bg-transparent text-brand-text-secondary text-sm leading-relaxed focus:outline-none resize-none"
                                value={result.summary || ''}
                                onChange={(e) => setResult(prev => prev ? ({ ...prev, summary: e.target.value }) : null)}
                                readOnly={isContentLocked}
                                placeholder="Summary will appear here. You can edit it directly."
                            />
                          )}
                      </div>
                  </div>
                  <div className="space-y-2 flex flex-col flex-1 min-h-0">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-brand-text">Timeline</h3>
                          <button onClick={() => handleCopy(result.timeline?.map(ch => `${ch.time} – ${ch.description}`).join('\n') || '', 'Timeline')} disabled={!result.timeline || result.timeline.length === 0} className="text-brand-text-secondary hover:text-brand-text transition-colors p-1 disabled:opacity-50" aria-label="Copy timeline">
                            <Icon name="copy" className="w-4 h-4"/>
                          </button>
                      </div>
                      <div className="bg-brand-bg/50 rounded-md p-2 flex-grow flex flex-col">
                          {isGeneratingDetails && (!result.timeline || result.timeline.length === 0) ? (
                              <div className="flex-grow flex items-center justify-center"><p className="text-brand-text-secondary text-sm">Generating timeline...</p></div>
                          ) : result.timeline && result.timeline.length > 0 ? (
                              <ul className="space-y-1.5 overflow-y-auto pr-2">
                                  {result.timeline.map((chapter, index) => (
                                  <li key={index} className="flex gap-4 p-1.5 rounded-md text-sm">
                                      <span className="font-semibold text-brand-primary w-16 text-right flex-shrink-0">{chapter.time}</span>
                                      <span className="text-brand-text-secondary">{chapter.description}</span>
                                  </li>
                                  ))}
                              </ul>
                          ) : (
                              <div className="flex-grow flex items-center justify-center"><p className="text-brand-text-secondary text-sm">Timeline not generated.</p></div>
                          )}
                      </div>
                  </div>
                </>
              )}
            </div>
          )}
          {activeResultTab === 'pacing' && (
            <div className="h-full flex flex-col">
              <div className="flex-grow min-h-0">
                {isAnalyzingPacing ? (
                  <div className="flex h-full items-center justify-center"><Spinner /></div>
                ) : result.pacing && result.pacing.length > 0 ? (
                  <div className="h-full flex flex-col space-y-4">
                    <div className="flex-shrink-0 bg-brand-bg/50 rounded-lg p-2">
                      <PacingChart data={result.pacing} />
                    </div>
                    <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                      <h4 className="text-base font-semibold text-brand-text mb-2">Pacing Breakdown</h4>
                      <ul className="space-y-2">
                        {result.pacing.map((point, index) => (
                          <li key={index} className="flex gap-4 items-start p-3 bg-brand-bg/50 rounded-md">
                            <span className="text-xl font-bold text-brand-primary w-8 text-center flex-shrink-0 mt-1" title={`Intensity: ${point.intensity}`}>{point.intensity}</span>
                            <p className="text-sm text-brand-text-secondary leading-relaxed">{point.chunk}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-brand-bg/50 rounded-lg">
                      <Icon name="trending-up" className="w-12 h-12 text-brand-text-secondary mb-4"/>
                      <h3 className="text-lg font-semibold">Analyze Script Pacing</h3>
                      <p className="text-sm text-brand-text-secondary">Click the button below to visualize the script's emotional and action intensity.</p>
                    </div>
                )}
              </div>
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-brand-surface">
                 <button 
                    onClick={handleAnalyzePacing}
                    disabled={isAnalyzingPacing || !result?.script || isContentLocked}
                    className="w-full flex-shrink-0 flex items-center justify-center gap-2 bg-brand-primary text-brand-text-inverse hover:bg-brand-secondary font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Icon name="sparkles" className="w-4 h-4" />
                  {result.pacing && result.pacing.length > 0 ? 'Re-analyze Pacing' : 'Analyze Pacing'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const buttonClass = (m: Mode) => `px-4 py-2 text-sm font-medium ${mode === m ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-text-secondary'}`;

  return (
    <div className="px-4 py-2">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        
        <div className="bg-brand-surface p-4 rounded-lg shadow-lg flex flex-col h-[calc(100vh-6rem)]">
          <div className="flex-shrink-0 border-b border-brand-surface pb-4 mb-4">
            <div className="flex items-center">
              <div className="flex-grow flex items-center gap-4">
                <h2 className="text-xl font-bold text-brand-text truncate" title={script?.title}>
                    {script?.title || 'New Script'}
                </h2>
                <div className="flex-grow">
                    <button onClick={() => setMode('generate')} className={buttonClass('generate')}>Generate</button>
                    <button onClick={() => setMode('rewrite')} className={buttonClass('rewrite')}>Rewrite</button>
                    <button onClick={() => setMode('keyword')} className={buttonClass('keyword')}>Keyword</button>
                    <button onClick={() => setMode('note')} className={buttonClass('note')}>Note</button>
                </div>
              </div>
              
              <button onClick={handleSaveOrUpdate} disabled={isSaving || isGenerating || isGeneratingDetails || isAnalyzingPacing || (isContentLocked && mode !== 'note')} className="text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5 px-3 disabled:opacity-50">
                <Icon name="save" className="w-4 h-4"/>
                {scriptId ? 'Update' : 'Save'}
              </button>
              <button onClick={() => handleClear()} disabled={isSaving || isGenerating || isGeneratingDetails || isAnalyzingPacing || (isContentLocked && mode !== 'note')} className="text-brand-text-secondary hover:text-brand-text transition-colors flex items-center gap-1.5 px-3">
                <Icon name="trash" className="w-4 h-4"/> Clear
              </button>
            </div>
             {isContentLocked && mode !== 'note' && (
                <div className="mt-3 text-center text-sm bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded-md">
                    You are in view-only mode.
                </div>
            )}
            {isContentLocked && mode === 'note' && (
                <div className="mt-3 text-center text-sm bg-green-500/10 text-green-600 dark:text-green-400 p-2 rounded-md">
                    You can edit and save notes in this section.
                </div>
            )}
          </div>
          <div className="flex-grow flex flex-col min-h-0">
            {renderInputs()}
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-lg shadow-lg flex flex-col h-[calc(100vh-6rem)]">
          {renderResult()}
        </div>
      </div>
      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setSaveModalOpen(false)}
        onSave={handleConfirmSave}
        initialTitle={result?.aiTitle || (mode === 'keyword' ? 'Script Analysis' : 'New Project Name')}
      />
      <StyleManagerModal 
        isOpen={isStyleManagerOpen}
        onClose={() => setStyleManagerOpen(false)}
      />
      <KeywordStyleManagerModal
        isOpen={isKeywordStyleManagerOpen}
        onClose={() => setKeywordStyleManagerOpen(false)}
      />
    </div>
  );
};