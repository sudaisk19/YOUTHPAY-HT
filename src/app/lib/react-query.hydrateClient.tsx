'use client';

import {
  HydrationBoundary,
  HydrationBoundaryProps,
} from '@tanstack/react-query';

export function Hydrate(props: HydrationBoundaryProps) {
  return <HydrationBoundary {...props} />;
}
