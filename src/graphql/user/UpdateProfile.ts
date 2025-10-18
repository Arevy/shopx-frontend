export const UPDATE_USER_PROFILE = /* GraphQL */ `
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      user {
        id
        email
        name
        role
      }
      message
    }
  }
`
