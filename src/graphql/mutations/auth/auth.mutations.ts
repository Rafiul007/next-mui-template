export const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      expiresInSeconds
      tokenType
    }
  }
`;

export const REFRESH_MUTATION = /* GraphQL */ `
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      expiresInSeconds
      tokenType
    }
  }
`;

export const LOGOUT_MUTATION = /* GraphQL */ `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

export const CHANGE_PASSWORD_MUTATION = /* GraphQL */ `
  mutation ChangePassword($newPassword: String!, $confirmPassword: String!) {
    changePassword(newPassword: $newPassword, confirmPassword: $confirmPassword)
  }
`;

export const RESEND_OTP_MUTATION = /* GraphQL */ `
  mutation ResendOtp($email: String!) {
    resendOtp(email: $email) {
      cooldown
      status
    }
  }
`;

export const USER_REGISTRATION_MUTATION = /* GraphQL */ `
  mutation UserRegistration($user: UserRegistration!) {
    userRegistration(user: $user) {
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

export const VERIFY_USER_MUTATION = /* GraphQL */ `
  mutation VerifyUser($email: String!, $otp: Int) {
    verifyUser(email: $email, otp: $otp) {
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
