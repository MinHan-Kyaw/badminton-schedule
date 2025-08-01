#!/bin/bash

echo "🏸 Setting up Badminton Court Manager..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server && npm install && cd ..

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "🔧 Creating .env file..."
    cp server/env.example server/.env
    echo "⚠️  Please update server/.env with your MongoDB connection string"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your MongoDB connection string"
echo "2. Run 'npm run dev:full' to start both frontend and backend"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Made with ❤️ by MIN 🧑🏻‍💻" 
