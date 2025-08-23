"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import styled, { keyframes } from "styled-components";

type Variant = "default" | "success" | "error" | "warning";
type ToastItem = { id: string; message: string; variant: Variant };

type ToastContextValue = {
  show: (
    message: string,
    variant?: Variant,
    opts?: { duration?: number }
  ) => string;
  success: (message: string, opts?: { duration?: number }) => string;
  error: (message: string, opts?: { duration?: number }) => string;
  warning: (message: string, opts?: { duration?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

/* UI */

const slideUp = keyframes`
  from { transform: translate(-50%, 8px); opacity: 0; }
  to   { transform: translate(-50%, 0);   opacity: 1; }
`;

const Container = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(80px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 60; /* por encima de tabs móviles y header */
  display: grid;
  gap: 8px;
  width: min(90vw, 420px);
  pointer-events: none; /* deja pasar clics a la página salvo en cada toast */
`;

const Item = styled.div<{ variant: Variant }>`
  pointer-events: all;
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 4px solid
    ${({ variant }) =>
      variant === "success"
        ? "var(--primary)"
        : variant === "error"
        ? "#ef4444"
        : variant === "warning"
        ? "#f59e0b"
        : "#64748b"};
  color: var(--fg);
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 600;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
  animation: ${slideUp} 0.14s ease both;
`;

const CloseBtn = styled.button`
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef(new Map<string, NodeJS.Timeout>());

  // limpia timers al desmontar
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const enqueue = useCallback(
    (message: string, variant: Variant = "default", duration = 2500) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const show = useCallback(
    (m: string, v: Variant = "default", opts?: { duration?: number }) =>
      enqueue(m, v, opts?.duration ?? 2500),
    [enqueue]
  );
  const success = useCallback(
    (m: string, opts?: { duration?: number }) => show(m, "success", opts),
    [show]
  );
  const error = useCallback(
    (m: string, opts?: { duration?: number }) => show(m, "error", opts),
    [show]
  );
  const warning = useCallback(
    (m: string, opts?: { duration?: number }) => show(m, "warning", opts),
    [show]
  );

  const clear = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show, success, error, warning, dismiss, clear }),
    [show, success, error, warning, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Container role="status" aria-live="polite">
        {toasts.map((t) => (
          <Item key={t.id} variant={t.variant}>
            <div>{t.message}</div>
            <CloseBtn
              aria-label="Cerrar notificación"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </CloseBtn>
          </Item>
        ))}
      </Container>
    </ToastContext.Provider>
  );
}
