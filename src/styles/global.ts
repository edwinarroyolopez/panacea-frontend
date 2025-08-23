"use client";
import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg: #0b0e14;
    --fg: #e7e9ee;
    --muted: #9aa4b2;
    --primary: #6ee7b7;
    --card: #121622;
    --border: #1f2433;
  }
  * { box-sizing: border-box; }
  html, body, #__next { height: 100%; }
  body {
    margin: 0; padding: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial;
  }
  a { color: inherit; text-decoration: none; }
  ::selection { background: #334155; color: #e2e8f0; }
`;
