# Tasks

- [x] Task 1: Fix Python PDF Extractor Column Shift
  - [x] SubTask 1.1: Read and modify `apps/backend/python-service/table_extractor.py` to identify dropped empty columns when using `dropna(how='all', axis=1)`.
  - [x] SubTask 1.2: Filter the `headers` list to include only the indices retained in `df.columns`, preventing column misalignment.
  - [x] SubTask 1.3: Clean up any trailing empty values and ensure the returned `headers` and `rows` lengths are exactly equal.

- [x] Task 2: Validate Frontend Table Rendering in File Details
  - [x] SubTask 2.1: Verify `FileDetailView.vue` does not have nested `<tbody>` inside `<TransitionGroup tag="tbody">` like the other views did.

- [x] Task 3: Restart Backend and Test Extraction
  - [x] SubTask 3.1: Write a python script or test script to verify `table_extractor.py` maps headers and rows perfectly.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
