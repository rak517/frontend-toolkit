import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra({
  reactStrictMode: true,
  transpilePackages: [
    '@frontend-toolkit/components',
    '@frontend-toolkit/hooks',
    '@frontend-toolkit/utils',
  ],
});
