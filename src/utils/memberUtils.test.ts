import { describe, it, expect } from 'vitest';
import { isBoardMember, getBoardRoleDisplay } from './memberUtils';
import type { Profile } from './memberUtils';

describe('memberUtils', () => {
  describe('isBoardMember', () => {
    it('should return true if functions array contains something', () => {
      const profile: Partial<Profile> = { functions: ['Diretor'] };
      expect(isBoardMember(profile as Profile)).toBe(true);
    });

    it('should return true if legacy is_board_member is true', () => {
      const profile: Partial<Profile> = { is_board_member: true, functions: [] };
      expect(isBoardMember(profile as Profile)).toBe(true);
    });

    it('should return false if no functions and legacy is false', () => {
      const profile: Partial<Profile> = { is_board_member: false, functions: [] };
      expect(isBoardMember(profile as Profile)).toBe(false);
    });
  });

  describe('getBoardRoleDisplay', () => {
    it('should join functions with commas', () => {
      const profile: Partial<Profile> = { functions: ['Presidente', 'Diretor'] };
      expect(getBoardRoleDisplay(profile as Profile)).toBe('Presidente, Diretor');
    });

    it('should use legacy board_role if functions are empty', () => {
      const profile: Partial<Profile> = { functions: [], board_role: 'Secretário' };
      expect(getBoardRoleDisplay(profile as Profile)).toBe('Secretário');
    });

    it('should return empty string if nothing is found', () => {
      const profile: Partial<Profile> = { functions: [], board_role: undefined };
      expect(getBoardRoleDisplay(profile as Profile)).toBe('');
    });
  });
});
