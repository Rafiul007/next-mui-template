export const CREATE_TENANT_MUTATION = /* GraphQL */ `
  mutation CreateTenant($tenant: CreateTenantInput!) {
    createTenant(tenant: $tenant) {
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

export const UPDATE_TENANT_MUTATION = /* GraphQL */ `
  mutation UpdateTenant($tenant: UpdateTenantInput!) {
    updateTenant(tenant: $tenant) {
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

export const ACTIVATE_TENANT_MUTATION = /* GraphQL */ `
  mutation ActivateTenant($tenantId: ID!) {
    activateTenant(tenantId: $tenantId) {
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

export const SUSPEND_TENANT_MUTATION = /* GraphQL */ `
  mutation SuspendTenant($tenantId: ID!) {
    suspendTenant(tenantId: $tenantId) {
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

export const TERMINATE_TENANT_MUTATION = /* GraphQL */ `
  mutation TerminateTenant($tenantId: ID!) {
    terminateTenant(tenantId: $tenantId) {
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

export const IMPERSONATE_TENANT_MUTATION = /* GraphQL */ `
  mutation ImpersonateTenant($tenantId: ID!) {
    impersonateTenant(tenantId: $tenantId) {
      accessToken
      tenantId
      tenantSlug
    }
  }
`;

export const CREATE_SUBSCRIPTION_PLAN_MUTATION = /* GraphQL */ `
  mutation CreateSubscriptionPlan($plan: CreatePlanInput!) {
    createSubscriptionPlan(plan: $plan) {
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

export const UPDATE_SUBSCRIPTION_PLAN_MUTATION = /* GraphQL */ `
  mutation UpdateSubscriptionPlan($plan: UpdatePlanInput!) {
    updateSubscriptionPlan(plan: $plan) {
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

export const SET_FEATURE_FLAG_MUTATION = /* GraphQL */ `
  mutation SetFeatureFlag($flag: FeatureFlagInput!) {
    setFeatureFlag(flag: $flag) {
      id
      flagName
      enabledGlobally
      enabledTenantIds
      disabledTenantIds
      scheduledAt
    }
  }
`;
