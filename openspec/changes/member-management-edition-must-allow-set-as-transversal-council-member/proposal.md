## Why

Administrators need a clear and intuitive way to assign members to the Transversal Council, which is responsible for moderating tasks and demands. Currently, this assignment is mixed with other roles in a multi-select field, lacking the same visibility and ease of use as the "Board Member" (Diretoria) configuration.

## What Changes

- **UI Update**: Addition of a "Membro do Conselho Transversal" toggle in the member management edition modal.
- **Role Synchronization**: Setting the toggle to ON will automatically add the `transversal_council` role to the member's profile. Setting it to OFF will remove it.
- **Profile Detail Visibility**: The transversal council status will be displayed clearly in the members list and profile views, similar to how board members are highlighted.
- **Consistency**: Align the "Conselho Transversal" configuration with the existing "Membro da Diretoria" pattern, including specific labels and styling as requested in the visual reference.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `member-management`: Update the "Modificação de Permissões" requirement to include the specific scenario for Transversal Council assignment via a dedicated toggle.

## Impact

- **Frontend**: 
    - `src/components/admin/MemberEditModal.tsx`: Add the new toggle and handle the role synchronization logic.
    - `src/pages/MemberManagement.tsx`: Ensure the "Conselho" chip/label is displayed correctly in the table.
- **Localization**:
    - `src/locales/pt/translation.json`: Ensure all necessary keys are present for the new UI elements.
- **Types**:
    - `src/utils/memberUtils.ts`: Add helper functions like `isTransversalCouncilMember` if needed for UI consistency.
