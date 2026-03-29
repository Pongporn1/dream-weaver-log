import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportElementToPDF = async (
  element: HTMLElement,
  filename: string = 'dream-book.pdf'
) => {
  try {
    // Add a temporary class in case we want to customize specific print styles
    element.classList.add('pdf-export-mode');
    
    // Backup the original styles if we need to modify them for capturing
    const originalStyle = element.style.cssText;
    
    // Optional: Force a specific width for consistent PDF layout
    element.style.width = '800px'; 
    element.style.maxWidth = 'none';
    
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: true, 
      logging: false,
      backgroundColor: '#1E1E2E', // Match a dark theme or light theme background
      windowWidth: 800,
    });

    // Restore original styles
    element.classList.remove('pdf-export-mode');
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    // A4 proportions (210 x 297 mm)
    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if the content implies scrolling
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
