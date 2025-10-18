export const REMOVE_FROM_CART = /* GraphQL */ `
  mutation RemoveFromCart($userId: ID!, $productId: ID!) {
    removeFromCart(userId: $userId, productId: $productId) {
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

