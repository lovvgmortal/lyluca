import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Folder } from '../types';

interface FoldersContextType {
  folders: Folder[];
  addFolder: (name: string, parentId: string | null) => Promise<Folder>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  loading: boolean;
  fetchFolders: () => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

export const FoldersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchFolders = useCallback(async () => {
    // We now fetch all folders for any logged-in user to create a shared view.
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('folders')
      .select('id, created_at, user_id, name, parent_id')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', JSON.stringify(error, null, 2));
      setFolders([]);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchFolders();
    } else if (!authLoading) {
      setFolders([]);
      setLoading(false);
    }
  }, [user?.id, authLoading, fetchFolders]);
     
  const addFolder = useCallback(async (name: string, parentId: string | null): Promise<Folder> => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('folders')
      .insert({ name, user_id: user.id, parent_id: parentId })
      .select('id, created_at, user_id, name, parent_id')
      .single();
       
    if (error) throw error;
    if (!data) throw new Error("Could not create folder.");

    setFolders(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)));
    return data;
  }, [user?.id]);

  const updateFolder = useCallback(async (id: string, name: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { error } = await supabase
        .from('folders')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f).sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
       
    // The database's ON DELETE CASCADE constraint will handle deleting
    // all nested folders and scripts within this folder.
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
       
    if (error) {
        console.error("Error deleting folder:", error);
        throw error;
    }
       
    // Refetch all folders to correctly update the state after cascade delete
    // This is the safest way to ensure the local state is consistent.
    await fetchFolders();

  }, [user?.id, fetchFolders]);

  return (
    <FoldersContext.Provider value={{ folders, addFolder, updateFolder, deleteFolder, loading, fetchFolders }}>
        {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = (): FoldersContextType => {
  const context = useContext(FoldersContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FoldersProvider');
  }
  return context;
};