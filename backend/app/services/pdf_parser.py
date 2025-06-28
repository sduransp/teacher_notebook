from typing import List, Dict, IO
import pdfplumber

def parse_students_from_pdf(file_stream: IO[bytes]) -> List[Dict]:
    """
    Open a PDF stream and extract student names.
    Returns a list of dicts with 'id' and 'full_name'.

    :param file_stream: binary stream of the PDF (e.g., UploadFile.file in FastAPI)
    :return: list of {'id': int, 'full_name': str}
    """
    students = []
    with pdfplumber.open(file_stream) as pdf:
        current_id = 1
        for page in pdf.pages:
            # extract plain text (best for line-by-line parsing)
            text = page.extract_text(layout=False)
            if not text:
                continue
            # split into lines and trim whitespace
            for line in text.splitlines():
                name = line.strip()
                if name:
                    students.append({
                        "id": current_id,
                        "full_name": name
                    })
                    current_id += 1
    return students


