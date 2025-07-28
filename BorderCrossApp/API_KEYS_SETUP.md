# API Keys Setup

This document explains how to configure API keys for the Garita Inteligente app.

## Required API Keys

### 1. Google Maps API Key
- **Service**: Google Maps Platform
- **Required for**: Maps display, Places API, Directions API
- **Environment variable**: `GOOGLE_MAPS_API_KEY`

### 2. Supabase Configuration
- **Service**: Supabase
- **Required for**: Database operations, authentication
- **Environment variables**: 
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SB_SERVICE_ROLE_KEY`

## Setup Instructions

### 1. Environment Variables
1. Copy `.env.example` to `.env` in the root directory
2. Fill in your actual API keys:

```bash
# Google Maps API
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SB_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. iOS Configuration
The iOS app automatically uses the `GOOGLE_MAPS_API_KEY` from your `.env` file through the build process. The `Info.plist` file contains a placeholder `$(GOOGLE_MAPS_API_KEY)` that gets replaced during build.

### 3. Android Configuration
For Android, Google Maps API key should be configured in `android/app/src/main/AndroidManifest.xml` or through environment variables.

## Security Notes

⚠️ **IMPORTANT**: Never commit actual API keys to the repository!

- All actual API keys should be in your `.env` file (which is gitignored)
- The repository only contains placeholder values and example files
- Use environment variables for all sensitive configuration

## Getting API Keys

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps, Places, and Directions APIs
4. Create credentials (API Key)
5. Restrict the API key to your bundle ID/package name

### Supabase Keys
1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and API keys