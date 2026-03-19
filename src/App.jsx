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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/bsa"
        element={
          <ProtectedRoute>
            <Layout>
              <BsaCalculator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/size"
        element={
          <ProtectedRoute>
            <Layout>
              <SizeConverter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/egfr"
        element={
          <ProtectedRoute>
            <Layout>
              <EgfrCalculator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/gamma"
        element={
          <ProtectedRoute>
            <Layout>
              <GammaCalculator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/cylinder"
        element={
          <ProtectedRoute>
            <Layout>
              <CylinderCalculator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/memos"
        element={
          <ProtectedRoute>
            <Layout>
              <MemoList />
            </Layout>
          </ProtectedRoute>
        }
      />
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
