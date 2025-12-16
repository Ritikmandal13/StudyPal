"""
StudyPal PDF Worker
Extracts text from PDFs and sends chunks to the backend.
"""

import os
import json
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pdf_parser import PDFParser
from text_chunker import TextChunker

load_dotenv()

app = Flask(__name__)

CALLBACK_URL = os.getenv('CALLBACK_URL', 'http://localhost:3001/api/callback')
CALLBACK_SECRET = os.getenv('CALLBACK_SECRET', 'dev-secret-key')
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'studypal-worker'
    })


@app.route('/parse', methods=['POST'])
def parse_pdf():
    """
    Parse a PDF file and extract text chunks.
    
    Expected payload:
    {
        "jobId": "uuid",
        "filePath": "/path/to/file.pdf",
        "callbackUrl": "http://backend/api/callback",
        "callbackSecret": "secret"
    }
    
    Or multipart form with 'pdf' file and 'jobId'
    """
    try:
        job_id = None
        pdf_path = None
        callback_url = CALLBACK_URL
        callback_secret = CALLBACK_SECRET
        
        # Handle JSON payload (file path reference)
        if request.is_json:
            data = request.get_json()
            job_id = data.get('jobId')
            pdf_path = data.get('filePath')
            callback_url = data.get('callbackUrl', CALLBACK_URL)
            callback_secret = data.get('callbackSecret', CALLBACK_SECRET)
            
        # Handle multipart form (direct file upload)
        elif 'pdf' in request.files:
            job_id = request.form.get('jobId')
            pdf_file = request.files['pdf']
            pdf_path = os.path.join(UPLOAD_DIR, f"{job_id}.pdf")
            pdf_file.save(pdf_path)
            callback_url = request.form.get('callbackUrl', CALLBACK_URL)
            callback_secret = request.form.get('callbackSecret', CALLBACK_SECRET)
        
        if not job_id:
            return jsonify({'error': 'jobId required'}), 400
            
        if not pdf_path or not os.path.exists(pdf_path):
            # Try looking in local uploads
            local_path = os.path.join(UPLOAD_DIR, f"{job_id}.pdf")
            if os.path.exists(local_path):
                pdf_path = local_path
            else:
                send_error_callback(job_id, callback_url, callback_secret, 'PDF file not found')
                return jsonify({'error': 'PDF file not found'}), 404
        
        # Parse PDF
        print(f"[Worker] Starting PDF parsing for job {job_id}")
        parser = PDFParser()
        result = parser.parse(pdf_path)
        print(f"[Worker] PDF parsing complete, result keys: {list(result.keys())}")
        
        if result.get('error'):
            print(f"[Worker] PDF parsing error: {result['error']}")
            send_error_callback(job_id, callback_url, callback_secret, result['error'])
            return jsonify({'error': result['error']}), 422
        
        # Chunk text with headings and page count for better titles/ranges
        print(f"[Worker] Starting text chunking, text length: {len(result.get('text', ''))}")
        chunker = TextChunker(target_words=600)
        chunks = chunker.chunk(
            result['text'],
            result.get('headings', []),
            result.get('metadata', {}).get('pages')
        )
        print(f"[Worker] Created {len(chunks)} chunks")
        
        # Prepare response
        response_data = {
            'jobId': job_id,
            'metadata': result['metadata'],
            'chunks': chunks,
            'status': 'success',
            'secret': callback_secret
        }
        
        # Send to callback
        print(f"[Worker] Sending callback to {callback_url}")
        send_callback(callback_url, response_data)
        print(f"[Worker] Callback sent successfully")
        
        return jsonify({
            'success': True,
            'jobId': job_id,
            'chunkCount': len(chunks)
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing PDF: {e}")
        print(f"Traceback: {error_trace}")
        if job_id:
            send_error_callback(job_id, callback_url, callback_secret, str(e))
        return jsonify({'error': str(e), 'traceback': error_trace}), 500


def send_callback(url, data):
    """Send parsed data to backend callback"""
    try:
        print(f"[Callback] Sending POST to {url}")
        print(f"[Callback] Payload size: {len(str(data))} chars, chunks: {len(data.get('chunks', []))}")
        response = requests.post(url, json=data, timeout=60)  # Increased timeout for large payloads
        print(f"[Callback] Response status: {response.status_code}")
        response.raise_for_status()
        print(f"[Callback] Callback sent successfully for job {data.get('jobId')}")
    except Exception as e:
        import traceback
        print(f"[Callback] Callback failed: {e}")
        print(f"[Callback] Traceback: {traceback.format_exc()}")
        # Retry logic could be added here


def send_error_callback(job_id, url, secret, error_message):
    """Send error callback to backend"""
    try:
        requests.post(url, json={
            'jobId': job_id,
            'status': 'error',
            'error': error_message,
            'secret': secret
        }, timeout=30)
    except Exception as e:
        print(f"Error callback failed: {e}")


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    # Simple ASCII banner to avoid Unicode issues on some Windows terminals
    print(f"==============================")
    print(f"   StudyPal PDF Worker")
    print(f"   Status: Running")
    print(f"   Port:   {port}")
    print(f"==============================")
    app.run(host='0.0.0.0', port=port, debug=True)

