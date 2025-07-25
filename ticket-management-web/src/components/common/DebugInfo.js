import React from 'react';
import { Box, Typography, Paper, Chip, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const DebugInfo = () => {
  const { user, isAuthenticated } = useAuth();
  
  const authToken = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  return (
    <Paper sx={{ p: 3, m: 2, bgcolor: 'warning.light' }}>
      <Typography variant="h6" gutterBottom>
        🔧 Informations de Debug
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">API URL:</Typography>
        <Chip label={apiUrl} size="small" />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Authentifié:</Typography>
        <Chip 
          label={isAuthenticated ? 'OUI' : 'NON'} 
          color={isAuthenticated ? 'success' : 'error'} 
          size="small" 
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Token présent:</Typography>
        <Chip 
          label={authToken ? 'OUI' : 'NON'} 
          color={authToken ? 'success' : 'error'} 
          size="small" 
        />
        {authToken && (
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({authToken.substring(0, 20)}...)
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Données utilisateur:</Typography>
        {user ? (
          <Box>
            <Typography variant="body2">
              <strong>Nom:</strong> {user.name}<br/>
              <strong>Email:</strong> {user.email}<br/>
              <strong>Rôle:</strong> {user.role}<br/>
              <strong>Guichet:</strong> {user.guichet || 'N/A'}<br/>
              <strong>Agence ID:</strong> {user.agence_id || 'N/A'}
            </Typography>
          </Box>
        ) : (
          <Chip label="AUCUNE" color="error" size="small" />
        )}
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Vérifiez la console du navigateur (F12)</strong> pour voir les logs détaillés des appels API.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default DebugInfo;
