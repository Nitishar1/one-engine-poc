import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2563eb', borderRadius: 8 } }}>
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
    </ConfigProvider>
  );
}
