import { catalogApi } from '../store/api/catalogApi';
import { store } from '../store';
import type { AnalyticsEventType } from '../types/catalog';

export function trackEvent(
  eventType: AnalyticsEventType,
  payload?: { productId?: string; metadata?: Record<string, string> },
) {
  store.dispatch(
    catalogApi.endpoints.trackAnalyticsEvent.initiate({
      eventType,
      productId: payload?.productId,
      metadata: payload?.metadata,
    }),
  );
}
