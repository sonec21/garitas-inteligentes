# Garita Inteligente App Setup Guide

## 1. Google Maps API Setup

### Get API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
4. Create credentials → API Key
5. Restrict the key to your app's bundle ID

### Configure API Key:

1. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in:

   - `src/config/maps.ts`
   - `android/app/src/main/res/values/strings.xml`

2. Add to iOS Info.plist (manually):

```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY_HERE</string>
```

3. Add to Android AndroidManifest.xml (manually):

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="@string/google_maps_key" />
```

## 2. Supabase Setup

### Create Supabase Project:

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Get your URL and anon key from Settings → API

### Configure Supabase:

1. Replace in `src/config/supabase.ts`:
   - `YOUR_NEXT_PUBLIC_SUPABASE_URL`
   - `YOUR_NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Schema:

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Border crossings
CREATE TABLE public.border_crossings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lanes
CREATE TABLE public.lanes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crossing_id UUID REFERENCES public.border_crossings(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  wait_time INTEGER DEFAULT 0,
  vehicle_count INTEGER DEFAULT 0,
  traffic_flow TEXT DEFAULT 'moderate',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  crossing_id UUID REFERENCES public.border_crossings(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO public.border_crossings (name, latitude, longitude) VALUES
('San Ysidro', 32.5422, -117.0309),
('Otay Mesa', 32.5586, -116.9319);
```

## 3. iOS Setup (if building for iOS)

### Install CocoaPods:

```bash
cd ios
pod install
```

### Manual Info.plist additions needed:

- Location permissions (already added)
- Google Maps API key (add manually)

## 4. Android Setup

### Manual AndroidManifest.xml additions needed:

- Location permissions (already added)
- Google Maps meta-data (add manually)

## 5. Build and Run

```bash
# Install dependencies
yarn install

# iOS
yarn ios

# Android
yarn android
```

## Troubleshooting

- If you get location permission errors, make sure to accept permissions when prompted
- If maps don't load, verify your API key is correct and has proper restrictions
- For Supabase connection issues, check your URL and keys in the config file
