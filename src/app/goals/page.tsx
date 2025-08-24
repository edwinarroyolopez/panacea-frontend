"use client";

import { useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  QUERY_GOALS,
  MUTATION_UPSERT_GOAL,
  MUTATION_GENERATE_PLAN,
  QUERY_PLAN_BY_GOAL,
  MUTATION_DELETE_GOAL,
} from "@/graphql/operations";
import { Input } from "@/components/ui/Input";
import AssistantComposer from "@/components/assistant/AssistantComposer";
import { useState, useMemo } from "react";
import { useUI } from "@/store/ui";
import { useToast } from "@/components/ui/toast/ToastProvider";

const Wrap = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;

export default function GoalsPage() {
  const { data, refetch } = useQuery(QUERY_GOALS, {
    fetchPolicy: "cache-and-network",
  });
  const [upsert] = useMutation(MUTATION_UPSERT_GOAL);

  const onCreate = async (formData: FormData) => {
    const title = String(formData.get("title") ?? "");
    const domain = String(formData.get("domain") ?? "SLEEP").toUpperCase();
    const target = String(formData.get("target") ?? "") || null;
    await upsert({ variables: { input: { title, domain, target } } });
    await refetch();
  };

  return (
    <Wrap>
      <h1>Objetivos</h1>

      <Card>
        <form action={onCreate} style={{ display: "grid", gap: 8 }}>
          <Input name="title" placeholder="Título (ej: Dormir mejor)" />
          <select
            name="domain"
            style={{
              padding: 10,
              borderRadius: 10,
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            <option value="SLEEP">sleep</option>
            <option value="STRESS">stress</option>
            <option value="WEIGHT">weight</option>
          </select>
          <Input name="target" placeholder="Meta (ej: Dormir 7.5h)" />
          <Button type="submit">Crear</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Mis objetivos</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {(data?.goals ?? []).map((g: any) => (
            <GoalRow key={g.id} goal={g} />
          ))}
        </div>
      </Card>

      <AssistantComposer />
    </Wrap>
  );
}

/** --------- Fila con Ver/Generar plan + Eliminar --------- */
function GoalRow({
  goal,
}: {
  goal: { id: string; title: string; domain: string };
}) {
  const { currentGoalId, setGoalId } = useUI();
  const toast = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: planData, refetch } = useQuery(QUERY_PLAN_BY_GOAL, {
    variables: { goalId: goal.id },
    fetchPolicy: "cache-first",
  });
  const hasPlan = Boolean(planData?.planByGoal?.id);

  const [genPlan] = useMutation(MUTATION_GENERATE_PLAN);
  const [deleteGoal] = useMutation(MUTATION_DELETE_GOAL, {
    variables: { goalId: goal.id },
    // UI optimista: quita el goal de la lista ya
    optimisticResponse: { deleteGoal: true },
    update(cache) {
      cache.modify({
        fields: {
          goals(existingRefs: any[] = [], { readField }) {
            return existingRefs.filter(
              (ref) => readField("id", ref) !== goal.id
            );
          },
        },
      });
    },
  });

  const onGenerate = async () => {
    setIsGenerating(true);
    try {
      await genPlan({ variables: { goalId: goal.id } });
      await refetch();
      toast?.success?.("Plan generado ✅");
    } catch {
      toast?.error?.("No se pudo generar el plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(`¿Eliminar "${goal.title}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteGoal();
      // si borraste el objetivo activo, limpialo del store
      if (currentGoalId === goal.id) setGoalId(undefined);
      toast?.success?.("Objetivo eliminado");
    } catch {
      toast?.error?.("No se pudo eliminar el objetivo");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>{goal.title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          ({goal.domain})
        </div>
      </div>

      {hasPlan ? (
        <Link href={`/plan/${goal.id}`}>
          <Button variant="primary">Ver plan</Button>
        </Link>
      ) : (
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generando…" : "Generar plan"}
        </Button>
      )}

      <Button
        onClick={onDelete}
        disabled={isDeleting}
        style={{ borderColor: "#ef4444", color: "#ef4444" }}
      >
        {isDeleting ? "Eliminando…" : "Eliminar"}
      </Button>
    </div>
  );
}
