---
name: Cognitive Retail Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#553300'
  on-tertiary: '#ffffff'
  tertiary-container: '#744800'
  on-tertiary-container: '#ffb759'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, frictionless customer support environment tailored for modern e-commerce. Built to mediate high-urgency interactions—such as order inquiries, logistics resolution, returns, and inventory checks—the system conveys calm authority, efficiency, and empathetic clarity. The emotional atmosphere balances human reassurance with automated precision.

The design movement merges Modern Corporate SaaS with Soft Minimalist Depth. It avoids both clinical, stark starkness and dense, bureaucratic enterprise clutter. By using layered slate-tinted canvas backdrops, pure white content planes, tactile pill-like micro-elements, and measured accents of deep royal indigo, the system guides users naturally across dense conversational streams, inventory feeds, and order management consoles.

## Colors

The palette balances soft, cool ambient neutrals with structured, decisive accents:

- **Primary (`#4338ca` - Deep Indigo)**: Drives primary actions, system-level conversational highlights, focused navigation nodes, and active state indicators.
- **Secondary (`#0f766e` - Deep Spruce Teal)**: Anchors positive confirmation states, inventory readiness badges ("In Stock"), verified agent identity indicators, and secondary metrics.
- **Tertiary (`#f59e0b` - Amber Core)**: Governs transitional states, items requiring human review ("Pending", "Action Required"), and real-time shipping alerts.
- **Neutral (`#64748b` - Slate)**: Foundations rely on a tiered neutral scale. Outer canvases utilize `#f8fafc` (Slate 50) and `#f1f5f9` (Slate 100), transitioning into `#ffffff` for elevated cards, `#e2e8f0` (Slate 200) for structural low-contrast dividers, and `#0f172a` (Slate 900) for high-contrast, fatigue-free body typography.

Semantic status colors also incorporate `#dc2626` (Red 600) exclusively for critical interruptions, failed payments, and "Out of Stock" notices. Tinted alpha variations (e.g., 8–12% opacity fill against solid borders) maintain low cognitive strain during dense record scanning.

## Typography

Plus Jakarta Sans provides geometric legibility paired with open, friendly terminal apertures that soften dense customer service encounters.

- **Headlines**: Set with strict negative tracking (`-0.025em` to `-0.01em`) to create polished, compact structural titles for views, drawer heads, and primary customer profiles.
- **Body Text**: Tuned for comfortable, continuous reading in message threads and return policy cards. Line heights remain generous (between 1.5x and 1.6x font size) to reduce ocular drift when reviewing itemized receipts or AI-generated recommendations.
- **Labels & Micro-copy**: Employs elevated font weights (`600` and `700`) paired with subtle positive tracking (`+0.01em` to `+0.04em`) on badge annotations, order statuses, and data labels to prevent letter-clustering at 11px–13px.

## Layout & Spacing

The layout model implements an adaptive, content-centric multi-column console:

- **Desktop (1280px and above)**: Employs a 3-pane responsive structure. A navigation utility strip (80px or 240px wide) pairs with a central operational conversation feed (fluid, max 768px reading channel) and an auxiliary contextual sidebar (360px–420px) displaying customer metrics, order histories, and SKU statuses. Gutters sit at `1.5rem` with outer shell margins at `2rem`.
- **Tablet (768px – 1279px)**: Collapses the contextual sidebar into an overlay sheet, retaining an expanded conversation canvas with `1rem` gutters and `1.5rem` margins.
- **Mobile (below 768px)**: Converts views into single-focus full-bleed views with bottom-anchored modal sheets for order lookups. Exterior margins scale down to `1rem`.

Component padding uses an 8pt base grid: `space-xs` (4px) for inline badge icons; `space-sm` (8px) for input padding and bubble margins; `space-md` (16px) for inner card content blocks; `space-lg` (24px) for major module separations; and `space-xl` (40px) for layout section divisions.

## Elevation & Depth

Visual hierarchy uses tonal surface stacking reinforced with diffuse, cool-tinted ambient shadows and crisp perimeter boundaries.

