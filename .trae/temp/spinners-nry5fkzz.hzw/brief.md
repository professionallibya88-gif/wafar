# Design Brief: 10 Spinner Variants Showcase

## Objective
Create a standalone HTML mockup page that showcases 10 distinct, high-quality, modern loading spinner designs. The user will review this page to select one spinner design to become the universal loading indicator for the "Wafar" platform (a car spare parts e-commerce and dashboard system).

## Target Audience
The project stakeholders and developers who need to evaluate and choose a professional, smooth, and modern loading animation.

## Aesthetic Direction
- **Vibe**: Professional, sleek, technical, and modern.
- **Theme**: The page should display the spinners on both dark and light backgrounds simultaneously so the user can evaluate contrast, or have a dark/light mode toggle.
- **Direction**: Right-to-Left (RTL) since the project is in Arabic.
- **Spinners**: Must be pure CSS or SVG + CSS animations. No GIFs. They must be smooth (60fps), elegant, and not overly playful. Think "enterprise dashboard" or "modern SaaS".

## Content Structure
- **Header**: Title "معاينة مؤشرات التحميل (Spinners)" with a brief description.
- **Grid Layout**: A responsive grid (e.g., 3 or 4 columns on desktop) displaying 10 cards.
- **Cards**: Each card should contain:
  - The spinner itself, centered.
  - A clean title (e.g., "1. نبض متداخل", "2. حلقة متدرجة").
  - A subtle background to make the spinner pop.
- **Spinner Variants to Include**:
  1. Smooth gradient ring (Tailwind-style).
  2. Dual overlapping spinning rings.
  3. Pulsing dots (3 dots bouncing or fading).
  4. Expanding/contracting concentric circles.
  5. SVG morphing shape or dashed circle drawing itself.
  6. Minimalist radar/radar sweep.
  7. Bouncing equalizer bars.
  8. Rotating dashed spinner (classic but refined).
  9. Infinite infinity symbol or figure-8 trace.
  10. Modern segmented circle.

## Typography
- **Font**: "Tajawal" (import via Google Fonts).
- **Hierarchy**: Clean, readable headers, muted labels for the spinner names.

## Colors
- **Primary Brand Color**: Blue (e.g., Tailwind's `blue-600` for light, `blue-500` for dark).
- **Backgrounds**: Slate or Gray shades.

## Output Requirements
- A single `index.html` file using Tailwind CSS via CDN.
- Place it in `C:\wafar-project\mockups\spinners\` (create this directory if it doesn't exist).
- The file must be fully self-contained (HTML + Tailwind CDN + Custom CSS inside `<style>` if needed for keyframes).
