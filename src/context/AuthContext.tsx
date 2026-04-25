import React, { createContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import i18n from 'i18next';
import { apiClient } from '../lib/api';
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
    let mounted = true;

    // Safety timeout to prevent infinite loading screen
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 6000);

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user && currentProfileIdRef.current !== session.user.id) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
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

    // Listen for real-time profile updates
    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        if (user && payload.new.id === user.id) {
          setProfile(payload.new);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      authSubscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchProfile = async (userId: string) => {
    if (fetchingUserIdRef.current === userId) return;
    
    fetchingUserIdRef.current = userId;
    setLoading(true);
    
    try {
      const { data, error } = await apiClient.invoke('api-members', 'getProfile');

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
        const { error } = await apiClient.invoke('api-members', 'updateProfile', {
          updates: { preferred_language: lng }
        });
        
        if (error) throw new Error(error);
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
        const { error } = await apiClient.invoke('api-members', 'updateProfile', {
          updates: { preferred_theme: themeMode }
        });
        
        if (error) throw new Error(error);
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

