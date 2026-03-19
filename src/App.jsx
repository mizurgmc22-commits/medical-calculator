import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BsaCalculator from './pages/BsaCalculator';
import SizeConverter from './pages/SizeConverter';
import EgfrCalculator from './pages/EgfrCalculator';
import GammaCalculator from './pages/GammaCalculator';
import CylinderCalculator from './pages/CylinderCalculator';
import MemoList from './pages/MemoList';

const protectedRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/calculator/bsa', element: <BsaCalculator /> },
  { path: '/calculator/size', element: <SizeConverter /> },
  { path: '/calculator/egfr', element: <EgfrCalculator /> },
  { path: '/calculator/gamma', element: <GammaCalculator /> },
  { path: '/calculator/cylinder', element: <CylinderCalculator /> },
  { path: '/memos', element: <MemoList /> },
];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Layout>{element}</Layout>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
