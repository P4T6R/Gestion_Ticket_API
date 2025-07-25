import React, { useState } from 'react';
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
  Button,
  Chip,
  Alert,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Stack,
  Avatar,
  Divider,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as CallIcon,
  Stop as FinishIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Queue as QueueIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { 
  useAgentQueue, 
  useCallNextTicket, 
  useFinishCurrentTicket 
} from '../hooks/useApi';
import { LoadingWithText } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { 
  formatTime, 
  formatTicketNumber, 
  getServiceLabel, 
  formatWaitingTime,
  getTicketStatusColor,
  getTicketStatusLabel 
} from '../utils/helpers';
import { extractQueueData } from '../utils/dataExtractors';

const QueueManagement = () => {
  const theme = useTheme();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Récupération des données
  const { 
    data: queueData, 
    isLoading, 
    error,
    refetch 
  } = useAgentQueue();

  // Mutations
  const callNextMutation = useCallNextTicket();
  const finishCurrentMutation = useFinishCurrentTicket();

  const handleCallNext = async () => {
    try {
      const result = await callNextMutation.mutateAsync();
      if (result.message_affichage) {
        console.log('Message d\'affichage:', result.message_affichage);
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel du prochain ticket:', error);
    }
  };

  const handleFinishCurrent = async () => {
    try {
      await finishCurrentMutation.mutateAsync({ notes });
      setDialogOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Erreur lors de la finalisation du ticket:', error);
    }
  };

  const handleTicketInfo = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleFinishDialog = () => {
    const { currentTicket } = extractQueueData(queueData);
    if (currentTicket) {
      setSelectedTicket(currentTicket);
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setNotes('');
  };

  if (isLoading && !queueData) {
    return <LoadingWithText text="Chargement de la file d'attente..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement de la file d'attente"
        onRetry={refetch}
      />
    );
  }

  // Extraction des données avec la structure API correcte
  const { currentTicket, waitingTickets, completedTickets } = extractQueueData(queueData);

  // Composant de métrique style TaskCI
  const MetricCard = ({ title, value, subtitle, change, changeType, color, icon: Icon }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        position: 'relative',
        '&:hover': {
          boxShadow: 1
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {changeType === 'increase' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : changeType === 'decrease' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'error.main', transform: 'rotate(180deg)' }} />
            ) : null}
            <Typography 
              variant="caption" 
              sx={{ 
                color: changeType === 'increase' ? 'success.main' : 
                       changeType === 'decrease' ? 'error.main' : 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: color,
            '& .MuiSvgIcon-root': { fontSize: 18 }
          }}
        >
          <Icon />
        </Avatar>
      </Box>
      {change && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${Math.min(Math.abs(change), 100)}%`,
            height: 3,
            backgroundColor: changeType === 'increase' ? 'success.main' : 'error.main',
            borderRadius: '0 0 8px 8px'
          }}
        />
      )}
    </Paper>
  );

  // Activité récente style TaskCI
  const ActivityItem = ({ user, action, time, ticket }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
        {user.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          <strong>{user}</strong> {action}
          {ticket && <strong> {ticket}</strong>}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {time}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header style TaskCI */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Gestion des files d'attente
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AssessmentIcon />}
              sx={{ textTransform: 'none' }}
            >
              Statistiques
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={isLoading}
              sx={{ 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Vue détaillée et contrôle des tickets en temps réel
        </Typography>
      </Box>

      {/* Indicateur de chargement global */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1400
          }}
        >
          <LinearProgress sx={{ height: 3 }} />
        </Box>
      )}

      {/* Métriques principales style TaskCI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ticket en cours"
            value={currentTicket ? '1' : '0'}
            subtitle={currentTicket ? 'En traitement' : 'Aucun en cours'}
            change={currentTicket ? 30 : -10}
            changeType={currentTicket ? "increase" : "decrease"}
            color="#22c55e"
            icon={PersonIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="File d'attente"
            value={waitingTickets.length}
            subtitle={`${waitingTickets.length > 5 ? 'File importante' : 'File normale'}`}
            change={waitingTickets.length > 5 ? 15 : -5}
            changeType={waitingTickets.length > 5 ? "increase" : "decrease"}
            color="#f59e0b"
            icon={QueueIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Terminés aujourd'hui"
            value={completedTickets.length}
            subtitle={`${completedTickets.length > 10 ? 'Bonne journée' : 'Démarrage'}`}
            change={completedTickets.length > 10 ? 20 : 5}
            changeType="increase"
            color="#3b82f6"
            icon={CheckIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Temps d'attente moyen"
            value={waitingTickets.length > 0 ? Math.round(waitingTickets.reduce((acc, t) => acc + t.temps_attente, 0) / waitingTickets.length) : '0'}
            subtitle="Minutes en moyenne"
            change={-5}
            changeType="decrease"
            color="#8b5cf6"
            icon={AccessTimeIcon}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Ticket en cours - Style TaskCI */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, backgroundColor: currentTicket ? '#22c55e' : '#6b7280' }}>
                    <PersonIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ticket en cours de traitement
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {currentTicket ? 'Traitement actif' : 'Aucun ticket en cours'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {currentTicket ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 3, 
                            backgroundColor: 'primary.main', 
                            color: 'primary.contrastText',
                            borderRadius: 2,
                            textAlign: 'center',
                            minWidth: 120
                          }}
                        >
                          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {currentTicket.numero}
                          </Typography>
                        </Paper>
                        
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {getServiceLabel(currentTicket.service)}
                          </Typography>
                          <Stack spacing={1}>
                            <Chip
                              icon={<AccessTimeIcon />}
                              label={`Démarré à ${formatTime(currentTicket.heure_appel)}`}
                              variant="outlined"
                              color="primary"
                              size="small"
                            />
                            <Chip
                              icon={<ScheduleIcon />}
                              label={`Temps écoulé: ${formatWaitingTime(currentTicket.temps_traitement)}`}
                              variant="outlined"
                              color="success"
                              size="small"
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="medium"
                          startIcon={<InfoIcon />}
                          onClick={() => handleTicketInfo(currentTicket)}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Voir détails
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="medium"
                          startIcon={<FinishIcon />}
                          onClick={handleFinishDialog}
                          disabled={finishCurrentMutation.isLoading}
                          sx={{ 
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#ef4444',
                            '&:hover': { backgroundColor: '#dc2626' }
                          }}
                        >
                          Terminer
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Avatar sx={{ 
                    mx: 'auto', 
                    mb: 3, 
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    color: 'text.secondary',
                    width: 80, 
                    height: 80 
                  }}>
                    <QueueIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Aucun ticket en cours de traitement
                  </Typography>
                  
                  {waitingTickets.length > 0 ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CallIcon />}
                      onClick={handleCallNext}
                      disabled={callNextMutation.isLoading}
                      sx={{ 
                        mt: 3,
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }
                      }}
                    >
                      {callNextMutation.isLoading ? 'Appel en cours...' : 'Appeler le prochain ticket'}
                    </Button>
                  ) : (
                    <Typography variant="body1" sx={{ opacity: 0.7, mt: 2 }}>
                      Aucun ticket en attente à traiter
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* File d'attente - Style TaskCI */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, backgroundColor: '#f59e0b' }}>
                    <QueueIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    File d'attente
                  </Typography>
                </Box>
                <Chip 
                  label={`${waitingTickets.length} tickets`}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {waitingTickets.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  elevation={0}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.grey[50], 0.5),
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        '& th': { 
                          fontWeight: 'bold', 
                          borderBottom: `2px solid ${theme.palette.divider}`,
                          backgroundColor: 'transparent'
                        } 
                      }}>
                        <TableCell>Position & Numéro</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Heure création</TableCell>
                        <TableCell>Temps d'attente</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {waitingTickets.map((ticket, index) => (
                        <TableRow 
                          key={ticket.id} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02)
                            },
                            '& td': { 
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                            }
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar 
                                sx={{ 
                                  backgroundColor: index === 0 ? '#3b82f6' : alpha(theme.palette.warning.main, 0.2),
                                  color: index === 0 ? 'white' : 'warning.main',
                                  width: 40,
                                  height: 40,
                                  fontWeight: 'bold'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {formatTicketNumber(ticket.numero)}
                                </Typography>
                                {index === 0 && (
                                  <Chip 
                                    label="Prochain"
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#3b82f6',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {getServiceLabel(ticket.service)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatTime(ticket.heure_creation)}
                              </Typography>
                              <Chip
                                icon={<AccessTimeIcon />}
                                label="Créé"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  color: 'success.main',
                                  fontWeight: 'medium'
                                }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatWaitingTime(ticket.temps_attente)}
                              size="medium"
                              sx={{
                                backgroundColor: ticket.temps_attente > 15 
                                  ? alpha(theme.palette.error.main, 0.1)
                                  : ticket.temps_attente > 5 
                                    ? alpha(theme.palette.warning.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                                color: ticket.temps_attente > 15 
                                  ? 'error.main'
                                  : ticket.temps_attente > 5 
                                    ? 'warning.main'
                                    : 'success.main',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Voir détails du ticket">
                              <IconButton
                                size="medium"
                                onClick={() => handleTicketInfo(ticket)}
                                sx={{
                                  color: 'primary.main',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Avatar sx={{ 
                    mx: 'auto', 
                    mb: 2, 
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    width: 64, 
                    height: 64 
                  }}>
                    <CheckIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Aucun ticket en attente
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tous les tickets ont été traités
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Tickets récemment traités - Style TaskCI */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, backgroundColor: '#22c55e' }}>
                  <CheckIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Récemment traités
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Historique des derniers tickets
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {completedTickets.length > 0 ? (
                <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
                  <Stack spacing={2}>
                    {completedTickets.slice(0, 10).map((ticket, index) => (
                      <Paper 
                        key={ticket.id} 
                        elevation={0}
                        sx={{ 
                          p: 3,
                          backgroundColor: alpha(theme.palette.success.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.08),
                            transform: 'translateY(-2px)',
                            boxShadow: 1
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {formatTicketNumber(ticket.numero)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {getServiceLabel(ticket.service)}
                            </Typography>
                            <Chip
                              icon={<CheckIcon />}
                              label="Terminé"
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.success.main, 0.2),
                                color: 'success.main',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Stack spacing={1}>
                              <Chip
                                icon={<AccessTimeIcon />}
                                label={formatTime(ticket.heure_fin)}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  fontWeight: 'medium'
                                }}
                              />
                              <Chip
                                icon={<ScheduleIcon />}
                                label={formatWaitingTime(ticket.duree_traitement)}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                                  color: 'info.main',
                                  fontWeight: 'medium'
                                }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Avatar sx={{ 
                    mx: 'auto', 
                    mb: 2, 
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                    width: 64, 
                    height: 64 
                  }}>
                    <ScheduleIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Aucun ticket traité récemment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Les tickets terminés apparaîtront ici
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Messages d'affichage et d'erreur */}
      {callNextMutation.data?.message_affichage && (
        <Alert 
          severity="success" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
          }}
        >
          <Typography variant="h6">{callNextMutation.data.message_affichage}</Typography>
        </Alert>
      )}

      {callNextMutation.error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
          }}
        >
          {callNextMutation.error.response?.data?.message || 'Erreur lors de l\'appel du ticket'}
        </Alert>
      )}

      {finishCurrentMutation.error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
          }}
        >
          {finishCurrentMutation.error.response?.data?.message || 'Erreur lors de la finalisation'}
        </Alert>
      )}

      {/* Dialog pour les détails/finalisation */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTicket?.status === 'in_progress' ? 'Finaliser le ticket' : 'Détails du ticket'}
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Numéro:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {formatTicketNumber(selectedTicket.numero)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Service:
                  </Typography>
                  <Typography variant="body1">
                    {getServiceLabel(selectedTicket.service)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Heure création:
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(selectedTicket.heure_creation)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut:
                  </Typography>
                  <Chip
                    label={getTicketStatusLabel(selectedTicket.status)}
                    color={getTicketStatusColor(selectedTicket.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {selectedTicket.status === 'in_progress' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (optionnel)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mt: 3 }}
                  placeholder="Ajoutez des notes sur le traitement de ce ticket..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Annuler
          </Button>
          {selectedTicket?.status === 'in_progress' && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CheckIcon />}
              onClick={handleFinishCurrent}
              disabled={finishCurrentMutation.isLoading}
            >
              {finishCurrentMutation.isLoading ? 'Finalisation...' : 'Terminer'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QueueManagement;
