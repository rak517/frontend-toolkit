// Main hook
export { useFunnel } from './useFunnel';
export type { UseFunnelOptionsWithAdapter } from './useFunnel';

// Core
export { useFunnelContext } from './core';
export type {
  FunnelProps,
  FunnelStepProps,
  FunnelState,
  FunnelHistory,
  UseFunnelOptions,
  UseFunnelReturn,
  FunnelContextValue,
  FunnelContextMap,
  FlattenContext,
} from './core';

// Adapters
export { createMemoryAdapter, createBrowserAdapter } from './adapters';
export type {
  FunnelAdapter,
  MemoryAdapterOptions,
  BrowserAdapterOptions,
  StorageAdapterOptions,
} from './adapters';
