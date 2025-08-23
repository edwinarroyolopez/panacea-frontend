// src/app/plan/[goalId]/page.tsx
import PlanClient from "./PlanClient";

export default function PlanPage({
  params,
}: {
  params: { goalId: string };
}) {
  // Aquí SIEMPRE existe params.goalId (en server)
  return <PlanClient goalId={params.goalId} />;
}
