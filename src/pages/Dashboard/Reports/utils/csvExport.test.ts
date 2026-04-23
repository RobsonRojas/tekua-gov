import { describe, it, expect, vi } from 'vitest';
import { downloadCSV } from './csvExport';
import { ContributionReportItem } from '../hooks/useContributionReports';

describe('downloadCSV', () => {
  it('should not do anything if data is empty', () => {
    const createObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    
    downloadCSV([]);
    
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('should generate a CSV blob and trigger download', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:url');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
    
    const mockData: ContributionReportItem[] = [
      {
        id: '1',
        created_at: '2026-04-22',
        description: 'Test contribution',
        amount_suggested: 100,
        status: 'completed',
        user_id: 'user1',
        profiles: { full_name: 'John Doe' }
      }
    ];
    
    // Mock document.createElement and body.appendChild
    const link = {
      href: '',
      download: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
      style: { visibility: '' }
    };
    vi.spyOn(document, 'createElement').mockReturnValue(link as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => link as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => link as any);
    
    downloadCSV(mockData);
    
    expect(createObjectURL).toHaveBeenCalled();
    expect(link.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('contributions_report'));
    expect(link.click).toHaveBeenCalled();
  });
});
