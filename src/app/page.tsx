"use client";

import Link from "next/link";
import styled from "styled-components";

const Wrap = styled.main`
  max-width: 1040px; margin: 0 auto; padding: 32px 20px;
`;
const Card = styled.div`
  background: var(--card); border: 1px solid var(--border);
  border-radius: 18px; padding: 24px; margin-bottom: 16px;
`;

export default function Home() {
  return (
    <Wrap>
      <h1>Panacea – Ambient AI</h1>
      <p>Demo: Chat con IA que crea objetivos, genera planes y tareas en tiempo real.</p>
      <Card>
        <ul>
          <li><Link href="/chat">Chat</Link></li>
          <li><Link href="/goals">Goals</Link></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
      </Card>
    </Wrap>
  );
}
