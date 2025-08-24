"use client";

import { useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import {
  QUERY_TASKS_TODAY,
  MUTATION_COMPLETE_TASK,
} from "@/graphql/operations";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AssistantComposer from "@/components/assistant/AssistantComposer";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

export default function HomePage() {
  const { data, loading } = useQuery(QUERY_TASKS_TODAY, {
    fetchPolicy: "cache-and-network",
  });
  const [complete] = useMutation(MUTATION_COMPLETE_TASK);

  const onDone = async (id: string) => {
    await complete({
      variables: { taskId: id },
      optimisticResponse: {
        completeTask: {
          __typename: "Task",
          id,
          title: "",
          status: "DONE",
          updatedAt: new Date().toISOString(),
        },
      },
      update(cache) {
        const todayKey = cache.identify({ __typename: "Query" });
        // opcional: leer/escribir QUERY_TASKS_TODAY y marcar DONE
      },
    });
  };

  const tasks = loading ? [] : data?.tasksToday ?? [];

  return (
    <Wrap>
      <h1>Hoy</h1>

      <Card>
        <h3 style={{ marginTop: 0 }}>Tareas de hoy</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {tasks.length === 0 && (
            <div style={{ color: "var(--muted)" }}>
              Nada por hoy. Pídele al asistente micro-tareas ✨
            </div>
          )}
          {tasks.map((t: any) => (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(t.dueAt).toLocaleString("es-CO")} · peso{" "}
                  {t.scoreWeight}
                </div>
              </div>
              <Button
                onClick={() => onDone(t.id)}
                disabled={t.status === "DONE"}
              >
                {t.status === "DONE" ? "Completada" : "Completar"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Progreso simple (streak, %). Puedes rellenar luego con una query. */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Progreso</h3>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>
          Streak: 3 días · 67% completadas esta semana
        </div>
      </Card>

      <AssistantComposer />
    </Wrap>
  );
}
