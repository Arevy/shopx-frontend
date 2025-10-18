export const CREATE_ORDER = /* GraphQL */ `
  mutation CreateOrder($userId: ID!, $products: [OrderProductInput!]!) {
    createOrder(userId: $userId, products: $products) {
      id
      userId
      total
      status
      products {
        quantity
        productId
        price
      }
    }
  }
`

