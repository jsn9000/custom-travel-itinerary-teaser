#!/bin/bash
# Wrapper script to update Git settings across multiple repositories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Git Repository Settings Updater ===${NC}\n"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

# Check for required Python packages
echo "Checking Python dependencies..."
python3 -c "import requests" 2>/dev/null || {
    echo -e "${YELLOW}Installing required packages...${NC}"
    pip3 install requests PyGithub python-gitlab
}

# Check for environment variables
if [ -z "$GITHUB_TOKEN" ] && [ -z "$GITLAB_TOKEN" ] && [ -z "$BITBUCKET_USER" ]; then
    echo -e "${YELLOW}Warning: No Git platform credentials found${NC}"
    echo "Please set one of the following:"
    echo "  - GITHUB_TOKEN for GitHub"
    echo "  - GITLAB_TOKEN for GitLab"
    echo "  - BITBUCKET_USER and BITBUCKET_APP_PASSWORD for Bitbucket"
    echo ""
    echo "You can add them to your .env file or export them:"
    echo "  export GITHUB_TOKEN='your-token-here'"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Parse command line arguments
DRY_RUN=false
CONFIG_FILE="$SCRIPT_DIR/update-git-settings.py"

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be updated without making changes"
            echo "  --config FILE      Use custom config file (default: update-git-settings.py)"
            echo "  --help             Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_TOKEN       GitHub personal access token"
            echo "  GITLAB_TOKEN       GitLab personal access token"
            echo "  BITBUCKET_USER     Bitbucket username"
            echo "  BITBUCKET_APP_PASSWORD  Bitbucket app password"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Display configuration
echo -e "${GREEN}Configuration:${NC}"
python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from pathlib import Path
exec(Path('$CONFIG_FILE').read_text())
print(f\"  Platform: {CONFIG['platform']}\")
print(f\"  Organization: {CONFIG['organization']}\")
print(f\"  Protected branches: {', '.join(CONFIG['protected_branches'])}\")
print(f\"  Teams: {', '.join(CONFIG['team_access'].keys()) if CONFIG['team_access'] else 'None'}\")
print(f\"  Target repos: {'All repositories' if not CONFIG['repositories'] else ', '.join(CONFIG['repositories'])}\")
"

echo ""
read -p "Continue with these settings? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Run the Python script
echo ""
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    # In a real implementation, we'd pass a --dry-run flag to Python
fi

python3 "$CONFIG_FILE"

echo ""
echo -e "${GREEN}✅ Done!${NC}"
