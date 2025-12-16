'use client';

import { Suspense, type ReactNode } from 'react';
import { QueryParamsProvider } from '@frontend-toolkit-js/hooks';
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/next-app';

interface ProvidersProps {
  children: ReactNode;
}

function QueryParamsProviderInner({ children }: ProvidersProps) {
  const adapter = useNextAppAdapter();

  return (
    <QueryParamsProvider adapter={adapter}>
      {children}
    </QueryParamsProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={null}>
      <QueryParamsProviderInner>{children}</QueryParamsProviderInner>
    </Suspense>
  );
}
