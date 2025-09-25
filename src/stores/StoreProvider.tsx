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
    store.productStore.fetchProducts()
    store.productStore.fetchCategories()
    store.cmsStore.fetchPages()

    if (store.userStore.isAuthenticated) {
      store.cartStore.syncFromServer()
      store.wishlistStore.syncFromServer()
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
