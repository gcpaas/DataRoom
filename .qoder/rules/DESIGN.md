# DataRoom Design System

## 1. Visual Theme & Atmosphere

DataRoom is a visual big screen designer — its interface must serve as a quiet, precise stage for the user's creative work. The design language inherits Vercel's shadow-as-border engineering philosophy and Stripe's tabular-data discipline, unified under a single Action Blue (`#3478f6`) as the brand's only chromatic accent. The result is a light-mode-only system that feels like a precision instrument: clean, confident, and obsessively aligned.

The canvas is pure white. Text is near-black (`#1d2129`). Depth is expressed through multi-layer shadow stacks rather than background color variation. Decorative gradients are absent — the user's dashboard creations are the color; the tool itself stays neutral. Every pixel of UI chrome exists to frame, not to compete.

Typography uses Inter (open-source, variable) with negative letter-spacing at display sizes and `font-feature-settings: "tnum"` for numeric/metric displays — a quiet signal that this is a data-first design tool. Three weights only: 400 (read), 500 (interact), 600 (announce).

**Key Characteristics:**
- Pure white canvas (`#ffffff`) with near-black text (`#1d2129`) — light mode only, no dark theme
- Single brand color: Action Blue (`#3478f6`) for all interactive elements
- Shadow-as-border technique: `box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.08)` replaces CSS borders throughout
- Multi-layer shadow stacks for nuanced card depth (border + elevation + ambient + inner highlight)
- Inter Variable with negative letter-spacing at display sizes (-2.0px at 48px, scaling to 0 at 14px)
- Tabular figures (`tnum`) for all numeric/metric/dimension displays
- Pill-shaped status badges (9999px) with tinted Action Blue backgrounds
- Product UI as protagonist: the designer canvas IS the hero; chrome recedes

## 2. Color Palette & Roles

### Brand

| Token | Value | Role |
|-------|-------|------|
| `--dr-blue` | `#3478f6` | Primary CTA, active states, links, focus rings, selected items |
| `--dr-blue-hover` | `#2563eb` | Button hover, link hover |
| `--dr-blue-pressed` | `#1d4ed8` | Button pressed/active state |
| `--dr-blue-soft` | `#eff6ff` | Tinted background for badges, selected rows, active panels |
| `--dr-blue-border` | `#bfdbfe` | Subtle border on selected/active containers |

### Neutral Scale

| Token | Value | Role |
|-------|-------|------|
| `--dr-gray-900` | `#1d2129` | Primary text, headings — not pure black, micro-warmth prevents harshness |
| `--dr-gray-700` | `#4e5969` | Secondary text, descriptions |
| `--dr-gray-500` | `#86909c` | Tertiary text, placeholders, disabled labels |
| `--dr-gray-400` | `#c9cdd4` | Disabled elements, muted icons |
| `--dr-gray-200` | `#e5e6eb` | Borders, dividers, hairlines |
| `--dr-gray-100` | `#f2f3f5` | Subtle surface tint, table stripe, hover backgrounds |
| `--dr-gray-50` | `#f7f8fa` | Panel backgrounds, sidebar fill, secondary surfaces |
| `--dr-white` | `#ffffff` | Page canvas, card surfaces, input backgrounds |

### Semantic

| Token | Value | Role |
|-------|-------|------|
| `--dr-success` | `#00b42a` | Success states, online indicators, positive metrics |
| `--dr-success-soft` | `#e8ffea` | Success badge background |
| `--dr-warning` | `#ff7d00` | Warning states, attention required |
| `--dr-warning-soft` | `#fff7e8` | Warning badge background |
| `--dr-danger` | `#f53f3f` | Error states, destructive actions, offline indicators |
| `--dr-danger-soft` | `#ffece8` | Error badge background |

### Shadows & Depth

