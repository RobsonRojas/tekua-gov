# Design: storage-media-policies

## Storage Configuration

### Buckets
- **official-docs**: Restricted to `admin` for write. `member` can read only if public or specifically shared.
- **task-evidence**: Public read (for the mural). Restricted to authenticated users for write.

### Policy Enforcement
- **MIME Types**: 
    - `task-evidence`: `image/jpeg`, `image/png`, `image/webp`.
    - `official-docs`: `application/pdf`, `image/jpeg`, `image/png`.
- **Max File Size**:
    - `task-evidence`: 5MB (after client-side compression).
    - `official-docs`: 20MB.

## Frontend Optimization

### Image Compression
- Use `browser-image-compression` library.
- Target size: < 1MB for task evidence.
- Max width: 1920px.

## Security (RLS)

### Object Policies
- `official-docs`: `SELECT` allowed if `role='admin'` OR `(is_public=true)`.
- `task-evidence`: `INSERT` allowed for `authenticated`. `SELECT` for all authenticated (mural).
