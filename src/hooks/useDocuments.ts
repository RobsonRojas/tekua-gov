import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

export interface DocumentMetadata {
  title: {
    pt: string;
    en: string;
  };
  description: {
    pt: string;
    en: string;
  };
  category: string;
}

export interface Document extends DocumentMetadata {
  id: string;
  file_path: string;
  created_at: string;
  created_by: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (file: File, metadata: DocumentMetadata) => {
    if (!user) {
      setError('User not authenticated.');
      return false;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${metadata.category}/${fileName}`;

      // 1. Upload to Supabase Storage
      const { uploadFile } = await import('../utils/storage');
      await uploadFile(file, {
        bucket: 'official-docs',
        path: filePath,
      });

      // Simulate progress since supabase-js doesn't provide upload progress natively for small files easily
      setUploadProgress(50);

      // 2. Insert metadata into documents table
      const { error: dbError } = await supabase.from('documents').insert({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        file_path: filePath,
        created_by: user.id
      });

      if (dbError) {
        // Rollback storage upload if DB insert fails
        await supabase.storage.from('official-docs').remove([filePath]);
        throw dbError;
      }

      setUploadProgress(100);
      
      // Refresh list
      await fetchDocuments();
      return true;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document.');
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('official-docs')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Refresh list
      await fetchDocuments();
      return true;
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = async (filePath: string) => {
    try {
      const { getFileUrl } = await import('../utils/storage');
      return await getFileUrl('official-docs', filePath, false);
    } catch (err: any) {
      console.error('Error generating signed URL:', err);
      setError(err.message || 'Failed to generate download URL.');
      return null;
    }
  };

  return {
    documents,
    loading,
    error,
    uploadProgress,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDownloadUrl
  };
}