| Token | Value | Role |
|-------|-------|------|
| `--dr-shadow-border` | `rgba(0,0,0,0.08) 0px 0px 0px 1px` | The signature — replaces traditional CSS borders |
| `--dr-shadow-sm` | `rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px` | Subtle card lift |
| `--dr-shadow-md` | `rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 8px, rgba(0,0,0,0.04) 0px 1px 3px` | Standard card elevation |
| `--dr-shadow-lg` | `rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 12px 24px -4px, rgba(0,0,0,0.04) 0px 4px 8px` | Floating panels, dropdowns, modals |
| `--dr-shadow-focus` | `0 0 0 2px #ffffff, 0 0 0 4px #3478f6` | Focus ring — white gap + blue outline |

## 3. Typography Rules

### Font Family

- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace**: `'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace`
- **OpenType Features**: `"liga"` globally; `"tnum"` on numeric/metric/dimension cells

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Display Hero | 48px | 600 | 1.10 | -2.0px | Page hero headlines, empty states |
| Display Section | 36px | 600 | 1.15 | -1.44px | Section titles, major feature headings |
| Heading Large | 28px | 600 | 1.20 | -0.84px | Panel titles, dialog headings |
| Heading Medium | 24px | 600 | 1.25 | -0.72px | Card headings, sub-sections |
| Heading Small | 20px | 600 | 1.30 | -0.4px | Widget titles, group labels |
| Body Large | 16px | 400 | 1.60 | 0 | Feature descriptions, introductions |
| Body | 14px | 400 | 1.57 | 0 | Standard reading text, form labels |
| Body Medium | 14px | 500 | 1.57 | 0 | Navigation links, emphasized labels |
| Body Small | 12px | 400 | 1.50 | 0 | Helper text, captions, metadata |
| Metric Display | 32px | 600 | 1.00 | -0.64px | KPI numbers, chart values (uses `tnum`) |
| Metric Body | 14px | 500 | 1.40 | -0.28px | Table cells, dimension inputs (uses `tnum`) |
| Button | 14px | 500 | 1.00 | 0 | All button labels |
| Caption | 12px | 500 | 1.33 | 0 | Tags, badges, micro labels |
| Mono Code | 13px | 400 | 1.50 | 0 | Code editors, JSON preview, expressions |

### Principles

- **Negative tracking at display sizes**: -2.0px at 48px, scaling proportionally to 0 at 14px. Creates compressed, engineered headlines.
- **Three weights, strict roles**: 400 (body/reading), 500 (UI/interactive), 600 (headings/emphasis). No bold (700) in the interface.
- **Tabular figures for data**: Every input showing pixel dimensions (1920x1080), chart values, dataset counts, or coordinates uses `font-feature-settings: "tnum"`. Numbers must align vertically in columns.
- **Mono for code contexts**: Dataset expressions, JSON previews, Groovy scripts, and SQL editors use JetBrains Mono at 13px.

## 4. Component Stylings

### Buttons

**Primary (Action Blue)**
- Background: `--dr-blue` (`#3478f6`)
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 6px
- Shadow: none
- Hover: `--dr-blue-hover` (`#2563eb`)
- Pressed: `--dr-blue-pressed` (`#1d4ed8`)
- Focus: `--dr-shadow-focus`

**Secondary (Ghost with border)**
- Background: `--dr-white` (`#ffffff`)
- Text: `--dr-gray-900` (`#1d2129`)
- Padding: 8px 16px
- Radius: 6px
- Shadow: `--dr-shadow-border` (rgba(0,0,0,0.08) 0px 0px 0px 1px)
- Hover: background shifts to `--dr-gray-50` (`#f7f8fa`)
- Focus: `--dr-shadow-focus`

**Text Button (Minimal)**
- Background: transparent
- Text: `--dr-blue` (`#3478f6`)
- Padding: 8px 12px
- Radius: 6px
- Hover: background `--dr-blue-soft` (`#eff6ff`)

**Danger**
- Background: `--dr-danger` (`#f53f3f`)
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 6px
- Hover: `#e63535`

### Cards & Containers

**Standard Card**
- Background: `--dr-white`
- Border: via shadow — `--dr-shadow-border`
- Radius: 8px
- Padding: 16px (compact) / 24px (standard)
- Hover: shadow transitions to `--dr-shadow-sm`

**Elevated Card (panels, floating tools)**
- Background: `--dr-white`
- Shadow: `--dr-shadow-md`
- Radius: 8px
- Padding: 16px–24px

