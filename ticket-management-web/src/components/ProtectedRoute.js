import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullPageLoading } from '../components/common/Loading';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// Composant pour protéger les routes authentifiées
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoading text="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Composant pour protéger les routes selon le rôle
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoading text="Vérification des permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier si l'utilisateur a un des rôles autorisés
  const hasPermission = allowedRoles.length === 0 || allowedRoles.some(role => hasRole(role));

  if (!hasPermission) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.50',
          p: 3
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Accès refusé
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Rôle requis: {allowedRoles.join(' ou ')}<br />
            Votre rôle: {user?.role || 'Non défini'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Retour
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

// Composant pour rediriger les utilisateurs authentifiés
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, isAgent, isAdmin } = useAuth();

  if (loading) {
    return <FullPageLoading text="Chargement..." />;
  }

  if (isAuthenticated) {
    // Rediriger selon le rôle
    if (isAdmin()) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (isAgent()) {
      return <Navigate to="/dashboard" replace />;
    }
    // Fallback
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Hook pour vérifier les permissions
export const usePermissions = () => {
  const { user, hasRole } = useAuth();

  const canAccessAdminPanel = () => hasRole('admin');
  const canAccessAgentPanel = () => hasRole('agent') || hasRole('admin');
  const canManageTickets = () => hasRole('agent') || hasRole('admin');
  const canViewStatistics = () => hasRole('admin');
  const canExportReports = () => hasRole('admin');

  return {
    canAccessAdminPanel,
    canAccessAgentPanel,
    canManageTickets,
    canViewStatistics,
    canExportReports,
    user
  };
};

export default ProtectedRoute;
