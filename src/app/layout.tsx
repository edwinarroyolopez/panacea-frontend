import Providers from "./providers";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

export const metadata = {
  title: "Panacea | Ambient AI",
  description: "MVP ÜMA Health - Chat + Orchestrator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
