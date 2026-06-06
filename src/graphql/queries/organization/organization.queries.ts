export const GET_BRANCH_QUERY = /* GraphQL */ `
  query GetBranch($branchId: ID!) {
    getBranch(branchId: $branchId) {
      id
      centerId
      name
      address
      phone
      managerId
      openTime
      closeTime
      workingDays
      status
      tenantId
    }
  }
`;

export const GET_BRANCHES_QUERY = /* GraphQL */ `
  query GetBranches($centerId: ID!) {
    getBranches(centerId: $centerId) {
      id
      centerId
      name
      address
      phone
      managerId
      openTime
      closeTime
      workingDays
      status
      tenantId
    }
  }
`;

export const GET_CENTER_QUERY = /* GraphQL */ `
  query GetCenter {
    getCenter {
      id
      name
      nameBangla
      tagline
      establishedYear
      academicYearStartMonth
      email
      phone
      address
      logo
      tenantId
    }
  }
`;

export const GET_ORG_CHART_QUERY = /* GraphQL */ `
  query GetOrgChart {
    getOrgChart {
      id
      name
      level
      managerId
      parentId
      tenantId
      children {
        id
        name
        level
        managerId
        parentId
        tenantId
      }
    }
  }
`;

export const GET_TENANT_ROLES_QUERY = /* GraphQL */ `
  query GetTenantRoles {
    getTenantRoles {
      id
      name
      permissions
      system
      tenantId
    }
  }
`;

export const GET_ALL_NOTICES_QUERY = /* GraphQL */ `
  query GetAllNotices {
    getAllNotices {
      id
      title
      body
      status
      publishedAt
      expiresAt
      targetBatchIds
      createdBy
      tenantId
    }
  }
`;

export const GET_NOTICES_FOR_BATCH_QUERY = /* GraphQL */ `
  query GetNoticesForBatch($batchId: ID!) {
    getNoticesForBatch(batchId: $batchId) {
      id
      title
      body
      status
      publishedAt
      expiresAt
      targetBatchIds
      createdBy
      tenantId
    }
  }
`;

export const GET_DEPARTMENTS_QUERY = /* GraphQL */ `
  query GetDepartments {
    getDepartments {
      id
      code
      name
      description
      status
      parentDepartmentId
      defaultRoles
      tenantId
    }
  }
`;

export const GET_DEPARTMENT_QUERY = /* GraphQL */ `
  query GetDepartment($id: ID!) {
    getDepartment(id: $id) {
      id
      code
      name
      description
      status
      parentDepartmentId
      defaultRoles
      tenantId
    }
  }
`;
