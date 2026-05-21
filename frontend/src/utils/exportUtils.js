/**
 * CSV and Print exporter utility.
 * Handles downloading tables to CSV and generating printable clean pages.
 */

// Export an array of objects to a downloadable CSV file
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  
  const bodyRows = data.map(row => {
    return headers.map(h => {
      let value = '';
      if (h.derived && typeof h.getValue === 'function') {
        value = h.getValue(row);
      } else {
        value = row[h.name] !== undefined && row[h.name] !== null ? row[h.name] : '';
      }
      // Clean cell values of any quotes and format
      const cell = String(value).replace(/"/g, '""');
      return `"${cell}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...bodyRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generates printable window frame containing a clean tabular layout
export const printReport = (data, headers, title = 'Report') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const style = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
      h1 { margin-bottom: 20px; color: #0f172a; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
      th { background-color: #f8fafc; font-weight: bold; color: #475569; }
      tr:nth-child(even) { background-color: #f8fafc; }
      .footer { margin-top: 30px; font-size: 10px; color: #64748b; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
  `;

  const headerCells = headers.map(h => `<th>${h.label}</th>`).join('');
  const rows = data.map(row => {
    const cells = headers.map(h => {
      const val = h.derived && typeof h.getValue === 'function' 
        ? h.getValue(row) 
        : (row[h.name] !== undefined && row[h.name] !== null ? row[h.name] : '');
      return `<td>${val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print ${title}</title>
        ${style}
      </head>
      <body>
        <h1>Airport Management System - ${title} Report</h1>
        <table>
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          Generated on: ${new Date().toLocaleString()} | Powered by Airport Management System
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
