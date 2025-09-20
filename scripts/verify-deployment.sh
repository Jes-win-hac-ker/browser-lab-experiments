#!/bin/bash

# 🚀 Bulletproof Deployment Verification Script
# This script ensures the deployment is working correctly

echo "🔍 Starting deployment verification..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="https://jes-win-hac-ker.github.io/browser-lab-experiments/"
MAX_RETRIES=10
RETRY_DELAY=30

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if site is accessible
check_site() {
    local url=$1
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
    
    if [ "$status_code" = "200" ]; then
        return 0
    else
        echo "Status code: $status_code"
        return 1
    fi
}

# Function to verify specific elements
verify_content() {
    local url=$1
    local content=$(curl -s -L "$url")
    
    # Check for essential elements
    if echo "$content" | grep -q "Chemistry Lab"; then
        print_status $GREEN "✅ Page title found"
    else
        print_status $RED "❌ Page title missing"
        return 1
    fi
    
    if echo "$content" | grep -q "assets/"; then
        print_status $GREEN "✅ Assets directory found"
    else
        print_status $RED "❌ Assets directory missing"
        return 1
    fi
    
    return 0
}

# Function to check build artifacts
check_build() {
    print_status $BLUE "🔍 Checking build artifacts..."
    
    if [ ! -d "dist" ]; then
        print_status $RED "❌ dist directory not found"
        return 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_status $RED "❌ index.html not found"
        return 1
    fi
    
    if [ ! -d "dist/assets" ]; then
        print_status $RED "❌ assets directory not found"
        return 1
    fi
    
    # Check file sizes
    local index_size=$(stat -f%z "dist/index.html" 2>/dev/null || stat -c%s "dist/index.html" 2>/dev/null)
    if [ "$index_size" -lt 1000 ]; then
        print_status $RED "❌ index.html is too small ($index_size bytes)"
        return 1
    fi
    
    print_status $GREEN "✅ Build artifacts verified"
    return 0
}

# Main verification process
main() {
    print_status $BLUE "🚀 Chemistry Lab Deployment Verification"
    echo "Target URL: $SITE_URL"
    echo "Max retries: $MAX_RETRIES"
    echo "Retry delay: ${RETRY_DELAY}s"
    echo "----------------------------------------"
    
    # Check build first
    if ! check_build; then
        print_status $RED "❌ Build verification failed"
        exit 1
    fi
    
    # Wait for initial deployment
    print_status $YELLOW "⏳ Waiting for initial deployment (60s)..."
    sleep 60
    
    # Retry loop
    for i in $(seq 1 $MAX_RETRIES); do
        print_status $BLUE "🔍 Attempt $i/$MAX_RETRIES: Testing site accessibility..."
        
        if check_site "$SITE_URL"; then
            print_status $GREEN "✅ Site is accessible!"
            
            # Verify content
            if verify_content "$SITE_URL"; then
                print_status $GREEN "✅ Content verification passed!"
                
                # Final checks
                print_status $BLUE "🔍 Running final verification checks..."
                
                # Check robots.txt
                if check_site "${SITE_URL}robots.txt"; then
                    print_status $GREEN "✅ robots.txt accessible"
                else
                    print_status $YELLOW "⚠️ robots.txt not found (optional)"
                fi
                
                # Check favicon
                if check_site "${SITE_URL}favicon.ico"; then
                    print_status $GREEN "✅ favicon.ico accessible"
                else
                    print_status $YELLOW "⚠️ favicon.ico not found (optional)"
                fi
                
                print_status $GREEN "🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!"
                print_status $GREEN "🌐 Site is live at: $SITE_URL"
                
                # Performance check
                print_status $BLUE "📊 Performance check..."
                local load_time=$(curl -o /dev/null -s -w "%{time_total}" "$SITE_URL")
                print_status $BLUE "⚡ Load time: ${load_time}s"
                
                exit 0
            else
                print_status $RED "❌ Content verification failed"
            fi
        else
            print_status $RED "❌ Site not accessible (attempt $i/$MAX_RETRIES)"
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            print_status $YELLOW "⏳ Waiting ${RETRY_DELAY}s before retry..."
            sleep $RETRY_DELAY
        fi
    done
    
    print_status $RED "❌ DEPLOYMENT VERIFICATION FAILED"
    print_status $RED "Site is not accessible after $MAX_RETRIES attempts"
    print_status $YELLOW "💡 Troubleshooting tips:"
    print_status $YELLOW "   1. Check GitHub Actions workflow status"
    print_status $YELLOW "   2. Verify GitHub Pages settings"
    print_status $YELLOW "   3. Check for DNS propagation delays"
    print_status $YELLOW "   4. Manual verification: $SITE_URL"
    
    exit 1
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
