from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


def export_pdf(markdown_text: str, output_path: str):
    """Lightweight markdown -> PDF export. Handles #/## headers and plain
    paragraphs well; table rows are rendered as readable text lines rather
    than a real PDF table. Good enough for a hackathon demo deliverable —
    swap in a proper markdown-to-pdf library later if you want polished tables.
    """
    doc = SimpleDocTemplate(
        output_path, pagesize=LETTER, topMargin=0.75 * inch, bottomMargin=0.75 * inch
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], spaceAfter=10)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], spaceAfter=8)
    body = ParagraphStyle("Body", parent=styles["BodyText"], spaceAfter=4)

    story = []
    for raw_line in markdown_text.split("\n"):
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 8))
        elif line.startswith("# "):
            story.append(Paragraph(line[2:], h1))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:], h2))
        elif line.startswith("|"):
            story.append(Paragraph(line.replace("|", " &nbsp;|&nbsp; "), body))
        else:
            story.append(Paragraph(line, body))

    doc.build(story)
