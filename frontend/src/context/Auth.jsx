import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Base URL for the Backend Placement Portal API
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/placement_api';

/**
 * Pre-configured Axios instance with credentials (cookies) enabled
 */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// In-memory CSRF token storage
let csrfToken = '';

// Axios request interceptor: attaches CSRF token on mutating requests
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method) && csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// React Authentication Context
const AuthContext = createContext(null);

/**
 * Maps each institutional role to its default root dashboard route
 */
export const roleHomes = {
  STUDENT: '/dashboard',
  COMPANY: '/company/dashboard',
  UNIVERSITY_ADMIN: '/admin/dashboard',
  DEPARTMENT_COORDINATOR: '/coordinator/dashboard'
};

/**
 * Authentication Context Provider
 * Manages global user session, login, logout, and automatic session restoration.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Refreshes user session from `/auth/me`
   */
  async function refresh() {
    try {
      const { data } = await api.get('/auth/me');
      csrfToken = data.csrfToken;
      setUser(data.user);
    } catch {
      csrfToken = '';
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  /**
   * Performs user authentication with email and password
   */
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    csrfToken = data.csrfToken;
    setUser(data.user);
    return data.user;
  }

  /**
   * Clears session cookie and resets user state
   */
  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      csrfToken = '';
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the AuthContext
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Resolves static URL for uploaded files (photos, resumes, certificates)
 */
export const fileUrl = (id, preview = false) =>
  `${API_BASE}/files/${id}${preview ? '?preview=1' : ''}`;

/**
 * Helper to download binary files (e.g. generated Excel spreadsheets)
 */
export async function download(path, filename = 'report.xlsx') {
  const response = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Extracts a human-friendly error message from an Axios error or standard Error
 */
export function errorText(e) {
  return (
    e?.response?.data?.error ||
    e?.message ||
    'Something went wrong. Please try again.'
  );
}
