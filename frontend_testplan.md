# Frontend E2E Test Plan — BongoEdu360

## Stack
- Playwright 1.61+ TypeScript
- Next.js 16 App Router, MUI 7, Apollo Client, react-hook-form + yup
- Auth: httpOnly cookies (`bongo.access-token`, `bongo.impersonate-token`)
- Backend: Spring Boot at `http://localhost:8080`
- DB: PostgreSQL cloud (Aiven) — `pg-qna-me-27fa.l.aivencloud.com:17644/bongoedu360`
- Redis: Aiven — `bongoedu360-me-27fa.l.aivencloud.com:17645`

---

## Infrastructure Setup

### Install
```bash
cd next-mui-template
npm install -D @playwright/test
npx playwright install chromium
```

### Key files created
| File | Purpose |
|---|---|
| `playwright.config.ts` | baseURL, serial workers, webServer, 30s timeout |
| `.env.test` | env vars pointing to localhost:8080 |
| `e2e/fixtures/auth.ts` | `loginAsSuperAdmin`, `loginAsCoachingAdmin`, `impersonateTenant`, `logout` |
| `e2e/fixtures/test-data.ts` | `SUPER_ADMIN`, `TEST_OTP`, `TEST_COACHING`, `TEST_EMPLOYEE`, `TEST_TEACHER` |
| `e2e/helpers/graphql.ts` | `executeAsAdmin()` for direct teardown/seeding |

### Run commands
```bash
npm run test:e2e                              # headless, all tests
npm run test:e2e:ui                           # Playwright UI mode
npm run test:e2e:debug                        # headed + debug
npx playwright test e2e/auth/... --reporter=list   # single file
```

---

## Backend Setup (test profile)

