#!/bin/bash

# Script to inject API keys into iOS build

set -e

# Get the path to the .env file
ENV_FILE="${SRCROOT}/../.env"

if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    
    # Extract Google Maps API key from .env
    GOOGLE_MAPS_API_KEY=$(grep "GOOGLE_MAPS_API_KEY" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
        echo "Injecting Google Maps API key into Info.plist"
        
        # Replace placeholder with actual API key in Info.plist
        /usr/libexec/PlistBuddy -c "Set :GMSApiKey $GOOGLE_MAPS_API_KEY" "${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"
        
        echo "Google Maps API key injected successfully"
    else
        echo "Warning: GOOGLE_MAPS_API_KEY not found in .env file"
    fi
else
    echo "Warning: .env file not found at $ENV_FILE"
fi