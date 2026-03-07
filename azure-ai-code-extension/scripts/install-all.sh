#!/bin/bash
echo "Installing dependencies for all services..."

# Extension
echo "Installing extension dependencies..."
cd extension && npm install && cd ..

# Backend
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installation complete!"
