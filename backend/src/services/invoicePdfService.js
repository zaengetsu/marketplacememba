const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Order } = require('../../models');

/**
 * Génère un PDF de facture pour une commande
 * @param {Object} invoice - L'objet Invoice Sequelize
 * @param {Object} order - L'objet Order Sequelize (avec items, user, etc.)
 * @param {Object} options - { outputPath: string }
 * @returns {Promise<string>} Chemin du PDF généré
 */
async function generateInvoicePdf(invoice, order, options = {}) {
  const outputDir = path.join(__dirname, '../../invoices');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `facture-${invoice.id}.pdf`;
  const filePath = path.join(outputDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Facture n°: ${invoice.invoiceNumber}`);
    doc.text(`Date d'émission: ${invoice.issuedAt?.toLocaleDateString?.('fr-FR') || ''}`);
    doc.text(`Commande n°: ${order.id}`);
    doc.moveDown();

    // Infos client
    doc.fontSize(14).text('Client:', { underline: true });
    doc.fontSize(12).text(`${order.billingAddress?.firstName || ''} ${order.billingAddress?.lastName || ''}`);
    doc.text(order.billingAddress?.email || '');
    doc.text(order.billingAddress?.addressLine1 || '');
    doc.text(`${order.billingAddress?.postalCode || ''} ${order.billingAddress?.city || ''}`);
    doc.moveDown();

    // Tableau des articles
    doc.fontSize(14).text('Détail de la commande:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text('Produit', 60, doc.y, { continued: true });
    doc.text('Qté', 250, doc.y, { continued: true });
    doc.text('Prix HT', 300, doc.y, { continued: true });
    doc.text('TVA', 370, doc.y, { continued: true });
    doc.text('Prix TTC', 440, doc.y);
    doc.moveDown(0.5);

    // Pour chaque item (à adapter selon ta structure Order)
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        doc.text(item.productName || item.name, 60, doc.y, { continued: true });
        doc.text(item.quantity, 250, doc.y, { continued: true });
        doc.text(`${item.priceHT?.toFixed(2) || ''} €`, 300, doc.y, { continued: true });
        doc.text(`${item.tva?.toFixed(2) || ''} €`, 370, doc.y, { continued: true });
        doc.text(`${item.priceTTC?.toFixed(2) || ''} €`, 440, doc.y);
      });
    }
    doc.moveDown();

    // Totaux
    doc.fontSize(12).text(`Total HT : ${invoice.totalHT?.toFixed(2) || ''} €`, { align: 'right' });
    doc.text(`TVA : ${invoice.tva?.toFixed(2) || ''} €`, { align: 'right' });
    doc.text(`Total TTC : ${invoice.totalTTC?.toFixed(2) || ''} €`, { align: 'right' });
    doc.moveDown();

    // Footer
    doc.fontSize(10).text('Merci pour votre commande !', { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateInvoicePdf };
