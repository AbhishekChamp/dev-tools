import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@dev-tools/theme';
import Tool from './Tool';
import '@dev-tools/theme/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <div className="p-6">
        <Tool />
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
