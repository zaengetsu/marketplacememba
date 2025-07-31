const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateInvoicePDF(order, invoice, user) {
  const fileName = `facture-${invoice.id}.pdf`; 
  const filePath = path.join(__dirname, '../../invoices', fileName);

  // Crée le dossier invoices s'il n'existe pas
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Facture', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Facture n°: ${invoice.invoiceNumber}`);
    doc.text(`Commande n°: ${order.id}`);
    doc.text(`Client: ${user.firstName} ${user.lastName} (${user.email})`);
    doc.text(`Montant: ${invoice.amount} €`);
    doc.text(`Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Merci pour votre achat !');

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = generateInvoicePDF;