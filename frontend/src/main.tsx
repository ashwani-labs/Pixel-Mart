import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './router';
import { applyTheme } from './theme/applyTheme';
import { loadThemeFromStorage } from './theme/storage';
import './index.css';

const saved = loadThemeFromStorage();
applyTheme(saved.presetId, saved.mode);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
