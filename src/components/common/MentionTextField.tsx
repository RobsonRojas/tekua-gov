import React, { useEffect, useState } from 'react';
import {
  Avatar, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemButton,
  ListItemText, Popover, TextField, Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

interface MentionUser {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface MentionTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  mentionedUserIds: string[];
  onMentionedUserIdsChange: (ids: string[]) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  sx?: SxProps<Theme>;
}

// Campo de texto que abre uma busca de membros ao digitar "@" e registra os IDs mencionados.
const MentionTextField: React.FC<MentionTextFieldProps> = ({
  value, onChange, mentionedUserIds, onMentionedUserIdsChange,
  placeholder, rows = 2, disabled, autoFocus, sx,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (anchorEl === null) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await apiClient.invoke('api-members', 'fetchUsers', { search: query, limit: 5 });
        if (error) throw new Error(error);
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users for mention:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, anchorEl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    const pos = e.target.selectionStart || 0;
    const match = val.slice(0, pos).match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setQuery(match[1]);
      setCursorPos(pos);
      setAnchorEl(e.target as HTMLElement);
    } else {
      setAnchorEl(null);
    }
  };

  const handleSelect = (user: MentionUser) => {
    if (cursorPos === null) return;
    const before = value.slice(0, cursorPos - query.length - 1);
    const after = value.slice(cursorPos);
    onChange(`${before}@${user.full_name || user.email} ${after}`);
    if (!mentionedUserIds.includes(user.id)) {
      onMentionedUserIdsChange([...mentionedUserIds, user.id]);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <TextField
        fullWidth
        multiline
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoFocus={autoFocus}
        variant="outlined"
        sx={sx}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { width: 300, maxHeight: 200, bgcolor: 'background.paper', borderRadius: 2 } } }}
      >
        {searching ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.noUsersFound', 'Nenhum usuário encontrado')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {users.map((u) => (
              <ListItem disablePadding key={u.id}>
                <ListItemButton onClick={() => handleSelect(u)}>
                  <ListItemAvatar>
                    <Avatar src={u.avatar_url || undefined} sx={{ width: 24, height: 24 }}>
                      {u.full_name?.charAt(0) || u.email?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.full_name || u.email}
                    slotProps={{ primary: { variant: 'body2', fontWeight: 600 } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default MentionTextField;
