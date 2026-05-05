"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { getApolloClient } from "@/lib/apollo/client";

export function ApolloAppProvider({ children }: PropsWithChildren) {
  const [client] = useState(getApolloClient);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
