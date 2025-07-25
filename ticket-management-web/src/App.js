import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import { AuthProvider } from './contexts/AuthContext';

// Import des composants
import { ProtectedRoute, RoleProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Import des pages
import LoginPage from './pages/LoginPage';
import AgentDashboard from './pages/AgentDashboard';
import QueueManagement from './pages/QueuePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminStatistics from './pages/AdminStatistics';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Configuration du thème Material-UI sophistiqué
const theme = createAppTheme('light'); // ou 'dark' pour le thème sombre

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Route publique - Connexion */}
              <Route 
                path="/login" 
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                } 
              />

              {/* Routes protégées avec layout */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard Agent */}
                <Route 
                  path="dashboard" 
                  element={
                    <RoleProtectedRoute allowedRoles={['agent']}>
                      <AgentDashboard />
                    </RoleProtectedRoute>
                  } 
                />
                
                {/* Gestion des files - Agent */}
                <Route 
                  path="queue" 
                  element={
                    <RoleProtectedRoute allowedRoles={['agent']}>
                      <QueueManagement />
                    </RoleProtectedRoute>
                  } 
                />

                {/* Dashboard Admin */}
                <Route 
                  path="admin/dashboard" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleProtectedRoute>
                  } 
                />
                
                {/* Statistiques Admin */}
                <Route 
                  path="admin/statistics" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminStatistics />
                    </RoleProtectedRoute>
                  } 
                />

                {/* Route par défaut - Redirection selon le rôle */}
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </Route>

              {/* Route 404 */}
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
