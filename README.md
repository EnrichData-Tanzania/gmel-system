# GMEL System

GMEL is a mobile-friendly monitoring, evaluation, and learning workspace for managing projects, logframe indicators, field forms, submissions, and reporting. It is built with React, Vite, and Capacitor.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` to create the static production bundle and `npm run lint` to run Oxlint.

## Current capabilities

- Create, edit, and delete projects.
- Add and edit logframe indicators, map them to numeric form fields, and calculate progress from recorded submissions.
- Build project forms with common field types, collect submissions in the browser, and prepare print-ready forms.
- Add skip logic to form questions so follow-up questions appear based on earlier answers.
- Export field submissions and indicator reports as spreadsheet-compatible CSV, or download a JSON backup.
- Review indicator progress and level breakdowns in the dashboard.

## Publish the web app

The `main` branch deploys to GitHub Pages through the repository's Actions workflow. After a successful deployment, open <https://enrichdata-tanzania.github.io/me-system/>.

## Install on a phone

Open the deployed HTTPS link in Android Chrome and choose **Install app** or **Add to Home screen**. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**. The app shell is cached for offline access after the first visit.

## Build the Android APK

Install a supported JDK and Android SDK, then run:

```sh
npm run android:apk
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. To install it, transfer the APK to an Android device and allow installation from that source in the device settings.

## Data and production security

This is a front-end prototype. Project and submission data are stored in the current browser's local storage; they are not shared across browsers or devices. Server-side accounts, password protection, organization separation, and shared hosted data are not yet implemented. Before using GMEL for real organizations or sensitive field data, connect a secure backend with authentication, authorization, tenant isolation, encrypted transport, backups, and a mobile collection API. Do not treat browser storage as a secure multi-user production database.
