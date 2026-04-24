import { describe, it, expect, vi } from 'vitest';
import { downloadCSV } from './csvExport';
import type { ActivityReportItem } from '../hooks/useActivityReports';

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
    
    const mockData: ActivityReportItem[] = [
      {
        id: '1',
        created_at: '2026-04-22',
        type: 'contribution',
        title: { pt: 'Teste', en: 'Test' },
        description: { pt: 'Desc Teste', en: 'Test Desc' },
        reward_amount: 100,
        status: 'completed',
        worker_id: 'user1',
        worker: { full_name: 'John Doe' },
        requester_id: null
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
    expect(link.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('activities_report'));
    expect(link.click).toHaveBeenCalled();
  });
});
