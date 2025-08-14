#!/bin/bash

# DirectDrive Authority Engine - Setup Script
echo "🚀 Setting up DirectDrive Authority Engine"
echo "========================================="

# Check Node.js version
echo "Checking Node.js version..."
node --version || { echo "❌ Node.js not found. Please install Node.js 18+"; exit 1; }

# Install dependencies for each package individually
echo -e "\n📦 Installing shared package dependencies..."
cd packages/shared && npm install

echo -e "\n🤖 Installing AI clients package dependencies..."
cd ../ai-clients && npm install

echo -e "\n📊 Installing dashboard dependencies..."
cd ../../apps/dashboard && npm install

echo -e "\n⚙️ Installing n8n workflows dependencies..."
cd ../n8n-workflows && npm install

# Return to root
cd ../../

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "\n🔧 Creating environment file..."
    cp .env.example .env.local
    echo "✅ Created .env.local - Please edit it with your API keys"
else
    echo -e "\n✅ Environment file already exists"
fi

echo -e "\n🎉 Setup complete!"
echo -e "\n📋 Next steps:"
echo "1. Edit .env.local with your API keys (Supabase, OpenAI, etc.)"
echo "2. Run: npm run dev:dashboard"
echo "3. Open: http://localhost:3000"
echo -e "\n🔗 Repository: https://github.com/mansurirad/directdrive-authority-engine"