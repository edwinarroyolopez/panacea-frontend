// src/app/plan/[goalId]/AddTasksForm.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { MUTATION_ADD_TASKS, QUERY_TASKS_BY_GOAL } from "@/graphql/operations";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AddTasksForm({
  planId,
  goalId,
}: {
  planId: string;
  goalId: string;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<string>(""); // "2025-08-31T21:00"
  const [weight, setWeight] = useState(3);

  const [addTasks, { loading }] = useMutation(MUTATION_ADD_TASKS);

  const onAdd = async () => {
    if (!title || !due) return;
    const dueISO = new Date(due).toISOString();
    await addTasks({
      variables: {
        input: {
          planId,
          items: [{ title, dueAt: dueISO, scoreWeight: weight }],
        },
      },
      // Optimistic y cache update de la vista del plan
      update(cache, { data }) {
        const created = data?.addTasks ?? [];
        if (!created.length) return;

        // 1) Actualiza lista por goal
        try {
          const prev = cache.readQuery<{ tasksByGoal: any[] }>({
            query: QUERY_TASKS_BY_GOAL,
            variables: { goalId },
          });
          cache.writeQuery({
            query: QUERY_TASKS_BY_GOAL,
            variables: { goalId },
            data: { tasksByGoal: [...(prev?.tasksByGoal ?? []), ...created] },
          });
        } catch {}

        // 2) (Opcional) Si tienes Today en cache, agrégalas si dueAt es hoy
        // Podrías leer QUERY_TASKS_TODAY y pushear si cae en rango.
      },
    });
    setTitle("");
    setDue("");
    setWeight(3);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0 }}>Agregar tarea</h3>
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        type="datetime-local"
        value={due}
        onChange={(e) => setDue(e.target.value)}
      />
      <Input
        type="number"
        min={1}
        max={5}
        value={weight}
        onChange={(e) => setWeight(parseInt(e.target.value || "3", 10))}
      />
      <Button
        onClick={onAdd}
        disabled={loading || !title || !due}
        variant="primary"
      >
        Agregar
      </Button>
    </div>
  );
}
