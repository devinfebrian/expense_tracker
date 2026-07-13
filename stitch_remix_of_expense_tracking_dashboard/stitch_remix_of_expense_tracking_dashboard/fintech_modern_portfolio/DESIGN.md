---
name: Fintech Modern Portfolio
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#40000d'
  on-tertiary-container: '#f23d5c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-trust financial environments. It balances the rigor of data-heavy enterprise software with the fluidity of modern fintech consumer apps. The personality is professional, precise, and reassuring.

The style is **Corporate Modern with Minimalist tendencies**, characterized by:
- **Data Clarity:** Numerical data is the primary hero; UI elements exist to support, not distract.
- **Precision:** Mathematical spacing and thin, low-contrast borders provide structure without visual weight.
- **High-Trust Whitespace:** Generous margins and internal padding convey a sense of calm and control over one's finances.
- **Modern Textures:** Subtle tonal shifts in background surfaces differentiate content areas rather than heavy shadows.

## Colors

This color palette prioritizes semantic clarity. The core foundation is built on deep navies and cool slates to establish an authoritative "bank-grade" atmosphere.

- **Primary (Deep Navy):** Used for navigation, primary headings, and critical UI anchors.
- **Secondary (Emerald Green):** Reserved exclusively for positive financial signals: income, surpluses, savings goals, and upward trends.
- **Tertiary (Coral Red):** Utilized for expenses, budget limits reached, and cautionary data points.
- **Neutrals (Slate Greys):** A refined range of greys used for secondary text, borders, and subtle surface layering.
- **Backgrounds:** A soft off-white (#F8FAFC) is used for the main canvas to reduce eye strain compared to pure white, while pure white is reserved for high-level cards and containers.

## Typography

The typography strategy employs a three-font system to maximize legibility and functional distinction:

1.  **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif that provides a distinctive "tech" feel for major page titles and section headers.
2.  **Inter (Body):** The industry standard for UI legibility. Used for all descriptive text, labels, and general interface elements.
3.  **JetBrains Mono (Data):** A monospaced font used specifically for currency amounts and transaction figures. This ensures that numbers align perfectly in tables and lists, making visual comparison effortless.

**Mobile Scaling:** `display-lg` should downscale to 32px on mobile devices, while `headline-lg` scales to 24px.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and tablet, transitioning to a single-column stack on mobile.

- **Rhythm:** A strict 4px base unit governs all padding and margins.
- **Margins:** Desktop views use 48px outer margins to create a "contained" professional look. Mobile views compress this to 16px.
- **Sectioning:** Content is grouped into logical modules (cards). The vertical gap between modules is a consistent 24px (`lg`).
- **Dashboard Density:** Information density is "Medium." It provides enough data to be useful without feeling cluttered or overwhelming.

## Elevation & Depth

This design system eschews heavy drop shadows in favor of **Tonal Layering and Low-Contrast Outlines**.

- **Level 0 (Canvas):** Background color #F8FAFC.
- **Level 1 (Cards/Containers):** Pure white (#FFFFFF) background with a 1px border in #E2E8F0 (Slate 200). No shadow.
- **Level 2 (Active/Hover):** When a card or element is focused, a very subtle, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.05)) may be applied to suggest lift.
- **Separators:** Use 1px solid lines in #F1F5F9 (Slate 100) for internal card divisions.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This "micro-radius" maintains a professional, geometric look that feels more modern than sharp corners but more serious than highly rounded "bubbly" interfaces.

- **Buttons & Inputs:** 4px radius.
- **Data Cards:** 8px (`rounded-lg`) to provide a clear container hierarchy.
- **Charts:** Corner radii on bar charts should also follow the 4px rule for consistency.

## Components

### Buttons
- **Primary:** Deep Navy (#0F172A) background, White text. High-contrast.
- **Secondary:** White background, Slate 200 border, Slate 700 text.
- **Semantic:** Use Emerald Green or Coral Red only for high-intent actions (e.g., "Confirm Deposit" or "Delete Transaction").

### Cards
All dashboard modules reside in white cards. Headers within cards should use `label-caps` typography in Slate 500 to provide context for the `data-lg` figures below them.

### Input Fields
Inputs use a 1px Slate 200 border. On focus, the border shifts to Deep Navy. For monetary inputs, prefix icons (e.g., "$") are set in JetBrains Mono.

### Chips/Tags
Used for transaction categories. They feature a desaturated background of the category color with high-contrast text (e.g., a light emerald background with dark emerald text).

### Progress Bars
Used for budget tracking. The background track is Slate 100. The fill uses Emerald Green when under 80% capacity, shifting to Coral Red when the budget limit is exceeded.

### Tables
Clean, unbordered rows separated by 1px Slate 100 dividers. Transaction amounts are right-aligned using `data-md` typography to ensure decimal points align.