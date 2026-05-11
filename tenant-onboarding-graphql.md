# BongoEdu360 — Tenant Onboarding GraphQL Playbook

End-to-end flow: create plan → onboard tenant → configure center → add branch → hire employee.

GraphiQL: `http://localhost:8080/graphiql`

---

## Prerequisites

| Step | Who runs it | Auth required |
|------|------------|---------------|
| 1. Create subscription plan | Bongo platform admin | No (platform bootstrap) |
| 2. Create tenant | Bongo platform admin | No (platform bootstrap) |
| 3. Login as tenant admin | Tenant admin | — |
| 4. Setup center | Tenant admin | Yes — `Authorization: Bearer <token>` |
| 5. Get branches | Tenant admin | Yes |
| 6. Create branch | Tenant admin | Yes |
| 7. Onboard employee | Tenant admin | Yes |
| 8. Login as employee | Employee | — |
| 9. Get current user (`me`) | Any authenticated user | Yes |

---

## Step 1 — Create Subscription Plan

**Mutation:** `createSubscriptionPlan`  
**Auth:** None (Bongo platform admin context)

```graphql
mutation {
  createSubscriptionPlan(plan: {
    name: "Standard"
    priceBdt: 5000
    billingCycle: "MONTHLY"
    maxBranches: 5
    maxStudents: 500
    maxStaff: 50
    storageGb: 100
    smsCredits: 1000
    featureFlags: ["PAYROLL", "PERFORMANCE_REVIEW", "MULTI_BRANCH"]
  }) {
    id
    name
    priceBdt
  }
}
```

### Input — `CreatePlanInput`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `String` | Yes | Plan display name |
| `priceBdt` | `Float` | Yes | Monthly/yearly price in BDT |
| `billingCycle` | `String` | Yes | `"MONTHLY"` or `"YEARLY"` |
| `maxBranches` | `Int` | Yes | Branch cap enforced by RLS |
| `maxStudents` | `Int` | Yes | Student cap |
| `maxStaff` | `Int` | Yes | Staff/employee cap |
| `storageGb` | `Int` | Yes | Storage quota in GB |
| `smsCredits` | `Int` | Yes | SMS credits per billing cycle |
| `featureFlags` | `[String]` | No | Feature keys enabled on plan |

### Response — `SubscriptionPlan`

| Field | Type |
|-------|------|
| `id` | `ID` — **save this, needed in Step 2** |
| `name` | `String` |
| `priceBdt` | `Float` |
| `billingCycle` | `String` |
| `maxBranches` | `Int` |
| `maxStudents` | `Int` |
| `maxStaff` | `Int` |
| `storageGb` | `Int` |
| `smsCredits` | `Int` |
| `featureFlags` | `[String]` |
| `active` | `Boolean` |

---

## Step 2 — Create Tenant

**Mutation:** `createTenant`  
**Auth:** None (Bongo platform admin context)

```graphql
mutation {
  createTenant(tenant: {
    legalName: "Bongo Coaching Center"
    tradeLicense: "TL-12345"
    address: "Dhaka, Bangladesh"
    contactName: "John Doe"
    contactEmail: "sharifhasan773@gmail.com"
    contactPhone: "01712345678"
    planId: "<subscription-plan-id>"   # from Step 1
  }) {
    id
    slug
    legalName
    status
  }
}
```

### Input — `CreateTenantInput`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `legalName` | `String` | Yes | Registered company/center name |
| `tradeLicense` | `String` | No | Bangladesh trade license number |
| `eBIN` | `String` | No | Electronic BIN for VAT |
| `address` | `String` | No | Full address |
| `contactName` | `String` | Yes | Primary contact person |
| `contactEmail` | `String` | Yes | Tenant admin email — used for login |
| `contactPhone` | `String` | No | Phone number |
| `planId` | `ID` | Yes | `id` from Step 1 |
| `trialEndsAt` | `String` | No | ISO date string for trial expiry |

### Response — `Tenant`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `ID` | **Tenant ID — save for all subsequent tenant-scoped calls** |
| `slug` | `String` | URL-safe identifier |
| `legalName` | `String` | |
| `status` | `String` | `TRIAL` / `ACTIVE` / `SUSPENDED` |
| `trialEndsAt` | `String` | |

> After `createTenant`, the system auto-creates a tenant admin `User` with the `contactEmail` and sends credentials via email.

---

## Step 3 — Login (Tenant Admin)

**Mutation:** `login`  
**Auth:** None

