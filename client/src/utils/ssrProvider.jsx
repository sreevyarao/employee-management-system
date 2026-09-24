import React from 'react';

export function SSRProvider({ children }) {
  return <>{children}</>;
}

export function useSSRSafeId(id) {
  return id || 'ssr-id';
}

export function useIsSSR() {
  return false;
}

export default SSRProvider;