### Start command
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dspring.profiles.active=test
```
> **Note:** Backend uses cloud DB — NOT local postgres — even in test profile.
> `application-test.yml` only overrides mail (no SMTP needed).

### Files added to `bongoedu360`
- `src/main/resources/application-test.yml` — mail override only; cloud DB inherited from `application.yml`
- `src/main/java/.../common/infrastructure/adapter/TestMailAdapter.java` — `@Profile("test") @Primary`, no-op `sendMail()`

### Email verification
`registerUser()` already sets `isVerified=true` — no OTP needed for registration flow.
`TestMailAdapter` prevents SMTP errors if OTP path is hit.
Phase 6 (email-verify) tests all `test.skip` until signup page is implemented.

---

## Test Credentials

### Super Admin
| Field | Value |
|---|---|
| Email | `bongo_admin@test.local` |
| Password | `Admin@12345` |
| Role | `BONGO_SUPER_ADMIN` |
| Tenant | NULL (platform-level) |

Seeded via local DB insert:
```sql
INSERT INTO users (id, email, first_name, last_name, phone, password, verified, activated, roles, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'bongo_admin@test.local', 'Bongo', 'Admin', '0000000000',
  '$2a$10$UHdWk3RR/latlafyp5.kue.IMo2vntKKN8qVTMnfZEbKt2voIf/q6',
  true, true, '{"BONGO_SUPER_ADMIN"}', NOW(), NOW()
) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
```
> Hash is BCrypt cost-10 of `Admin@12345`. Verified with `BCryptPasswordEncoder(10).matches()`.

---

## DOM Selection — Proven Selectors

### Priority order
1. `getByRole()` + `getByLabel()` — MUI semantic HTML, covers ~80% of cases
2. `getByText()` — toasts, headings, static labels → add `.first()` when both Alert + toast visible
3. `getByTestId()` — only login submit (text changes to spinner on submit)
4. **Never** CSS class selectors — MUI classes change on build

### Real button texts (verified by reading source)
| Component | Actual text | Selector |
|---|---|---|
| Login submit | `"Sign in"` (changes to spinner) | `getByTestId("login-submit")` |
| Add Tenant | `"Add Tenant"` | `getByRole("button", { name: "Add Tenant" })` |
| Tenant dialog save | `"Create Tenant"` / `"Save Changes"` | `getByRole("button", { name: "Create Tenant" })` |
| Impersonate dialog | `"Open Tenant Dashboard"` | `getByRole("link", { name: "Open Tenant Dashboard" })` |
| Add employee | `"Onboard employee"` | `getByRole("button", { name: "Onboard employee" })` |
| Employee dialog save | `"Onboard"` / `"Save changes"` | `getByRole("button", { name: "Onboard" })` |
| Row actions menu (3-dot) | Tooltip: `"Actions"` | `getByRole("button", { name: "Actions" })` |
| Impersonate menu item | `"Impersonate"` | `getByRole("menuitem", { name: "Impersonate" })` |

### `data-testid` budget — only 1 added
| Element | testid | Why needed |
|---|---|---|
| Login submit | `login-submit` | Text swaps to spinner on submit — ARIA name disappears |

### Password field gotcha
`getByLabel("Password")` resolves to 2 elements: the input AND the "Show password" toggle (aria-label contains "password"). Always use:
```typescript
page.getByLabel("Password", { exact: true })
```

---

## Known Pitfalls & Fixes (learned from live runs)

### 1. `getByText()` strict mode violation
**Problem:** Both MUI `<Alert>` and react-hot-toast render simultaneously → `getByText(regex)` finds 2 elements → strict mode error.
**Fix:** Always append `.first()`:
```typescript
await expect(page.getByText(/error message/i).first()).toBeVisible();
```

### 2. Login lock via Redis
**Problem:** `AuthService` locks account after 5 failed login attempts (30-min TTL in Redis). Wrong-password tests on the real admin account trigger the lock.
**Fix — prevent:** Use a throwaway nonexistent email for negative credential tests:
```typescript
await page.getByLabel("Email").fill("no-such-user@playwright.local");
```
**Fix — recover:** Run this Spring test to clear the lock:
```java
// ResetLoginLock.java (temporary, delete after use)
@SpringBootTest
class ResetLoginLock {
  @Autowired StringRedisTemplate redis;
  @Test void reset() { redis.delete("login_attempts:bongo_admin@test.local"); }
}
```
Or connect to Redis directly:
```
Redis URL: rediss://default:<redacted -- see application.yml>@bongoedu360-me-27fa.l.aivencloud.com:17645
Key pattern: login_attempts:{email_lowercase}
```

### 3. Origin header required on all API calls
Next.js auth routes validate origin via `rejectDisallowedOrigin()`. `page.request.post()` skips browser Origin header.
**Fix:** Always pass Origin explicitly in fixtures:
```typescript
await page.request.post("/api/auth/logout", {
  headers: { Origin: "http://localhost:3000" },
});
```

### 4. Backend must be restarted after `application-test.yml` changes
Spring Boot loads config once at startup. Editing `application-test.yml` while backend is running has NO effect.
**Fix:** Kill and restart the process after config changes.

### 5. Local DB needs test user seeded
`application-test.yml` → test profile → uses local Postgres (`localhost:5432/bongo_edu_360`).
Cloud DB changes don't affect the running test backend.
Always run the seed SQL above after resetting local DB.

### 6. `onTouched` mode doesn't validate untouched fields on submit alone
react-hook-form `mode: "onTouched"` — just clicking submit without touching fields only shows errors for fields that were touched.
**Fix:** Click each field first, then submit:
```typescript
await page.getByLabel("Email").click();
await page.getByLabel("Password", { exact: true }).click();
await page.getByTestId("login-submit").click();
```

### 7. Impersonate opens new tab
`TenantImpersonateDialog` "Open Tenant Dashboard" button has `target="_blank"` → opens new browser tab.
**Fix:** Use `waitForEvent("page")`:
```typescript
const [newPage] = await Promise.all([
  page.context().waitForEvent("page"),
  page.getByRole("link", { name: "Open Tenant Dashboard" }).click(),
]);
await newPage.waitForURL("**/dashboard**");
```

---

## Phase Status

| Phase | File | Status | Tests |
|---|---|---|---|
| 0 | Backend test profile | ✅ Done | — |
| 1 | Infrastructure | ✅ Done | — |
| 2 | Super admin login | ✅ **6/6 passing** | `e2e/auth/super-admin-login.spec.ts` |
| 3 | Tenant management | 🔲 Ready to run | `e2e/bongo/tenant-management.spec.ts` |
| 4 | Coaching setup | 🔲 Ready to run | `e2e/coaching/setup.spec.ts` |
| 5 | HR / employees | 🔲 Ready to run | `e2e/coaching/hr.spec.ts` |
| 6 | Email verify | ⏸ Skipped (signup not built) | `e2e/auth/email-verify.spec.ts` |
| 7 | Student portal | 🔲 Ready to run | `e2e/student/portal.spec.ts` |

---

## Phase 2 — Super Admin Login ✅
**File:** `e2e/auth/super-admin-login.spec.ts` — **6/6 passing**

| Test | Result | Notes |
|---|---|---|
| `shouldRedirectToLoginWhenUnauthenticated` | ✅ | Guards work |
| `shouldShowValidationErrorsOnEmptySubmit` | ✅ | Touch fields before submit |
| `shouldShowErrorOnWrongCredentials` | ✅ | Use nonexistent email, `.first()` on matcher |
| `shouldLoginAndRedirectToBongoDashboard` | ✅ | userType=BONGO → `/bongo/dashboard` |
| `shouldPersistSessionOnRefresh` | ✅ | httpOnly cookie survives reload |
| `shouldLogoutSuccessfully` | ✅ | Origin header required on logout POST |

---

## Phase 3 — Tenant Management
**File:** `e2e/bongo/tenant-management.spec.ts`
Prerequisite: `beforeEach` → `loginAsSuperAdmin()`

| Test | Selector | Notes |
|---|---|---|
| `shouldLoadTenantsPage` | `getByRole("table")` | — |
| `shouldCreateTenantWithRequiredFields` | `getByRole("button", { name: "Add Tenant" })` → dialog → `"Create Tenant"` | — |
| `shouldValidateRequiredFieldsOnCreate` | empty submit → `getByText(/required/i).first()` | — |
| `shouldImpersonateCreatedTenant` | row → `"Actions"` menu → `menuitem "Impersonate"` → `waitForEvent("page")` | Opens new tab |

---

## Phase 4 — Coaching Center Setup
**File:** `e2e/coaching/setup.spec.ts`
Prerequisite: `beforeAll` → super admin login → impersonate tenant

| Test | Route | Notes |
|---|---|---|
| `shouldLoadCenterProfilePage` | `/dashboard/tenant-setup/center-profile` | — |
| `shouldSaveCenterProfile` | same | Fill name/email/phone → `getByRole("button", { name: /save|update/i })` |
| `shouldCreateBranch` | `/dashboard/tenant-setup/branches` | Dialog → `"Save"` |
| `shouldValidateBranchRequiredFields` | same | Empty submit |

---

## Phase 5 — Employee & Teacher Onboarding
**File:** `e2e/coaching/hr.spec.ts`
Prerequisite: impersonated session + center profile + branch exist

| Test | Selector | Notes |
|---|---|---|
| `shouldLoadEmployeesPage` | `getByRole("table")` | — |
| `shouldOnboardEmployeeWithUser` | `"Onboard employee"` → dialog → `"Onboard"` | Branch + type + date required |
| `shouldOnboardTeacher` | same | `employmentType=Part-time` |
| `shouldValidateEmployeeForm` | blur field after invalid email | `mode: onTouched` — must blur |
| `shouldFilterEmployeeBySearch` | `getByPlaceholder("search staff")` | — |

---

## Phase 6 — Email Verification ⏸
**File:** `e2e/auth/email-verify.spec.ts` — all `test.skip`
Activate when `/signup` page is implemented. Fixed OTP `123456` via `TestMailAdapter`.

---

## Phase 7 — Student Portal
**File:** `e2e/student/portal.spec.ts`
Prerequisite: student user exists in DB with known credentials (`TEST_STUDENT_EMAIL` env var)

| Test | Notes |
|---|---|
| `shouldRedirectStudentToStudentDashboard` | login → `/student/dashboard` |
| `shouldLoadStudentDashboard` | `getByRole("main")` visible |
| `shouldNotAccessCoachingAdminDashboard` | guard redirects away |

---

## Quick Reference — Before Each Test Session

```bash
# 1. Start backend (test profile)
cd bongoedu360
mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dspring.profiles.active=test

# 2. Verify local DB has test user (run once, or after DB reset)
psql -U postgres -d bongo_edu_360 -h localhost -W
# password: 12345678
# Run seed SQL from "Test Credentials" section above

# 3. Start frontend
cd next-mui-template
npm run dev

# 4. Run tests
npx playwright test e2e/auth/super-admin-login.spec.ts --reporter=list

# If login fails with lock error — reset via Spring test or Redis DEL:
# Key: login_attempts:bongo_admin@test.local
```