```graphql
mutation Login {
  login(
    email: "sharifhasan773@gmail.com"
    password: "Bng@6f70662c"
  ) {
    accessToken
    refreshToken
    expiresInSeconds
    tokenType
  }
}
```

### Input

| Field | Type | Required |
|-------|------|----------|
| `email` | `String` | Yes |
| `password` | `String` | Yes |

### Response — `AuthResponse`

| Field | Type | Notes |
|-------|------|-------|
| `accessToken` | `String` | JWT — set as `Authorization: Bearer <token>` header |
| `refreshToken` | `String` | Use with `refresh` mutation to get new access token |
| `expiresInSeconds` | `Int` | Access token TTL |
| `tokenType` | `String` | Always `"Bearer"` |

> All mutations/queries from Step 4 onwards require the header:
> ```
> Authorization: Bearer <accessToken>
> ```

---

## Step 4 — Setup Center

**Mutation:** `setupCenter`  
**Auth:** Required (tenant admin JWT)

```graphql
mutation {
  setupCenter(center: {
    name: "Bongo Coaching Center"
    nameBangla: "বোঙ্গো কোচিং সেন্টার"
    address: "Gulshan, Dhaka"
    phone: "01712345678"
    email: "admin@bongo.coaching"
    establishedYear: 2020
    academicYearStartMonth: 1
  }) {
    id
    name
    tenantId
  }
}
```

### Input — `SetupCenterInput`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | Center name in English |
| `nameBangla` | `String` | Center name in Bangla (optional) |
| `logo` | `String` | URL to logo image (optional) |
| `tagline` | `String` | Short tagline (optional) |
| `address` | `String` | |
| `phone` | `String` | |
| `email` | `String` | Public contact email |
| `establishedYear` | `Int` | e.g., `2020` |
| `academicYearStartMonth` | `Int` | `1`=January … `12`=December |

### Response — `Center`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `ID` | **Center ID — save for branch operations** |
| `name` | `String` | |
| `tenantId` | `ID` | Matches logged-in tenant |

---

## Step 5 — Get Branches

**Query:** `getBranches`  
**Auth:** Required

```graphql
query GetBranches {
  getBranches(centerId: "<center-id>") {   # from Step 4
    id
    centerId
    tenantId
    name
    address
    phone
    managerId
    status
    workingDays
    openTime
    closeTime
  }
}
```

### Input

| Field | Type | Required |
|-------|------|----------|
| `centerId` | `ID` | Yes — `id` from Step 4 |

### Response — `[Branch]`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `ID` | |
| `centerId` | `ID` | |
| `tenantId` | `ID` | |
| `name` | `String` | |
| `address` | `String` | |
| `phone` | `String` | |
| `managerId` | `ID` | Nullable — assigned manager |
| `status` | `String` | `ACTIVE` / `INACTIVE` |
| `workingDays` | `[String]` | Day names e.g. `["MONDAY", "TUESDAY"]` |
| `openTime` | `String` | `"HH:mm"` |
| `closeTime` | `String` | `"HH:mm"` |

---

## Step 6 — Create Branch

**Mutation:** `createBranch`  
**Auth:** Required

```graphql
mutation {
  createBranch(branch: {
    centerId: "<center-id>"   # from Step 4
    name: "Main Branch"
    address: "Gulshan, Dhaka"
    phone: "01712345678"
    workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    openTime: "09:00"
    closeTime: "18:00"
  }) {
    id
    name
    tenantId
  }
}
```

### Input — `CreateBranchInput`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `centerId` | `ID` | Yes | Parent center |
| `name` | `String` | Yes | Branch display name |
| `address` | `String` | No | |
| `phone` | `String` | No | |
| `managerId` | `ID` | No | Assign an existing employee as manager |
| `workingDays` | `[String]` | No | Day names in uppercase |
| `openTime` | `String` | No | `"HH:mm"` 24-hour format |
| `closeTime` | `String` | No | `"HH:mm"` 24-hour format |

### Valid `workingDays` Values

`MONDAY` `TUESDAY` `WEDNESDAY` `THURSDAY` `FRIDAY` `SATURDAY` `SUNDAY`

### Response — `Branch`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `ID` | **Branch ID — save for employee onboarding** |
| `name` | `String` | |
| `tenantId` | `ID` | |

---

## Step 7 — Onboard Employee

**Mutation:** `onboardEmployee`  
**Auth:** Required (tenant admin JWT)

