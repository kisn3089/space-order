/**
 * 브라우저 쿠키를 읽는 유틸리티 함수
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // SSR 환경 대응
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * 브라우저 쿠키를 설정하는 유틸리티 함수
 */
export function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === 'undefined') {
    return; // SSR 환경 대응
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${value}${expires}; path=/`;
}

/**
 * 브라우저 쿠키를 삭제하는 유틸리티 함수
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return; // SSR 환경 대응
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
