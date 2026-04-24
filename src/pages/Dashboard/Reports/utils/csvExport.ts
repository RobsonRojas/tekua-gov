import type { ActivityReportItem } from '../hooks/useActivityReports';

export const downloadCSV = (data: ActivityReportItem[]) => {
  if (data.length === 0) return;

  const headers = ['ID', 'Data', 'Tipo', 'Membro', 'Título', 'Valor ($S)', 'Status'];
  
  const csvRows = data.map(item => [
    item.id,
    new Date(item.created_at).toISOString(),
    item.type,
    item.worker?.full_name || item.requester?.full_name || 'N/A',
    // Escape quotes and wrap in quotes for CSV. Title is JSONB, use pt as default for CSV or current lang if possible
    `"${(item.title?.pt || item.title?.en || 'N/A').toString().replace(/"/g, '""')}"`,
    item.reward_amount,
    item.status
  ]);

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `activities_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
