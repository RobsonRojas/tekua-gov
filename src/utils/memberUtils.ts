/**
 * Utility functions for member and profile management
 */

export interface Profile {
  id: string;
  full_name?: string;
  role: 'admin' | 'member';
  is_board_member: boolean;
  board_role?: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Checks if a user is a member of the board (Diretoria)
 */
export const isBoardMember = (profile: Partial<Profile> | null | undefined): boolean => {
  if (!profile) return false;
  return !!profile.is_board_member;
};

/**
 * Gets the display name for a board role
 */
export const getBoardRoleDisplay = (profile: Partial<Profile> | null | undefined): string => {
  if (!profile || !profile.is_board_member) return '';
  return profile.board_role || 'Membro da Diretoria';
};
