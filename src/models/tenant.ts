import type { GetTenantsQuery } from "@/graphql/generated";

export type TenantRecord = GetTenantsQuery["getTenants"][number];

export type ConfirmAction = "activate" | "suspend" | "terminate";
