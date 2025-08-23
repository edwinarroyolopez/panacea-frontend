"use client";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const makeApolloClient = () =>
  new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      // fetch: (typeof window === "undefined") ? fetch : undefined, // if you use polyfills
    }),
    cache: new InMemoryCache(),
  });