```graphql
mutation {
  onboardEmployee(input: {
    branchId: "<branch-id>"       # from Step 6
    employeeCode: "EMP-003"
    designation: "Math Teacher"
    department: "Academic"
    employmentType: "FULL_TIME"
    joiningDate: "2026-05-07"
    nid: "1234567890123"
    emergencyContactName: "Ali Khan"
    emergencyContactPhone: "01700000000"
    email: "kikhaboplatform@gmail.com"
  }) {
    id
    tenantId
    userId
    branchId
    employeeCode
    designation
    department
    status
  }
}
```

### Input — `OnboardEmployeeInput`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `branchId` | `ID` | Yes | Branch from Step 6 |
| `employeeCode` | `String` | No | Unique code e.g. `"EMP-001"` |
| `designation` | `String` | No | Job title |
| `department` | `String` | No | e.g. `"Academic"`, `"Admin"` |
| `employmentType` | `String` | Yes | `"FULL_TIME"` / `"PART_TIME"` / `"CONTRACT"` |
| `joiningDate` | `String` | Yes | `"YYYY-MM-DD"` |
| `probationEndsAt` | `String` | No | `"YYYY-MM-DD"` |
| `nid` | `String` | No | National ID number (13–17 digits) |
| `tin` | `String` | No | Tax identification number |
| `bloodGroup` | `String` | No | e.g. `"A+"`, `"O-"` |
| `emergencyContactName` | `String` | No | |
| `emergencyContactPhone` | `String` | No | |
| `email` | `String` | No | If provided, creates a `User` account and sends invite email |
| `userId` | `ID` | No | Link to existing user instead of creating one |

### Response — `Employee`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `ID` | Employee record ID |
| `tenantId` | `ID` | |
| `userId` | `ID` | Linked user account (if created) |
| `branchId` | `ID` | |
| `employeeCode` | `String` | |
| `designation` | `String` | |
| `department` | `String` | |
| `status` | `String` | `ACTIVE` / `INACTIVE` / `TERMINATED` |
| `isOnProbation` | `Boolean` | |

---

## Step 8 — Login (Employee)

Same mutation as Step 3. Employee receives credentials via email after onboarding.

```graphql
mutation {
  login(
    email: "kikhaboplatform@gmail.com"
    password: "<auto-generated-password-from-invite-email>"
  ) {
    accessToken
    refreshToken
    expiresInSeconds
    tokenType
  }
}
```

---

## Step 9 — Get Current User (`me`)

**Query:** `me`  
**Auth:** Required

```graphql
query {
  me {
    id
    firstName
    lastName
    email
    roles
    isVerified
    isActivated
  }
}
```

### Response — `User`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | User UUID |
| `firstName` | `String` | |
| `lastName` | `String` | |
| `email` | `String` | |
| `phone` | `String` | |
| `roles` | `[String]` | e.g. `["TENANT_ADMIN"]`, `["EMPLOYEE"]` |
| `isVerified` | `Boolean` | Email verified via OTP |
| `isActivated` | `Boolean` | Account active |

---

## Token Refresh & Logout

```graphql
# Refresh access token before it expires
mutation {
  refresh(refreshToken: "<refreshToken>") {
    accessToken
    refreshToken
    expiresInSeconds
    tokenType
  }
}

# Logout (invalidates refresh token)
mutation {
  logout(refreshToken: "<refreshToken>")
}
```

---

## Full Flow Summary

```
createSubscriptionPlan  →  plan.id
        ↓
createTenant(planId)    →  tenant.id, auto-creates tenant admin user + sends credentials
        ↓
login(contactEmail)     →  accessToken   [set Authorization header]
        ↓
setupCenter             →  center.id
        ↓
createBranch(centerId)  →  branch.id
        ↓
onboardEmployee(branchId, email)  →  employee.id, userId  [sends invite email]
        ↓
login(employeeEmail)    →  accessToken   [employee session]
        ↓
me                      →  user profile + roles
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `UNAUTHORIZED` | Missing or expired JWT | Re-run `login`, set `Authorization: Bearer <token>` header |
| `TENANT_NOT_FOUND` | Wrong tenant context | Verify JWT `tenantId` claim matches the resource |
| `PLAN_NOT_FOUND` | Invalid `planId` in `createTenant` | Use `id` from `createSubscriptionPlan` response |
| `DUPLICATE_EMPLOYEE_CODE` | `employeeCode` already exists in tenant | Use a unique code per tenant |
| `app.current_tenant_id is not set` | RLS session variable missing | Check `TenantResolutionFilter` ran; verify JWT contains `tenantId` claim |
