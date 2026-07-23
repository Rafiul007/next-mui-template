export const GET_MY_IMPERSONATION_STATUS_QUERY = /* GraphQL */ `
  query GetMyImpersonationStatus {
    myImpersonationStatus {
      active
      asImpersonatedUser
      sessionId
      adminUserId
      adminName
      targetUserId
      targetUserName
      startedAt
    }
  }
`;
