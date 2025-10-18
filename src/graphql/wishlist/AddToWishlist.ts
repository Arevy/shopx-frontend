export const ADD_TO_WISHLIST = /* GraphQL */ `
  mutation AddToWishlist($userId: ID!, $productId: ID!) {
    addToWishlist(userId: $userId, productId: $productId) {
      userId
      products {
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
`

