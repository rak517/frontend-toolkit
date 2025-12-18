import { parseAsJson } from '../../useQueryParams';
import type { FunnelState } from '../core';

/**
 * URLSearchParams → FunnelState 변환
 */
export function parseState<TStep extends string, TContext extends object>(
  params: URLSearchParams,
  stepKey: string,
  contextKey: string,
  initialStep: TStep,
  initialContext: TContext
): FunnelState<TStep, TContext> {
  const step = (params.get(stepKey) as TStep) || initialStep;

  const contextStr = params.get(contextKey);
  const contextParser = parseAsJson<TContext>();
  const context = contextStr
    ? (contextParser.parse(contextStr) ?? initialContext)
    : initialContext;

  return { step, context };
}

/**
 * FunnelState → URLSearchParams 변환
 */
export function serializeState<TStep extends string, TContext extends object>(
  state: FunnelState<TStep, TContext>,
  stepKey: string,
  contextKey: string
): URLSearchParams {
  const params = new URLSearchParams();
  params.set(stepKey, state.step);

  if (Object.keys(state.context).length > 0) {
    const contextParser = parseAsJson<TContext>();
    params.set(contextKey, contextParser.serialize(state.context));
  }

  return params;
}