**Selected/Active Card**
- Background: `--dr-blue-soft` (`#eff6ff`)
- Border: `2px solid --dr-blue` (`#3478f6`)
- Radius: 8px

### Inputs & Forms

**Text Input**
- Background: `--dr-white`
- Text: `--dr-gray-900`
- Padding: 8px 12px
- Radius: 6px
- Border: `1px solid --dr-gray-200` (`#e5e6eb`)
- Focus: border `--dr-blue`, shadow `--dr-shadow-focus`
- Placeholder: `--dr-gray-500` (`#86909c`)
- Height: 32px (compact) / 36px (default)

**Number Input (dimensions, coordinates)**
- Same as text input but with `font-feature-settings: "tnum"`
- Right-aligned text for numeric values

**Select / Dropdown**
- Same base as text input
- Dropdown panel: `--dr-shadow-lg`, radius 8px, max-height 280px

### Navigation

**Top Bar**
- Background: `--dr-white`
- Height: 48px
- Border-bottom: `--dr-shadow-border` (shadow technique, not CSS border)
- Logo left-aligned, nav center, actions right
- Link text: 14px weight 500, `--dr-gray-900`
- Active link: `--dr-blue` text color

**Sidebar (Designer panels)**
- Background: `--dr-gray-50` (`#f7f8fa`)
- Width: 240px (component library) / 300px (property panel)
- Border-right: `--dr-shadow-border`
- Section headers: 12px weight 500 uppercase `--dr-gray-500`, 8px bottom margin

**Tab Bar**
- Background: transparent
- Tab text: 14px weight 500, `--dr-gray-500` (inactive), `--dr-gray-900` (active)
- Active indicator: 2px bottom border `--dr-blue`
- Tab padding: 8px 12px
- Gap between tabs: 4px

### Badges & Status

**Pill Badge**
- Background: `--dr-blue-soft` (`#eff6ff`)
- Text: `--dr-blue` (`#3478f6`)
- Padding: 2px 8px
- Radius: 9999px (full pill)
- Font: 12px weight 500

**Status Dot**
- Size: 6px circle
- Colors: `--dr-success` (online/published), `--dr-warning` (draft), `--dr-danger` (error)
- Paired with 12px caption text

### Designer-Specific Components

**Canvas Ruler**
- Background: `--dr-gray-50`
- Tick marks: `--dr-gray-400`
- Numbers: Mono 10px `--dr-gray-500`, `tnum` enabled
- Active position highlight: `--dr-blue` at 0.15 opacity

**Component Thumbnail (in library panel)**
- Background: `--dr-white`
- Shadow: `--dr-shadow-border`
- Radius: 6px
- Padding: 8px
- Hover: `--dr-shadow-sm` + slight scale(1.02) transition
- Selected: `--dr-blue-border` + `--dr-blue-soft` background

**Property Input Row**
- Layout: label left (90px width, 12px weight 500, `--dr-gray-700`) + input right (flex 1)
- Spacing: 8px gap, 4px vertical between rows
- Group separator: 1px `--dr-gray-100` line + 12px vertical spacing

**Property Collapse Panel**
- Panel/content background: `--dr-white`
- Outer spacing: no padding or margin between the collapse panel and its parent property panel
- Section spacing: stacked collapse groups use `0` vertical margin; title bars provide the visual separation
- Header background: `--dr-gray-50`
- Header text: 12px weight 600, `--dr-gray-900`
- Header height: 36px, horizontal padding 12px
- Header separator: use an inset bottom shadow `inset 0 -1px 0 0 --dr-gray-200`; do not add outer margins
- Body padding: 12px for form rows; content remains white

**Drag Handle**
- Color: `--dr-gray-400`
- Hover: `--dr-gray-700`
- Size: 12px grip icon
- Cursor: `grab` / `grabbing`

**Selection Marquee (on canvas)**
- Border: 1px dashed `--dr-blue`
- Fill: `--dr-blue` at 0.06 opacity
- No radius

**Resize Handle (on canvas)**
- Size: 8px square
- Background: `--dr-white`
- Border: 2px solid `--dr-blue`
- Active: filled `--dr-blue`

