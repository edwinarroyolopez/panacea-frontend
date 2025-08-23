"use client";

import { useMemo } from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "@apollo/client";
import { useUI } from "@/store/ui";
import GoalSelector from "@/components/GoalSelector";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  QUERY_PLAN_BY_GOAL,
  QUERY_TASKS_BY_GOAL,
  MUTATION_GENERATE_PLAN,
  MUTATION_COMPLETE_TASK,
} from "@/graphql/operations";

const Wrap = styled.main`
  max-width: 1100px; margin: 0 auto; padding: 24px 16px; display: grid; gap: 16px;
`;
const Grid = styled.div`
  display: grid; gap: 16px;
  grid-template-columns: 1.2fr .8fr;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const Stat = styled.div`
  background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px;
  display: grid; gap: 4px;
`;
const List = styled.div` display: grid; gap: 10px; `;

function isTodayISO(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString(); // suficiente para MVP (timezone local)
}

export default function DashboardClient() {
  const { currentGoalId } = useUI();

  const { data: planData, loading: planLoading } = useQuery(QUERY_PLAN_BY_GOAL, {
    variables: { goalId: currentGoalId! },
    skip: !currentGoalId,
    fetchPolicy: "cache-and-network",
  });

  const { data: tasksData, loading: tasksLoading, refetch } = useQuery(QUERY_TASKS_BY_GOAL, {
    variables: { goalId: currentGoalId! },
    skip: !currentGoalId,
    fetchPolicy: "cache-and-network",
  });

  const [generatePlan, { loading: genLoading }] = useMutation(MUTATION_GENERATE_PLAN);
  const [completeTask] = useMutation(MUTATION_COMPLETE_TASK);

  const tasks = tasksData?.tasksByGoal ?? [];
  const todayTasks = useMemo(() => tasks.filter((t: any) => isTodayISO(t.dueAt)), [tasks]);
  const done = tasks.filter((t: any) => t.status === "DONE").length;
  const pending = tasks.length - done;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const onGenerate = async () => {
    if (!currentGoalId) return;
    await generatePlan({ variables: { goalId: currentGoalId } });
    await refetch();
  };

  const onComplete = async (taskId: string) => {
    await completeTask({ variables: { taskId } });
    await refetch();
  };

  return (
    <Wrap>
      <h1>Tablero</h1>

      <Card>
        <GoalSelector />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Button onClick={onGenerate} disabled={!currentGoalId || genLoading}>
            {genLoading ? "Generando plan…" : "Generar/Re-generar plan"}
          </Button>
        </div>
      </Card>

      {!currentGoalId ? (
        <Card><p>Selecciona un objetivo para ver su plan y tareas de hoy.</p></Card>
      ) : (
        <Grid>
          <div style={{ display: "grid", gap: 16 }}>
            <Stat>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Progreso</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{completion}%</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{done} completadas · {pending} pendientes</div>
            </Stat>

            <Card>
              <h3 style={{ marginTop: 0 }}>Tareas de hoy</h3>
              {tasksLoading ? <p>Cargando…</p> : (
                <List>
                  {todayTasks.length === 0 && <p>No hay tareas para hoy. Genera el plan o ajusta el existente.</p>}
                  {todayTasks.map((t: any) => (
                    <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {new Date(t.dueAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · peso {t.scoreWeight}
                        </div>
                      </div>
                      <Button onClick={() => onComplete(t.id)} disabled={t.status === "DONE"}>
                        {t.status === "DONE" ? "Completada" : "Completar"}
                      </Button>
                    </div>
                  ))}
                </List>
              )}
            </Card>
          </div>

          <Card>
            <h3 style={{ marginTop: 0 }}>Plan</h3>
            {planLoading ? <p>Cargando…</p> : planData?.planByGoal ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div><strong>Resumen:</strong><br />{planData.planByGoal.summary}</div>
                {planData.planByGoal.recommendations?.length > 0 && (
                  <div>
                    <strong>Recomendaciones:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {planData.planByGoal.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {planData.planByGoal.weeklySchedule?.length > 0 && (
                  <div>
                    <strong>Agenda semanal:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {planData.planByGoal.weeklySchedule.map((it: any, i: number) => (
                        <li key={i}>{it.day}: {it.action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>No hay plan para este objetivo.</p>
                <Button onClick={onGenerate} disabled={genLoading}>
                  {genLoading ? "Generando…" : "Generar plan ahora"}
                </Button>
              </div>
            )}
          </Card>
        </Grid>
      )}
    </Wrap>
  );
}
