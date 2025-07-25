import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop
} from '@mui/material';

// Composant de chargement simple
export const LoadingSpinner = ({ size = 40, color = 'primary' }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3
    }}
  >
    <CircularProgress size={size} color={color} />
  </Box>
);

// Composant de chargement avec texte
export const LoadingWithText = ({ text = 'Chargement...', size = 40 }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3,
      gap: 2
    }}
  >
    <CircularProgress size={size} />
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  </Box>
);

// Composant de chargement plein écran
export const FullPageLoading = ({ text = 'Chargement...' }) => (
  <Backdrop
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      flexDirection: 'column',
      gap: 2
    }}
    open={true}
  >
    <CircularProgress color="inherit" size={60} />
    <Typography variant="h6" color="inherit">
      {text}
    </Typography>
  </Backdrop>
);

// Composant de chargement pour les cartes
export const CardLoading = ({ height = 200 }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height,
      bgcolor: 'grey.50',
      borderRadius: 1
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

export default LoadingSpinner;
