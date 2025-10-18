export const GET_ORDERS = /* GraphQL */ `
  query GetOrders($userId: ID!) {
    getOrders(userId: $userId) {
      id
      userId
      total
      status
      createdAt
      updatedAt
      products {
        productId
        quantity
        price
      }
    }
  }
`
