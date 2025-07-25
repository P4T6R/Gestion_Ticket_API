import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Queue as QueueIcon,
  Assessment as StatsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAgent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Éléments de navigation pour les agents
  const agentNavItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/dashboard',
      id: 'dashboard'
    },
    {
      text: 'Gestion des files',
      icon: <QueueIcon />,
      path: '/queue',
      id: 'queue'
    }
  ];

  // Éléments de navigation pour les admins
  const adminNavItems = [
    {
      text: 'Vue d\'ensemble',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      id: 'admin-dashboard'
    },
    {
      text: 'Statistiques',
      icon: <StatsIcon />,
      path: '/admin/statistics',
      id: 'admin-statistics'
    }
  ];

  // Obtenir les éléments de navigation selon le rôle
  const getNavItems = () => {
    if (isAdmin()) return adminNavItems;
    if (isAgent()) return agentNavItems;
    return [];
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête avec logo et titre */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Gestion de Tickets
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Système de file d'attente
        </Typography>
      </Box>

      {/* Informations utilisateur */}
      <Box sx={{ p: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {isAdmin() ? <AdminIcon /> : <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }} noWrap>
              {user?.name || 'Utilisateur'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {isAdmin() ? 'Administrateur' : 'Agent'}
            </Typography>
            {user?.agence && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.agence.nom}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1 }}>
        <List>
          {getNavItems().map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActivePath(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActivePath(item.path) 
                      ? theme.palette.primary.contrastText 
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Déconnexion */}
      <Box sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 1,
              color: theme.palette.error.main,
              '&:hover': {
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Déconnexion"
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: theme.shadows[8],
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
