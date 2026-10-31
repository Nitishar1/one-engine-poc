export type ThemeMode = 'light' | 'dark';

/** Design tokens shared by CSS variables (Tailwind / custom CSS) and the Ant Design theme. */
export interface ThemeTokens {
  /** Brand accent: focus, active navigation, links, selected states. */
  primary: string;
  primaryHover: string;
  /** Tinted accent fill (selected rows, active chips). */
  primarySoft: string;
  /** Text / icon colour placed on a solid `primary` fill. */
  onPrimary: string;
  /** Navy → blue → cyan. Logo mark, login visual and other brand moments. */
  brandGradient: string;
  /** Secondary (cyan) accent used for "live" / network signals and gradient tails. */
  secondary: string;
  link: string;
  focusRing: string;

  /** Primary action fill (buttons, active pills). Blue → indigo, white text stays AA. */
  gradientPrimary: string;
  gradientPrimaryHover: string;
  /** Deep featured surface (hero panel, headline KPI). Always paired with light text. */
  gradientFeature: string;
  /** Soft tinted surface for highlighted, non-primary content. */
  gradientSoft: string;
  /** Hairline gradient used as a border on featured elements. */
  gradientBorder: string;
  /** Radial ambient lighting painted behind the app shell. */
  ambient: string;
  /** Coloured elevation for primary actions and featured cards. */
  glow: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  surfaceSunken: string;
  /** Translucent surface for glass panels (header, floating toolbars). */
  surfaceGlass: string;
  /** Content cards: lightly translucent so page backdrops read through without blur. */
  surfaceCard: string;
  /** Stronger frosted fill for floating panels over busy backgrounds. */
  glassStrong: string;
  /** Luminous hairline used on glass edges. */
  glassBorder: string;
  /** Inset top highlight that gives glass its edge light. */
  glassHighlight: string;
  /** Backdrop colours behind page content (command centre, network, AI, grid). */
  backdropPrimary: string;
  backdropSecondary: string;
  backdropTertiary: string;

  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  headerBg: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  hover: string;
  active: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  shadowSm: string;
  shadow: string;
  shadowStrong: string;

  canvasBg: string;
  /** Radial lighting layered over the canvas background. */
  canvasGlow: string;
  canvasGrid: string;
  nodeBg: string;
  nodeText: string;
  nodeBorder: string;
  edge: string;
  edgeActive: string;

  /** Per node-type accents, shared by the canvas nodes, palette and minimap. */
  nodeStart: string;
  nodeEnd: string;
  nodeCondition: string;
  nodeDelay: string;
  nodeCommand: string;
  nodeAction: string;

  /** Categorical chart series. `chart1End` is the gradient tail of series 1. */
  chart1: string;
  chart1End: string;
  chart2: string;
  chartGrid: string;
}

