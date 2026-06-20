import "@apollo/client";
import type { ErrorPolicy } from "@apollo/client";

/**
 * Apollo Client v4 gates `defaultOptions.errorPolicy` behind a declaration so
 * the result types stay accurate. Declaring it here lets us set an app-wide
 * `errorPolicy` in the client without type errors.
 *
 * See: https://www.apollographql.com/docs/react/data/typescript#declaring-default-options-for-type-safety
 */
declare module "@apollo/client" {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface Query {
        errorPolicy: ErrorPolicy;
      }
      interface WatchQuery {
        errorPolicy: ErrorPolicy;
      }
      interface Mutate {
        errorPolicy: ErrorPolicy;
      }
    }
  }
}
