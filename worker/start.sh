#!/bin/bash
# Railway start script for worker
PORT=${PORT:-5000}
gunicorn -w 1 -b 0.0.0.0:$PORT worker:app

