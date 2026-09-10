import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { ClerkProvider } from '@clerk/clerk-react';

const rawPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const hasValidClerkKey = rawPublishableKey &&
  !rawPublishableKey.toLowerCase().includes('your_') &&
  !rawPublishableKey.toLowerCase().includes('replace_') &&
  !rawPublishableKey.toLowerCase().includes('example');

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!hasValidClerkKey) {
 root.render(
 <React.StrictMode>
 <App />
 </React.StrictMode>
 );
} else {
 root.render(
 <React.StrictMode>
 <ClerkProvider publishableKey={rawPublishableKey}>
 <App />
 </ClerkProvider>
 </React.StrictMode>
 );
}
