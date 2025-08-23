"use client";

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

type Variant = "default" | "success" | "error" | "warning";

const Wrap = styled.div<{ variant: Variant }>`
  position: fixed;
  left: 50%;
  bottom: 80px; /* por encima de los tabs móviles */
  transform: translateX(-50%);
  z-index: 60; /* > header/tabs */
  min-width: 260px;
  max-width: 90vw;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 600;
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
  color: var(--fg);

  /* borde lateral por variante */
  box-shadow: inset 4px 0 0
    ${({ variant }) =>
      variant === "success"
        ? "var(--primary)"
        : variant === "error"
        ? "#ef4444"
        : variant === "warning"
        ? "#f59e0b"
        : "#64748b"};
`;

export function useToast(opts?: { autoHideMs?: number }) {
  const autoHideMs = opts?.autoHideMs ?? 2500;

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [variant, setVariant] = useState<Variant>("default");

  const show = useCallback((message: string, v: Variant = "default") => {
    setMsg(message);
    setVariant(v);
    setOpen(true);
  }, []);

  const success = useCallback((m: string) => show(m, "success"), [show]);
  const error = useCallback((m: string) => show(m, "error"), [show]);
  const warning = useCallback((m: string) => show(m, "warning"), [show]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), autoHideMs);
    return () => clearTimeout(id);
  }, [open, autoHideMs]);

  const Toast = open ? (
    <Wrap role="status" aria-live="polite" variant={variant}>
      {msg}
    </Wrap>
  ) : null;

  return { show, success, error, warning, Toast };
}
