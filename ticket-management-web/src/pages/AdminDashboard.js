import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  Container,
  Stack,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  Queue as QueueIcon,
  CheckCircle as CompletedIcon,
  TrendingUp as TrendIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAdminDashboard } from '../hooks/useApi';
import StatsCard from '../components/common/StatsCard';
import { LoadingWithText } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { 
  formatTime, 
  formatTicketNumber, 
  getServiceLabel, 
  formatWaitingTime,
  formatNumber,
  calculatePercentage
} from '../utils/helpers';
import { extractAdminDashboardData } from '../utils/dataExtractors';

const AdminDashboard = () => {
  // Récupération des données temps réel
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useAdminDashboard();

  if (isLoading && !dashboardData) {
    return <LoadingWithText text="Chargement du tableau de bord administrateur..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement du tableau de bord"
        onRetry={refetch}
      />
    );
  }

  const data = dashboardData || {};
  
  const {
    stats_globales = {},
    agences = [],
    agents_actifs = [],
    tickets_recents = [],
    performance_temps_reel = {}
  } = data;

  // Debug pour voir les vraies données reçues
  console.log('📊 Données dashboard reçues:', {
    stats_globales,
    performance_temps_reel,
    agences: agences.length,
    agents_actifs: agents_actifs.length,
    tickets_recents: tickets_recents.length
  });

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* En-tête avec gradient moderne */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                Tableau de bord administrateur
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Vue d'ensemble temps réel du système de gestion de tickets
              </Typography>
            </Box>
          </Stack>
          
          {/* Indicateur de chargement intégré */}
          {isLoading && (
            <LinearProgress 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }} 
            />
          )}
        </Box>
        
        {/* Effet de fond décoratif */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        />
      </Box>

      {/* Cartes de statistiques avec design conforme à l'image */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            backgroundColor: '#f0fdf9',
            border: '1px solid #d1fae5',
            borderRadius: 3,
            borderLeft: '4px solid #10b981',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 25px rgba(16, 185, 129, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#047857', mb: 1 }}>
                    {stats_globales.tickets_aujourdhui || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#374151', fontWeight: 500, mb: 1 }}>
                    Tickets créés aujourd'hui
                  </Typography>
                  {stats_globales.evolution_tickets && stats_globales.evolution_tickets !== '0' && (
                    <Chip 
                      icon={<TrendIcon />}
                      label={`${stats_globales.evolution_tickets}%`}
                      size="small"
                      sx={{ 
                        backgroundColor: '#d1fae5',
                        color: '#047857'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ 
                  backgroundColor: '#d1fae5', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QueueIcon sx={{ fontSize: 32, color: '#10b981' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 3,
            borderLeft: '4px solid #3b82f6',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 25px rgba(59, 130, 246, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#1d4ed8', mb: 1 }}>
                    {stats_globales.tickets_traites || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#374151', fontWeight: 500, mb: 1 }}>
                    Tickets traités
                  </Typography>
                  {stats_globales.evolution_traites && (
                    <Chip 
                      icon={<TrendIcon />}
                      label={`${stats_globales.evolution_traites}%`}
                      size="small"
                      sx={{ 
                        backgroundColor: '#bae6fd',
                        color: '#1d4ed8'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ 
                  backgroundColor: '#bae6fd', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CompletedIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            backgroundColor: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: 3,
            borderLeft: '4px solid #f59e0b',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 25px rgba(245, 158, 11, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#d97706', mb: 1 }}>
                    {stats_globales.tickets_en_attente || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#374151', fontWeight: 500 }}>
                    En attente
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={stats_globales.tickets_en_attente > 10 ? '!' : null}
                  color="error"
                >
                  <Box sx={{ 
                    backgroundColor: '#fed7aa', 
                    borderRadius: '50%', 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                  </Box>
                </Badge>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 3,
            borderLeft: '4px solid #8b5cf6',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 25px rgba(139, 92, 246, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#7c3aed', mb: 1 }}>
                    {stats_globales.agents_actifs || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#374151', fontWeight: 500, mb: 1 }}>
                    Agents actifs
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    sur {stats_globales.total_agents || 0} agents
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: '#e9d5ff', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Performance temps réel */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Performance temps réel
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Taux de traitement</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
                    {performance_temps_reel.taux_traitement || 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={performance_temps_reel.taux_traitement || 0}
                  sx={{ 
                    height: 8, 
                    borderRadius: 1,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#10b981'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Efficacité globale</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
                    {performance_temps_reel.efficacite_globale || 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={performance_temps_reel.efficacite_globale || 0}
                  sx={{ 
                    height: 8, 
                    borderRadius: 1,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#3b82f6'
                    }
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 2
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1d4ed8' }}>
                      {formatNumber(performance_temps_reel.temps_moyen_attente || 0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Temps moyen (min)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: '#f0fdf9',
                    border: '1px solid #d1fae5',
                    borderRadius: 2
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#047857' }}>
                      {formatNumber(performance_temps_reel.tickets_par_heure || 0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Tickets/heure
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* État des agences */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                État des agences
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Agence</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>En attente</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Traités</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Agents</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agences.length > 0 ? (
                      agences.map((agence) => (
                        <TableRow key={agence.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon fontSize="small" sx={{ color: '#6b7280' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
                                {agence.nom}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={agence.tickets_en_attente || 0}
                              size="small"
                              sx={{
                                backgroundColor: '#fed7aa',
                                color: '#d97706',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={agence.tickets_traites || 0}
                              size="small"
                              sx={{
                                backgroundColor: '#d1fae5',
                                color: '#047857',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${agence.agents_actifs || 0}/${agence.total_agents || 0}`}
                              size="small"
                              sx={{
                                backgroundColor: '#bae6fd',
                                color: '#1d4ed8',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Aucune donnée d'agence disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Agents actifs */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Agents actifs ({agents_actifs.length})
              </Typography>
              
              {agents_actifs.length > 0 ? (
                <List dense>
                  {agents_actifs.slice(0, 8).map((agent) => (
                    <ListItem key={agent.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#667eea' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
                              {agent.name}
                            </Typography>
                            <Chip
                              label={`Guichet ${agent.guichet}`}
                              size="small"
                              sx={{
                                backgroundColor: '#e9d5ff',
                                color: '#7c3aed',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Agence: {agent.agence?.nom}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Traités: {agent.tickets_traites_aujourdhui || 0}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  
                  {agents_actifs.length > 8 && (
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: '#6b7280' }} textAlign="center">
                            ... et {agents_actifs.length - 8} autres agents
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: '#f0f9ff', color: '#1d4ed8', border: '1px solid #bae6fd' }}>
                  Aucun agent actif actuellement
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activité récente */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Activité récente
              </Typography>
              
              {tickets_recents.length > 0 ? (
                <List dense>
                  {tickets_recents.slice(0, 10).map((ticket) => (
                    <ListItem key={ticket.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={formatTicketNumber(ticket.numero)}
                              size="small"
                              sx={{
                                backgroundColor: '#bae6fd',
                                color: '#1d4ed8',
                                fontWeight: 'bold'
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#374151' }}>
                              {getServiceLabel(ticket.service)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {ticket.agence?.nom} - Guichet {ticket.guichet}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {formatTime(ticket.updated_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: '#f0f9ff', color: '#1d4ed8', border: '1px solid #bae6fd' }}>
                  Aucune activité récente
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
