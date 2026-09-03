import * as XLSX from 'xlsx';

/**
 * Export JSON array data to a formatted Excel (.xlsx) file with fallback to CSV
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Output filename (e.g. Attendance_Report)
 * @param {String} sheetName - Sheet name
 */
export const exportToExcel = (data, fileName = 'Export_Data', sheetName = 'Records') => {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  try {
    // Generate worksheet from data objects
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Compute optimal column widths
    const columnWidths = Object.keys(data[0] || {}).map((key) => {
      let maxLength = key.length;
      data.forEach((row) => {
        const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
        if (val.length > maxLength) maxLength = val.length;
      });
      return { wch: Math.min(Math.max(maxLength + 4, 12), 60) };
    });

    worksheet['!cols'] = columnWidths;

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Trigger browser download of .xlsx file
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (err) {
    console.error('XLSX Export error, using CSV fallback', err);
    exportToCSV(data, fileName);
  }
};

/**
 * Fallback CSV Exporter (opens natively in Excel)
 */
export const exportToCSV = (data, fileName = 'Export_Data') => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach((row) => {
    const values = headers.map((header) => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
