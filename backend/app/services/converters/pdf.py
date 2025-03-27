import tempfile
from typing import Tuple, List, Dict, Any
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered

def convert_pdf_bytes_to_markdown(pdf_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Convert PDF bytes to markdown text with extracted images.
    
    Args:
        pdf_bytes: Raw bytes of the PDF file
        
    Returns:
        Tuple of (markdown_text, images)
    """
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(pdf_bytes)
        tmp_pdf.flush()

        converter = PdfConverter(artifact_dict=create_model_dict())

        # Run converter on the temporary PDF file path
        rendered = converter(tmp_pdf.name)

        # Get text (markdown), images, tables
        markdown_text, tables, images = text_from_rendered(rendered)

    return markdown_text, images