## 5. Layout Principles

### Spacing System

Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Micro gaps (icon-to-text, inline elements) |
| `--space-2` | 8px | Compact padding, input internal, related items |
| `--space-3` | 12px | Standard gap between form rows |
| `--space-4` | 16px | Card padding (compact), section gap (tight) |
| `--space-5` | 20px | — |
| `--space-6` | 24px | Card padding (standard), panel internal spacing |
| `--space-8` | 32px | Section spacing, modal internal padding |
| `--space-10` | 40px | Large section gaps |
| `--space-12` | 48px | Page-level section rhythm |
| `--space-16` | 64px | Major section divisions |

### Grid & Container

- **Page list view**: max-width 1200px, centered
- **Designer workspace**: full viewport, three-column (library 240px | canvas flex-1 | properties 300px)
- **Canvas**: occupies remaining space after toolbars/panels, with 8px margin from edges
- **Component library grid**: 2-column for thumbnails, 1-column for list view
- **Property panel**: single column, label-input rows

### Whitespace Philosophy

- **Chrome is invisible**: toolbars, panels, and controls use minimal vertical space. The canvas gets maximum area.
- **Dense but breathable**: property panels use 4px between rows, 12px between groups. Tight enough for power users, open enough to parse.
- **Section rhythm in page views**: 32px between card groups, 16px between individual cards in a grid.

### Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Inline code, tiny tags, color swatches |
| `--radius-md` | 6px | Buttons, inputs, compact cards |
| `--radius-lg` | 8px | Standard cards, panels, modals |
| `--radius-xl` | 12px | Featured cards, image containers, dialog chrome |
| `--radius-pill` | 9999px | Badges, status pills, toggle tracks |

## 6. Depth & Elevation

| Level | Shadow | Use |
|-------|--------|-----|
| Level 0 (Flat) | None | Page background, inline text, panel content |
| Level 1 (Ring) | `rgba(0,0,0,0.08) 0px 0px 0px 1px` | Shadow-as-border: cards, containers, inputs |
| Level 2 (Card) | Ring + `rgba(0,0,0,0.04) 0px 1px 2px` | Standard cards with minimal lift |
| Level 3 (Panel) | Ring + `rgba(0,0,0,0.06) 0px 4px 8px` + `rgba(0,0,0,0.04) 0px 1px 3px` | Elevated panels, toolbar flyouts |
| Level 4 (Float) | Ring + `rgba(0,0,0,0.08) 0px 12px 24px -4px` + `rgba(0,0,0,0.04) 0px 4px 8px` | Dropdowns, modals, context menus |
| Focus | `0 0 0 2px #ffffff, 0 0 0 4px #3478f6` | Keyboard focus on all interactive elements |

**Shadow Philosophy**: Shadows serve architecture, not decoration. The multi-layer stacks give each card a constructed feel — the 1px ring defines the boundary, the soft blur provides ambient depth, and the negative-spread layer prevents shadows from bleeding into adjacent cards. No element uses a shadow heavier than 0.08 opacity.

## 7. Designer Canvas Rules

The designer canvas (where users build their dashboards) has its own visual rules distinct from the application chrome:

**Canvas Background**
- Default: `#f0f1f3` (a neutral warm gray that differentiates canvas from chrome)
- Grid dots: `#d4d7de` at 16px intervals (PageDesigner grid mode)
- No grid: clean background (VisualScreenDesigner pixel mode)

**Canvas Selection States**
- Selected component: 1px solid `--dr-blue` outline with 8px square handles at corners and midpoints
- Multi-select: dashed `--dr-blue` outline, handles only on bounding box
- Hover (not selected): 1px dashed `--dr-gray-400` outline

**Canvas Component Chrome**
- Components render with no additional chrome when deselected
- Selected: thin blue outline, resize handles, optional rotation handle
- Drag ghost: 0.6 opacity duplicate with `--dr-shadow-lg`

**Alignment Guides**
- Color: `#f53f3f` (red, high visibility)
- Style: 1px solid
- Distance labels: 10px mono font, red background with white text, pill shape

## 8. Do's and Don'ts

