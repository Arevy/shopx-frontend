export const CREATE_PAYMENT = /* GraphQL */ `
  mutation CreatePayment($orderId: ID!, $amount: Float!, $method: String!) {
    createPayment(orderId: $orderId, amount: $amount, method: $method) {
      id
      orderId
      amount
      status
      method
    }
  }
`

