import { isTokenExpired } from "./jwt";

const TOKEN_KEY = "token";

// SSR-safe browser cookie utility helpers
const getCookie = (name) => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  if (typeof window === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  // Store securely using Lax (CSRF protection) and Secure (HTTPS only) flags
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
};

const deleteCookie = (name) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
};

export const getSession = () => {
  const token = getCookie(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
};

export const setSession = (token) => {
  if (token) {
    setCookie(TOKEN_KEY, token, 7);
  } else {
    clearSession();
  }
};

export const clearSession = () => {
  deleteCookie(TOKEN_KEY);
};

export const isValidSession = () => {
  const token = getSession();
  return !!token;
};
