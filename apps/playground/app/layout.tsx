import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frontend Toolkit Playground',
  description: '개발 및 테스트를 위한 환경입니다.',
};

const navItems = [
  { href: '/calendar', label: 'Calendar' },
  { href: '/inview', label: 'InViewTrigger' },
  { href: '/debounce', label: 'DebouncedCallback' },
  { href: '/suspense', label: 'SuspenseBoundary' },
  { href: '/funnel', label: 'Funnel' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <h1>Frontend Toolkit Playground</h1>
          <p>개발 및 테스트를 위한 환경입니다.</p>

          <nav
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '2rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '8px',
            }}
          >
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 16px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <main style={{ marginTop: '2rem' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
