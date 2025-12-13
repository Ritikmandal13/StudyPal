"""
PDF Parser Module
Extracts text and metadata from PDF files using pdfplumber.
"""

import re
from typing import Dict, List, Optional


class PDFParser:
    """Extract text and metadata from PDF files"""
    
    def __init__(self):
        self.min_text_density = 50  # Minimum chars per page to not be "scanned"
    
    def parse(self, pdf_path: str) -> Dict:
        """
        Parse a PDF file and extract text.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dict with text, metadata, and optional error
        """
        try:
            import pdfplumber
            
            full_text = []
            headings = []
            page_count = 0
            word_count = 0
            
            with pdfplumber.open(pdf_path) as pdf:
                page_count = len(pdf.pages)
                
                # Check page limit
                if page_count > 100:
                    return {
                        'error': 'TOO_MANY_PAGES',
                        'metadata': {'pages': page_count}
                    }
                
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ''
                    
                    # Check for scanned PDF (low text density)
                    if i < 3 and len(page_text.strip()) < self.min_text_density:
                        # First few pages have very little text
                        pass
                    
                    # Extract potential headings (lines in ALL CAPS or starting with numbers)
                    lines = page_text.split('\n')
                    for line in lines:
                        clean_line = line.strip()
                        if self._is_heading(clean_line):
                            headings.append({
                                'text': clean_line,
                                'page': i + 1
                            })
                    
                    full_text.append(page_text)
                    word_count += len(page_text.split())
                
                # Get metadata
                metadata = pdf.metadata or {}
            
            combined_text = '\n\n'.join(full_text)
            
            # Check if document appears to be scanned (very low text)
            if word_count < 100 and page_count > 2:
                return {
                    'error': 'SCANNED_PDF',
                    'metadata': {'pages': page_count, 'words': word_count}
                }
            
            return {
                'text': combined_text,
                'headings': headings,
                'metadata': {
                    'title': metadata.get('Title', ''),
                    'author': metadata.get('Author', ''),
                    'pages': page_count,
                    'wordCount': word_count,
                    'creationDate': str(metadata.get('CreationDate', ''))
                }
            }
            
        except Exception as e:
            # Fallback to PyPDF2
            return self._parse_with_pypdf2(pdf_path)
    
    def _parse_with_pypdf2(self, pdf_path: str) -> Dict:
        """Fallback parser using PyPDF2"""
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(pdf_path)
            page_count = len(reader.pages)
            
            if page_count > 100:
                return {
                    'error': 'TOO_MANY_PAGES',
                    'metadata': {'pages': page_count}
                }
            
            full_text = []
            word_count = 0
            
            for page in reader.pages:
                text = page.extract_text() or ''
                full_text.append(text)
                word_count += len(text.split())
            
            # Get metadata
            meta = reader.metadata or {}
            
            return {
                'text': '\n\n'.join(full_text),
                'headings': [],
                'metadata': {
                    'title': meta.get('/Title', ''),
                    'author': meta.get('/Author', ''),
                    'pages': page_count,
                    'wordCount': word_count
                }
            }
            
        except Exception as e:
            return {
                'error': f'PARSING_FAILED: {str(e)}',
                'metadata': {}
            }
    
    def _is_heading(self, text: str) -> bool:
        """Check if a line is likely a heading"""
        if not text or len(text) > 100:
            return False
        
        # Check for common heading patterns
        patterns = [
            r'^[A-Z][A-Z\s]{5,}$',  # ALL CAPS
            r'^(?:Chapter|Section|Part)\s+\d+',  # Chapter/Section numbers
            r'^\d+\.\s+[A-Z]',  # Numbered headings
            r'^[IVX]+\.\s+',  # Roman numerals
        ]
        
        for pattern in patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return True
        
        return False

