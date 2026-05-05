/**
 * Utility functions for member and profile management
 */

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  roles: ('admin' | 'member' | 'transversal_council')[];
  functions: string[];
  avatar_url?: string;
  accepted_terms_at?: string;
  created_at?: string;
  /** @deprecated use roles array instead */
  role?: 'admin' | 'member' | 'transversal_council';
  /** @deprecated use functions array instead */
  is_board_member?: boolean;
  /** @deprecated use functions array instead */
  board_role?: string;
}

/**
 * Checks if a user is a member of the board (Diretoria)
 */
export const isBoardMember = (profile: Partial<Profile> | null | undefined): boolean => {
  if (!profile) return false;
  return (profile.functions && profile.functions.length > 0) || !!profile.is_board_member;
};

/**
 * Gets the display name for a board role
 */
export const getBoardRoleDisplay = (profile: Partial<Profile> | null | undefined): string => {
  if (!profile) return '';
  if (profile.functions && profile.functions.length > 0) {
    return profile.functions.join(', ');
  }
  return profile.board_role || (profile.is_board_member ? 'Membro da Diretoria' : '');
};
