import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = ReactDOM.createRoot(document.getElementById('root'));

if (!PUBLISHABLE_KEY) {
 root.render(
 <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: 'red' }}>
 <h2>Missing Clerk Publishable Key</h2>
 <p>Please add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to your frontend <code>.env</code> file.</p>
 </div>
 );
} else {
 root.render(
 <React.StrictMode>
 <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
 <App />
 </ClerkProvider>
 </React.StrictMode>
 );
}
