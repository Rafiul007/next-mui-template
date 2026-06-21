export const GET_DISCOUNTS_QUERY = /* GraphQL */ `
  query GetDiscounts {
    getDiscounts {
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

export const GET_FEE_PLANS_QUERY = /* GraphQL */ `
  query GetFeePlans($batchId: ID, $programId: ID) {
    getFeePlans(batchId: $batchId, programId: $programId) {
      id
      feeTypeId
      feeTypeName
      feeTypeKeyName
      batchId
      programId
      amount
      frequency
      isActive
      tenantId
    }
  }
`;

export const GET_FEE_TYPES_QUERY = /* GraphQL */ `
  query GetFeeTypes {
    getFeeTypes {
      id
      typeName
      keyName
      isRecurring
      isActive
      tenantId
    }
  }
`;

export const GET_HOLIDAYS_QUERY = /* GraphQL */ `
  query GetHolidays($year: String!) {
    getHolidays(year: $year) {
      id
      branchId
      date
      name
      type
      tenantId
    }
  }
`;

export const GET_INVOICE_QUERY = /* GraphQL */ `
  query GetInvoice($id: ID!) {
    getInvoice(id: $id) {
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

export const GET_INVOICES_QUERY = /* GraphQL */ `
  query GetInvoices($tenantId: ID!) {
    getInvoices(tenantId: $tenantId) {
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

export const GET_LATE_FINE_POLICY_QUERY = /* GraphQL */ `
  query GetLateFinePolicy {
    getLateFinePolicy {
      id
      fineType
      graceDays
      value
      tenantId
    }
  }
`;

export const GET_PAYMENTS_BY_INVOICE_QUERY = /* GraphQL */ `
  query GetPaymentsByInvoice($invoiceId: ID!) {
    getPaymentsByInvoice(invoiceId: $invoiceId) {
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
      receiptNumber
      tenantId
    }
  }
`;

export const GET_STUDENT_INVOICE_QUERY = /* GraphQL */ `
  query GetStudentInvoice($id: ID!) {
    getStudentInvoice(id: $id) {
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

export const GET_STUDENT_INVOICES_QUERY = /* GraphQL */ `
  query GetStudentInvoices($studentId: ID!) {
    getStudentInvoices(studentId: $studentId) {
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

export const GET_BATCH_INVOICES_QUERY = /* GraphQL */ `
  query GetBatchInvoices($batchId: ID!, $month: String!) {
    getBatchInvoices(batchId: $batchId, month: $month) {
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

export const GET_DEFAULTERS_QUERY = /* GraphQL */ `
  query GetDefaulters($batchId: ID, $month: String) {
    getDefaulters(batchId: $batchId, month: $month) {
      invoiceId
      studentId
      batchId
      month
      total
      paidAmount
      outstanding
      dueDate
      status
      daysOverdue
    }
  }
`;

export const GET_BATCH_FEE_REPORT_QUERY = /* GraphQL */ `
  query GetBatchFeeReport($batchId: ID!, $month: String!) {
    getBatchFeeReport(batchId: $batchId, month: $month) {
      batchId
      month
      totalStudents
      totalInvoiced
      totalPaid
      totalPending
      totalOverdue
      fullyPaidCount
      partiallyPaidCount
      overdueCount
      unpaidCount
    }
  }
`;
