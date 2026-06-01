## ADDED Requirements

### Requirement: Profile Photo Management
The system SHALL allow authenticated users to upload, update, and remove their own profile photo directly from their profile page. The file upload SHALL enforce image compression (max 1MB output) and accept only standard formats (JPEG, PNG, WEBP).

#### Scenario: Upload Profile Photo
- **GIVEN** An authenticated user on their own profile page.
- **WHEN** The user selects a valid profile image and uploads it.
- **THEN** The image is compressed, uploaded to the `member-photos` bucket, and the user's `avatar_url` is updated in the profiles table and displayed in the UI.

#### Scenario: Remove Profile Photo
- **GIVEN** An authenticated user with a profile photo.
- **WHEN** The user clicks to remove their profile photo.
- **THEN** The user's `avatar_url` is set to `null` in the profiles table, and the UI falls back to displaying the user's initials.
