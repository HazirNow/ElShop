/**
 * Centralized Application Error & Toast Notification Utility
 * 
 * Provides unified error catching, state-reversion hooks, and direct dispatch
 * into the App.tsx toast banner mechanism.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastPayload {
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

/**
 * Register a listener for global toast notifications (used by App.tsx)
 */
export function registerToastListener(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dispatch a toast notification to all registered listeners and window events
 */
export function triggerToast(message: string, type: ToastType = 'info', duration: number = 3500): void {
  const payload: ToastPayload = { message, type, duration };

  // Notify registered callbacks (e.g., App.tsx toast state)
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      console.warn('[ErrorHandler] Failed to execute toast listener:', err);
    }
  });

  // Also dispatch browser CustomEvent for decoupled listeners/testing
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: payload }));
    } catch {
      // Ignore if event dispatching is unavailable
    }
  }
}

/**
 * Extracts a clean, human-readable error description from any caught error
 */
export function formatErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Operation failed. Please try again.'
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error) {
    // Check if error message is JSON
    if (error.message.startsWith('{') && error.message.endsWith('}')) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message || parsed.error) {
          return String(parsed.message || parsed.error);
        }
      } catch {
        // Fallback to error.message
      }
    }
    return error.message || fallbackMessage;
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error === 'string') return obj.error;
  }

  return fallbackMessage;
}

/**
 * Centralized API error handler that:
 * 1. Formats the error message
 * 2. Invokes the state-reversion callback (if provided)
 * 3. Triggers the App.tsx toast mechanism with an 'error' notification
 * 
 * @param error Caught exception
 * @param fallbackMessage User-facing context description
 * @param onRevert Optional state rollback callback
 * @returns The user-facing error message
 */
export function notifyError(
  error: unknown,
  fallbackMessage: string = 'Operation could not be completed. Please check connection.',
  onRevert?: () => void
): string {
  const message = formatErrorMessage(error, fallbackMessage);

  // Execute state reversion logic if provided (e.g. roll back optimistic updates or forms)
  if (typeof onRevert === 'function') {
    try {
      onRevert();
    } catch (revertErr) {
      console.warn('[ErrorHandler] Error executing state reversion callback:', revertErr);
    }
  }

  // Trigger user-facing alert via App.tsx toast banner
  triggerToast(message, 'error');

  return message;
}

/**
 * Convenience helper to show a user-facing success toast
 */
export function notifySuccess(message: string, duration: number = 3000): void {
  triggerToast(message, 'success', duration);
}

/**
 * Convenience helper to show an info toast
 */
export function notifyInfo(message: string, duration: number = 3000): void {
  triggerToast(message, 'info', duration);
}

/**
 * Wraps an asynchronous API call with centralized error handling and state reversion.
 * 
 * @example
 * const res = await withApiErrorHandling(
 *   () => updateProduct(id, updates),
 *   {
 *     fallbackMessage: 'Failed to update product stock',
 *     onRevert: () => revertOptimisticStock(id)
 *   }
 * );
 */
export async function withApiErrorHandling<T>(
  apiFn: () => Promise<T>,
  options: {
    fallbackMessage?: string;
    onRevert?: () => void;
    rethrow?: boolean;
    successMessage?: string;
  } = {}
): Promise<T | null> {
  try {
    const result = await apiFn();
    if (options.successMessage) {
      notifySuccess(options.successMessage);
    }
    return result;
  } catch (err) {
    notifyError(err, options.fallbackMessage, options.onRevert);
    if (options.rethrow) {
      throw err;
    }
    return null;
  }
}
