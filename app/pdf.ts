import { formatCurrency } from './calculations';
import { SavedQuote } from './types';

declare const jspdf: any;

export const generateQuotePDF = (quote: SavedQuote) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#4f46e5');
    doc.text('VOXAREL', margin, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#1f2937');
    doc.text('Voxarel Logistics\nDubai, United Arab Emirates\ncontact@voxarel.com', margin, 28);

    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth - margin, 35, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quote #: ${quote.quoteNo}`, pageWidth - margin, 45, { align: 'right' });
    doc.text(`Date: ${new Date(quote.date).toLocaleDateString()}`, pageWidth - margin, 50, { align: 'right' });
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, pageWidth - margin, 55, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(margin, 70, pageWidth - margin, 70);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BILL TO:', margin, 80);
    doc.text('SHIPMENT INFO:', pageWidth / 2, 80);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const clientDetails = [
        quote.formData.name,
        quote.formData.contactNumber,
        quote.formData.email,
        `Pickup: ${quote.formData.pickupLocation}`,
    ].filter(Boolean).join('\n');
    doc.text(clientDetails, margin, 86);

    const shipmentDetails = [
        `Service: ${quote.formData.modeOfService}`,
        `Goods: ${quote.formData.typeOfGoods}`,
        `Destination: ${quote.formData.deliveryLocation}, ${quote.formData.deliveryCity}, ${quote.formData.deliveryCountry}`,
        quote.formData.transitTime ? `Transit Time: ${quote.formData.transitTime}` : '',
    ].filter(Boolean).join('\n');
    doc.text(shipmentDetails, pageWidth / 2, 86);

    let tableStartY = 115;

    if (quote.formData.inclusions && quote.formData.inclusions.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('INCLUSIONS:', margin, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const inclusionsText = quote.formData.inclusions.map(inc => `• ${inc}`).join('\n');
        doc.text(inclusionsText, margin, 111);
        const textHeight = doc.getTextDimensions(inclusionsText).h;
        tableStartY = 111 + textHeight + 5;
    }

    const tableHeaders = [
        'Item #',
        'Description',
        'Dimensions',
        'Actual Wt',
        'Vol. Wt',
        'Billed Wt',
        'Qty',
        'Rate/kg',
        'Packing',
        'Handling',
        'Duty',
        'Line Total (AED)',
    ];

    const tableBody = quote.items.map(item => [
        item.itemNumber,
        item.description,
        `${item.length}x${item.breadth}x${item.height} cm`,
        `${item.actualWeight.toFixed(2)} kg`,
        `${item.volumetricWeight.toFixed(2)} kg`,
        `${item.billedWeight.toFixed(2)} kg`,
        item.quantity,
        item.ratePerKg.toFixed(2),
        item.packingCharge.toFixed(2),
        item.handlingCharge.toFixed(2),
        item.duty.toFixed(2),
        item.lineTotal.toFixed(2),
    ]);

    (doc as any).autoTable({
        startY: tableStartY,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: '#4f46e5', textColor: 255, fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 11: { halign: 'right' } },
        didParseCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 11) {
                data.cell.styles.halign = 'right';
            }
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    const totalsX = pageWidth - margin - 60;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const subtotalY = finalY + 10;
    const grandTotalY = subtotalY + 10;

    doc.text('Subtotal:', totalsX, subtotalY, { align: 'right' });
    doc.text(formatCurrency(quote.totals.subtotal), pageWidth - margin, subtotalY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', totalsX, grandTotalY, { align: 'right' });
    doc.text(formatCurrency(quote.totals.grandTotal), pageWidth - margin, grandTotalY, { align: 'right' });

    const footerY = pageHeight - 30;
    doc.setLineWidth(0.2);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#6b7280');
    doc.text('Terms & Conditions:', margin, footerY + 5);
    doc.text('1. All charges are in AED. | 2. Transit time is an estimate and not guaranteed.', margin, footerY + 9);
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 20, { align: 'center' });

    doc.save(`Quotation-${quote.quoteNo}.pdf`);
};
