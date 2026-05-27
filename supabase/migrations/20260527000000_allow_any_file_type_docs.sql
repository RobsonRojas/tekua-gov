-- Migration: Allow any file type for official docs
-- Date: 2026-05-27
-- Purpose: Remove the allowed_mime_types restriction on the official-docs bucket

UPDATE storage.buckets 
SET allowed_mime_types = NULL
WHERE id = 'official-docs';
