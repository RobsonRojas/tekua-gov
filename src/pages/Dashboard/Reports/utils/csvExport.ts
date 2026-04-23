import type { ContributionReportItem } from '../hooks/useContributionReports';

export const downloadCSV = (data: ContributionReportItem[]) => {
  if (data.length === 0) return;

  const headers = ['ID', 'Data', 'Contribuidor', 'Descrição', 'Valor', 'Status'];
  
  const csvRows = data.map(item => [
    item.id,
    new Date(item.created_at).toISOString(),
    item.profiles?.full_name || 'N/A',
    // Escape quotes and wrap in quotes for CSV
    `"${item.description.replace(/"/g, '""')}"`,
    item.amount_suggested,
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
  link.setAttribute('download', `contributions_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
