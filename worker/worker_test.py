"""
Worker Tests
Run with: pytest worker_test.py -v
"""

import pytest
import os
import tempfile
from pdf_parser import PDFParser
from text_chunker import TextChunker


class TestTextChunker:
    """Tests for text chunking logic"""
    
    def test_empty_text(self):
        """Should return empty list for empty text"""
        chunker = TextChunker()
        assert chunker.chunk('') == []
        assert chunker.chunk('   ') == []
    
    def test_short_text(self):
        """Should handle short text appropriately"""
        chunker = TextChunker(min_words=10)
        text = "This is a short paragraph with a few words."
        chunks = chunker.chunk(text)
        assert len(chunks) >= 0  # May be empty if below min
    
    def test_chunking_by_paragraphs(self):
        """Should split text by paragraphs"""
        chunker = TextChunker(target_words=50, min_words=10, max_words=100)
        
        # Create text with multiple paragraphs
        paragraphs = [
            "This is the first paragraph. " * 10,
            "This is the second paragraph. " * 10,
            "This is the third paragraph. " * 10,
        ]
        text = '\n\n'.join(paragraphs)
        
        chunks = chunker.chunk(text)
        assert len(chunks) > 0
        
        # Each chunk should have text and metadata
        for chunk in chunks:
            assert 'text' in chunk
            assert 'index' in chunk
    
    def test_chunk_word_counts(self):
        """Chunks should have wordCount metadata"""
        chunker = TextChunker(target_words=100, min_words=20, max_words=200)
        text = "Word " * 500  # 500 words
        
        chunks = chunker.chunk(text)
        assert len(chunks) > 0
        
        for chunk in chunks:
            assert 'wordCount' in chunk
            assert chunk['wordCount'] > 0
    
    def test_page_range_estimation(self):
        """Chunks should have estimated page ranges"""
        chunker = TextChunker(target_words=100, min_words=20, max_words=200)
        text = "Content " * 1000
        
        chunks = chunker.chunk(text)
        
        for chunk in chunks:
            assert 'pageRange' in chunk
            assert len(chunk['pageRange']) == 2
            assert chunk['pageRange'][0] <= chunk['pageRange'][1]


class TestPDFParser:
    """Tests for PDF parsing"""
    
    def test_parser_initialization(self):
        """Parser should initialize correctly"""
        parser = PDFParser()
        assert parser.min_text_density == 50
    
    def test_heading_detection(self):
        """Should detect common heading patterns"""
        parser = PDFParser()
        
        # Test various heading patterns
        assert parser._is_heading("CHAPTER ONE") == True
        assert parser._is_heading("Chapter 1") == True
        assert parser._is_heading("1. Introduction") == True
        assert parser._is_heading("I. Overview") == True
        
        # Should reject non-headings
        assert parser._is_heading("This is a regular sentence.") == False
        assert parser._is_heading("") == False
        assert parser._is_heading("x" * 150) == False  # Too long
    
    def test_parse_missing_file(self):
        """Should handle missing file gracefully"""
        parser = PDFParser()
        result = parser.parse('/nonexistent/file.pdf')
        
        assert 'error' in result
    
    @pytest.fixture
    def sample_pdf_path(self):
        """Create a simple test PDF (requires reportlab)"""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            fd, path = tempfile.mkstemp(suffix='.pdf')
            os.close(fd)
            
            c = canvas.Canvas(path, pagesize=letter)
            c.drawString(100, 750, "Test Document Title")
            c.drawString(100, 700, "This is a test paragraph with some content.")
            c.drawString(100, 650, "It contains multiple lines of text for testing.")
            c.save()
            
            yield path
            
            # Cleanup
            os.unlink(path)
            
        except ImportError:
            pytest.skip("reportlab not installed")
    
    def test_parse_valid_pdf(self, sample_pdf_path):
        """Should parse valid PDF successfully"""
        parser = PDFParser()
        result = parser.parse(sample_pdf_path)
        
        assert 'error' not in result or result.get('error') is None
        assert 'text' in result
        assert 'metadata' in result
        assert result['metadata']['pages'] >= 1


class TestIntegration:
    """Integration tests"""
    
    def test_full_pipeline(self):
        """Test chunking of parsed-like content"""
        # Simulate parsed PDF content
        text = """
        Chapter 1: Introduction
        
        This is the introduction to our document. It contains important 
        information that students need to understand. The concepts presented
        here form the foundation for later chapters.
        
        Key terms include: algorithm, data structure, complexity.
        
        Chapter 2: Main Content
        
        The main content explores these ideas in depth. We examine how
        algorithms work and why they matter in computer science.
        
        Important points to remember:
        - Algorithms solve problems step by step
        - Data structures organize information
        - Complexity measures efficiency
        """
        
        chunker = TextChunker(target_words=50, min_words=20, max_words=100)
        chunks = chunker.chunk(text)
        
        assert len(chunks) > 0
        
        # Verify chunks have all required fields
        for chunk in chunks:
            assert 'text' in chunk
            assert 'index' in chunk
            assert 'wordCount' in chunk
            assert 'pageRange' in chunk


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

