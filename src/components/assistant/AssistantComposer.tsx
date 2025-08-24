"use client";

import styled from "styled-components";
import { useState, useMemo, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { MUTATION_SEND_CHAT, QUERY_CHAT_HISTORY } from "@/graphql/operations";
import { useUI } from "@/store/ui";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { applyAssistantEffects } from "@/lib/effects";

const Bar = styled.div`
  position: sticky;
  bottom: 64px; /* deja espacio para tabs móviles */
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: var(--card);
  z-index: 15;
`;

export default function AssistantComposer() {
  const { currentGoalId } = useUI();
  const toast = useToast?.();
  const [text, setText] = useState("");
  const [sendChat, { loading }] = useMutation(MUTATION_SEND_CHAT);

  const variables = useMemo(
    () => ({ goalId: currentGoalId ?? null, limit: 50 }),
    [currentGoalId]
  );

  const onSend = async () => {
    const msg = text.trim();
    if (!msg) return;
    setText("");

    try {
      await sendChat({
        variables: { text: msg, goalId: currentGoalId ?? null },
        // El historial se refresca donde esté montado (Home o Detalle)
        refetchQueries: [{ query: QUERY_CHAT_HISTORY, variables }],
        awaitRefetchQueries: false,
        update(cache, { data }) {
          const fx = data?.sendChat?.effects as
            | Array<{ type: string; payload?: any }>
            | undefined;
          if (fx?.length) applyAssistantEffects(cache, fx);
        },
      });
    } catch {
      toast?.error?.("No pude enviar tu mensaje. Intenta de nuevo.");
    }
  };

  return (
    <Bar>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
        <Input
          placeholder={
            currentGoalId
              ? "Pide un ajuste o agrega algo a este objetivo…"
              : "Escribe “Quiero dormir mejor” para crear objetivo"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onSend()}
          disabled={loading}
        />
        <Button
          onClick={onSend}
          disabled={loading || !text.trim()}
          variant="primary"
        >
          {loading ? "Enviando…" : "Enviar"}
        </Button>
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {/* Chips rápidos, contextuales */}
        <Button variant="ghost" onClick={() => setText("Ajusta el plan")}>
          Ajustar plan
        </Button>
        <Button
          variant="ghost"
          onClick={() => setText("Añade 3 micro-tareas para hoy")}
        >
          Micro-tareas
        </Button>
        <Button
          variant="ghost"
          onClick={() => setText("Posponer tareas de hoy a mañana")}
        >
          Posponer 1 día
        </Button>
      </div>
    </Bar>
  );
}
