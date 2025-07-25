import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleToggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseDrawer = () => {
    setSidebarOpen(false);
  };

  // Fermer automatiquement le sidebar sur mobile lors du changement de taille d'écran
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Barre de navigation supérieure */}
      <TopBar open={sidebarOpen} onToggleDrawer={handleToggleDrawer} />
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleCloseDrawer} />
      
      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          mt: 8, // Hauteur de l'AppBar
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'grey.50',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ p: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
