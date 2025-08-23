"use client";

import { ReactNode, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import { makeApolloClient } from "@/lib/apolloClient";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@/styles/global";
import { theme } from "@/styles/theme";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return (
    <StyledComponentsRegistry>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          {children}
        </ThemeProvider>
      </ApolloProvider>
    </StyledComponentsRegistry>
  );
}
