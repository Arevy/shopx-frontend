import { makeAutoObservable, runInAction } from 'mobx'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export class UiStore {
  toasts: Toast[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  addToast(message: string, type: ToastType = 'info', timeout = 4000) {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

    this.toasts.push({ id, message, type })

    if (timeout) {
      setTimeout(() => {
        runInAction(() => {
          this.removeToast(id)
        })
      }, timeout)
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
  }
}
