# Fix Global Layout Margins Spec

## Why
Currently, content pages, lists, and tables (like MyFilesView) are stuck to the right and left edges of the screen on desktop. This happens because the `.dashboard-main` CSS class overrides the Tailwind `lg:pr-[20rem]` sidebar offset class, and the horizontal padding is missing or stripped by `.page-shell` and `mx-0` classes. A radical and unified fix is needed to ensure consistent breathing room (margins/padding) across the entire platform.

## What Changes
- Remove hardcoded `padding` properties from `.dashboard-main` in `main.css` to prevent overriding Tailwind utility classes.
- Update `DashboardLayout.vue` to use standard Tailwind padding utilities (`px-4 sm:px-6 lg:px-8 py-6 lg:py-8`) while maintaining the sidebar offset class (`desktopSidebarOffsetClass`).
- Remove `px-0 sm:px-0` from `.page-shell` in `main.css` so that pages naturally inherit or define their own padding without stripping it globally.
- Ensure `.panel-table` correctly uses `-mx-4 sm:mx-0` ONLY when the parent container has proper padding, restoring the Mobile Native edge-to-edge experience without breaking desktop layouts.
- Unify `AdminLayout.vue` and `DashboardLayout.vue` padding structures.

## Impact
- Affected specs: Layout & Responsive Design
- Affected code: `main.css`, `DashboardLayout.vue`, `AdminLayout.vue`

## MODIFIED Requirements
### Requirement: Dashboard Layout Spacing
The main content area SHALL have consistent horizontal and vertical padding on all screen sizes, ensuring content never touches the screen edges on desktop, while properly offsetting for the fixed sidebar on the right side.