### Do
- Use `--dr-blue` (`#3478f6`) as the ONLY chromatic accent in the application chrome
- Use shadow-as-border (`0px 0px 0px 1px rgba(0,0,0,0.08)`) instead of CSS borders on cards/containers
- Apply `font-feature-settings: "tnum"` on all numeric displays (dimensions, coordinates, chart values, counts)
- Keep three weights: 400 (read), 500 (interact), 600 (announce) — never use 700/bold
- Use negative letter-spacing at display sizes (-2.0px at 48px, scaling to 0 at 14px)
- Let the user's canvas work be the color — the tool stays neutral
- Use the focus ring (`0 0 0 2px #fff, 0 0 0 4px #3478f6`) on ALL keyboard-focusable elements
- Use `--dr-gray-50` (`#f7f8fa`) for panel/sidebar backgrounds to create subtle depth without shadows

### Don't
- Don't introduce a dark mode — this is a light-mode-only system
- Don't use colored backgrounds on application chrome (only on the user's canvas content)
- Don't use CSS `border` on cards — use the shadow-border technique
- Don't use weight 700 (bold) anywhere in the UI
- Don't use shadows heavier than 0.08 opacity — the depth system is whisper-level
- Don't use `--dr-blue` for body text — it's for interactive elements only
- Don't add decorative gradients, patterns, or illustrations to the application chrome
- Don't use pill radius (9999px) on action buttons — pills are for badges/status only; buttons use 6px
- Don't skip `tnum` on numeric inputs — misaligned numbers feel broken in a precision design tool
- Don't compete with the user's canvas content — the designer chrome must be quieter than the work

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA / Active: `#3478f6`
- Primary Hover: `#2563eb`
- Background: `#ffffff`
- Heading text: `#1d2129`
- Body text: `#4e5969`
- Muted text: `#86909c`
- Border (shadow): `rgba(0,0,0,0.08) 0px 0px 0px 1px`
- Panel background: `#f7f8fa`
- Canvas background: `#f0f1f3`
- Focus ring: `0 0 0 2px #fff, 0 0 0 4px #3478f6`

### Example Component Prompts

- "Create a designer toolbar: white background, 48px height, bottom shadow-border. Tool icons 20px in `#4e5969`, active tool icon in `#3478f6` with `#eff6ff` background circle. Group separators as 1px `#e5e6eb` vertical lines, 24px tall."

- "Design a component library panel: `#f7f8fa` background, 240px width. Section header: 12px weight 500 uppercase `#86909c`. Component thumbnails in 2-column grid: white cards with shadow-border, 6px radius, 8px padding. Hover: shadow-sm + scale(1.02). Selected: `#eff6ff` background + `#bfdbfe` border."

- "Build a property input row: label left (90px, 12px weight 500, `#4e5969`), input right (flex-1, 32px height, 6px radius, 1px `#e5e6eb` border). Number inputs use `tnum`. Focus: blue border + focus ring."

- "Design a page card for the project list: white background, shadow-border, 8px radius. Thumbnail 16:9 at top with `#f2f3f5` placeholder. Title: 14px weight 600 `#1d2129`. Metadata: 12px weight 400 `#86909c`. Status badge: pill (9999px radius) with semantic color backgrounds."

- "Create a dataset metric display: 32px weight 600 `#1d2129` with `tnum` for the number. 12px weight 400 `#86909c` for the label below. Optional trend arrow in `--dr-success` (up) or `--dr-danger` (down)."

### Iteration Guide

1. Always use shadow-as-border instead of CSS border — `0px 0px 0px 1px rgba(0,0,0,0.08)` is the foundation
2. Letter-spacing scales: -2.0px at 48px, -1.44px at 36px, -0.84px at 28px, -0.72px at 24px, 0 at 14px
3. Three weights only: 400 (read), 500 (interact), 600 (announce)
4. Color is functional — `#3478f6` marks interactive/active only; everything else is gray scale
5. Panels use `#f7f8fa` background; page canvas uses `#ffffff`; designer canvas uses `#f0f1f3`
6. Numeric inputs always enable `tnum` — pixel values, coordinates, sizes must align
7. The designer chrome should feel lighter than the user's canvas work at all times