export const GET_FEATURE_FLAGS_QUERY = /* GraphQL */ `
  query GetFeatureFlags {
    getFeatureFlags {
      id
      flagName
      enabledGlobally
      enabledTenantIds
      disabledTenantIds
      scheduledAt
    }
  }
`;

export const IS_FEATURE_ENABLED_QUERY = /* GraphQL */ `
  query IsFeatureEnabled($tenantId: ID!, $flagName: String!) {
    isFeatureEnabled(tenantId: $tenantId, flagName: $flagName)
  }
`;

export const GET_SUBSCRIPTION_PLAN_QUERY = /* GraphQL */ `
  query GetSubscriptionPlan($id: ID!) {
    getSubscriptionPlan(id: $id) {
      id
      name
      priceBdt
      billingCycle
      maxBranches
      maxStudents
      maxStaff
      smsCredits
      storageGb
      featureFlags
      active
    }
  }
`;

export const GET_SUBSCRIPTION_PLANS_QUERY = /* GraphQL */ `
  query GetSubscriptionPlans {
    getSubscriptionPlans {
      id
      name
      priceBdt
      billingCycle
      maxBranches
      maxStudents
      maxStaff
      smsCredits
      storageGb
      featureFlags
      active
    }
  }
`;

export const GET_TENANT_QUERY = /* GraphQL */ `
  query GetTenant($id: ID!) {
    getTenant(id: $id) {
      id
      legalName
      contactName
      contactEmail
      contactPhone
      address
      eBIN
      tradeLicense
      logo
      planId
      slug
      status
      trialEndsAt
      createdAt
    }
  }
`;

export const GET_REVENUE_SUMMARY_QUERY = /* GraphQL */ `
  query GetRevenueSummary {
    getRevenueSummary {
      totalTenants
      activeTenants
      mrr
      totalInvoiced
      totalCollected
      totalOutstanding
    }
  }
`;

export const GET_TENANTS_QUERY = /* GraphQL */ `
  query GetTenants($page: Int, $limit: Int) {
    getTenants(page: $page, limit: $limit) {
      id
      legalName
      contactName
      contactEmail
      contactPhone
      address
      eBIN
      tradeLicense
      logo
      planId
      slug
      status
      trialEndsAt
      createdAt
    }
  }
`;
