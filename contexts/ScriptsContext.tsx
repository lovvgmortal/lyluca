import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Script, Chapter, ScriptChunk, PacingPoint } from '../types';
import type { Database, Json } from '../lib/database.types';

type ScriptsTableRow = Database['public']['Tables']['scripts']['Row'];
type ScriptsTableInsert = Database['public']['Tables']['scripts']['Insert'];
type ScriptsTableUpdate = Database['public']['Tables']['scripts']['Update'];

interface ScriptsContextType {
  scripts: Script[];
  addScript: (script: Partial<Omit<Script, 'id' | 'createdAt'>>) => Promise<Script>;
  updateScript: (id: string, data: Partial<Omit<Script, 'id' | 'createdAt'>>) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  getScriptById: (id: string) => Script | undefined;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  fetchScripts: () => Promise<void>;
  startContentCreation: (scriptId: string) => Promise<void>;
  completeContent: (scriptId: string) => Promise<void>;
  startEditing: (scriptId: string) => Promise<void>;
  completeEditing: (scriptId: string) => Promise<void>;
  publishScript: (scriptId: string) => Promise<void>;
}

const ScriptsContext = createContext<ScriptsContextType | undefined>(undefined);

export const ScriptsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, loading: authLoading } = useAuth();

  const fetchScripts = useCallback(async () => {
    if (!user?.id || !profile) {
      setLoading(false);
      setScripts([]);
      return;
    };

    setLoading(true);
    const { data, error } = await supabase
      .from('scripts')
      .select('id, created_at, user_id, title, ai_title, summary, script, timeline, split_script, folder_id, mode, idea_prompt, generated_outline, script_prompt, original_script, pacing, status, assigned_to, assigned_at, completed_at, last_modified_by, note, published_at, youtube_link, content_creator_id, editor_id, content_assigned_at, content_completed_at, youtube_title, youtube_views, youtube_likes, youtube_comments, youtube_stats_last_updated, youtube_thumbnail_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scripts:', JSON.stringify(error, null, 2));
      setScripts([]);
    } else {
      const formattedScripts: Script[] = (data || []).map((d) => ({
        id: d.id,
        createdAt: d.created_at,
        title: d.title,
        createdBy: d.user_id,
        aiTitle: d.ai_title ?? undefined,
        summary: d.summary,
        script: d.script,
        timeline: (d.timeline as unknown as Chapter[] | null) ?? [],
        splitScript: (d.split_script as unknown as ScriptChunk[] | null) ?? [],
        pacing: (d.pacing as unknown as PacingPoint[] | null) ?? [],
        folderId: d.folder_id ?? null,
        mode: d.mode ?? undefined,
        ideaPrompt: d.idea_prompt ?? undefined,
        generatedOutline: d.generated_outline ?? undefined,
        scriptPrompt: d.script_prompt ?? undefined,
        originalScript: d.original_script ?? undefined,
        status: d.status ?? null,
        assignedTo: d.assigned_to ?? null,
        lastModifiedBy: d.last_modified_by ?? null,
        note: d.note ?? undefined,
        publishedAt: d.published_at,
        youtubeLink: d.youtube_link ?? null,
        contentCreatorId: d.content_creator_id ?? null,
        editorId: d.editor_id ?? null,
        contentAssignedAt: d.content_assigned_at,
        contentCompletedAt: d.content_completed_at,
        editAssignedAt: d.assigned_at, 
        editCompletedAt: d.completed_at,
        youtubeTitle: d.youtube_title ?? null,
        youtubeViews: d.youtube_views ?? null,
        youtubeLikes: d.youtube_likes ?? null,
        youtubeComments: d.youtube_comments ?? null,
        youtubeStatsLastUpdated: d.youtube_stats_last_updated,
        youtubeThumbnailUrl: d.youtube_thumbnail_url ?? null,
      }));
      setScripts(formattedScripts);
    }
    setLoading(false);
  }, [user?.id, profile]);

  useEffect(() => {
    if (!authLoading) {
        fetchScripts();
    }
  }, [authLoading, fetchScripts]);

  const addScript = useCallback(async (scriptData: Partial<Omit<Script, 'id' | 'createdAt'>>): Promise<Script> => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const newScriptDataForDb: ScriptsTableInsert = {
      user_id: user.id,
      title: scriptData.title ?? 'Untitled Script',
      ai_title: scriptData.aiTitle ?? null,
      summary: scriptData.summary ?? '',
      script: scriptData.script ?? '',
      timeline: (scriptData.timeline as unknown as Json) ?? null,
      split_script: (scriptData.splitScript as unknown as Json) ?? null,
      pacing: (scriptData.pacing as unknown as Json) ?? null,
      folder_id: scriptData.folderId ?? null,
      mode: scriptData.mode ?? null,
      idea_prompt: scriptData.ideaPrompt ?? null,
      generated_outline: scriptData.generatedOutline ?? null,
      script_prompt: scriptData.scriptPrompt ?? null,
      original_script: scriptData.originalScript ?? null,
      status: scriptData.status ?? null,
      note: scriptData.note ?? null,
      youtube_link: scriptData.youtubeLink ?? null,
      youtube_thumbnail_url: scriptData.youtubeThumbnailUrl ?? null,
    };
    
    const { data, error } = await supabase
      .from('scripts')
      .insert(newScriptDataForDb)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create script");
    
    const createdScript: Script = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        createdBy: data.user_id,
        aiTitle: data.ai_title ?? undefined,
        summary: data.summary,
        script: data.script,
        timeline: (data.timeline as unknown as Chapter[] | null) ?? [],
        splitScript: (data.split_script as unknown as ScriptChunk[] | null) ?? [],
        pacing: (data.pacing as unknown as PacingPoint[] | null) ?? [],
        folderId: data.folder_id ?? null,
        mode: data.mode ?? undefined,
        ideaPrompt: data.idea_prompt ?? undefined,
        generatedOutline: data.generated_outline ?? undefined,
        scriptPrompt: data.script_prompt ?? undefined,
        originalScript: data.original_script ?? undefined,
        status: data.status ?? null,
        assignedTo: data.assigned_to ?? null,
        lastModifiedBy: data.last_modified_by ?? null,
        note: data.note ?? undefined,
        publishedAt: data.published_at,
        youtubeLink: data.youtube_link ?? null,
        contentCreatorId: data.content_creator_id ?? null,
        editorId: data.editor_id ?? null,
        contentAssignedAt: data.content_assigned_at,
        contentCompletedAt: data.content_completed_at,
        editAssignedAt: data.assigned_at,
        editCompletedAt: data.completed_at,
        youtubeTitle: data.youtube_title ?? null,
        youtubeViews: data.youtube_views ?? null,
        youtubeLikes: data.youtube_likes ?? null,
        youtubeComments: data.youtube_comments ?? null,
        youtubeStatsLastUpdated: data.youtube_stats_last_updated,
        youtubeThumbnailUrl: data.youtube_thumbnail_url ?? null,
    };
    
    await fetchScripts();
    return createdScript;
  }, [user?.id, fetchScripts]);

  const updateScript = useCallback(async (id: string, dataToUpdate: Partial<Omit<Script, 'id' | 'createdAt'>>) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const dataToUpdateForDb: ScriptsTableUpdate = {
        title: dataToUpdate.title,
        ai_title: dataToUpdate.aiTitle,
        summary: dataToUpdate.summary,
        script: dataToUpdate.script,
        timeline: (dataToUpdate.timeline as unknown as Json),
        split_script: (dataToUpdate.splitScript as unknown as Json),
        pacing: (dataToUpdate.pacing as unknown as Json),
        folder_id: dataToUpdate.folderId,
        mode: dataToUpdate.mode,
        idea_prompt: dataToUpdate.ideaPrompt,
        generated_outline: dataToUpdate.generatedOutline,
        script_prompt: dataToUpdate.scriptPrompt,
        original_script: dataToUpdate.originalScript,
        status: dataToUpdate.status,
        assigned_to: dataToUpdate.assignedTo,
        last_modified_by: user.id, // Always set the modifier
        note: dataToUpdate.note,
        published_at: dataToUpdate.publishedAt,
        youtube_link: dataToUpdate.youtubeLink,
        // Work Management Fields
        content_creator_id: dataToUpdate.contentCreatorId,
        editor_id: dataToUpdate.editorId,
        content_assigned_at: dataToUpdate.contentAssignedAt,
        content_completed_at: dataToUpdate.contentCompletedAt,
        assigned_at: dataToUpdate.editAssignedAt, // Maps to editAssignedAt
        completed_at: dataToUpdate.editCompletedAt, // Maps to editCompletedAt
        // YouTube Fields
        youtube_title: dataToUpdate.youtubeTitle,
        youtube_views: dataToUpdate.youtubeViews,
        youtube_likes: dataToUpdate.youtubeLikes,
        youtube_comments: dataToUpdate.youtubeComments,
        youtube_stats_last_updated: dataToUpdate.youtubeStatsLastUpdated,
        youtube_thumbnail_url: dataToUpdate.youtubeThumbnailUrl,
    };

    const { error } = await supabase
      .from('scripts')
      .update(dataToUpdateForDb)
      .eq('id', id);
      
    if (error) {
      console.error("Update Script Error:", error);
      throw error;
    };
    
    await fetchScripts();
  }, [user?.id, fetchScripts]);

  const deleteScript = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id);

    if (error) throw error;

    setScripts(prevScripts => prevScripts.filter(script => script.id !== id));
  }, [user?.id]);
  
  const getScriptById = useCallback((id: string): Script | undefined => {
    return scripts.find(script => script.id === id);
  }, [scripts]);

  const handleRpcAndUpdate = async (rpcName: string, params: object) => {
    const { error } = await supabase.rpc(rpcName as any, params);
    if (error) {
      console.error(`Error calling RPC ${rpcName}:`, error);
      throw error;
    }
    await fetchScripts();
  };

  const startContentCreation = useCallback(async (scriptId: string) => {
    await handleRpcAndUpdate('start_content_creation', { script_id_to_start: scriptId });
  }, [fetchScripts]);

  const completeContent = useCallback(async (scriptId: string) => {
    await handleRpcAndUpdate('complete_content', { script_id_to_complete: scriptId });
  }, [fetchScripts]);

  const startEditing = useCallback(async (scriptId: string) => {
    await handleRpcAndUpdate('start_editing', { script_id_to_start: scriptId });
  }, [fetchScripts]);

  const completeEditing = useCallback(async (scriptId: string) => {
    await handleRpcAndUpdate('complete_editing', { script_id_to_complete: scriptId });
  }, [fetchScripts]);

  const publishScript = useCallback(async (scriptId: string) => {
    await handleRpcAndUpdate('publish_script', { script_id_to_publish: scriptId });
  }, [fetchScripts]);

  return (
    <ScriptsContext.Provider value={{ scripts, addScript, updateScript, deleteScript, getScriptById, loading, setLoading, fetchScripts, startContentCreation, completeContent, startEditing, completeEditing, publishScript }}>
      {children}
    </ScriptsContext.Provider>
  );
};

export const useScripts = (): ScriptsContextType => {
  const context = useContext(ScriptsContext);
  if (context === undefined) {
    throw new Error('useScripts must be used within a ScriptsProvider');
  }
  return context;
};
