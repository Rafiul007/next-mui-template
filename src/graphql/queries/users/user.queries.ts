export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      firstName
      lastName
      email
      phone
      profilePicture
      isActivated
      isVerified
      roles
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
