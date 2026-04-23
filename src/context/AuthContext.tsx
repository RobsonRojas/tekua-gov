import React, { createContext, useEffect, useState } from 'react';
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingUserIdRef = React.useRef<string | null>(null);
  const currentProfileIdRef = React.useRef<string | null>(null);
  const { setThemeMode } = useThemeContext();

  useEffect(() => {
    // Listen for auth changes (including initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          if (currentProfileIdRef.current !== session.user.id) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        } else if (!session) {
          setProfile(null);
          currentProfileIdRef.current = null;
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (fetchingUserIdRef.current === userId) return;
    
    fetchingUserIdRef.current = userId;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        currentProfileIdRef.current = data.id;
        
        if (data.preferred_language && i18n.language !== data.preferred_language) {
          i18n.changeLanguage(data.preferred_language);
        }

        if (data.preferred_theme) {
          setThemeMode(data.preferred_theme as PaletteMode);
        }
      } else {
        setProfile(null);
        currentProfileIdRef.current = null;
      }
    } catch (error) {
      setProfile(null);
      currentProfileIdRef.current = null;
    } finally {
      fetchingUserIdRef.current = null;
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

