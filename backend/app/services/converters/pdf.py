import tempfile
from typing import Tuple, List, Dict, Any
import fitz  # PyMuPDF
from pdf2image import convert_from_bytes
import pytesseract
import base64

def convert_pdf_bytes_to_markdown(pdf_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Convert PDF bytes to markdown text with extracted images.

    Args:
        pdf_bytes: Raw bytes of the PDF file

    Returns:
        Tuple of (markdown_text, images)
    """
    markdown_text = ""
    images = []

    # First attempt: Extract embedded text and images using PyMuPDF (fast)
    with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
        for page_number, page in enumerate(pdf):
            text = page.get_text()
            markdown_text += text + "\n\n"

            # Extract images from the PDF page
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                images.append({
                    "page": page_number + 1,
                    "image_index": img_index,
                    "image_base64": image_base64,
                    "image_ext": image_ext
                })

    # If embedded text extraction yields little content, fallback to OCR (Tesseract)
    if len(markdown_text.strip()) < 100:
        markdown_text = ""
        # Convert PDF pages to images for OCR processing at reduced dpi (faster OCR)
        ocr_images = convert_from_bytes(pdf_bytes, dpi=150)
        for img in ocr_images:
            ocr_text = pytesseract.image_to_string(img)
            markdown_text += ocr_text + "\n\n"

    return markdown_text.strip(), images
