export const SETUP_CENTER_MUTATION = /* GraphQL */ `
  mutation SetupCenter($center: SetupCenterInput!) {
    setupCenter(center: $center) {
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

export const UPDATE_CENTER_MUTATION = /* GraphQL */ `
  mutation UpdateCenter($center: SetupCenterInput!) {
    updateCenter(center: $center) {
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

export const CREATE_BRANCH_MUTATION = /* GraphQL */ `
  mutation CreateBranch($branch: CreateBranchInput!) {
    createBranch(branch: $branch) {
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

export const UPDATE_BRANCH_MUTATION = /* GraphQL */ `
  mutation UpdateBranch($branch: UpdateBranchInput!) {
    updateBranch(branch: $branch) {
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

export const DEACTIVATE_BRANCH_MUTATION = /* GraphQL */ `
  mutation DeactivateBranch($branchId: ID!) {
    deactivateBranch(branchId: $branchId) {
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

export const CREATE_HOLIDAY_MUTATION = /* GraphQL */ `
  mutation CreateHoliday($holiday: CreateHolidayInput!) {
    createHoliday(holiday: $holiday) {
      id
      branchId
      date
      name
      type
      tenantId
    }
  }
`;

export const ADD_ORG_NODE_MUTATION = /* GraphQL */ `
  mutation AddOrgNode($node: CreateOrgNodeInput!) {
    addOrgNode(node: $node) {
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

export const CREATE_CUSTOM_ROLE_MUTATION = /* GraphQL */ `
  mutation CreateCustomRole($role: CreateTenantRoleInput!) {
    createCustomRole(role: $role) {
      id
      name
      permissions
      system
      tenantId
    }
  }
`;

export const ASSIGN_ROLE_TO_USER_MUTATION = /* GraphQL */ `
  mutation AssignRoleToUser($userId: ID!, $roleName: String!) {
    assignRoleToUser(userId: $userId, roleName: $roleName) {
      id
      name
      permissions
      system
      tenantId
    }
  }
`;

export const ADD_ROLE_MUTATION = /* GraphQL */ `
  mutation AddRole($id: String!, $roles: [String!]!) {
    addRole(id: $id, roles: $roles) {
      id
      email
      firstName
      lastName
      phone
      profilePicture
      isActivated
      isVerified
      roles
    }
  }
`;
