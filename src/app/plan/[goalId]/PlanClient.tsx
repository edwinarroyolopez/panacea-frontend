"use client";

import Link from "next/link";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  MUTATION_COMPLETE_TASK,
  QUERY_TASKS_BY_GOAL,
  QUERY_PLAN_BY_GOAL,
  QUERY_GOAL, // <- agregar
} from "@/graphql/operations";
import { markTaskDoneInCache } from "@/lib/cache";
import { useToast } from "@/components/ui/toast/ToastProvider";
import AddTasksForm from "./AddTasksForm";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

const Tag = styled.span`
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted);
`;

export default function PlanClient({ goalId }: { goalId: string }) {
  const { success, error } = useToast();

  // a) título del objetivo
  const { data: goalData } = useQuery(QUERY_GOAL, {
    variables: { id: goalId },
    skip: !goalId,
    fetchPolicy: "cache-first",
  });
  const goal = goalData?.goal;
  const title = goal?.title;
  const domain = goal?.domain;

  // b) plan para obtener planId
  const { data: planData } = useQuery(QUERY_PLAN_BY_GOAL, {
    variables: { goalId },
    skip: !goalId,
    fetchPolicy: "cache-first",
  });

  // c) tareas (fallback para planId)
  const { data: tasksData, loading } = useQuery(QUERY_TASKS_BY_GOAL, {
    variables: { goalId },
    skip: !goalId,
    fetchPolicy: "cache-and-network",
  });

  const planId: string | undefined =
    planData?.planByGoal?.id ?? tasksData?.tasksByGoal?.[0]?.planId;

  const [complete] = useMutation(MUTATION_COMPLETE_TASK, {
    optimisticResponse: (vars) => ({
      completeTask: {
        __typename: "Task",
        id: (vars as any).taskId,
        title: "",
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
  };

  const tasks = tasksData?.tasksByGoal ?? [];

  // (Opcional) poner el título en la pestaña
  if (typeof document !== "undefined") {
    document.title = title ? `Plan — ${title}` : "Plan";
  }

  return (
    <Wrap>
      <h1>
        {title ?? "Plan"}
        {domain ? <Tag>{domain.toUpperCase()}</Tag> : null}
      </h1>

      <Card>
        <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
          <Link href="/goals">← Volver a objetivos</Link>
          <Link href="/chat">Ir al Chat</Link>
        </div>

        {planId ? (
          <div style={{ marginBottom: 16 }}>
            <AddTasksForm planId={planId} goalId={goalId} />
          </div>
        ) : (
          <p style={{ marginBottom: 16 }}>
            Aún no hay plan para este objetivo. Genera uno desde el Chat o el
            Dashboard.
          </p>
        )}

        {loading && <p>Cargando tareas…</p>}

        <div style={{ display: "grid", gap: 10 }}>
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
                onClick={() => onComplete(t.id)}
                disabled={t.status === "DONE"}
              >
                {t.status === "DONE" ? "Completada" : "Completar"}
              </Button>
            </div>
          ))}

          {!loading && tasks.length === 0 && (
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
