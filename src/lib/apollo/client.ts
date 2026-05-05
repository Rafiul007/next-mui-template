"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { env } from "@/config/env";

let browserApolloClient: ApolloClient | undefined;

const createApolloClient = () =>
  new ApolloClient({
    link: new HttpLink({
      uri: env.graphqlProxyPath,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        errorPolicy: "all",
      },
      watchQuery: {
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });

export const getApolloClient = () => {
  if (typeof window === "undefined") {
    return createApolloClient();
  }

  if (!browserApolloClient) {
    browserApolloClient = createApolloClient();
  }

  return browserApolloClient;
};
