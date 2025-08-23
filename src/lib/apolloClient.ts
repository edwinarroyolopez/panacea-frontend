
"use client";
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, from } from "@apollo/client";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  // fetchOptions: { cache: "no-store" },
});

const authLink = new ApolloLink((operation, forward) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));
  return forward(operation!);
});

export const makeApolloClient = () =>
  new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Task: { keyFields: ["id"] },
        Goal: { keyFields: ["id"] },
        Plan: { keyFields: ["id"] },
        UserInfo: { keyFields: ["id"] },
      },
    }),
  });
