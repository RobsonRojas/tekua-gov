# Design: Village Beneficiary and Translation Fixes

## Architecture
- **Village Beneficiary**: Append a fixed pseudo-member object (e.g., `{ id: 'village', full_name: 'Vila Tekuá', email: '' }`) to the `members` array in `CreateDemand.tsx` and `TaskDetail.tsx` right after fetching them. Wait, if the backend expects a UUID, we must verify what ID to use. If the backend accepts `null` as the village, we can map the `village` id to `null` on submission. If there is a specific System UUID, we should use that. 
For now, we can append a custom option to the Autocomplete list and handle its ID accordingly during the API call.

- **Translations**: Update `src/locales/pt/translation.json` and `src/locales/en/translation.json` to include:
  - `work.newProject` ("Novo Projeto" / "New Project")
  - `common.none` ("Nenhum" / "None")
