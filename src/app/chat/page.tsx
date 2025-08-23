"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MUTATION_SEND_CHAT, QUERY_CHAT_HISTORY } from "@/graphql/operations";
import { useUI } from "@/store/ui";
import GoalSelector from "@/components/GoalSelector";
import { MUTATION_REPLAN } from "@/graphql/operations";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;
const Bubble = styled.div<{ role: "user" | "assistant" }>`
  background: ${({ role }) => (role === "user" ? "#182235" : "#121a2b")};
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px 14px;
  white-space: pre-wrap;
`;

export default function ChatPage() {
  const { currentGoalId } = useUI();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const variables = useMemo(
    () => ({ goalId: currentGoalId ?? null, limit: 50 }),
    [currentGoalId]
  );
  const { data, refetch, loading } = useQuery(QUERY_CHAT_HISTORY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const [sendChat, { loading: sending }] = useMutation(MUTATION_SEND_CHAT);
  const [replan, { loading: replanning }] = useMutation(MUTATION_REPLAN);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const onSend = async () => {
    if (!text.trim()) return;
    await sendChat({ variables: { text } });
    setText("");
    await refetch();
  };

  const onReplan = async () => {
    if (!currentGoalId) {
      alert("Selecciona un objetivo para ajustar su plan.");
      return;
    }
    await replan({ variables: { goalId: currentGoalId } });
    // Puedes empujar un mensaje informativo al chat o solo refrescar historial:
    await refetch();
    alert("Plan ajustado con IA. Revisa las nuevas tareas y el resumen.");
  };

  return (
    <Wrap>
      <h1>Chat</h1>

      <Card>
        <GoalSelector />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button onClick={onReplan} disabled={!currentGoalId || replanning}>
            {replanning ? "Ajustando…" : "Ajustar plan (IA)"}
          </Button>
        </div>
      </Card>

      <Card>
        <div style={{ display: "grid", gap: 10, minHeight: 200 }}>
          {(loading ? [] : data?.chatHistory ?? []).map((m: any) => (
            <Bubble key={m.id} role={m.role}>
              {m.text}
            </Bubble>
          ))}
          <div ref={bottomRef} />
        </div>
      </Card>

      <Card>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}
        >
          <Input
            placeholder={
              currentGoalId
                ? "Escribe tu mensaje…"
                : "Tip: selecciona un objetivo o escribe 'Quiero dormir mejor'"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
          <Button onClick={onSend} disabled={sending} variant="primary">
            {sending ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      </Card>
    </Wrap>
  );
}
