"use client";

import Link from "next/link";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  MUTATION_COMPLETE_TASK,
  QUERY_TASKS_BY_GOAL,
} from "@/graphql/operations";
import { markTaskDoneInCache } from "@/lib/cache";
import { useToast } from "@/components/ui/toast/ToastProvider";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

export default function PlanClient({ goalId }: { goalId: string }) {
  const { success, error } = useToast();

  const { data, loading } = useQuery(QUERY_TASKS_BY_GOAL, {
    variables: { goalId },
    skip: !goalId,
    fetchPolicy: "cache-and-network",
  });

  const [complete] = useMutation(MUTATION_COMPLETE_TASK, {
    optimisticResponse: (vars) => ({
      completeTask: {
        __typename: "Task",
        id: (vars as any).taskId,
        title: "", // no lo usamos aquí, pero cumple el selection set
        status: "DONE",
        updatedAt: new Date().toISOString(),
      },
    }),
    update(cache, { data }) {
      if (!goalId) return;
      const tid = data?.completeTask?.id;
      if (tid) markTaskDoneInCache(cache, tid, goalId);
    },
    onCompleted() {
      success("Tarea completada ✅");
    },
    onError(e) {
      if (e.message.includes("FAILED_PRECONDITION")) {
        error("Ajustando índices de Firestore, reintenta en unos minutos.");
      } else {
        error("No se pudo completar la tarea.");
      }
    },
  });

  const onComplete = async (taskId: string) => {
    await complete({ variables: { taskId } });
    // no hace falta refetch: optimistic + update ya actualizan la UI
  };

  return (
    <Wrap>
      <h1>Plan</h1>

      <Card>
        <div style={{ marginBottom: 8 }}>
          <Link href="/chat">Ir al Chat</Link>
        </div>

        {loading && <p>Cargando tareas…</p>}

        <div style={{ display: "grid", gap: 10 }}>
          {data?.tasksByGoal?.map((t: any) => (
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
                onClick={() => onComplete(t.id)}
                disabled={t.status === "DONE"}
              >
                {t.status === "DONE" ? "Completada" : "Completar"}
              </Button>
            </div>
          ))}
          {!loading &&
            (!data?.tasksByGoal || data.tasksByGoal.length === 0) && (
              <p>
                No hay tareas aún. Genera o ajusta el plan desde el Chat o el
                Dashboard.
              </p>
            )}
        </div>
      </Card>

    </Wrap>
  );
}
