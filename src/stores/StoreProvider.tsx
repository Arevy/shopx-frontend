'use client'

import { createContext, useContext, useEffect, useMemo } from 'react'
import { enableStaticRendering } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { createRootStore, RootStore } from './rootStore'

const isServer = typeof window === 'undefined'
enableStaticRendering(isServer)

const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => createRootStore(), [])

  useEffect(() => {
    store.userStore.hydrateFromStorage()
    store.cartStore.hydrateFromStorage()
    store.wishlistStore.hydrateFromStorage()
    store.cmsStore.fetchPages()

    if (store.userStore.isAuthenticated) {
      void store.userStore.bootstrapAuthenticatedUser()
    }
  }, [store])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStores = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('StoreProvider is missing from component tree')
  }
  return store
}
