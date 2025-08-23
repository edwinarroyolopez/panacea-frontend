"use client";

import { useQuery } from "@apollo/client";
import styled from "styled-components";
import { QUERY_GOALS } from "@/graphql/operations";
import { useUI } from "@/store/ui";

const Box = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;
const Pill = styled.button<{ active?: boolean }>`
  border: 1px solid var(--border);
  background: ${({ active }) => (active ? "var(--primary)" : "transparent")};
  color: ${({ active }) => (active ? "#0b0e14" : "var(--fg)")};
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
`;

export default function GoalSelector() {
  const { currentGoalId, setGoalId, clearGoal } = useUI();
  const { data } = useQuery(QUERY_GOALS, { fetchPolicy: "cache-and-network" });

  return (
    <Box>
      <span style={{ color: "var(--muted)" }}>Objetivo:</span>
      <Pill onClick={clearGoal} active={!currentGoalId}>
        Todos
      </Pill>
      {data?.goals?.map((g: any) => (
        <Pill
          key={g.id}
          active={currentGoalId === g.id}
          onClick={() => setGoalId(g.id)}
        >
          {g.title}
        </Pill>
      ))}
    </Box>
  );
}
