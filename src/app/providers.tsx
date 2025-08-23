"use client";

import { ReactNode, useMemo } from "react";
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@/styles/global";
import { theme } from "@/styles/theme";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

function makeApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_URL }),
    cache: new InMemoryCache(),
  });
}

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
