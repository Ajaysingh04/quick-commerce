import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

import { ClerkProvider } from '@clerk/clerk-react';

const rawPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_YW1hemVkLWxpemFyZC0yNC5jbGVyay5hY2NvdW50cy5kZXYk').trim();
const hasValidClerkKey = rawPublishableKey &&
  !rawPublishableKey.toLowerCase().includes('your_') &&
  !rawPublishableKey.toLowerCase().includes('replace_') &&
  !rawPublishableKey.toLowerCase().includes('example');

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!hasValidClerkKey) {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ClerkProvider publishableKey={rawPublishableKey}>
          <App />
        </ClerkProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
