declare global {
  interface Window {
    __ONRI_NATIVE__?: boolean;
    __ONRI_PLATFORM__?: string;
    __ONRI_FCM_TOKEN__?: string;
    ReactNativeWebView?: {
      postMessage: (msg: string) => void;
    };
  }
}

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && !!window.__ONRI_NATIVE__;
}

export function getNativePlatform(): string | null {
  if (!isNativeApp()) return null;
  return window.__ONRI_PLATFORM__ || null;
}

export function getFcmToken(): string | null {
  if (!isNativeApp()) return null;
  return window.__ONRI_FCM_TOKEN__ || null;
}

export async function registerFcmToken(): Promise<void> {
  const token = getFcmToken();
  if (!token) return;

  try {
    await fetch('/api/fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: getNativePlatform() || 'unknown',
      }),
    });
  } catch (err) {
    console.error('[NativeBridge] FCM 토큰 등록 실패:', err);
  }
}

export function postToNative(message: Record<string, unknown>): void {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}
