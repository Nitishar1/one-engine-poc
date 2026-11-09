import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';
import { ThemeProvider } from './theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* AntApp lets pages show messages with App.useApp(). */}
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              {/* Every other URL needs a signed-in user; MenuPage picks the page. */}
              <Route element={<ProtectedRoute />}>
                <Route path="*" element={<MenuPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ThemeProvider>
  );
}
