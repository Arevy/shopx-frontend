export const ADD_ADDRESS = /* GraphQL */ `
  mutation AddAddress(
    $userId: ID!
    $street: String!
    $city: String!
    $postalCode: String!
    $country: String!
  ) {
    addAddress(
      userId: $userId
      street: $street
      city: $city
      postalCode: $postalCode
      country: $country
    ) {
      id
      street
      city
      postalCode
      country
    }
  }
`

