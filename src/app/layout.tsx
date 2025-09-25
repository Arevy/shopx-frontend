import type { Metadata } from 'next'
import './globals.scss'
import { StoreProvider } from '@stores/StoreProvider'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { ToastStack } from '@components/ui/ToastStack'

export const metadata: Metadata = {
  title: 'ShopX – Discover the next era of shopping',
  description:
    'ShopX is the modern e-commerce platform that delivers inspired products, fast shipping, and a seamless journey from discovery to checkout.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div className="app-shell">
            <Header />
            <main className="app-main">{children}</main>
            <Footer />
          </div>
          <ToastStack />
        </StoreProvider>
      </body>
    </html>
  )
}
