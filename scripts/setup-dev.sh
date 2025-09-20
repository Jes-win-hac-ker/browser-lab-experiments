#!/bin/bash

# 🔧 Chemistry Lab Development Setup Script
# This script helps you set up the development environment securely

echo "🧪 Chemistry Lab - Development Setup"
echo "===================================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    echo "📝 Current configuration:"
    if grep -q "VITE_GEMINI_API_KEY.*your_development_api_key_here" .env 2>/dev/null; then
        echo "⚠️  You need to add your actual Gemini API key"
    elif grep -q "VITE_GEMINI_API_KEY=AIzaSy" .env 2>/dev/null; then
        echo "✅ API key is configured"
    else
        echo "⚠️  No API key found in .env"
    fi
else
    echo "📝 Creating .env file for development..."
    cat > .env << 'EOF'
# Chemistry Lab Development Environment
# Get your API key from: https://aistudio.google.com/app/apikey

VITE_GEMINI_API_KEY=your_development_api_key_here

# Optional: Development settings
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false
EOF
    echo "✅ Created .env file"
fi

echo ""
echo "🔑 Next Steps:"
echo "1. Get your Gemini API key: https://aistudio.google.com/app/apikey"
echo "2. Edit .env file and replace 'your_development_api_key_here' with your actual key"
echo "3. Run: npm run dev"
echo ""
echo "🔒 Security Notes:"
echo "• .env files are automatically ignored by git"
echo "• Never commit API keys to the repository"
echo "• Use GitHub Secrets for production deployment"
echo ""
echo "📚 Complete guide: docs/SECURITY.md"
