/**
 * Export utility functions for generating CSV, PDF, XLSX, and JSON exports.
 */

import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Convert an array of objects to CSV string.
 */
export function toCSV(data: Record<string, any>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => `"${c.label}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\r\n');
}

/**
 * Generate a PDF document as a Buffer from tabular data.
 */
export async function toPDF(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  title: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const margin = 40;
  const usableWidth = width - margin * 2;
  const rowHeight = 18;
  const headerHeight = 22;
  const colWidth = usableWidth / columns.length;

  let y = height - margin;

  // Title
  page.drawText(title, {
    x: margin,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 28;

  // Subtitle with date
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: margin,
    y,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 20;

  // Table header
  const headerY = y;
  page.drawRectangle({
    x: margin,
    y: headerY - headerHeight,
    width: usableWidth,
    height: headerHeight,
    color: rgb(0.85, 0.85, 0.85),
  });
  columns.forEach((col, i) => {
    page.drawText(col.label, {
      x: margin + i * colWidth + 4,
      y: headerY - 16,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
  });
  y -= headerHeight;

  // Table rows
  for (const row of data) {
    if (y - rowHeight < margin) {
      // New page
      page = pdfDoc.addPage([612, 792]);
      y = height - margin;
    }

    let maxLines = 1;
    const cells = columns.map((col) => {
      const val = row[col.key];
      const text = val === null || val === undefined ? '' : String(val);
      const lines = wrapText(text, colWidth - 8, font, 8);
      if (lines.length > maxLines) maxLines = lines.length;
      return lines;
    });

    const cellHeight = Math.max(rowHeight, maxLines * 12 + 4);

    // Alternate row background
    if (data.indexOf(row) % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: y - cellHeight,
        width: usableWidth,
        height: cellHeight,
        color: rgb(0.95, 0.95, 0.97),
      });
    }

    cells.forEach((lines, i) => {
      lines.forEach((line, li) => {
        page.drawText(line, {
          x: margin + i * colWidth + 4,
          y: y - 12 - li * 12,
          size: 8,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
    });

    y -= cellHeight;
  }

  // Footer
  page.drawText(`Page ${pdfDoc.getPageCount()} | ${data.length} records`, {
    x: margin,
    y: 20,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate an XLSX workbook as a Buffer from tabular data.
 */
export function toXLSX(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  sheetName: string = 'Sheet1'
): Buffer {
  const headerRow = columns.map((c) => c.label);
  const dataRows = data.map((row) => columns.map((c) => row[c.key] ?? ''));
  const wsData = [headerRow, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  const colWidths = columns.map((col, idx) => {
    const maxLen = Math.max(
      col.label.length,
      ...data.map((row) => {
        const val = row[col.key];
        return val ? String(val).length : 0;
      })
    );
    return { wch: Math.min(maxLen + 3, 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Convert data to JSON string.
 */
export function toJSON(data: Record<string, any>[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * MIME types for download.
 */
export const MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  json: 'application/json',
};

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  // Simple word-wrap heuristic based on char count
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    if (current.length >= charsPerLine) {
      lines.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

/**
 * Get a filename for download with the current timestamp.
 */
export function getExportFilename(baseName: string, ext: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${baseName}_${date}.${ext}`;
}