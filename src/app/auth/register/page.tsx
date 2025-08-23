"use client";

import { useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { MUTATION_REGISTER } from "@/graphql/operations";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useEffect, useState } from "react";

const Wrap = styled.main`
  max-width: 420px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
`;
const Title = styled.h1`
  margin: 0;
`;
const Form = styled.form`
  display: grid;
  gap: 12px;
`;
const Field = styled.div`
  display: grid;
  gap: 6px;
`;
const Label = styled.label`
  font-size: 13px;
  color: var(--muted);
`;
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #0e1320;
  color: var(--fg);
`;
const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
`;
const Helper = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--muted);
`;

export default function RegisterPage() {
  const router = useRouter();
  const client = useApolloClient();
  const { success, error } = useToast();

  // pequeño UX: si ya hay token, redirige
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [register, { loading }] = useMutation(MUTATION_REGISTER, {
    onCompleted: async ({ register }) => {
      localStorage.setItem("token", register.accessToken);
      success("Cuenta creada ✅");
      await client.resetStore();
      router.push("/dashboard");
    },
    onError: (e) => {
      const msg = e.message.includes("Email ya registrado")
        ? "Ese email ya está registrado."
        : "No se pudo crear la cuenta.";
      error(msg);
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const confirm = String(f.get("confirm") || "");

    if (!email || !password)
      return error("Email y contraseña son obligatorios.");
    if (password.length < 6)
      return error("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return error("Las contraseñas no coinciden.");

    await register({ variables: { email, password, name: name || undefined } });
  };

  return (
    <Wrap>
      <Title>Crear cuenta</Title>
      <Card>
        <Form onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="name">Nombre (opcional)</Label>
            <Input id="name" name="name" placeholder="Tu nombre" />
          </Field>

          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tucorreo@acme.com"
              required
            />
          </Field>

          <Field>
            <Label htmlFor="password">Contraseña</Label>
            <Row>
              <Input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <Button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label="Mostrar/ocultar contraseña"
              >
                {showPass ? "Ocultar" : "Mostrar"}
              </Button>
            </Row>
          </Field>

          <Field>
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Row>
              <Input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repite la contraseña"
                required
              />
              <Button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Mostrar/ocultar confirmación"
              >
                {showConfirm ? "Ocultar" : "Mostrar"}
              </Button>
            </Row>
            <Helper>
              Usaremos tu email para iniciar sesión y avisarte de cambios
              importantes.
            </Helper>
          </Field>

          <Button type="submit" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </Form>
      </Card>

      <Helper>
        ¿Ya tienes cuenta? <Link href="/auth/login">Inicia sesión</Link>
      </Helper>
    </Wrap>
  );
}
