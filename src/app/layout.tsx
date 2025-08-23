// src/app/layout.tsx
import Providers from "./providers";
import AppShell from "@/components/navigation/AppShell";

export const metadata = { title: "Panacea | Ambient AI", description: "MVP ÜMA Health" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
