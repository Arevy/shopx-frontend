import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@styles/globals.scss'
import { TranslationProvider } from '@/i18n'
import { StoreProvider } from '@stores/StoreProvider'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { ToastStack } from '@components/ui/ToastStack'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>ShopX – Discover the next era of shopping</title>
        <meta
          name="description"
          content="ShopX is the modern e-commerce platform that delivers inspired products, fast shipping, and a seamless journey from discovery to checkout."
        />
      </Head>
      <TranslationProvider>
        <StoreProvider>
          <div className="app-shell">
            <Header />
            <main className="app-main">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
          <ToastStack />
        </StoreProvider>
      </TranslationProvider>
    </>
  )
}

export default App
