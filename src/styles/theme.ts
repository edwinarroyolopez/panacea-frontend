export const theme = {
  colors: {
    bg: "var(--bg)",
    fg: "var(--fg)",
    primary: "var(--primary)",
    card: "var(--card)",
    border: "var(--border)",
    muted: "var(--muted)",
  },
  radius: { md: "12px", lg: "18px" },
  space: (n: number) => `${n * 4}px`,
};
export type AppTheme = typeof theme;
