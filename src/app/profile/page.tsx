// src/app/profile/page.tsx
"use client";
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ME, MUTATION_UPSERT_MY_PROFILE } from "@/graphql/operations";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styled from "styled-components";
import { useToast } from "@/components/ui/toast/ToastProvider";

const Wrap = styled.main`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #0e1320;
  color: var(--fg);
`;

export default function ProfilePage() {
  const { data, refetch } = useQuery(QUERY_ME);
  const { success, error } = useToast();
  const [save, { loading }] = useMutation(MUTATION_UPSERT_MY_PROFILE, {
    onCompleted: () => {
      success("Perfil actualizado ✅");
      refetch();
    },
    onError: () => error("No se pudo actualizar el perfil."),
  });

  const me = data?.me;
  const onSubmit = async (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await save({
      variables: {
        input: {
          name: String(f.get("name") || ""),
          email: String(f.get("email") || ""),
          timeZone: String(f.get("timeZone") || ""),
          locale: String(f.get("locale") || ""),
        },
      },
    });
  };

  return (
    <Wrap>
      <h1>Perfil</h1>
      <Card>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <Input
            name="name"
            defaultValue={me?.name ?? ""}
            placeholder="Nombre"
          />
          <Input
            name="email"
            defaultValue={me?.email ?? ""}
            placeholder="Email"
          />
          <Input
            name="timeZone"
            defaultValue={me?.timeZone ?? "America/Bogota"}
            placeholder="Time zone"
          />
          <Input
            name="locale"
            defaultValue={me?.locale ?? "es-CO"}
            placeholder="Locale"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </form>
      </Card>
    </Wrap>
  );
}
