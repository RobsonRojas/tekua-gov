import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import router from './router';

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export default App;
