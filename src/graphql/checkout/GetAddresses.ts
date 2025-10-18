export const GET_ADDRESSES = /* GraphQL */ `
  query GetAddresses($userId: ID!) {
    getAddresses(userId: $userId) {
      id
      street
      city
      postalCode
      country
    }
  }
`

