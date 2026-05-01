# Fix Upload Bugs and Settings API Spec

## Why
After implementing the unified PDF schema, testing revealed three new bugs:
1. The extracted supplier name from the PDF metadata has its Arabic characters reversed.
2. The `/api/settings/public` and `/api/system/features` endpoints return 500 Internal Server Error, causing issues on the frontend.
3. The upload progress UI gets stuck at 0% and fails to show the final completion state or the buttons to proceed.

## What Changes
- Fix RTL Arabic text processing in the Python service's `extract_metadata` endpoint so the supplier name displays correctly.
- Fix the `SettingsService` or the `/api/settings/public` route to correctly fetch public settings and feature flags without throwing a 500 error.
- Fix the `UploadPDFView.vue` progress monitor logic to correctly track progress and transition to the completed state, showing the appropriate buttons.

## Impact
- Affected specs: PDF metadata extraction, System settings retrieval, PDF upload progress tracking.
- Affected code: `apps/backend/python-service/app.py`, `apps/backend/src/services/SettingsService.js` (or related controllers), `apps/frontend/src/views/dashboard/UploadPDFView.vue`.

## MODIFIED Requirements
### Requirement: PDF Metadata Extraction
The Python service MUST correctly process Arabic text in the metadata without reversing the character order, maintaining standard RTL reading order.

### Requirement: System Settings Retrieval
The backend MUST successfully serve public settings and feature flags via `/api/settings/public` and `/api/system/features` to allow the frontend to load site configurations without 500 errors.

### Requirement: Upload Progress UI
The frontend MUST correctly poll and update the PDF upload progress, displaying accurate percentages, and MUST transition to a completed state (100%) showing action buttons when the file processing finishes.
