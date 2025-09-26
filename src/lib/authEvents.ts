export type SessionExpiredListener = () => void

const listeners = new Set<SessionExpiredListener>()

export const onSessionExpired = (listener: SessionExpiredListener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const emitSessionExpired = () => {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Session expired listener failed', error)
    }
  })
}

export const markSessionExpired = (error: unknown) => {
  if (error && typeof error === 'object') {
    Object.assign(error, { sessionExpired: true })
  }
}

export const isSessionExpiredError = (error: unknown): error is Error & {
  sessionExpired?: boolean
} => {
  return Boolean(error && typeof error === 'object' && (error as { sessionExpired?: boolean }).sessionExpired)
}
