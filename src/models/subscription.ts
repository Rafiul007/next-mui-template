import type { GetSubscriptionPlansQuery } from "@/graphql/generated";

export type PlanRecord = GetSubscriptionPlansQuery["getSubscriptionPlans"][number];
