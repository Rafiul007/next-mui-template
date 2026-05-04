import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      roles
      profilePicture
    }
  }
`;
