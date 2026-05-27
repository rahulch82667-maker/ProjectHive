import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { IOrder } from '../models/Order';
import { IProject } from '../models/Project';

// Helper to convert hex color string to pdf-lib rgb()
const hex = (h: string) => {
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

/**
 * Generates a professional PDF Invoice as a Buffer in-memory using pdf-lib.
 * pdf-lib is a pure JavaScript library — no file-system font dependencies,
 * fully compatible with Next.js API routes.
 */
export const generateInvoicePDF = async (order: IOrder, project: IProject): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  // Embed standard fonts (bundled in pdf-lib — no external files needed)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Color palette
  const brown = hex('#3B1F0A');
  const dark = hex('#111827');
  const mid = hex('#374151');
  const light = hex('#6B7280');
  const green = hex('#10B981');
  const bgGray = hex('#F3F4F6');
  const lineColor = hex('#E5E7EB');

  const margin = 50;
  const pageW = width;

  // ── Helper: draw text ──────────────────────────────────────────────────────
  const drawText = (
    text: string,
    x: number,
    y: number,
    opts: { font?: typeof fontBold; size?: number; color?: ReturnType<typeof rgb>; maxWidth?: number } = {}
  ) => {
    page.drawText(String(text), {
      x,
      y: height - y, // pdf-lib origin is bottom-left; invert Y
      font: opts.font ?? fontRegular,
      size: opts.size ?? 9,
      color: opts.color ?? dark,
      maxWidth: opts.maxWidth,
    });
  };

  // ── Helper: draw horizontal line ───────────────────────────────────────────
  const drawLine = (y: number, color = lineColor, thickness = 0.75) => {
    page.drawLine({
      start: { x: margin, y: height - y },
      end:   { x: pageW - margin, y: height - y },
      thickness,
      color,
    });
  };

  // ── Helper: draw filled rectangle ─────────────────────────────────────────
  const drawRect = (x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) => {
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1. HEADER
  // ─────────────────────────────────────────────────────────────────────────
  drawText('ProjectHive', margin, 55, { font: fontBold, size: 22, color: dark });
  drawText('Premium Code & Video Template Marketplace', margin, 78, { size: 8.5, color: light });
  drawText('support@projecthive.com  |  www.projecthive.com', margin, 91, { size: 8.5, color: light });

  // INVOICE label (right-aligned)
  const invoiceLabel = 'INVOICE';
  const invoiceLabelW = fontBold.widthOfTextAtSize(invoiceLabel, 20);
  drawText(invoiceLabel, pageW - margin - invoiceLabelW, 55, { font: fontBold, size: 20, color: brown });

  const invoiceNo = `Invoice No: INV-${order._id.toString().substring(0, 8).toUpperCase()}`;
  const invoiceNoW = fontRegular.widthOfTextAtSize(invoiceNo, 8.5);
  drawText(invoiceNo, pageW - margin - invoiceNoW, 78, { size: 8.5, color: mid });

  const dateStr = `Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`;
  const dateStrW = fontRegular.widthOfTextAtSize(dateStr, 8.5);
  drawText(dateStr, pageW - margin - dateStrW, 91, { size: 8.5, color: mid });

  const paidLabel = 'Status: PAID';
  const paidLabelW = fontBold.widthOfTextAtSize(paidLabel, 8.5);
  drawText(paidLabel, pageW - margin - paidLabelW, 104, { font: fontBold, size: 8.5, color: green });

  // Divider
  drawLine(118, lineColor, 1);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. BILL TO (left column)
  // ─────────────────────────────────────────────────────────────────────────
  drawText('Bill To:', margin, 138, { font: fontBold, size: 10.5, color: dark });
  const payeeName = `${order.billingDetails.firstName} ${order.billingDetails.lastName}`;
  drawText(payeeName, margin, 154, { font: fontBold, size: 9.5, color: mid });
  drawText(order.billingDetails.email, margin, 167, { size: 9, color: light });

  let curY = 180;
  if (order.billingDetails.companyName) {
    drawText(order.billingDetails.companyName, margin, curY, { size: 9, color: mid });
    curY += 13;
  }
  drawText(order.billingDetails.addressLine1, margin, curY, { size: 9, color: mid }); curY += 13;
  if (order.billingDetails.addressLine2) {
    drawText(order.billingDetails.addressLine2, margin, curY, { size: 9, color: mid }); curY += 13;
  }
  drawText(`${order.billingDetails.city}, ${order.billingDetails.state} - ${order.billingDetails.zipCode}`, margin, curY, { size: 9, color: mid }); curY += 13;
  drawText(order.billingDetails.country, margin, curY, { size: 9, color: mid }); curY += 15;
  if (order.billingDetails.gstin) {
    drawText(`GSTIN: ${order.billingDetails.gstin}`, margin, curY, { font: fontBold, size: 9, color: mid });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PAYMENT METHOD (right column)
  // ─────────────────────────────────────────────────────────────────────────
  const rightCol = 320;
  drawText('Payment Method:', rightCol, 138, { font: fontBold, size: 10.5, color: dark });
  drawText('Stripe Checkout Secure Payment', rightCol, 154, { size: 9, color: mid, maxWidth: 210 });
  drawText('Currency: USD (United States Dollar)', rightCol, 167, { size: 9, color: mid, maxWidth: 210 });
  drawText('Transaction Session ID:', rightCol, 180, { size: 9, color: mid });
  drawText(order.stripeSessionId, rightCol, 193, { font: fontOblique, size: 7.5, color: light, maxWidth: 210 });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ITEMS TABLE
  // ─────────────────────────────────────────────────────────────────────────
  const tableTop = 268;

  // Table header background
  drawRect(margin, tableTop, pageW - margin * 2, 24, bgGray);

  drawText('Description / Item', margin + 5, tableTop + 7, { font: fontBold, size: 9, color: mid });
  drawText('Qty', pageW - margin - 170, tableTop + 7, { font: fontBold, size: 9, color: mid });
  drawText('Rate', pageW - margin - 110, tableTop + 7, { font: fontBold, size: 9, color: mid });
  drawText('Amount', pageW - margin - 55, tableTop + 7, { font: fontBold, size: 9, color: mid });

  drawLine(tableTop + 24, lineColor, 0.75);

  // Item row
  const amountStr = `USD ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  drawText(project.title, margin + 5, tableTop + 38, { size: 9, color: dark, maxWidth: 260 });
  drawText('1', pageW - margin - 165, tableTop + 38, { size: 9, color: dark });
  drawText(amountStr, pageW - margin - 120, tableTop + 38, { size: 9, color: dark });
  drawText(amountStr, pageW - margin - 65, tableTop + 38, { size: 9, color: dark });

  drawLine(tableTop + 60, lineColor, 0.75);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. TOTALS SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  const summaryTop = tableTop + 76;
  drawText('Subtotal:', pageW - margin - 160, summaryTop, { size: 9, color: light });
  drawText(amountStr, pageW - margin - 65, summaryTop, { size: 9, color: dark });

  drawText('Tax (GST 0%):', pageW - margin - 160, summaryTop + 14, { size: 9, color: light });
  drawText('USD 0.00', pageW - margin - 65, summaryTop + 14, { size: 9, color: dark });

  drawLine(summaryTop + 28, lineColor, 0.75);

  drawText('Total Paid:', pageW - margin - 160, summaryTop + 42, { font: fontBold, size: 10.5, color: brown });
  drawText(amountStr, pageW - margin - 75, summaryTop + 42, { font: fontBold, size: 10.5, color: brown });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. FOOTER
  // ─────────────────────────────────────────────────────────────────────────
  drawLine(680, lineColor, 0.75);
  drawText(
    'Thank you for purchasing from ProjectHive. This is an electronically generated receipt which does not require a physical signature.',
    margin, 695, { font: fontOblique, size: 7.5, color: light, maxWidth: pageW - margin * 2 }
  );
  drawText(
    'For queries or support, please visit support.projecthive.com or email support@projecthive.com.',
    margin, 708, { font: fontOblique, size: 7.5, color: light, maxWidth: pageW - margin * 2 }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 7. SERIALIZE
  // ─────────────────────────────────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
