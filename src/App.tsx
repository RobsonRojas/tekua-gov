import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PWAProvider } from './context/PWAContext';
import { useTranslation } from 'react-i18next';
import ConsentGuard from './components/auth/ConsentGuard';
import router from './router';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.title');
  }, [i18n.language, t]);

  return (
    <PWAProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <ConsentGuard>
              <RouterProvider router={router} />
            </ConsentGuard>
          </NotificationProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </PWAProvider>
  );
};

export default App;
