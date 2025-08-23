"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styled from "styled-components";
import {
  MUTATION_COMPLETE_TASK,
  QUERY_TASKS_BY_GOAL,
} from "@/graphql/operations";
import { markTaskDoneInCache } from "@/lib/cache";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

export default function PlanPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const { data, refetch } = useQuery(QUERY_TASKS_BY_GOAL, {
    variables: { goalId },
    skip: !goalId,
    fetchPolicy: "cache-and-network",
  });
  const [complete] = useMutation(MUTATION_COMPLETE_TASK, {
    optimisticResponse: (vars) => ({
      completeTask: {
        __typename: "Task",
        id: (vars as any).taskId,
        title: "", // puedes mantenerlo vacío
        status: "DONE",
        updatedAt: new Date().toISOString(),
      },
    }),
    update(cache, { data }) {
      if (!goalId) return;
      const tid = data?.completeTask?.id;
      if (!tid) return;
      markTaskDoneInCache(cache, tid, goalId as string);
    },
  });

  const onComplete = async (taskId: string) => {
    await complete({ variables: { taskId } });
    // await refetch();
  };

  return (
    <Wrap>
      <h1>Plan</h1>
      <Card>
        <div style={{ marginBottom: 8 }}>
          <Link href="/chat">Ir al Chat</Link>
        </div>
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
        </div>
      </Card>
    </Wrap>
  );
}
