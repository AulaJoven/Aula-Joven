import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfesorDashboard from './pages/profesor/ProfesorDashboard';
import EstudianteDashboard from './pages/estudiante/EstudianteDashboard';

const getRoleHome = (rol) => {
  if (rol === 'admin')      return '/admin';
  if (rol === 'profesor')   return '/profesor';
  if (rol === 'estudiante') return '/estudiante';
  return '/login';
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={getRoleHome(user?.rol)} replace />;
  return children;
};

const PrivateRoute = ({ children, rol }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.rol !== rol) return <Navigate to={getRoleHome(user?.rol)} replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? getRoleHome(user?.rol) : '/login'} replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/admin/*"      element={<PrivateRoute rol="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path="/profesor/*"   element={<PrivateRoute rol="profesor"><ProfesorDashboard /></PrivateRoute>} />
      <Route path="/estudiante/*" element={<PrivateRoute rol="estudiante"><EstudianteDashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;