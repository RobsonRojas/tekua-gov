export const BOARD_ROLES = [
  'Presidente',
  'Vice-Presidente',
  'Secretário',
  'Tesoureiro',
  'Membro da Diretoria',
  'Conselho Fiscal',
  'Diretor Acadêmico',
  'Diretor de Eventos',
  'Diretor de Comunicação',
  'Bibliotecário',
  'Orador'
] as const;

export type BoardRole = typeof BOARD_ROLES[number];
