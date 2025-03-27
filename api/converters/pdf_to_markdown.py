from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered

def convert_pdf_to_markdown(pdf_path):
    converter = PdfConverter(
    artifact_dict=create_model_dict(),
    )

    # Run converter on PDF
    rendered = converter(pdf_path)

    # Get text (markdown), images, tables
    markdown_text, _, images = text_from_rendered(rendered)

    return markdown_text, images

