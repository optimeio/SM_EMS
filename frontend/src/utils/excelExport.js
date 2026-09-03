import * as XLSX from 'xlsx';

/**
 * Export JSON array data to a formatted Excel (.xlsx) file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Output filename (e.g. Employee_Directory)
 * @param {String} sheetName - Sheet name
 */
export const exportToExcel = (data, fileName = 'Export_Data', sheetName = 'Records') => {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

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
};
