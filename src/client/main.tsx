import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './react/App';

// Clean up any stray canvases if injected
document.querySelectorAll('body > canvas').forEach((c) => c.remove());

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
