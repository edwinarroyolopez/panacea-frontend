// src/app/goals/[goalId]/page.tsx
import GoalDetailClient from "./GoalDetailClient";

export default function GoalDetailPage({ params }: { params: { goalId: string } }) {
  return <GoalDetailClient goalId={params.goalId} />;
}
