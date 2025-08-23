"use client";
import styled from "styled-components";
export const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #0e1320;
  color: var(--fg);
  &:focus {
    outline: none;
    border-color: #334155;
  }
`;
