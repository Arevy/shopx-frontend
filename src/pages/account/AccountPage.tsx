'use client'

import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { useRTL, useTranslation } from '@/i18n'
import styles from './AccountPage.module.scss'

type SectionKey = 'overview' | 'security' | 'orders'

type SectionDefinition = {
  key: SectionKey
  label: string
  title: string
  description: string
}

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '—'
  }

  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return String(value)
  }
}

const formatCurrency = (value: number): string =>
  value.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })

const AccountPage = observer(() => {
  const { userStore } = useStores()
  const { t } = useTranslation('Page_Account')
  const isRtl = useRTL()

  const [selectedSection, setSelectedSection] = useState<SectionKey>('overview')
  const [profileForm, setProfileForm] = useState(() => ({
    name: userStore.user?.name ?? '',
    email: userStore.user?.email ?? '',
  }))
  const [allowProfileEdit, setAllowProfileEdit] = useState<boolean>(false)
  const [profilePassword, setProfilePassword] = useState<string>('')
  const [profileClientError, setProfileClientError] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordClientError, setPasswordClientError] = useState<string | null>(null)

  useEffect(() => {
    setProfileForm({
      name: userStore.user?.name ?? '',
      email: userStore.user?.email ?? '',
    })
    setAllowProfileEdit(false)
    setProfilePassword('')
    setProfileClientError(null)
  }, [userStore.user?.name, userStore.user?.email])

  useEffect(() => {
    if (!userStore.isAuthenticated) {
      return
    }
    if (selectedSection === 'orders') {
      userStore.loadOrders().catch(() => undefined)
    }
  }, [selectedSection, userStore, userStore.isAuthenticated])

  const sections = useMemo<SectionDefinition[]>(
    () => [
      {
        key: 'overview',
        label: t('menu.overview'),
        title: t('sections.overview.title'),
        description: t('sections.overview.description'),
      },
      {
        key: 'security',
        label: t('menu.security'),
        title: t('sections.security.title'),
        description: t('sections.security.description'),
      },
      {
        key: 'orders',
        label: t('menu.orders'),
        title: t('sections.orders.title'),
        description: t('sections.orders.description'),
      },
    ],
    [t],
  )

  const activeSection = sections.find((section) => section.key === selectedSection) ?? sections[0]

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userStore.user) {
      return
    }
    if (!allowProfileEdit) {
      return
    }

    setProfileClientError(null)

    const trimmedName = profileForm.name.trim()
    const trimmedEmail = profileForm.email.trim()
    const currentName = userStore.user.name ?? ''
    const currentEmail = userStore.user.email ?? ''

    const updates: {
      name?: string | null
      email?: string
    } = {}

    if (trimmedName !== currentName) {
      updates.name = trimmedName.length ? trimmedName : null
    }

    if (trimmedEmail !== currentEmail) {
      updates.email = trimmedEmail
    }

    if (!Object.keys(updates).length) {
      setAllowProfileEdit(false)
      setProfilePassword('')
      return
    }

    const trimmedPassword = profilePassword.trim()
    if (!trimmedPassword) {
      setProfileClientError(t('sections.overview.form.password_required'))
      return
    }

    const updated = await userStore.updateProfile({
      ...updates,
      currentPassword: trimmedPassword,
    })

    if (updated) {
      setAllowProfileEdit(false)
      setProfilePassword('')
      setProfileClientError(null)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordClientError(null)

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordClientError(t('sections.security.form.mismatch'))
      return
    }

    const success = await userStore.changePassword(passwordForm.current, passwordForm.next)
    if (success) {
      setPasswordForm({ current: '', next: '', confirm: '' })
    }
  }

  const handleProfileEditToggle = () => {
    setAllowProfileEdit((prev) => {
      const next = !prev
      if (!next) {
        setProfilePassword('')
        setProfileClientError(null)
        userStore.profileError = null
        setProfileForm({
          name: userStore.user?.name ?? '',
          email: userStore.user?.email ?? '',
        })
      }
      return next
    })
  }

  const renderOverview = () => (
    <Surface className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
        <p className={styles.sectionDescription}>{activeSection.description}</p>
      </div>
      <form className={styles.formGrid} onSubmit={handleProfileSubmit}>
        <FormField label={t('sections.overview.form.name_label')}>
          <Input
            value={profileForm.name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={t('sections.overview.form.name_placeholder')}
            autoComplete="name"
            disabled={!allowProfileEdit}
          />
        </FormField>
        <FormField label={t('sections.overview.form.email_label')}>
          <Input
            type="email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder={t('sections.overview.form.email_placeholder')}
            autoComplete="email"
            disabled={!allowProfileEdit}
          />
        </FormField>

        <div
          className={classNames(styles.editToggle, isRtl && styles.editToggleRtl)}
        >
          <label className={styles.editToggleLabel}>
            <input
              type="checkbox"
              checked={allowProfileEdit}
              onChange={handleProfileEditToggle}
            />
            <span>{t('sections.overview.form.enable_edit')}</span>
          </label>
        </div>

        {allowProfileEdit ? (
          <FormField label={t('sections.overview.form.password_label')}>
            <Input
              type="password"
              value={profilePassword}
              onChange={(event) => {
                setProfilePassword(event.target.value)
                setProfileClientError(null)
              }}
              placeholder={t('sections.overview.form.password_placeholder')}
              autoComplete="current-password"
            />
          </FormField>
        ) : null}

        {profileClientError ? (
          <span className={styles.errorMessage}>{profileClientError}</span>
        ) : null}
        {userStore.profileError ? (
          <span className={styles.errorMessage}>{userStore.profileError}</span>
        ) : null}

        <div className={styles.formActions}>
          <Button
            type="submit"
            loading={userStore.profileSaving}
            disabled={!allowProfileEdit || userStore.profileSaving}
          >
            {t('sections.overview.form.submit')}
          </Button>
        </div>
      </form>
    </Surface>
  )

  const renderSecurity = () => (
    <Surface className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
        <p className={styles.sectionDescription}>{activeSection.description}</p>
      </div>
      <form className={styles.formGrid} onSubmit={handlePasswordSubmit}>
        <FormField label={t('sections.security.form.current_label')}>
          <Input
            type="password"
            value={passwordForm.current}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, current: event.target.value }))
            }
            autoComplete="current-password"
            placeholder={t('sections.security.form.current_placeholder')}
          />
        </FormField>
        <FormField label={t('sections.security.form.new_label')}>
          <Input
            type="password"
            value={passwordForm.next}
            onChange={(event) => {
              setPasswordClientError(null)
              setPasswordForm((prev) => ({ ...prev, next: event.target.value }))
            }}
            autoComplete="new-password"
            placeholder={t('sections.security.form.new_placeholder')}
          />
        </FormField>
        <FormField label={t('sections.security.form.confirm_label')}>
          <Input
            type="password"
            value={passwordForm.confirm}
            onChange={(event) => {
              setPasswordClientError(null)
              setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))
            }}
            autoComplete="new-password"
            placeholder={t('sections.security.form.confirm_placeholder')}
          />
        </FormField>

        {passwordClientError ? (
          <span className={styles.errorMessage}>{passwordClientError}</span>
        ) : null}

        {userStore.passwordError ? (
          <span className={styles.errorMessage}>{userStore.passwordError}</span>
        ) : null}

        <div className={styles.formActions}>
          <Button type="submit" loading={userStore.passwordChanging}>
            {t('sections.security.form.submit')}
          </Button>
        </div>
      </form>
    </Surface>
  )

  const renderOrders = () => (
    <Surface className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
        <p className={styles.sectionDescription}>{activeSection.description}</p>
      </div>

      {userStore.ordersLoading ? (
        <p>{t('sections.orders.loading')}</p>
      ) : userStore.ordersError ? (
        <span className={styles.errorMessage}>{userStore.ordersError}</span>
      ) : userStore.orders.length === 0 ? (
        <p>{t('sections.orders.empty')}</p>
      ) : (
        <div className={styles.ordersList}>
          {userStore.orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <strong>
                  {t('sections.orders.order_id', { id: order.id })}
                </strong>
                <span>
                  {t('sections.orders.total', { value: formatCurrency(order.total) })}
                </span>
              </div>
              <div className={styles.orderMeta}>
                <span>{t('sections.orders.placed', { value: formatDate(order.createdAt) })}</span>
                <span>{t('sections.orders.status', { value: order.status })}</span>
                <span>
                  {t('sections.orders.items', { count: order.products.length })}
                </span>
              </div>
              <div className={styles.orderProducts}>
                {order.products.map((product, index) => (
                  <div key={`${order.id}-${product.productId}-${index}`} className={styles.orderProduct}>
                    <span>{t('sections.orders.product_line', { id: product.productId })}</span>
                    <span>
                      {product.quantity} × {formatCurrency(product.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Surface>
  )

  if (!userStore.isAuthenticated) {
    return (
      <Surface className={styles.guard}>
        <h1 className="section-title">{t('guard.title')}</h1>
        <p className="section-subtitle">{t('guard.subtitle')}</p>
        <div className={styles.guardActions}>
          <Button href={{ pathname: '/auth/login' }}>{t('guard.actions.sign_in')}</Button>
          <Button href={{ pathname: '/auth/register' }} variant="outline">
            {t('guard.actions.register')}
          </Button>
        </div>
      </Surface>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      <div className={classNames(styles.layout, isRtl && styles.layoutRtl)}>
        <aside className={classNames(styles.sidebar, isRtl && styles.sidebarRtl)}>
          <div className={styles.sidebarButtons}>
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={classNames(
                  styles.menuButton,
                  selectedSection === section.key && styles.menuButtonActive,
                )}
                onClick={() => setSelectedSection(section.key)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        <main className={styles.content}>
          {selectedSection === 'overview'
            ? renderOverview()
            : selectedSection === 'security'
              ? renderSecurity()
              : renderOrders()}
        </main>
      </div>
    </div>
  )
})

export default AccountPage
