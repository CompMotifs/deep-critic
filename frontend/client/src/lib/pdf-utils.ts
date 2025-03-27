import { PDFDocumentProxy } from 'pdfjs-dist';

declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (source: { url: string }) => Promise<PDFDocumentProxy>;
    }
  }
}

export const extractPdfTextContent = async (file: File): Promise<string> => {
  try {
    // Load pdfjs dynamically
    await import('pdfjs-dist/build/pdf');
    await import('pdfjs-dist/build/pdf.worker.entry');
    
    const fileUrl = URL.createObjectURL(file);
    const loadingTask = window.pdfjsLib.getDocument({ url: fileUrl });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up
    URL.revokeObjectURL(fileUrl);
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const preparePdfPreview = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result.toString());
      } else {
        reject(new Error('Failed to read PDF file'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
