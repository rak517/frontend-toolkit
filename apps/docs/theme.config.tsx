import type { DocsThemeConfig } from 'nextra-theme-docs';
import React from 'react';

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 'bold' }}>🧰 Frontend Toolkit</span>,
  project: {
    link: 'https://github.com/rak517/frontend-toolkit',
  },
  docsRepositoryBase:
    'https://github.com/rak517/frontend-toolkit/tree/main/apps/docs',
  footer: {
    component: (
      <footer style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Frontend Toolkit - Made with ❤️</p>
      </footer>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Frontend Toolkit" />
      <meta
        property="og:description"
        content="React components and hooks library for better DX"
      />
      <title>Frontend Toolkit</title>
    </>
  ),
};

export default config;
