export const CHANGE_USER_PASSWORD = /* GraphQL */ `
  mutation ChangeUserPassword($currentPassword: String!, $newPassword: String!) {
    changeUserPassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`
