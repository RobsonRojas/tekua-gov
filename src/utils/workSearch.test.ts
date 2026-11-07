import { describe, it, expect } from 'vitest';
import { filterActivitiesBySearch, normalizeSearchText } from './workSearch';

const activities = [
  { id: 1, status: 'open', title: { pt: 'Revisar Estatuto' }, description: { pt: 'Ajustar artigos' }, requester: { full_name: 'Maria Souza' } },
  { id: 2, status: 'in_progress', title: { pt: 'Oficina de Capacitação' }, worker: { full_name: 'João Silva' }, executors: [{ full_name: 'Ana Lima' }], project: { name: 'Projeto Aldeia' } },
  { id: 3, status: 'completed', title: 'Plain title', category: { name: { pt: 'Comunicação' } }, protocol: null }
];
const ids = (r: any[]) => r.map((a) => a.id);

describe('workSearch', () => {
  it('normalizes accents and case', () => {
    expect(normalizeSearchText('  Execução ')).toBe('execucao');
  });
  it('returns everything for empty term', () => {
    expect(filterActivitiesBySearch(activities, '  ')).toHaveLength(3);
  });
  it('matches title and description', () => {
    expect(ids(filterActivitiesBySearch(activities, 'estatuto'))).toEqual([1]);
    expect(ids(filterActivitiesBySearch(activities, 'artigos'))).toEqual([1]);
  });
  it('ignores accent and case', () => {
    expect(ids(filterActivitiesBySearch(activities, 'CAPACITACAO'))).toEqual([2]);
    expect(ids(filterActivitiesBySearch(activities, 'comunicacao'))).toEqual([3]);
  });
  it('matches people, project and executors', () => {
    expect(ids(filterActivitiesBySearch(activities, 'maria'))).toEqual([1]);
    expect(ids(filterActivitiesBySearch(activities, 'joao'))).toEqual([2]);
    expect(ids(filterActivitiesBySearch(activities, 'ana lima'))).toEqual([2]);
    expect(ids(filterActivitiesBySearch(activities, 'aldeia'))).toEqual([2]);
  });
  it('requires all terms in any order', () => {
    expect(ids(filterActivitiesBySearch(activities, 'oficina silva'))).toEqual([2]);
    expect(filterActivitiesBySearch(activities, 'oficina maria')).toEqual([]);
  });
  it('matches translated status label', () => {
    const labels: Record<string, string> = { in_progress: 'Em Execução' };
    expect(ids(filterActivitiesBySearch(activities, 'execucao', (s) => labels[s] || ''))).toEqual([2]);
  });
  it('tolerates null input', () => {
    expect(filterActivitiesBySearch(null, 'x')).toEqual([]);
  });
});
