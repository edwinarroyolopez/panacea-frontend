"use client";
import styled from "styled-components";

const Base = styled.button<{ variant?: "primary" | "ghost" }>`
  border: 1px solid var(--border);
  background: ${({ variant }) =>
    variant === "primary" ? "var(--primary)" : "transparent"};
  color: ${({ variant }) => (variant === "primary" ? "#0b0e14" : "var(--fg)")};
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.05s ease, background 0.2s ease, color 0.2s ease;
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
export default function Button(
  props: React.ComponentProps<"button"> & { variant?: "primary" | "ghost" }
) {
  return <Base {...props} />;
}
