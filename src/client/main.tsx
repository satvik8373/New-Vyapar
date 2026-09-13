import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './react/App';
import { initNativeApp } from './mobile/initNativeApp';

// Clean up any stray canvases if injected
document.querySelectorAll('body > canvas').forEach((c) => c.remove());

// Initialize mobile native environment (status bar, splash) if on Android / iOS
initNativeApp();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
