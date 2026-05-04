export const CREATE_DISCOUNT_MUTATION = /* GraphQL */ `
  mutation CreateDiscount($input: CreateDiscountInput!) {
    createDiscount(input: $input) {
      id
      name
      discountType
      isPercentage
      value
      applicableRuleJson
      tenantId
    }
  }
`;

export const CREATE_FEE_PLAN_MUTATION = /* GraphQL */ `
  mutation CreateFeePlan($input: CreateFeePlanInput!) {
    createFeePlan(input: $input) {
      id
      feeTypeId
      batchId
      programId
      amount
      frequency
      isActive
      tenantId
    }
  }
`;

export const CREATE_FEE_TYPE_MUTATION = /* GraphQL */ `
  mutation CreateFeeType($input: CreateFeeTypeInput!) {
    createFeeType(input: $input) {
      id
      typeName
      isRecurring
      isActive
      tenantId
    }
  }
`;

export const SET_LATE_FINE_POLICY_MUTATION = /* GraphQL */ `
  mutation SetLateFinePolicy($input: SetLateFinePolicyInput!) {
    setLateFinePolicy(input: $input) {
      id
      fineType
      graceDays
      value
      tenantId
    }
  }
`;

export const GENERATE_MONTHLY_INVOICES_MUTATION = /* GraphQL */ `
  mutation GenerateMonthlyInvoices {
    generateMonthlyInvoices {
      id
      invoiceNumber
      dueDate
      subtotal
      vatAmount
      total
      status
      createdAt
      paidAt
      tenantId
    }
  }
`;

export const GENERATE_MONTHLY_STUDENT_INVOICES_MUTATION = /* GraphQL */ `
  mutation GenerateMonthlyStudentInvoices($batchId: ID!, $month: String!) {
    generateMonthlyStudentInvoices(batchId: $batchId, month: $month) {
      id
      batchId
      studentId
      month
      dueDate
      subtotal
      discountAmount
      fineAmount
      paidAmount
      total
      status
      gracePeriodDays
      pdfPath
      tenantId
      lineItems {
        feeTypeId
        description
        amount
      }
    }
  }
`;

export const RECORD_PAYMENT_MUTATION = /* GraphQL */ `
  mutation RecordPayment($payment: RecordPaymentInput!) {
    recordPayment(payment: $payment) {
      id
      invoiceId
      amount
      method
      transactionRef
      recordedAt
      recordedBy
    }
  }
`;

export const RECORD_STUDENT_PAYMENT_MUTATION = /* GraphQL */ `
  mutation RecordStudentPayment($payment: RecordStudentPaymentInput!) {
    recordStudentPayment(payment: $payment) {
      id
      invoiceId
      studentId
      amount
      method
      transactionRef
      status
      collectedAt
      collectedBy
      receiptPath
      tenantId
    }
  }
`;

export const REQUEST_WAIVER_MUTATION = /* GraphQL */ `
  mutation RequestWaiver($invoiceId: ID!) {
    requestWaiver(invoiceId: $invoiceId) {
      id
      batchId
      studentId
      month
      dueDate
      subtotal
      discountAmount
      fineAmount
      paidAmount
      total
      status
      gracePeriodDays
      pdfPath
      tenantId
      lineItems {
        feeTypeId
        description
        amount
      }
    }
  }
`;

export const APPROVE_WAIVER_MUTATION = /* GraphQL */ `
  mutation ApproveWaiver($invoiceId: ID!) {
    approveWaiver(invoiceId: $invoiceId) {
      id
      batchId
      studentId
      month
      dueDate
      subtotal
      discountAmount
      fineAmount
      paidAmount
      total
      status
      gracePeriodDays
      pdfPath
      tenantId
      lineItems {
        feeTypeId
        description
        amount
      }
    }
  }
`;
