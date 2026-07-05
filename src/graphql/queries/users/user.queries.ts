export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      user {
        id
        firstName
        lastName
        email
        phone
        profilePicture
        isActivated
        isVerified
      }
      roles
      permissions {
        resource
        actions
      }
      userType
    }
  }
`;

export const GET_USER_QUERY = /* GraphQL */ `
  query GetUser($id: String!) {
    getUser(id: $id) {
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

export const GET_USERS_QUERY = /* GraphQL */ `
  query GetUsers($page: Int, $limit: Int, $query: String) {
    getUsers(page: $page, limit: $limit, query: $query) {
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

export const GET_TEACHERS_QUERY = /* GraphQL */ `
  query GetTeachers {
    getTeachers {
      id
      firstName
      lastName
      email
      phone
      profilePicture
      roles
    }
  }
`;

export const GET_MY_PLAN_QUERY = /* GraphQL */ `
  query GetMyPlan {
    getMyPlan {
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

export const GET_MY_NOTIFICATIONS_QUERY = /* GraphQL */ `
  query GetMyNotifications($page: Int, $limit: Int) {
    myNotifications(page: $page, limit: $limit) {
      id
      title
      body
      type
      isRead
      readAt
      createdAt
      tenantId
    }
  }
`;

export const GET_MY_UNREAD_COUNT_QUERY = /* GraphQL */ `
  query GetMyUnreadCount {
    myUnreadCount
  }
`;
