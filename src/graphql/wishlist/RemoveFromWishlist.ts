export const REMOVE_FROM_WISHLIST = /* GraphQL */ `
  mutation RemoveFromWishlist($userId: ID!, $productId: ID!) {
    removeFromWishlist(userId: $userId, productId: $productId) {
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

