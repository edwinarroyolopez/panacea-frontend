"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MUTATION_SEND_CHAT,
  MUTATION_REPLAN,
  QUERY_CHAT_HISTORY,
} from "@/graphql/operations";
import { useUI } from "@/store/ui";
import GoalSelector from "@/components/GoalSelector";
import { useToast } from "@/components/ui/toast/ToastProvider";

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
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;
const Typing = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  & > span {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.3;
    animation: bounce 1.4s infinite;
  }
  & > span:nth-child(2) {
    animation-delay: 0.2s;
  }
  & > span:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0.8);
      opacity: 0.3;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  goalId: string | null;
  planId?: string | null;
  createdAt: string;
  __typename?: "ChatMessage";
};

export default function ChatPage() {
  const { currentGoalId } = useUI();
  const toast = useToast?.();
  const [text, setText] = useState("");
  const [ephemeral, setEphemeral] = useState<ChatMsg[]>([]); // bubbles locales (usuario + typing)
  const bottomRef = useRef<HTMLDivElement>(null);

  const variables = useMemo(
    () => ({ goalId: currentGoalId ?? null, limit: 50 }),
    [currentGoalId]
  );

  const { data, refetch, loading, networkStatus } = useQuery(
    QUERY_CHAT_HISTORY,
    {
      variables,
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [sendChat, { loading: sending }] = useMutation(MUTATION_SEND_CHAT);
  const [replan, { loading: replanning }] = useMutation(MUTATION_REPLAN);

  // Autoscroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, ephemeral]);

  const onSend = async () => {
    const msg = text.trim();
    if (!msg) return;

    // 1) Bubble del usuario instantáneo
    const nowISO = new Date().toISOString();
    const tempUser: ChatMsg = {
      id: `temp-u-${Date.now()}`,
      role: "user",
      text: msg,
      goalId: currentGoalId ?? null,
      planId: null,
      createdAt: nowISO,
      __typename: "ChatMessage",
    };
    // 2) Bubble "typing…" del assistant
    const tempTyping: ChatMsg = {
      id: `temp-a-${Date.now() + 1}`,
      role: "assistant",
      text: "…",
      goalId: currentGoalId ?? null,
      planId: null,
      createdAt: nowISO,
      __typename: "ChatMessage",
    };
    setEphemeral((prev) => [...prev, tempUser, tempTyping]);
    setText("");

    try {
      // 3) Mutation (con goalId)
      await sendChat({
        variables: { text: msg, goalId: currentGoalId ?? null },
        // 4) Opcional: empuja respuesta del assistant al cache de chatHistory (optimistic)
        optimisticResponse: {
          sendChat: {
            __typename: "ChatMessage",
            id: tempTyping.id, // el mismo id temporal
            role: "assistant",
            text: "…",
            goalId: currentGoalId ?? null,
            planId: null,
            createdAt: nowISO,
          },
        },
        update(cache, { data: resp }) {
          const reply = resp?.sendChat as ChatMsg | undefined;
          if (!reply) return;
          // Añade la respuesta real al final del chat actual (por goalId)
          try {
            const prev = cache.readQuery<{ chatHistory: ChatMsg[] }>({
              query: QUERY_CHAT_HISTORY,
              variables,
            });
            cache.writeQuery({
              query: QUERY_CHAT_HISTORY,
              variables,
              data: { chatHistory: [...(prev?.chatHistory ?? []), reply] },
            });
          } catch {
            /* si no está en cache, lo traeremos con refetch */
          }
        },
      });
    } catch (e: any) {
      // 5) Error: revertir typing y avisar
      setEphemeral((prev) =>
        prev.filter((m) => m.id !== tempUser.id && m.id !== tempTyping.id)
      );
      toast?.error?.("No se pudo enviar el mensaje. Revisa tu conexión.");
      return;
    }

    // 6) Sync final: limpia los temporales y trae histórico (incluye el bubble real del usuario)
    setEphemeral((prev) =>
      prev.filter((m) => m.id !== tempUser.id && m.id !== tempTyping.id)
    );
    await refetch();
  };

  const onReplan = async () => {
    if (!currentGoalId) {
      (toast?.success ?? alert)("Selecciona un objetivo para ajustar su plan.");
      return;
    }
    // burbuja informativa opcional
    const ack: ChatMsg = {
      id: `temp-info-${Date.now()}`,
      role: "assistant",
      text: "🔧 Ajustando el plan…",
      goalId: currentGoalId,
      planId: null,
      createdAt: new Date().toISOString(),
      __typename: "ChatMessage",
    };
    setEphemeral((p) => [...p, ack]);
    try {
      await replan({ variables: { goalId: currentGoalId } });
      toast?.success?.("Plan ajustado. Revisa nuevas tareas y resumen.");
    } catch {
      toast?.error?.("No se pudo ajustar el plan.");
    } finally {
      setEphemeral((p) => p.filter((m) => m.id !== ack.id));
      await refetch();
    }
  };

  const messages: ChatMsg[] = useMemo(() => {
    const hist = loading ? [] : data?.chatHistory ?? [];
    const all = [...hist, ...ephemeral];

    // dedupe por id
    const seen = new Set<string>();
    const deduped: ChatMsg[] = [];
    for (const m of all) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        deduped.push(m);
      }
    }
    return deduped;
  }, [data, ephemeral, loading]);

  // helper
  const normalizeRole = (r: string): "user" | "assistant" =>
    (r || "").toLowerCase() === "user" ? "user" : "assistant";

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
          {messages.map((m) => {
            const role = normalizeRole(m.role as any);
            const isTyping = m.text === "…" && role === "assistant";
            return isTyping ? (
              <Bubble key={m.id} role="assistant">
                <Typing>
                  <span />
                  <span />
                  <span />
                </Typing>
              </Bubble>
            ) : (
              <Bubble key={m.id} role={role}>
                {m.text}
              </Bubble>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </Card>

      <Card>
        <Row>
          <Input
            placeholder={
              currentGoalId
                ? "Escribe tu mensaje…"
                : "Tip: selecciona un objetivo o escribe 'Quiero dormir mejor'"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && onSend()}
            disabled={sending}
          />
          <Button
            onClick={onSend}
            disabled={sending || !text.trim()}
            variant="primary"
          >
            {sending ? "Enviando…" : "Enviar"}
          </Button>
        </Row>
      </Card>
    </Wrap>
  );
}
