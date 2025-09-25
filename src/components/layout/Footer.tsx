import styles from './Footer.module.scss'

const supportLinks = [
  { href: '#', label: 'Contact' },
  { href: '#', label: 'FAQ' },
  { href: '#', label: 'Returns & Warranty' },
]

const companyLinks = [
  { href: '#', label: 'About ShopX' },
  { href: '#', label: 'Careers' },
  { href: '#', label: 'Blog' },
]

const socialLinks = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'Facebook' },
  { href: '#', label: 'TikTok' },
]

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>ShopX</div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            The e-commerce platform that blends technology with design for a contemporary shopping experience.
          </p>
        </div>
        <div>
          <div className={styles.sectionTitle}>Support</div>
          {supportLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <div className={styles.sectionTitle}>Company</div>
          {companyLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <div className={styles.sectionTitle}>Social</div>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className={styles.bottomBar}>
        <span>© {new Date().getFullYear()} ShopX. All rights reserved.</span>
        <span>Crafted with care using Next.js & GraphQL.</span>
      </div>
    </footer>
  )
}
