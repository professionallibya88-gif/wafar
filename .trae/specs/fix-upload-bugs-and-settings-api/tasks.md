# Tasks

- [x] Task 1: Fix RTL Arabic Text Reversal
  - [x] SubTask 1.1: Investigate `extract_metadata` in `apps/backend/python-service/app.py`.
  - [x] SubTask 1.2: Remove or correct the LTR/RTL splitting and reversing logic that causes Arabic names to be reversed.

- [x] Task 2: Fix 500 Error on Settings API
  - [x] SubTask 2.1: Investigate `SettingsService.js` and `settingsController.js` to find the root cause of the 500 error.
  - [x] SubTask 2.2: Fix the code or database state to ensure `/api/settings/public` and `/api/system/features` return 200 OK.

- [x] Task 3: Fix Upload Progress UI
  - [x] SubTask 3.1: Investigate `UploadPDFView.vue` to check why the progress monitor gets stuck at 0%.
  - [x] SubTask 3.2: Ensure `progressStatus` state correctly updates and triggers the completion UI (action buttons).

# Task Dependencies
- [Task 1], [Task 2], and [Task 3] can be done in parallel as they touch different parts of the stack.
