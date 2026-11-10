# GMEL System

GMEL is a responsive monitoring, evaluation, and learning workspace for managing projects, logframe indicators, field forms, submissions, and reporting.

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
- Export field submissions and indicator reports as spreadsheet-compatible CSV, or download a JSON backup.
- Review indicator progress and level breakdowns in the dashboard.

## Deployment and data requirements

This repository currently provides a front-end prototype. Project and submission data are saved in the current browser's local storage; they are not shared across browsers or devices. The app does not yet include server-side accounts, password protection, organization separation, hosted APIs, or a connected mobile collector. The mobile screen documents this setup requirement rather than presenting a nonfunctional endpoint as active.

Before using GMEL for real organizations or sensitive field data, connect a secure backend with authentication, authorization, tenant isolation, encrypted transport, backups, and a mobile collection API. Do not treat browser storage as a secure or multi-user production database.
