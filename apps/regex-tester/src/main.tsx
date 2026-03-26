import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@dev-tools/theme';
import Tool from './Tool';
import '@dev-tools/theme/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <div className="bg-background min-h-screen p-8">
        <Tool />
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
