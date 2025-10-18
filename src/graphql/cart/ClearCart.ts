export const CLEAR_CART = /* GraphQL */ `
  mutation ClearCart($userId: ID!) {
    clearCart(userId: $userId)
  }
`

