import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra({
  reactStrictMode: true,
  transpilePackages: [
    '@frontend-toolkit-js/components',
    '@frontend-toolkit-js/hooks',
    '@frontend-toolkit-js/utils',
  ],
});