export const themeTokens: Record<ThemeMode, ThemeTokens> = {
  dark: {
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    primarySoft: 'rgba(59, 130, 246, 0.14)',
    onPrimary: '#ffffff',
    brandGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 48%, #06b6d4 100%)',
    secondary: '#22d3ee',
    link: '#7cb4ff',
    focusRing: 'rgba(59, 130, 246, 0.42)',

    gradientPrimary: 'linear-gradient(135deg, #2563eb 0%, #3b6cf0 50%, #5b5ff0 100%)',
    gradientPrimaryHover: 'linear-gradient(135deg, #3b74f2 0%, #4b7bf5 50%, #6a6cf3 100%)',
    gradientFeature:
      'radial-gradient(120% 140% at 100% 0%, rgba(6, 182, 212, 0.38) 0%, transparent 46%), linear-gradient(135deg, #0b1838 0%, #13308a 55%, #2156e0 100%)',
    gradientSoft:
      'linear-gradient(180deg, rgba(59, 130, 246, 0.09) 0%, rgba(59, 130, 246, 0.015) 100%)',
    gradientBorder:
      'linear-gradient(135deg, rgba(96, 165, 250, 0.7) 0%, rgba(34, 211, 238, 0.35) 45%, rgba(99, 102, 241, 0.6) 100%)',
    ambient:
      'radial-gradient(60% 50% at 85% -10%, rgba(37, 99, 235, 0.16) 0%, transparent 60%), radial-gradient(45% 40% at 0% 0%, rgba(6, 182, 212, 0.07) 0%, transparent 60%), radial-gradient(50% 50% at 50% 110%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)',
    glow: '0 10px 30px -10px rgba(37, 99, 235, 0.6), 0 2px 6px -2px rgba(37, 99, 235, 0.4)',

    background: '#060a14',
    surface: '#0b1120',
    surfaceAlt: '#101829',
    surfaceElevated: '#111a2c',
    surfaceSunken: '#080d19',
    surfaceGlass: 'rgba(13, 20, 36, 0.72)',
    surfaceCard: 'rgba(12, 19, 35, 0.78)',
    glassStrong: 'rgba(14, 22, 40, 0.68)',
    glassBorder: 'rgba(148, 190, 255, 0.16)',
    glassHighlight: 'inset 0 1px 0 rgba(180, 210, 255, 0.07)',
    backdropPrimary: 'rgba(37, 99, 235, 0.22)',
    backdropSecondary: 'rgba(34, 211, 238, 0.12)',
    backdropTertiary: 'rgba(99, 102, 241, 0.16)',

    sidebarBg: 'rgba(7, 12, 24, 0.74)',
    sidebarText: '#94a0b8',
    sidebarActiveBg:
      'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.06) 100%)',
    headerBg: 'rgba(6, 10, 20, 0.72)',

    textPrimary: '#e7ecf5',
    textSecondary: '#a4afc4',
    textMuted: '#75829d',
    border: 'rgba(148, 170, 210, 0.1)',
    borderStrong: 'rgba(148, 170, 210, 0.17)',
    hover: 'rgba(120, 150, 220, 0.06)',
    active: 'rgba(120, 150, 220, 0.1)',

    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',

    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.45)',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px -6px rgba(0, 0, 0, 0.45)',
    shadowStrong: '0 0 0 1px rgba(148, 170, 210, 0.08), 0 24px 56px -12px rgba(0, 0, 0, 0.7)',

    canvasBg: '#070c18',
    canvasGlow:
      'radial-gradient(55% 45% at 50% 0%, rgba(37, 99, 235, 0.14) 0%, transparent 70%), radial-gradient(40% 35% at 100% 100%, rgba(6, 182, 212, 0.07) 0%, transparent 70%)',
    canvasGrid: 'rgba(120, 160, 230, 0.16)',
    nodeBg: '#0f1729',
    nodeText: '#e7ecf5',
    nodeBorder: 'rgba(148, 170, 210, 0.16)',
    edge: '#3f5378',
    edgeActive: '#60a5fa',

    nodeStart: '#34d399',
    nodeEnd: '#f87171',
    nodeCondition: '#fbbf24',
    nodeDelay: '#94a3b8',
    nodeCommand: '#22d3ee',
    nodeAction: '#60a5fa',

    chart1: '#3b82f6',
    chart1End: '#22d3ee',
    chart2: '#f87171',
    chartGrid: 'rgba(148, 170, 210, 0.08)',
  },
  light: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primarySoft: 'rgba(37, 99, 235, 0.08)',
    onPrimary: '#ffffff',
    brandGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%)',
    secondary: '#0891b2',
    link: '#1d4ed8',
    focusRing: 'rgba(37, 99, 235, 0.28)',

    gradientPrimary: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #4f46e5 100%)',
    gradientPrimaryHover: 'linear-gradient(135deg, #1e46c7 0%, #1f5ae0 50%, #4338ca 100%)',
    gradientFeature:
      'radial-gradient(120% 140% at 100% 0%, rgba(34, 211, 238, 0.42) 0%, transparent 46%), linear-gradient(135deg, #0f1f4d 0%, #1e40af 55%, #2563eb 100%)',
    gradientSoft: 'linear-gradient(180deg, #eff5ff 0%, #ffffff 100%)',
    gradientBorder:
      'linear-gradient(135deg, rgba(37, 99, 235, 0.55) 0%, rgba(6, 182, 212, 0.3) 45%, rgba(99, 102, 241, 0.5) 100%)',
    ambient:
      'radial-gradient(60% 45% at 85% -10%, rgba(37, 99, 235, 0.09) 0%, transparent 60%), radial-gradient(45% 40% at 0% 0%, rgba(6, 182, 212, 0.06) 0%, transparent 60%)',
    glow: '0 10px 28px -12px rgba(37, 99, 235, 0.55), 0 2px 6px -2px rgba(37, 99, 235, 0.3)',

    background: '#f5f7fb',
    surface: '#ffffff',
    surfaceAlt: '#f2f5fa',
    surfaceElevated: '#ffffff',
    surfaceSunken: '#eef2f8',
    surfaceGlass: 'rgba(255, 255, 255, 0.76)',
    surfaceCard: 'rgba(255, 255, 255, 0.84)',
    glassStrong: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(37, 99, 235, 0.14)',
    glassHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    backdropPrimary: 'rgba(37, 99, 235, 0.13)',
    backdropSecondary: 'rgba(6, 182, 212, 0.1)',
    backdropTertiary: 'rgba(99, 102, 241, 0.1)',

    sidebarBg: 'rgba(251, 252, 254, 0.74)',
    sidebarText: '#4b5873',
    sidebarActiveBg:
      'linear-gradient(90deg, rgba(37, 99, 235, 0.11) 0%, rgba(37, 99, 235, 0.03) 100%)',
    headerBg: 'rgba(245, 247, 251, 0.78)',

    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    border: 'rgba(15, 23, 42, 0.08)',
    borderStrong: 'rgba(15, 23, 42, 0.14)',
    hover: 'rgba(37, 99, 235, 0.04)',
    active: 'rgba(37, 99, 235, 0.08)',

    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',

    shadowSm: '0 1px 2px rgba(15, 30, 70, 0.05)',
    shadow: '0 1px 2px rgba(15, 30, 70, 0.04), 0 8px 24px -8px rgba(30, 64, 175, 0.1)',
    shadowStrong: '0 0 0 1px rgba(15, 23, 42, 0.05), 0 24px 48px -12px rgba(30, 58, 138, 0.2)',

    canvasBg: '#f7f9fd',
    canvasGlow:
      'radial-gradient(55% 45% at 50% 0%, rgba(37, 99, 235, 0.07) 0%, transparent 70%), radial-gradient(40% 35% at 100% 100%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
    canvasGrid: 'rgba(37, 70, 140, 0.16)',
    nodeBg: '#ffffff',
    nodeText: '#0f172a',
    nodeBorder: 'rgba(15, 23, 42, 0.12)',
    edge: '#9aabc8',
    edgeActive: '#2563eb',

    nodeStart: '#16a34a',
    nodeEnd: '#dc2626',
    nodeCondition: '#d97706',
    nodeDelay: '#64748b',
    nodeCommand: '#0891b2',
    nodeAction: '#2563eb',

    chart1: '#2563eb',
    chart1End: '#06b6d4',
    chart2: '#ef4444',
    chartGrid: 'rgba(15, 23, 42, 0.06)',
  },
};

const toKebab = (key: string) =>
  key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/(\d+)/g, '-$1');

/** Writes the active theme's tokens to `:root` as `--oe-*` CSS variables. */
export function applyThemeVariables(mode: ThemeMode): void {
  const root = document.documentElement;
  const tokens = themeTokens[mode];
  (Object.keys(tokens) as (keyof ThemeTokens)[]).forEach((key) => {
    root.style.setProperty(`--oe-${toKebab(key)}`, tokens[key]);
  });
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}
