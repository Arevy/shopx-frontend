export const ADD_TO_CART = /* GraphQL */ `
  mutation AddToCart($userId: ID!, $productId: ID!, $quantity: Int!) {
    addToCart(userId: $userId, item: { productId: $productId, quantity: $quantity }) {
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

