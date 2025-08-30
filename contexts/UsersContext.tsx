import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { SimpleProfile, UserRole } from '../types';

interface UsersContextType {
  users: SimpleProfile[];
  getUserById: (id: string) => SimpleProfile | undefined;
  loading: boolean;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<SimpleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    // Allow any authenticated user to fetch the public profile list
    if (!user) {
      setLoading(false);
      setUsers([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, email');

    if (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } else {
      const formattedUsers = (data || []).map(profile => ({
        id: profile.id,
        role: profile.role,
        fullName: profile.full_name,
        email: profile.email
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if(user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);
  
  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === userId ? { ...u, role } : u))
    );
  }, []);

  const getUserById = useCallback((id: string): SimpleProfile | undefined => {
    return users.find(u => u.id === id);
  }, [users]);

  return (
    <UsersContext.Provider value={{ users, getUserById, loading, updateUserRole }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};