# Design - Fix Admin Panel Header

## Context
The Admin Panel layout needs to be more modular.

## Decisions

### 1. Main Layout Refactor
- In `src/pages/Admin/index.tsx`, the `Typography` and `Box` containing the main title will be updated.
- The `subtitle` and action buttons (like "Novo Membro") will be removed from the top level and passed down or managed by the tab components.

### 2. Tab-Specific Headers
- **User Management Tab**: Will contain its own title ("Gerenciamento de Usuários"), subtitle, and action buttons ("Refresh", "Novo Membro").
- **Financial Tab**: Will contain its own title ("Integridade Financeira"), subtitle, and "Refresh" button.

### 3. Styling
- Use a consistent `Box` layout for tab headers:
  ```tsx
  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Box>
      <Typography variant="h4">...</Typography>
      <Typography variant="body2">...</Typography>
    </Box>
    <Box>
      {/* Action Buttons */}
    </Box>
  </Box>
  ```
