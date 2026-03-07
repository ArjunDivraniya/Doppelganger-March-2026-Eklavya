#!/bin/bash
echo "Starting development servers..."

# Start Backend
cd backend && npm run dev &

# Start Extension
cd extension && npm run watch &

echo "Development servers started!"
