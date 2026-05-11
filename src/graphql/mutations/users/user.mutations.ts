export const INVITE_BONGO_USER_MUTATION = /* GraphQL */ `
  mutation InviteBongoUser($user: InviteBongoUserInput!) {
    inviteBongoUser(user: $user) {
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

export const DELETE_USER_MUTATION = /* GraphQL */ `
  mutation DeleteUser($id: String) {
    deleteUser(id: $id)
  }
`;

export const SET_ACTIVE_STATUS_MUTATION = /* GraphQL */ `
  mutation SetActiveStatus($id: String!, $newStatus: Boolean!) {
    setActiveStatus(id: $id, newStatus: $newStatus) {
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

export const UPDATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateProfile($user: UserUpdate) {
    updateProfile(user: $user) {
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

export const ONBOARD_EMPLOYEE_MUTATION = /* GraphQL */ `
  mutation OnboardEmployee($input: OnboardEmployeeInput!) {
    onboardEmployee(input: $input) {
      id
      tenantId
      userId
      branchId
      employeeCode
      designation
      department
      employmentType
      joiningDate
      status
      isOnProbation
      probationEndsAt
      nid
      tin
      bloodGroup
      emergencyContactName
      emergencyContactPhone
    }
  }
`;
