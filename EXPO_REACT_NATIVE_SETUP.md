# PaisaTrack: Cross-Platform React Native & Expo Architecture Guide

PaisaTrack is designed with a **shared business logic and offline-first data model** that runs both in the current responsive environment and directly on native iOS and Android via Expo and React Native.

---

## 1. Quick Start Commands

### Web & Preview:
```bash
# Run Development Server
npm run dev

# Run Typecheck & Linting
npm run lint

# Compile Production Build
npm run build
```

---

## 2. React Native & Expo Project Setup

To deploy native Android APK/AAB or iOS IPA builds using Expo:

### Initialize Expo Router Project:
```bash
npx create-expo-app@latest paisatrack --template tabs
cd paisatrack
```

### Install Compatible Native Dependencies:
```bash
npx expo install \
  expo-sqlite \
  expo-router \
  expo-notifications \
  expo-file-system \
  expo-sharing \
  lucide-react-native \
  react-native-svg \
  @supabase/supabase-js
```

### App Configuration (`app.json`):
```json
{
  "expo": {
    "name": "PaisaTrack",
    "slug": "paisatrack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#10B981"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.paisatrack.finance"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#10B981"
      },
      "package": "com.paisatrack.finance",
      "permissions": ["NOTIFICATIONS"]
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#10B981"
        }
      ]
    ]
  }
}
```

---

## 3. SQLite Storage Adapter (`expo-sqlite`)

The database schema defined in `src/db/schema.sql` executes directly in `expo-sqlite`:

```typescript
import * as SQLite from 'expo-sqlite';

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync('paisatrack.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  
  return db;
}
```

---

## 4. Testing on Android & iOS via Expo Go

1. Install **Expo Go** from Google Play Store or Apple App Store.
2. In your terminal, run:
   ```bash
   npx expo start
   ```
3. Scan the generated QR code using the Expo Go camera on Android or the iOS Camera app.

---

## 5. EAS Build Instructions for Production

### Android (Production AAB / APK):
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure EAS Build
eas build:configure

# Build Android APK (for direct sideload testing)
eas build -p android --profile preview

# Build Android App Bundle (for Google Play Console release)
eas build -p android --profile production
```

### iOS (App Store Release):
```bash
# Build iOS IPA for TestFlight & App Store
eas build -p ios --profile production

# Submit directly to Apple App Store Connect
eas submit -p ios
```

---

## 6. Supabase Cloud Sync Setup

1. Create a project at [https://supabase.com](https://supabase.com).
2. Go to **SQL Editor** and paste the SQL script from `src/db/schema.sql`.
3. Copy your **Project URL** and **Anon Public Key** from *Project Settings > API*.
4. In PaisaTrack, open **Settings > Configure Supabase Cloud Sync** and paste your credentials.
5. Tap **Save & Connect** then **Sync Now**.
