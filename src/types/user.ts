export type UserRole = 'CUSTOMER' | 'SUPPORT'

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

export interface AuthPayload {
  token: string
  user: User
}
