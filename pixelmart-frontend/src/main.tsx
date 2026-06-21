import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StoreBootstrap } from './components/StoreBootstrap';
import { store } from './store';
import { router } from './router';
import { applyTheme } from './theme/applyTheme';
import { loadThemeFromStorage } from './theme/storage';
import i18n from './i18n';
import './index.css';

const saved = loadThemeFromStorage();
applyTheme(saved.presetId, saved.mode);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ErrorBoundary>
          <StoreBootstrap />
          <RouterProvider router={router} />
        </ErrorBoundary>
      </Provider>
    </I18nextProvider>
  </StrictMode>,
);
