export const REDEEM_IMPERSONATION = /* GraphQL */ `
  mutation RedeemImpersonation($token: String!) {
    redeemImpersonation(token: $token) {
      id
      email
      name
      role
    }
  }
`
