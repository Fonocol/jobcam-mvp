// src/app/providers.tsx
'use client';

import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ 
  children, 
  session 
}: { 
  children: ReactNode,
  session: SessionProviderProps['session']
}) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}