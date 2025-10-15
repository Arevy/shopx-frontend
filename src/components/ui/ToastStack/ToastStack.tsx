'use client'

import { observer } from 'mobx-react-lite'
import { AnimatePresence, motion } from 'framer-motion'
import { useStores } from '@stores/StoreProvider'
import styles from './ToastStack.module.scss'

export const ToastStack = observer(() => {
  const { uiStore } = useStores()

  return (
    <div className={styles.stack}>
      <AnimatePresence>
        {uiStore.toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`${styles.toast} ${
              toast.type === 'success'
                ? styles.toastSuccess
                : toast.type === 'error'
                  ? styles.toastError
                  : styles.toastInfo
            }`}
          >
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              onClick={() => uiStore.removeToast(toast.id)}
              className={styles.close}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
})
