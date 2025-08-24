"use client";

import styled from "styled-components";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ChatPanel from "./ChatPanel";
import { useUI } from "@/store/ui";
import {
  QUERY_GOAL,
  QUERY_PLAN_BY_GOAL,
  QUERY_TASKS_BY_GOAL,
  QUERY_CHAT_HISTORY,
  MUTATION_REPLAN,
} from "@/graphql/operations";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

export default function GoalDetailClient({ goalId }: { goalId: string }) {
  const { setCurrentGoal } = useUI(); // asegúrate de tener este setter en tu zustand

  // Guardar goalId actual en Zustand (y limpiarlo al salir si quieres)
  useEffect(() => {
    setCurrentGoal(goalId);
    return () => setCurrentGoal(null as any);
  }, [goalId, setCurrentGoal]);

  const vars = useMemo(() => ({ goalId }), [goalId]);

  const { data: goalData } = useQuery(QUERY_GOAL, {
    variables: { id: goalId },
    fetchPolicy: "cache-and-network",
  });

  const { data: planData } = useQuery(QUERY_PLAN_BY_GOAL, {
    variables: vars,
    fetchPolicy: "cache-and-network",
  });

  const { data: tasksData } = useQuery(QUERY_TASKS_BY_GOAL, {
    variables: vars,
    fetchPolicy: "cache-and-network",
  });

  const { data: chatData, refetch: refetchChat } = useQuery(
    QUERY_CHAT_HISTORY,
    {
      variables: { goalId, limit: 50 },
      fetchPolicy: "cache-and-network",
    }
  );

  const [replan, { loading: replanning }] = useMutation(MUTATION_REPLAN);

  const onReplan = async () => {
    await replan({
      variables: { goalId },
      // refresca tareas y plan; el chat se refresca abajo con onUpdated
      refetchQueries: [
        { query: QUERY_TASKS_BY_GOAL, variables: { goalId } },
        { query: QUERY_PLAN_BY_GOAL, variables: { goalId } },
      ],
      update(cache, { data }) {
        // opcional: actualiza plan en cache sin esperar refetch
        const newPlan = data?.replan;
        if (newPlan) {
          cache.writeQuery({
            query: QUERY_PLAN_BY_GOAL,
            variables: { goalId },
            data: { planByGoal: newPlan },
          });
        }
      },
    });
    await refetchChat();
  };

  const goal = goalData?.goal;
  const tasks = tasksData?.tasksByGoal ?? [];
  const messages = chatData?.chatHistory ?? [];

  return (
    <Wrap>
      <h1>Objetivo</h1>

      <Card>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {goal?.title ?? "Objetivo"}
            {goal?.domain ? (
              <span
                style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)" }}
              >
                ({goal.domain})
              </span>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/plan/${goalId}`}>Ver plan</Link>
            <Button onClick={onReplan} disabled={replanning}>
              {replanning ? "Ajustando…" : "Ajustar plan (IA)"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Plan snapshot simple */}
      {planData?.planByGoal && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Resumen del plan
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {planData.planByGoal.summary}
          </div>
        </Card>
      )}

      {/* Tareas (mini) */}
      {!!tasks.length && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Siguientes tareas
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {tasks.slice(0, 5).map((t: any) => (
              <li key={t.id}>
                {t.title} · {new Date(t.dueAt).toLocaleString("es-CO")}
              </li>
            ))}
          </ul>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            (Ves todas las tareas en <Link href={`/plan/${goalId}`}>Plan</Link>)
          </div>
        </Card>
      )}

      {/* Chat contextual del objetivo */}
      <Card>
        <ChatPanel
          goalId={goalId}
          messages={messages}
          onUpdated={refetchChat}
        />
      </Card>
    </Wrap>
  );
}
