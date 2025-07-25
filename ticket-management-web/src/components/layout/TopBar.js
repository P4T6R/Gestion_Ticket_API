import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime } from '../../utils/helpers';

const DRAWER_WIDTH = 280;

const TopBar = ({ open, onToggleDrawer, title = 'Tableau de bord' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAgent, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Mettre à jour l'heure toutes les secondes
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: { md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
        ml: { md: open ? `${DRAWER_WIDTH}px` : 0 },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Section gauche */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={onToggleDrawer}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          
          <Box>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            {user?.agence && (
              <Typography variant="body2" color="text.secondary">
                {user.agence.nom}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Section droite */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Heure actuelle */}
          <Typography 
            variant="body2" 
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontFamily: 'monospace',
              fontWeight: 'medium'
            }}
          >
            {formatTime(currentTime)}
          </Typography>

          {/* Rôle utilisateur */}
          <Chip
            label={isAdmin() ? 'Admin' : 'Agent'}
            size="small"
            color={isAdmin() ? 'error' : 'primary'}
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />

          {/* Guichet pour les agents */}
          {isAgent() && user?.guichet && (
            <Chip
              label={`Guichet ${user.guichet}`}
              size="small"
              color="secondary"
              sx={{ fontWeight: 'medium' }}
            />
          )}

          {/* Boutons d'action */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={handleRefresh}
              title="Actualiser"
            >
              <RefreshIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              title="Notifications"
            >
              <NotificationsIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
