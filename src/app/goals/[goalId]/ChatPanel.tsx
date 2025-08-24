"use client";

import styled from "styled-components";
import { useState, useMemo, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { MUTATION_SEND_CHAT, QUERY_CHAT_HISTORY } from "@/graphql/operations";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { applyAssistantEffects } from "@/lib/effects";

const Panel = styled.div`
  display: grid;
  gap: 10px;
`;
const Bubble = styled.div<{ role: "user" | "assistant" }>`
  background: ${({ role }) => (role === "user" ? "#182235" : "#121a2b")};
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
  white-space: pre-wrap;
`;

const normalizeRole = (r: string): "user" | "assistant" =>
  (r || "").toLowerCase() === "user" ? "user" : "assistant";

export default function ChatPanel({
  goalId,
  messages,
  onUpdated,
}: {
  goalId: string;
  messages: any[];
  onUpdated: () => Promise<any>;
}) {
  const [text, setText] = useState("");
  const [sendChat, { loading }] = useMutation(MUTATION_SEND_CHAT);
  const bottomRef = useRef<HTMLDivElement>(null);

  const vars = useMemo(() => ({ goalId, limit: 50 }), [goalId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async () => {
    const msg = text.trim();
    if (!msg) return;
    setText("");
    await sendChat({
      variables: { text: msg, goalId },
      refetchQueries: [{ query: QUERY_CHAT_HISTORY, variables: vars }],
      update(cache, { data }) {
        const fx = data?.sendChat?.effects as
          | Array<{ type: string; payload?: any }>
          | undefined;
        if (fx?.length) applyAssistantEffects(cache, fx);
      },
    });
    await onUpdated();
  };

  return (
    <Panel>
      <h3 style={{ marginTop: 0 }}>Chat del objetivo</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {messages.map((m) => (
          <Bubble key={m.id} role={normalizeRole(m.role)}>
            {m.text}
          </Bubble>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
        <Input
          placeholder="Pídele al asistente que ajuste este objetivo…"
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
    </Panel>
  );
}
