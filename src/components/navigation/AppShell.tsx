// src/components/navigation/AppShell.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { useUI } from "@/store/ui";
import { useEffect, useMemo } from "react";

const Shell = styled.div`
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;
const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
`;
const Brand = styled.div`
  font-weight: 800;
  letter-spacing: 0.3px;
`;
const IconBtn = styled.button`
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg);
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
`;
const Content = styled.main`
  padding: 16px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
`;
const DrawerOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: ${(p) => (p.open ? 1 : 0)};
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;
const Drawer = styled.nav<{ open: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 78%;
  max-width: 320px;
  background: var(--card);
  border-right: 1px solid var(--border);
  transform: translateX(${(p) => (p.open ? "0" : "-100%")});
  transition: transform 0.2s ease;
  padding: 16px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const NavLink = styled(Link)<{ active?: boolean }>`
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid ${(p) => (p.active ? "var(--primary)" : "var(--border)")};
  background: ${(p) => (p.active ? "rgba(110,231,183,.15)" : "transparent")};
`;
const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// Bottom tabs (solo móvil)
const Tabs = styled.nav`
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--border);
  background: var(--card);
  @media (min-width: 900px) {
    display: none;
  }
`;
const Tab = styled(Link)<{ active?: boolean }>`
  padding: 10px 8px;
  text-align: center;
  font-size: 12px;
  border-top: 2px solid ${(p) => (p.active ? "var(--primary)" : "transparent")};
`;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { navOpen, toggleNav, closeNav, currentGoalId } = useUI();

  const links = useMemo(() => {
    const base = [
      { href: "/", label: "Inicio" },
      { href: "/goals", label: "Goals" },
      { href: "/dashboard", label: "Tablero" },
      { href: "/chat", label: "Chat" },
    ];
    if (currentGoalId)
      base.splice(3, 0, { href: `/plan/${currentGoalId}`, label: "Plan" });
    return base;
  }, [currentGoalId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isPublic =
      pathname?.startsWith("/auth/login") ||
      pathname?.startsWith("/auth/register") ||
      pathname === "/";
    if (isPublic) return;

    const token = localStorage.getItem("token");
    if (!token) router.replace("/auth/login");
  }, [pathname, router]);

  return (
    <Shell>
      <a
        href="#contenido"
        style={{ position: "absolute", left: -9999 }}
        className="skip"
      >
        Saltar al contenido
      </a>
      <Header>
        <Row>
          <IconBtn aria-label="Abrir menú" onClick={toggleNav}>
            &#9776;
          </IconBtn>
          <Brand>Panacea</Brand>
        </Row>
        <Row style={{ gap: 12, display: "none" }} aria-hidden>
          {/* Si quisieras acciones rápidas en desktop */}
        </Row>
      </Header>

      {/* Drawer móvil */}
      <DrawerOverlay open={navOpen} onClick={closeNav} />
      <Drawer open={navOpen} role="dialog" aria-modal aria-label="Menú">
        <Row style={{ justifyContent: "space-between" }}>
          <Brand>Menú</Brand>
          <IconBtn onClick={closeNav} aria-label="Cerrar">
            ✕
          </IconBtn>
        </Row>
        <div style={{ height: 8 }} />
        {links.map((l) => (
          <NavLink
            key={l.href}
            href={l.href}
            onClick={closeNav}
            active={pathname === l.href}
          >
            {l.label}
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", fontSize: 12, color: "var(--muted)" }}>
          v0.1 • mobile-first
        </div>
      </Drawer>

      <Content id="contenido">{children}</Content>

      {/* Tabs móviles */}
      <Tabs>
        {links.slice(0, 4).map((l) => (
          <Tab key={l.href} href={l.href} active={pathname === l.href}>
            {l.label}
          </Tab>
        ))}
      </Tabs>
    </Shell>
  );
}
