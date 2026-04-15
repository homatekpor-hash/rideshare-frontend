import jsPDF from 'jspdf';

export const generateReceipt = (booking) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RYDE GHANA', 105, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Trip Receipt', 105, 30, { align: 'center' });

  // Receipt info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT DETAILS', 20, 55);
  doc.setDrawColor(52, 168, 83);
  doc.setLineWidth(0.5);
  doc.line(20, 58, 190, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const details = [
    ['Receipt No:', `RYD-${booking.id}-${Date.now().toString().slice(-4)}`],
    ['Date:', new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
    ['Time:', new Date().toLocaleTimeString()],
    ['Booking ID:', `#${booking.id}`],
    ['Status:', booking.booking_status?.toUpperCase() || 'COMPLETED'],
  ];

  let y = 68;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 80, y);
    y += 10;
  });

  // Trip details
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TRIP DETAILS', 20, y);
  doc.line(20, y + 3, 190, y + 3);
  y += 13;

  doc.setFontSize(10);
  const tripDetails = [
    ['Passenger:', booking.passenger_name || 'N/A'],
    ['Driver:', booking.driver_name || 'N/A'],
    ['From:', booking.from_location || 'N/A'],
    ['To:', booking.to_location || 'N/A'],
    ['Departure:', booking.departure_time || 'N/A'],
    ['Vehicle:', `${booking.vehicle_color || ''} ${booking.vehicle_model || ''} ${booking.vehicle_number || ''}`.trim() || 'N/A'],
  ];

  tripDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 80, y);
    y += 10;
  });

  // Payment
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PAYMENT SUMMARY', 20, y);
  doc.line(20, y + 3, 190, y + 3);
  y += 13;

  doc.setFillColor(240, 253, 244);
  doc.rect(15, y - 5, 180, 30, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Fare:', 20, y + 5);
  doc.text(`GH₵ ${booking.price}`, 80, y + 5);
  doc.text('Payment Method:', 20, y + 15);
  doc.text('Mobile Money (Paystack)', 80, y + 15);

  y += 35;
  doc.setFillColor(26, 26, 46);
  doc.rect(15, y - 5, 180, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: GH₵ ${booking.price}`, 105, y + 8, { align: 'center' });

  // Footer
  y += 30;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for riding with Ryde Ghana! 🇬🇭', 105, y, { align: 'center' });
  doc.text('For support: support@ryde.com.gh | www.ryde.com.gh', 105, y + 8, { align: 'center' });
  doc.text('This is an electronically generated receipt.', 105, y + 16, { align: 'center' });

  // Save
  doc.save(`Ryde-Receipt-${booking.id}.pdf`);
};