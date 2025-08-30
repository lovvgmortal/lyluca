import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { KeywordStyle } from '../types';
import { Database } from '../lib/database.types';

type KeywordStylesTableRow = Database['public']['Tables']['keyword_styles']['Row'];
type KeywordStylesTableUpdate = Database['public']['Tables']['keyword_styles']['Update'];

interface KeywordStylesContextType {
  keywordStyles: KeywordStyle[];
  addKeywordStyle: (style: Omit<KeywordStyle, 'id'>) => Promise<void>;
  updateKeywordStyle: (id: string, data: Partial<Omit<KeywordStyle, 'id'>>) => Promise<void>;
  deleteKeywordStyle: (id: string) => Promise<void>;
}

const KeywordStylesContext = createContext<KeywordStylesContextType | undefined>(undefined);

export const KeywordStylesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keywordStyles, setKeywordStyles] = useState<KeywordStyle[]>([]);
  const { user, loading: authLoading } = useAuth();
   
  const fetchKeywordStyles = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('keyword_styles')
      .select('id, name, prompt')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
       
    if (error) {
      console.error("Error fetching keyword styles:", JSON.stringify(error, null, 2));
      setKeywordStyles([]);
    } else if (data) {
      setKeywordStyles(data as KeywordStyle[] || []);
    }
  }, [user?.id]); // ✅ Chỉ phụ thuộc vào user.id

  useEffect(() => {
    if (user?.id) {
      fetchKeywordStyles();
    } else if (!authLoading) {
      setKeywordStyles([]);
    }
  }, [user?.id, authLoading, fetchKeywordStyles]); // ✅ fetchKeywordStyles giờ stable

  const addKeywordStyle = useCallback(async (styleData: Omit<KeywordStyle, 'id'>) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('keyword_styles')
      .insert({ ...styleData, user_id: user.id })
      .select('id, name, prompt')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add keyword style.');
    setKeywordStyles(prev => [...prev, data as KeywordStyle].sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const updateKeywordStyle = useCallback(async (id: string, dataToUpdate: Partial<Omit<KeywordStyle, 'id'>>) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('keyword_styles')
      .update(dataToUpdate as KeywordStylesTableUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, prompt')
      .single();
       
    if (error) throw error;
    if (!data) throw new Error('Failed to update keyword style.');
    setKeywordStyles(prevStyles => prevStyles.map(style => 
      style.id === id ? (data as KeywordStyle) : style
    ).sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const deleteKeywordStyle = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { error } = await supabase
      .from('keyword_styles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    setKeywordStyles(prevStyles => prevStyles.filter(style => style.id !== id));
  }, [user?.id]);

  return (
    <KeywordStylesContext.Provider value={{ keywordStyles, addKeywordStyle, updateKeywordStyle, deleteKeywordStyle }}>
      {children}
    </KeywordStylesContext.Provider>
  );
};

export const useKeywordStyles = (): KeywordStylesContextType => {
  const context = useContext(KeywordStylesContext);
  if (context === undefined) {
    throw new Error('useKeywordStyles must be used within a KeywordStylesProvider');
  }
  return context;
};