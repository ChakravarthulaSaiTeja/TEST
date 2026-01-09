#!/bin/bash
# Script to start the backend server

cd "$(dirname "$0")/backend"

echo "Starting Backend Server..."
echo "=========================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please create it first: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
python main.py
