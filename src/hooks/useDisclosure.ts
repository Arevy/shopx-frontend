import { useCallback, useState } from 'react'

type UseDisclosureOptions = {
  defaultIsOpen?: boolean
}

export function useDisclosure({ defaultIsOpen = false }: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])
  const onToggle = useCallback(() => setIsOpen((value) => !value), [])

  return { isOpen, onOpen, onClose, onToggle }
}
