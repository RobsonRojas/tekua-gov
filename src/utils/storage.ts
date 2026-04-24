import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

export interface UploadOptions {
  bucket: 'task-evidence' | 'official-docs';
  path: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  metadata?: Record<string, any>;
}

export const uploadFile = async (file: File, options: UploadOptions) => {
  let fileToUpload = file;
  
  // Get current user for metadata
  const { data: { user } } = await supabase.auth.getUser();

  // Compress image if it's an image and target is task-evidence or specified
  if (file.type.startsWith('image/') && options.bucket === 'task-evidence') {
    const compressionOptions = {
      maxSizeMB: options.maxSizeMB || 1,
      maxWidthOrHeight: options.maxWidthOrHeight || 1920,
      useWebWorker: true,
    };

    try {
      fileToUpload = await imageCompression(file, compressionOptions);
    } catch (error) {
      console.error('Image compression failed, uploading original:', error);
    }
  }

  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
      metadata: {
        ...options.metadata,
        owner_id: user?.id,
        uploaded_at: new Date().toISOString(),
      }
    });

  if (error) throw error;
  
  return data.path;
};

export const getFileUrl = async (bucket: string, path: string, isPublic: boolean = true) => {
  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
};
