## 1. Database Schema

- [ ] 1.1 Create a migration to add `accepted_terms_at` (timestamp) and `terms_version` (text) to the `profiles` table.
- [ ] 1.2 Update RLS policies if necessary to protect these new fields.

## 2. Backend Implementation (Edge Functions)

- [ ] 2.1 Create the `api-privacy` edge function scaffold.
- [ ] 2.2 Implement the `exportUserData` action to aggregate data from `profiles`, `contributions`, `votes`, and `activity_log`.
- [ ] 2.3 Implement the `deleteAccount` action with safe removal of personal data and anonimization of governance records.

## 3. Consent Flow

- [ ] 3.1 Create `src/components/auth/PrivacyConsentModal.tsx` to display Terms and Privacy Policy.
- [ ] 3.2 Implement a check in the application entry point (e.g., `App.tsx` or `AuthProvider`) to block access if consent is missing.
- [ ] 3.3 Add logic to update the `profiles` table when the user clicks "Aceito".

## 4. User Interface

- [ ] 4.1 Add a "Privacidade" tab to `src/pages/Profile.tsx`.
- [ ] 4.2 Create `src/components/profile/PrivacySettings.tsx` to house export and deletion tools.
- [ ] 4.3 Implement the client-side download logic for the JSON data export.
- [ ] 4.4 Add a multi-step confirmation dialog for account deletion to prevent accidental loss.

## 5. Verification

- [ ] 5.1 Verify that the consent modal correctly blocks unconsented users.
- [ ] 5.2 Verify that the exported JSON file contains all expected user data fields.
- [ ] 5.3 Verify that account deletion successfully removes personal info while preserving system integrity.
