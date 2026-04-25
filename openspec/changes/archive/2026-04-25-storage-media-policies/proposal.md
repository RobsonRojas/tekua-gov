# Proposal: storage-media-policies

## Objective
Establish formal policies for the use of Supabase Storage, ensuring data security, performance, and resource optimization.

## Rationale
The platform stores sensitive documents and evidence of work. Without clear policies on file types, sizes, and bucket permissions, we risk security vulnerabilities, storage bloat, and poor performance on mobile devices.

## Scope
- **Policy Definition**: Define standard limits (e.g., 5MB for evidence images, 20MB for official documents).
- **Storage Configuration**: Update Supabase bucket configurations to enforce file type restrictions.
- **Backend**: Implement Edge Function or UI logic to resize/compress images before upload.
- **Security**: Refine RLS for storage objects to ensure private documents remain inaccessible to unauthorized members.
