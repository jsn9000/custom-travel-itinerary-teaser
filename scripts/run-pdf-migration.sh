#!/bin/bash

# Database Migration Helper Script
# This script helps you run the PDF processing migration

echo "🚀 PDF Processing Database Migration Helper"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/002_pdf_processing.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "   Make sure you're in the project root directory."
    exit 1
fi

echo "📄 Found migration file: supabase/migrations/002_pdf_processing.sql"
echo ""

# Display the migration content
echo "📋 Migration SQL Content:"
echo "------------------------"
cat supabase/migrations/002_pdf_processing.sql
echo ""
echo "------------------------"
echo ""

echo "🔧 Next Steps:"
echo "1. Open your Supabase Dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the SQL content above"
echo "4. Click 'Run' to execute the migration"
echo ""

echo "✅ After running the migration, your PDF processing system will be ready!"
echo ""

# Optional: Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "🔍 Supabase CLI detected. You can also run:"
    echo "   supabase db push"
    echo ""
fi
