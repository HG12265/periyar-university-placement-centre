/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT SYSTEM - CLIENT ENTRYPOINT
 * ============================================================================
 * 
 * Mounts the React application into the DOM root:
 * - QueryClientProvider: React Query caching and data synchronization.
 * - BrowserRouter: Client-side routing.
 * - AuthProvider: Global authentication state and CSRF session handling.
 * - App: Root routes, navigation guards, and layout containers.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/Auth.jsx';
import App from './App.jsx';
import './styles/main.css';

// Configure TanStack Query client with standard stale time and single retry
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1
    }
  }
});

// Render the application tree
const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
