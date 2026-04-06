import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import router from './router';

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export default App;
