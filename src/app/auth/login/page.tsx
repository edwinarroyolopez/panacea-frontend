"use client";
import { useMutation } from "@apollo/client";
import { MUTATION_LOGIN } from "@/graphql/operations";
import styled from "styled-components";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useRouter } from "next/navigation";

const Wrap = styled.main`
  max-width: 420px;
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

export default function LoginPage() {
  const { success, error } = useToast();
  const router = useRouter();
  const [login, { loading }] = useMutation(MUTATION_LOGIN, {
    onCompleted: ({ login }) => {
      localStorage.setItem("token", login.accessToken);
      success("Sesión iniciada ✅");
      router.push("/dashboard");
    },
    onError: () => error("Credenciales inválidas"),
  });

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await login({
      variables: {
        email: String(f.get("email")),
        password: String(f.get("password")),
      },
    });
  };

  return (
    <Wrap>
      <h1>Ingresar</h1>
      <Card>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <Input name="email" type="email" placeholder="Email" required />
          <Input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Card>
    </Wrap>
  );
}
