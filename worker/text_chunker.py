"""
Text Chunker Module
Splits text into manageable chunks for AI processing.
"""

import re
from typing import List, Dict, Optional


class TextChunker:
    """Split text into chunks optimized for AI processing"""
    
    def __init__(self, target_words: int = 600, min_words: int = 100, max_words: int = 800):
        """
        Initialize chunker with word count parameters.
        
        Args:
            target_words: Ideal chunk size in words
            min_words: Minimum words per chunk
            max_words: Maximum words per chunk
        """
        self.target_words = target_words
        self.min_words = min_words
        self.max_words = max_words
    
    def chunk(self, text: str, headings: Optional[List[Dict]] = None, pages: Optional[int] = None) -> List[Dict]:
        """
        Split text into chunks.
        
        Prefers natural breaks (headings, paragraphs) but falls back
        to word count if needed.
        
        Args:
            text: Full document text
            headings: Optional list of detected headings
            
        Returns:
            List of chunk dictionaries with text and metadata
        """
        if not text or not text.strip():
            return []
        
        # Clean up text
        text = self._clean_text(text)
        
        # Try to split by headings first
        if headings and len(headings) > 1:
            chunks = self._split_by_headings(text, headings, pages)
            if chunks:
                return self._post_process_chunks(chunks, pages)
        
        # Fall back to paragraph-based chunking
        chunks = self._split_by_paragraphs(text)
        return self._post_process_chunks(chunks, pages)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        
        # Remove page numbers and headers (common patterns)
        text = re.sub(r'\n\d+\n', '\n', text)
        text = re.sub(r'Page \d+ of \d+', '', text)
        
        return text.strip()
    
    def _split_by_headings(self, text: str, headings: List[Dict], pages: Optional[int]) -> List[Dict]:
        """Split text using detected headings as boundaries"""
        chunks = []
        current_pos = 0
        
        for i, heading in enumerate(headings):
            heading_text = heading.get('text', '')
            heading_pos = text.find(heading_text, current_pos) if heading_text else -1
            
            if heading_pos == -1:
                continue
            
            # Get text before this heading (if not first)
            if current_pos < heading_pos and i > 0:
                section_text = text[current_pos:heading_pos].strip()
                if len(section_text.split()) >= self.min_words:
                    chunks.append({
                        'index': len(chunks),
                        'text': section_text,
                        'heading': headings[i-1].get('text'),
                        'pageRange': self._estimate_page_range(headings[i-1], headings[i], pages)
                    })
            
            current_pos = heading_pos
        
        # Add remaining text
        if current_pos < len(text):
            remaining = text[current_pos:].strip()
            if len(remaining.split()) >= self.min_words:
                chunks.append({
                    'index': len(chunks),
                    'text': remaining,
                    'heading': headings[-1].get('text') if headings else None,
                    'pageRange': self._estimate_page_range(headings[-1] if headings else None, None, pages)
                })
        
        return chunks
    
    def _split_by_paragraphs(self, text: str) -> List[Dict]:
        """Split text into chunks based on paragraphs and word count"""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = []
        current_words = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para_words = len(para.split())
            
            # If adding this paragraph exceeds max, start new chunk
            if current_words + para_words > self.max_words and current_words >= self.min_words:
                chunks.append({
                    'index': len(chunks),
                    'text': '\n\n'.join(current_chunk)
                })
                current_chunk = [para]
                current_words = para_words
            else:
                current_chunk.append(para)
                current_words += para_words
        
        # Add remaining content
        if current_chunk:
            chunks.append({
                'index': len(chunks),
                'text': '\n\n'.join(current_chunk)
            })
        
        return chunks
    
    def _is_low_quality_chunk(self, text: str) -> bool:
        """Check if chunk is likely syllabus/TOC/references"""
        lower = text.lower()
        # High density of course metadata indicators
        markers = ['unit', 'hours]', 'reference book', 'text book', 'edition', 'chapter', 'syllabus']
        marker_count = sum(1 for m in markers if m in lower)
        if marker_count >= 3:
            return True
        # Very list-heavy (likely TOC or references)
        lines = text.split('\n')
        list_lines = sum(1 for line in lines if re.match(r'^\s*[\d\-\•\*]', line))
        if len(lines) > 5 and list_lines / len(lines) > 0.7:
            return True
        return False
    
    def _post_process_chunks(self, chunks: List[Dict], pages: Optional[int]) -> List[Dict]:
        """Post-process chunks to ensure quality"""
        processed = []
        
        for chunk in chunks:
            text = chunk['text'].strip()
            
            # Skip low-quality chunks (syllabus, TOC, references)
            if self._is_low_quality_chunk(text):
                continue
            
            text = chunk['text'].strip()
            word_count = len(text.split())
            
            # Skip very small chunks
            if word_count < self.min_words / 2:
                # Merge with previous if possible
                if processed:
                    processed[-1]['text'] += '\n\n' + text
                    processed[-1]['wordCount'] = len(processed[-1]['text'].split())
                continue
            
            # Split very large chunks
            if word_count > self.max_words * 1.5:
                sub_chunks = self._force_split(text)
                for i, sub_text in enumerate(sub_chunks):
                    processed.append({
                        'index': len(processed),
                        'text': sub_text,
                        'wordCount': len(sub_text.split()),
                        'heading': chunk.get('heading'),
                        'pageRange': chunk.get('pageRange')
                    })
            else:
                chunk['wordCount'] = word_count
                chunk['index'] = len(processed)
                processed.append(chunk)
        
        # Add page ranges (estimated based on position when missing)
        total_chunks = len(processed)
        for i, chunk in enumerate(processed):
            if not chunk.get('pageRange'):
                start_page = max(1, int((i / total_chunks) * (pages or 10)) + 1)
                end_page = max(start_page, int(((i + 1) / total_chunks) * (pages or 10)) + 1)
                chunk['pageRange'] = [start_page, end_page]
            
            # Add a short title for UI/AI prompts
            chunk['title'] = self._make_title(chunk.get('heading'), chunk['text'])
        
        return processed

    def _estimate_page_range(self, heading: Optional[Dict], next_heading: Optional[Dict], pages: Optional[int]) -> List[int]:
        """Estimate page range using heading metadata."""
        start_page = (heading or {}).get('page', 1)
        if next_heading and next_heading.get('page'):
            end_page = max(start_page, next_heading['page'])
        else:
            end_page = pages or start_page
        return [start_page, end_page]

    def _make_title(self, heading: Optional[str], text: str) -> str:
        """Create a concise title using heading or leading words."""
        if heading:
            return heading.strip()[:80]
        words = text.split()
        return ' '.join(words[:10]).strip()[:80] or 'Section'
    
    def _force_split(self, text: str) -> List[str]:
        """Force split a large chunk by sentences"""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current = []
        current_words = 0
        
        for sentence in sentences:
            sentence_words = len(sentence.split())
            
            if current_words + sentence_words > self.target_words:
                if current:
                    chunks.append(' '.join(current))
                current = [sentence]
                current_words = sentence_words
            else:
                current.append(sentence)
                current_words += sentence_words
        
        if current:
            chunks.append(' '.join(current))
        
        return chunks
