export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      expiresInSeconds
      tokenType
    }
  }
`;

export const REFRESH_MUTATION = `
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      expiresInSeconds
      tokenType
    }
  }
`;
