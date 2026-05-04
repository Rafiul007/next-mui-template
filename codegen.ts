import type { CodegenConfig } from "@graphql-codegen/cli";
import { toGraphqlApiUrl } from "./src/lib/graphql/endpoint";

const runtimeUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "https://bongo-coaching-be.onrender.com/graphiql";

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.GRAPHQL_API_URL ?? toGraphqlApiUrl(runtimeUrl),
  documents: [
    "src/graphql/queries/**/*.{ts,tsx,graphql}",
    "src/graphql/mutations/**/*.{ts,tsx,graphql}",
    "src/graphql/fragments/**/*.{ts,tsx,graphql}",
  ],
  ignoreNoDocuments: true,
  generates: {
    "src/graphql/generated/schema.ts": {
      plugins: ["typescript"],
    },
    "src/graphql/generated/operations.ts": {
      plugins: ["typescript-operations", "typed-document-node"],
      config: {
        preResolveTypes: false,
        importSchemaTypesFrom: "src/graphql/generated/schema",
        namespacedImportName: "SchemaTypes",
        useTypeImports: true,
      },
    },
  },
};

export default config;
