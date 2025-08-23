"use client";
import { useMutation, useQuery } from "@apollo/client";
import styled from "styled-components";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MUTATION_GENERATE_PLAN, MUTATION_UPSERT_GOAL, QUERY_GOALS } from "@/graphql/operations";
import { useState } from "react";
import Link from "next/link";
import { useUI } from "@/store/ui";

const Wrap = styled.main` max-width: 980px; margin: 0 auto; padding: 24px 16px; display: grid; gap: 16px; `;
const Row = styled.div` display: grid; grid-template-columns: 1fr auto; gap: 8px; `;

export default function GoalsPage() {
  const { setGoalId } = useUI();
  const { data, refetch } = useQuery(QUERY_GOALS, { fetchPolicy: "cache-and-network" });
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<"SLEEP"|"WEIGHT"|"STRESS">("SLEEP");
  const [target, setTarget] = useState("");

  const [createGoal, { loading: creating }] = useMutation(MUTATION_UPSERT_GOAL);
  const [genPlan, { loading: planning }] = useMutation(MUTATION_GENERATE_PLAN);

  const onCreate = async () => {
    await createGoal({ variables: { input: { title, domain, target: target || null } } });
    setTitle(""); setTarget("");
    await refetch();
  };

  const onPlan = async (goalId: string) => {
    setGoalId(goalId);
    await genPlan({ variables: { goalId } });
    alert("Plan generado. Revisa /plan/" + goalId + " o vete al Chat.");
  };

  return (
    <Wrap>
      <h1>Goals</h1>

      <Card>
        <h3>Crear objetivo</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <Input placeholder="Título (p. ej. Dormir mejor)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Row>
            <select value={domain} onChange={(e) => setDomain(e.target.value as any)}>
              <option value="SLEEP">sleep</option>
              <option value="WEIGHT">weight</option>
              <option value="STRESS">stress</option>
            </select>
            <Input placeholder="Target (p. ej. Dormir 7.5h)" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Row>
          <Button onClick={onCreate} disabled={creating} variant="primary">
            {creating ? "Creando…" : "Crear"}
          </Button>
        </div>
      </Card>

      <Card>
        <h3>Mis objetivos</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {data?.goals?.map((g: any) => (
            <div key={g.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8 }}>
              <div>
                <strong>{g.title}</strong> <span style={{ color: "var(--muted)" }}>({g.domain})</span>
              </div>
              <Link href={`/plan/${g.id}`} onClick={() => setGoalId(g.id)}>Ver plan</Link>
              <Button onClick={() => onPlan(g.id)} disabled={planning}>Generar plan</Button>
            </div>
          ))}
        </div>
      </Card>
    </Wrap>
  );
}
