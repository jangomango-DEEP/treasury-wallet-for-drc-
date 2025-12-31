
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure Buffer is globally available for web3 libraries
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  // If the script tag in index.html didn't load yet or failed, this is a fallback.
  // Note: Most web3 modules check global Buffer on load.
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
