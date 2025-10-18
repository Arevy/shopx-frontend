export const GET_CART = /* GraphQL */ `
  query GetCart($userId: ID!) {
    getCart(userId: $userId) {
      userId
      total
      items {
        quantity
        product {
          id
          name
          price
          description
          categoryId
          image {
            url
          }
        }
      }
    }
  }
`

