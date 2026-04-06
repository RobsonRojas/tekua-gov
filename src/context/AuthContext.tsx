import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import i18n from 'i18next';
import { supabase } from '../lib/supabase';
import { useThemeContext } from './ThemeContext';
import type { PaletteMode } from '@mui/material';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { setThemeMode } = useThemeContext();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Sync i18n with profile preference
      if (data?.preferred_language && i18n.language !== data.preferred_language) {
        i18n.changeLanguage(data.preferred_language);
      }

      // Sync theme with profile preference
      if (data?.preferred_theme) {
        setThemeMode(data.preferred_theme as PaletteMode);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (lng: string) => {
    try {
      i18n.changeLanguage(lng);
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: lng })
          .eq('id', user.id);
        
        if (error) throw error;
        setProfile((prev: any) => prev ? { ...prev, preferred_language: lng } : null);
      }
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const updateTheme = async (themeMode: string) => {
    try {
      setThemeMode(themeMode as PaletteMode);
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_theme: themeMode })
          .eq('id', user.id);
        
        if (error) throw error;
        setProfile((prev: any) => prev ? { ...prev, preferred_theme: themeMode } : null);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, updateLanguage, updateTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