1. **Substrate (Level 0)**: The base application canvas is `#f8fafc`. No shadows; depth is derived from surrounding structural contrasts.
2. **Resting Cards & Containers (Level 1)**: Pure white (`#ffffff`) surfaces defined by a 1px solid border in `#e2e8f0`. Layered with a multi-step ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Interactive Hover & Message Groupings (Level 2)**: Elevated conversation cards and selectable order elements elevate using `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` alongside a dynamic border color shift to `#cbd5e1`.
4. **Floating Drawers, Menus & Toolbars (Level 3)**: Modals, autocomplete panels, and slide-in customer histories utilize an ambient shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` with a `#ffffff` plane encased in `#cbd5e1`.
5. **Glass Accents**: Sticky navigation headers and pinned chat input docks use background blurring (`backdrop-filter: blur(12px)`) over a translucent surface (`rgba(248, 250, 252, 0.85)`), preserving awareness of receding messages.

## Shapes

The shape system balances approachable softness with modular discipline:

- **Cards & Data Modules (`rounded-2xl` / 16px)**: High-level dashboard blocks, active order panels, and major modal dialogs use generous curvature to avoid harsh geometric visual fatigue.
- **Controls & Secondary Enclosures (`rounded-xl` / 12px)**: Input fields, response alternatives, drop-down sheets, and conversational bubbles use a medium curvature.
- **Micro Elements & Badges (`rounded-full` / Pill)**: Status pills, numeric notification counts, avatar outlines, and quick-reply action chips use continuous pill-shaped boundaries, separating interactive triggers from contextual data cards.

## Components

### Buttons & Interactive Triggers
- **Primary Buttons**: Background `#4338ca`, label `#ffffff` (`label-md`), corner radius 12px (`rounded-xl`), horizontal padding 18px, vertical padding 10px. Hover introduces a subtle shift to `#3730a3` with a focused ring of 3px in `rgba(67, 56, 202, 0.2)`.
- **Secondary / Ghost Buttons**: `#ffffff` background with 1px border in `#e2e8f0`, label `#0f172a`. Hover transitions fill to `#f1f5f9` and border to `#cbd5e1`.
- **Quick-Reply Action Chips**: Pill-shaped (`rounded-full`), border 1px solid `#e2e8f0`, surface `#ffffff`, text `#4338ca`. Hover applies an ambient fill of `rgba(67, 56, 202, 0.06)` and `#4338ca` border.

### Badges & Status Indicators
Rendered with an interior fill, matching border, and high-contrast label (`label-sm`, uppercase tracking):
- **In Stock / Approved**: Surface `#f0fdf4`, border `#bbf7d0`, text `#15803d` (Green 700). Includes a solid 6px circular dot indicator.
- **Pending / In Review**: Surface `#fffbeb`, border `#fde68a`, text `#b45309` (Amber 700).
- **Out of Stock / Rejected**: Surface `#fef2f2`, border `#fecaca`, text `#b91c1c` (Red 700).
- **AI Verified / System Notice**: Surface `#eef2ff`, border `#c7d2fe`, text `#4338ca` (Indigo 700).

### Conversational Chat Bubbles
- **AI Agent Bubble**: Surface `#ffffff`, border 1px solid `#e2e8f0`, radius `16px 16px 16px 4px`, text `#0f172a` (`body-md`), internal padding 16px. Nested structured widgets (tracking timelines, SKU cards) sit within internal `#f8fafc` containers.
- **Customer Bubble**: Surface `#4338ca`, border 1px solid `#3730a3`, radius `16px 16px 4px 16px`, text `#ffffff` (`body-md`), internal padding 16px. Metadata (timestamps, delivery receipts) rendered in `rgba(255, 255, 255, 0.75)`.

### Form Fields & Inputs
- **Base Input**: Surface `#ffffff`, border 1px solid `#cbd5e1`, radius 12px (`rounded-xl`), internal padding 12px 16px, text `#0f172a`, placeholder text `#94a3b8`. 
- **Active Focus**: Border shifts to `#4338ca` alongside an exterior ring of `3px rgba(67, 56, 202, 0.15)`. No sudden layouts shifts.
- **Multi-line Prompt Box**: Integrated dock housing contextual actions (attach image, product search selector) with a pinned submit button in the bottom right corner.

### Cards & Data Panels
Order lookup cards, product snapshots, and customer detail panels use a pure white surface (`#ffffff`) on a `#f8fafc` canvas. Cards feature 1px solid `#e2e8f0` borders and 20px of internal padding. Header rows separate contextual information from secondary actions via a single-pixel horizontal rule in `#f1f5f9`.