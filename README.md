# G-MEL Monitoring System

A mobile-friendly project monitoring and field data collection app built with React, Vite, and Capacitor.

## Run locally

```sh
npm install
npm run dev
```

## GitHub Pages

The requested Pages repository is `G-MEL-System/Go`. Build for its `/Go/` path with:

```sh
npm run build:pages
```

Publish the contents of `dist` to GitHub Pages for that repository. Its Pages URL will be `https://g-mel-system.github.io/Go/` after Pages is enabled and the deployment completes. The repository connected to this workspace is different, so this build does not publish or push code.

## Install on a phone

Open the deployed HTTPS link in Android Chrome and choose **Install app** or **Add to Home screen**. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**. The app shell is cached for offline access after the first visit. Project data is stored in that browser's local storage and does not sync between devices.

## Build the Android APK

Install a supported JDK and Android SDK, then run:

```sh
npm run android:apk
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. To install it, transfer the APK to an Android device and allow installation from that source in the device settings.
