import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { RewriteStyle } from '../types';
import { Database } from '../lib/database.types';

type StylesTableRow = Database['public']['Tables']['styles']['Row'];
type StylesTableUpdate = Database['public']['Tables']['styles']['Update'];

interface StylesContextType {
  styles: RewriteStyle[];
  addStyle: (style: Omit<RewriteStyle, 'id'>) => Promise<void>;
  updateStyle: (id: string, data: Partial<Omit<RewriteStyle, 'id'>>) => Promise<void>;
  deleteStyle: (id: string) => Promise<void>;
}

const StylesContext = createContext<StylesContextType | undefined>(undefined);

export const StylesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<RewriteStyle[]>([]);
  const { user, loading: authLoading } = useAuth();
   
  const fetchStyles = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('styles')
      .select('id, name, prompt')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
       
    if (error) {
      console.error("Error fetching styles:", JSON.stringify(error, null, 2));
      setStyles([]);
    } else if (data) {
      setStyles(data as RewriteStyle[] || []);
    }
  }, [user?.id]); // ✅ Chỉ phụ thuộc vào user.id

  useEffect(() => {
    if (user?.id) {
      fetchStyles();
    } else if (!authLoading) {
      setStyles([]);
    }
  }, [user?.id, authLoading, fetchStyles]); // ✅ fetchStyles giờ stable

  const addStyle = useCallback(async (styleData: Omit<RewriteStyle, 'id'>) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('styles')
      .insert({ ...styleData, user_id: user.id })
      .select('id, name, prompt')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add style.');
    setStyles(prev => [...prev, data as RewriteStyle].sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const updateStyle = useCallback(async (id: string, dataToUpdate: Partial<Omit<RewriteStyle, 'id'>>) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('styles')
      .update(dataToUpdate as StylesTableUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, prompt')
      .single();
       
    if (error) throw error;
    if (!data) throw new Error('Failed to update style.');
    setStyles(prevStyles => prevStyles.map(style => 
      style.id === id ? (data as RewriteStyle) : style
    ).sort((a,b) => a.name.localeCompare(b.name)));
  }, [user?.id]);

  const deleteStyle = useCallback(async (id: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const { error } = await supabase
      .from('styles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    setStyles(prevStyles => prevStyles.filter(style => style.id !== id));
  }, [user?.id]);

  return (
    <StylesContext.Provider value={{ styles, addStyle, updateStyle, deleteStyle }}>
      {children}
    </StylesContext.Provider>
  );
};

export const useStyles = (): StylesContextType => {
  const context = useContext(StylesContext);
  if (context === undefined) {
    throw new Error('useStyles must be used within a StylesProvider');
  }
  return context;
};