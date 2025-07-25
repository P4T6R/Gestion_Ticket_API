import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Paper
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Composant d'erreur simple
export const ErrorMessage = ({ 
  message = 'Une erreur est survenue', 
  severity = 'error',
  onRetry = null 
}) => (
  <Alert 
    severity={severity}
    action={
      onRetry && (
        <Button color="inherit" size="small" onClick={onRetry}>
          Réessayer
        </Button>
      )
    }
  >
    {message}
  </Alert>
);

// Composant d'erreur avec titre
export const ErrorWithTitle = ({ 
  title = 'Erreur',
  message = 'Une erreur est survenue',
  onRetry = null 
}) => (
  <Alert severity="error">
    <AlertTitle>{title}</AlertTitle>
    {message}
    {onRetry && (
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          size="small" 
          onClick={onRetry}
          startIcon={<RefreshIcon />}
        >
          Réessayer
        </Button>
      </Box>
    )}
  </Alert>
);

// Composant d'erreur pleine page
export const FullPageError = ({ 
  title = 'Oops! Une erreur est survenue',
  message = 'Nous rencontrons des difficultés techniques. Veuillez réessayer plus tard.',
  onRetry = null 
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      p: 3,
      textAlign: 'center'
    }}
  >
    <Paper 
      sx={{ 
        p: 4, 
        maxWidth: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <ErrorIcon 
        sx={{ 
          fontSize: 80, 
          color: 'error.main',
          mb: 2 
        }} 
      />
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {message}
      </Typography>
      {onRetry && (
        <Button 
          variant="contained" 
          color="primary"
          onClick={onRetry}
          startIcon={<RefreshIcon />}
          size="large"
        >
          Réessayer
        </Button>
      )}
    </Paper>
  </Box>
);

// Composant d'erreur de connexion réseau
export const NetworkError = ({ onRetry = null }) => (
  <Alert severity="warning">
    <AlertTitle>Problème de connexion</AlertTitle>
    Vérifiez votre connexion internet et réessayez.
    {onRetry && (
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          color="warning" 
          size="small" 
          onClick={onRetry}
          startIcon={<RefreshIcon />}
        >
          Réessayer
        </Button>
      </Box>
    )}
  </Alert>
);

// Composant d'erreur d'autorisation
export const UnauthorizedError = ({ message = 'Vous n\'êtes pas autorisé à accéder à cette ressource.' }) => (
  <Alert severity="error">
    <AlertTitle>Accès refusé</AlertTitle>
    {message}
  </Alert>
);

// Composant d'erreur de validation
export const ValidationError = ({ errors = [] }) => (
  <Alert severity="error">
    <AlertTitle>Erreurs de validation</AlertTitle>
    {errors.length > 0 ? (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    ) : (
      'Des erreurs de validation ont été détectées.'
    )}
  </Alert>
);

// Composant d'avertissement
export const WarningMessage = ({ message, title = null }) => (
  <Alert severity="warning" icon={<WarningIcon />}>
    {title && <AlertTitle>{title}</AlertTitle>}
    {message}
  </Alert>
);

export default ErrorMessage;
