import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface PDFClient {
  name: string;
  company: string;
  email: string;
  phone?: string;
}

interface PDFContract {
  startDate: string;
  endDate: string;
  monthlyRate: number;
}

export async function generateAgreementPdf(
  client: PDFClient,
  contract: PDFContract,
  spaceName: string,
  branchName: string,
  signatureDataUrl?: string
): Promise<string> {
  // 1. Create a new document
  const pdfDoc = await PDFDocument.create();
  
  // 2. Add an A4 size page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
  const { width, height } = page.getSize();
  
  // 3. Embed standard fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // 4. Drawing variables
  let yPosition = height - 60;
  const margin = 50;
  
  // Title / Header
  page.drawText("CONEXUS WORKSPACE LICENSE AGREEMENT", {
    x: margin,
    y: yPosition,
    size: 16,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15), // navy
  });
  
  yPosition -= 15;
  // Divider line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1.5,
    color: rgb(0.23, 0.51, 0.96), // brand blue
  });
  
  yPosition -= 35;
  
  // Introduction Text
  const introText = 
    `This legally binding Workspace License Agreement is executed on ${new Date().toLocaleDateString()} between CoNexus Coworking Operating Services ("Licensor") and the corporate entity/individual named below ("Licensee") for the usage of specified coworking desks, offices, or facilities.`;
  
  // Draw wrapped paragraph
  page.drawText(introText, {
    x: margin,
    y: yPosition,
    size: 10,
    font: fontHelvetica,
    lineHeight: 14,
    maxWidth: width - 2 * margin,
    color: rgb(0.18, 0.25, 0.35),
  });
  
  yPosition -= 65;
  
  // SECTION 1: LICENSEE DETAILS
  page.drawText("1. LICENSEE DETAILS & REPRESENTATION", {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  yPosition -= 18;
  
  const licenseeDetails = [
    ["Representative Name:", client.name],
    ["Company Name:", client.company],
    ["Contact Email:", client.email],
    ["Contact Phone:", client.phone || "Not Provided"],
  ];
  
  licenseeDetails.forEach(([label, value]) => {
    page.drawText(label, { x: margin + 10, y: yPosition, size: 10, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
    page.drawText(value, { x: margin + 150, y: yPosition, size: 10, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    yPosition -= 15;
  });
  
  yPosition -= 20;
  
  // SECTION 2: WORKSPACE & FEE MATRIX
  page.drawText("2. LICENSED WORKSPACE & LEASING FEE", {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  yPosition -= 18;
  
  const workspaceDetails = [
    ["Center Branch Location:", branchName],
    ["Designated Space Inventory:", spaceName],
    ["Contract Term Commencement:", new Date(contract.startDate).toLocaleDateString()],
    ["Contract Term Expiration:", new Date(contract.endDate).toLocaleDateString()],
    ["Recurring Monthly License Fee:", `INR ${contract.monthlyRate.toLocaleString()} (Excl. taxes)`],
  ];
  
  workspaceDetails.forEach(([label, value]) => {
    page.drawText(label, { x: margin + 10, y: yPosition, size: 10, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
    page.drawText(value, { x: margin + 200, y: yPosition, size: 10, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    yPosition -= 15;
  });
  
  yPosition -= 25;
  
  // SECTION 3: CORE COVENANTS
  page.drawText("3. CORE LICENSING COVENANTS", {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  yPosition -= 15;
  
  const covenants = [
    "• Licensee is entitled to exclusive seating/usage rights for the specified space. Subleasing is strictly forbidden.",
    "• Invoices are raised 5 days prior to the calendar month start. Unpaid balances beyond 10 days risk access revocation.",
    "• Licensor reserves the right to adjust center layouts, hours of operations, and community guidelines with 14-days notice.",
    "• Either party may terminate this license at expiration or by writing notice 30 days prior to contract termination.",
  ];
  
  covenants.forEach((bullet) => {
    page.drawText(bullet, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: fontHelvetica,
      maxWidth: width - 2 * margin - 10,
      lineHeight: 13,
      color: rgb(0.25, 0.33, 0.45),
    });
    yPosition -= 26;
  });
  
  yPosition -= 25;
  
  // SECTION 4: SIGNATURES
  page.drawText("4. EXECUTION OF SIGNATURES", {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  yPosition -= 35;
  
  // Draw signature boxes
  page.drawText("CoNexus Operating Officer (Licensor)", {
    x: margin + 10,
    y: yPosition,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(0.18, 0.25, 0.35),
  });
  
  page.drawText("Licensee Authorized Representative", {
    x: margin + 250,
    y: yPosition,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(0.18, 0.25, 0.35),
  });
  
  yPosition -= 40;
  
  // Draw lines where signatures go
  page.drawLine({
    start: { x: margin + 10, y: yPosition },
    end: { x: margin + 180, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawLine({
    start: { x: margin + 250, y: yPosition },
    end: { x: margin + 450, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  yPosition -= 15;
  
  page.drawText("Authorized Signatory\nDate: " + new Date().toLocaleDateString(), {
    x: margin + 10,
    y: yPosition,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(`Signed By: ${client.name}\nDate: ` + new Date().toLocaleDateString(), {
    x: margin + 250,
    y: yPosition,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // 5. Embed Client Hand-drawn Signature if available
  if (signatureDataUrl) {
    try {
      const base64Data = signatureDataUrl.split(",")[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const signatureImage = await pdfDoc.embedPng(imageBytes);
      
      // Draw signature above the line
      page.drawImage(signatureImage, {
        x: margin + 270,
        y: yPosition + 25,
        width: 120,
        height: 40,
      });
    } catch (e) {
      console.error("Failed to embed signature in agreement PDF:", e);
    }
  }

  // 6. Save document bytes
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

interface PDFInvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export async function generateInvoicePdf(
  client: { name: string; company: string; email: string; phone?: string },
  invoice: { id: string; amount: number; tax: number; dueDate: string; lineItems: PDFInvoiceItem[]; createdAt: string }
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = height - 60;
  const margin = 50;
  
  // Header Logo / Name
  page.drawText("CONEXUS COWORKING", {
    x: margin,
    y: yPosition,
    size: 16,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  page.drawText("INVOICE", {
    x: width - margin - 80,
    y: yPosition,
    size: 18,
    font: fontHelveticaBold,
    color: rgb(0.23, 0.51, 0.96),
  });
  
  yPosition -= 15;
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1.5,
    color: rgb(0.23, 0.51, 0.96),
  });
  
  yPosition -= 35;
  
  // Invoice Meta
  page.drawText(`Invoice Ref: #${invoice.id.toUpperCase().substring(0, 8)}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.06, 0.09, 0.15),
  });
  
  page.drawText(`Issued: ${new Date(invoice.createdAt).toLocaleDateString()}`, {
    x: width - margin - 150,
    y: yPosition,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.25, 0.33, 0.45),
  });
  
  yPosition -= 15;
  
  page.drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
    x: width - margin - 150,
    y: yPosition,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(0.94, 0.31, 0.31),
  });
  
  yPosition -= 10;
  
  // Billed To Section
  page.drawText("BILLED TO:", {
    x: margin,
    y: yPosition,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.18, 0.25, 0.35),
  });
  
  yPosition -= 16;
  page.drawText(client.company, { x: margin, y: yPosition, size: 11, font: fontHelveticaBold, color: rgb(0.06, 0.09, 0.15) });
  yPosition -= 14;
  page.drawText(`Attn: ${client.name}`, { x: margin, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.25, 0.33, 0.45) });
  yPosition -= 12;
  page.drawText(client.email, { x: margin, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.25, 0.33, 0.45) });
  if (client.phone) {
    yPosition -= 12;
    page.drawText(client.phone, { x: margin, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.25, 0.33, 0.45) });
  }
  
  yPosition -= 40;
  
  // Table Headers
  page.drawText("Item Description", { x: margin + 10, y: yPosition, size: 9, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
  page.drawText("Qty", { x: margin + 270, y: yPosition, size: 9, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
  page.drawText("Unit Price", { x: margin + 330, y: yPosition, size: 9, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
  page.drawText("Total (INR)", { x: width - margin - 70, y: yPosition, size: 9, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
  
  yPosition -= 6;
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  yPosition -= 18;
  
  // Render line items
  invoice.lineItems.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    page.drawText(item.description, { x: margin + 10, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    page.drawText(item.quantity.toString(), { x: margin + 270, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    page.drawText(`INR ${item.price.toLocaleString()}`, { x: margin + 330, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    page.drawText(`INR ${itemTotal.toLocaleString()}`, { x: width - margin - 70, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
    yPosition -= 20;
  });
  
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 0.8,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  yPosition -= 25;
  
  // Subtotal & Totals calculations
  const subtotal = invoice.amount;
  const taxAmount = invoice.tax;
  const totalDue = subtotal + taxAmount;
  
  // Draw totals on the right side
  page.drawText("Subtotal:", { x: width - margin - 180, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.25, 0.33, 0.45) });
  page.drawText(`INR ${subtotal.toLocaleString()}`, { x: width - margin - 70, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
  
  yPosition -= 15;
  page.drawText("Tax (18% GST):", { x: width - margin - 180, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.25, 0.33, 0.45) });
  page.drawText(`INR ${taxAmount.toLocaleString()}`, { x: width - margin - 70, y: yPosition, size: 9, font: fontHelvetica, color: rgb(0.06, 0.09, 0.15) });
  
  yPosition -= 20;
  page.drawLine({
    start: { x: width - margin - 190, y: yPosition + 5 },
    end: { x: width - margin, y: yPosition + 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  page.drawText("TOTAL DUE:", { x: width - margin - 180, y: yPosition, size: 10, font: fontHelveticaBold, color: rgb(0.06, 0.09, 0.15) });
  page.drawText(`INR ${totalDue.toLocaleString()}`, {
    x: width - margin - 70,
    y: yPosition,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.23, 0.51, 0.96),
  });
  
  yPosition -= 80;
  
  // Footer terms
  page.drawText("Payment Terms & Instructions:", { x: margin, y: yPosition, size: 9, font: fontHelveticaBold, color: rgb(0.18, 0.25, 0.35) });
  yPosition -= 14;
  page.drawText("Please wire transfers directly to the CoNexus corporate bank routing details listed in your client dashboard.", {
    x: margin,
    y: yPosition,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 12;
  page.drawText("Late payments are subject to a 1.5% interest rate surcharge compounded weekly.", {
    x: margin,
    y: yPosition,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

