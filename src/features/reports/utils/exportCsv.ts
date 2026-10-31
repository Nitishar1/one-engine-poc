type Cell = string | number;

/** Escapes a value for CSV and neutralises spreadsheet formula injection. */
const escapeCell = (value: Cell) => {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function exportCsv(fileName: string, header: string[], rows: Cell[][]) {
  const csv = [header, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n');
  // Prefix a BOM so Excel detects UTF-8.
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
