# API Gap Analysis — Batch Admission & Payment

> **Context:** The frontend forms capture more data than the current GraphQL schema accepts.
> The fields listed below need to be added to the respective input types (or new mutations created).

---

## 1. Batch Creation

**Mutation:** `createBatch(batch: CreateBatchInput)`

### Missing fields in `CreateBatchInput`

| Field | Type | Notes |
|---|---|---|
| `type` | `String` (`course` \| `class`) | Distinguishes a course-based batch from a class-based one |
| `status` | `String` (`upcoming` \| `ongoing` \| `completed` \| `cancelled`) | Initial status at creation time; currently only settable via `changeBatchStatus` after creation |
| `deliveryMode` | `String` (`in-person` \| `online` \| `hybrid`) | Mode of instruction delivery |
| `mediumOfInstruction` | `String` (`bangla` \| `english` \| `bilingual`) | Language of instruction |
| `registrationDeadline` | `String` (ISO date) | Last date students can register |
| `certificateOnCompletion` | `Boolean` | Whether a certificate is issued on completion |
| `certificateTemplateName` | `String` (optional) | Name of the certificate template to use |
| `prerequisites` | `String` (optional) | Free-text prerequisites for joining the batch |
| `notes` | `String` (optional) | Internal notes about the batch |

> **Note on `courseName` / `batchNumber` / `className` / `section`:** The form collects these separately and derives the final batch `name` from them. If the API should store them individually, add `courseName`, `batchNumber`, `className`, and `section` as optional fields. Otherwise the frontend will concatenate them before sending `name`.

---

## 2. Discounts

**Mutation:** `createDiscount(input: CreateDiscountInput)`

### Missing fields in `CreateDiscountInput`

| Field | Type | Notes |
|---|---|---|
| `earlyBirdDeadline` | `String` (ISO date, optional) | Required when `discountType` is `early_bird`; the cutoff date after which the discount no longer applies |

---

## 3. Student Admission

**Mutation:** `admitStudent(student: AdmitStudentInput)`

### Missing fields in `AdmitStudentInput`

| Field | Type | Notes |
|---|---|---|
| `address` | `String` (optional) | Full free-text address. The API currently stores `district` / `division` / `upazila` / `village` separately. Either add `address` or the frontend will need to be updated to collect the split fields instead — **needs decision** |
| `notes` | `String` (optional) | Admission staff notes; not displayed to the student |
| `qualifications` | `[QualificationInput!]` (optional) | Array of academic qualifications (see type below). Currently the API only has `previousInstitution` (single string) + `previousResult` (single string), which is insufficient |

**New input type needed:**

```graphql
input QualificationInput {
  institution: String!
  exam:        String!       # PSC, JSC, SSC, HSC, O-Level, A-Level, etc.
  gradeGpa:    String
  passingYear: String        # 4-digit year
  board:       String        # Dhaka, Chittagong, etc.
}
```

---

## 4. Guardian

**Mutation:** `addGuardian(guardian: AddGuardianInput)`

### Missing fields in `AddGuardianInput`

| Field | Type | Notes |
|---|---|---|
| `email` | `String` (optional) | Guardian's email address; currently missing from the input type |

---

## 5. Student Payment

**Mutation:** `recordStudentPayment(payment: RecordStudentPaymentInput)`

### Missing fields in `RecordStudentPaymentInput`

| Field | Type | Notes |
|---|---|---|
| `paidAt` | `String` (ISO datetime, optional) | Client-supplied payment date/time. Currently the API auto-generates `collectedAt` on the server. Needed to allow backdating a payment (e.g. cash collected earlier) |
| `remarks` | `String` (optional) | Free-text note about the payment (e.g. "partial — rest due next week") |

---

## Quick Reference — All Changes

| Input Type | Add Field | Type | Required? |
|---|---|---|---|
| `CreateBatchInput` | `type` | `String` | Yes |
| `CreateBatchInput` | `status` | `String` | No (default `upcoming`) |
| `CreateBatchInput` | `deliveryMode` | `String` | No (default `in-person`) |
| `CreateBatchInput` | `mediumOfInstruction` | `String` | No (default `bangla`) |
| `CreateBatchInput` | `registrationDeadline` | `String` | No |
| `CreateBatchInput` | `certificateOnCompletion` | `Boolean` | No (default `false`) |
| `CreateBatchInput` | `certificateTemplateName` | `String` | No |
| `CreateBatchInput` | `prerequisites` | `String` | No |
| `CreateBatchInput` | `notes` | `String` | No |
| `CreateDiscountInput` | `earlyBirdDeadline` | `String` | No |
| `AdmitStudentInput` | `address` | `String` | No |
| `AdmitStudentInput` | `notes` | `String` | No |
| `AdmitStudentInput` | `qualifications` | `[QualificationInput!]` | No |
| `AddGuardianInput` | `email` | `String` | No |
| `RecordStudentPaymentInput` | `paidAt` | `String` | No |
| `RecordStudentPaymentInput` | `remarks` | `String` | No |

---

## Open Questions for Backend

1. **Address vs split fields** — Should `AdmitStudentInput` get a single `address: String` field, or should the frontend collect `district` / `division` / `upazila` / `village` individually? Currently the frontend uses a single address text box.
2. **Qualifications array** — The frontend supports multiple past qualifications per student. Should these be stored as a sub-table/embedded array in the student record, or serialised into the existing `previousInstitution` / `previousResult` fields?
3. **Batch fee plans on creation** — The batch form collects `oneTimePayments[]` and `monthlyPayments[]`. Currently these must be created via separate `createFeePlan` calls after the batch is created. Should batch creation accept fee plans inline, or keep it as a two-step flow?
4. **Enrollment-time discounts** — The admission form lets staff apply discounts at enrollment time (`appliedDiscountIndexes`). Currently there is no way to attach a discount to a specific enrollment. Should `enrollStudent` accept `discountIds: [ID!]`?
