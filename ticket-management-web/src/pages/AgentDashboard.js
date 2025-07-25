import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Paper,
  Stack,
  LinearProgress,
  Avatar,
  Fade,
  Grow,
  Slide,
  Zoom,
  Divider,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  PlayArrow as CallIcon,
  Stop as FinishIcon,
  Queue as QueueIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  PriorityHigh as PriorityHighIcon,
  Notifications as NotificationsIcon,
  Update as UpdateIcon,
  MoreVert as MoreVertIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  useAgentQueue, 
  useAgentStats, 
  useCallNextTicket, 
  useFinishCurrentTicket 
} from '../hooks/useApi';
import StatsCard from '../components/common/StatsCard';
import { LoadingSpinner, LoadingWithText } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { extractQueueData, extractStatsData } from '../utils/dataExtractors';
import { 
  formatTime, 
  formatTicketNumber, 
  getServiceLabel, 
  formatWaitingTime 
} from '../utils/helpers';

const AgentDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Récupération des données
  const { 
    data: queueData, 
    isLoading: queueLoading, 
    error: queueError,
    refetch: refetchQueue 
  } = useAgentQueue();
  
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useAgentStats();

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
      await finishCurrentMutation.mutateAsync();
    } catch (error) {
      console.error('Erreur lors de la finalisation du ticket:', error);
    }
  };

  // Animation au montage
  useEffect(() => {
    setMounted(true);
  }, []);

  // États de chargement et d'erreur
  if (queueLoading || statsLoading) {
    return <LoadingWithText text="Chargement du tableau de bord..." />;
  }

  if (queueError || statsError) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des données"
        onRetry={refetchQueue}
      />
    );
  }

  // Extraction des données avec les utilitaires
  const { currentTicket, waitingTickets, completedTickets } = extractQueueData(queueData);
  const statsExtracted = extractStatsData(statsData);
  
  // Stats pour l'affichage - vraies données de tickets
  const stats = {
    tickets_traites_aujourdhui: statsExtracted.tickets_traites || 0,
    total_tickets_en_attente: waitingTickets.length,
    temps_moyen_traitement: statsExtracted.temps_moyen_traitement || 0,
    performance: Math.round((statsExtracted.tickets_traites / Math.max(waitingTickets.length + statsExtracted.tickets_traites, 1)) * 100)
  };

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
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
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

  // Composant de projet/ticket style TaskCI
  const ProjectCard = ({ title, subtitle, progress, status, color, priority = false }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        mb: 2,
        '&:hover': {
          boxShadow: 1
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {priority && (
              <Chip 
                label="Urgent" 
                size="small" 
                color="error" 
                sx={{ height: 20, fontSize: '0.7rem' }} 
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Chip
          label={status}
          size="small"
          sx={{
            backgroundColor: color,
            color: 'white',
            fontSize: '0.75rem',
            height: 24,
            fontWeight: 500
          }}
        />
      </Box>
      {progress !== undefined && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progression
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(color, 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 3
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );

  // Activité de l'équipe style TaskCI
  const ActivityItem = ({ user: activityUser, action, time, ticket }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
        {activityUser.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          <strong>{activityUser}</strong> {action}
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
            Tableau de bord
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AssessmentIcon />}
              sx={{ textTransform: 'none' }}
            >
              Planning
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              sx={{ 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Nouveau ticket
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Bonjour ! Voici un aperçu de vos projets en cours - {user?.agence?.nom || 'Agence'} 
          {user?.guichet && ` - Guichet ${user.guichet}`}
        </Typography>
      </Box>

      {/* Métriques principales style TaskCI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tickets terminés"
            value={stats.tickets_traites_aujourdhui}
            subtitle={`+${Math.round(stats.performance)}% depuis le mois dernier`}
            change={stats.performance}
            changeType="increase"
            color="#22c55e"
            icon={CheckCircleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="En cours"
            value={currentTicket ? '1' : '0'}
            subtitle={`+${stats.total_tickets_en_attente}% depuis le mois dernier`}
            change={currentTicket ? 30 : -10}
            changeType={currentTicket ? "increase" : "decrease"}
            color="#f59e0b"
            icon={ScheduleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="File d'attente"
            value={stats.total_tickets_en_attente}
            subtitle={`${stats.total_tickets_en_attente > 5 ? 'File importante' : 'File normale'}`}
            change={stats.total_tickets_en_attente > 5 ? 15 : -5}
            changeType={stats.total_tickets_en_attente > 5 ? "increase" : "decrease"}
            color="#f59e0b"
            icon={QueueIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Temps moyen (min)"
            value={stats.temps_moyen_traitement}
            subtitle={`Temps de traitement moyen`}
            change={stats.temps_moyen_traitement > 5 ? -10 : 5}
            changeType={stats.temps_moyen_traitement > 5 ? "decrease" : "increase"}
            color="#3b82f6"
            icon={TimeIcon}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Section Projets en cours style TaskCI */}
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
                    Tickets en cours
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Suivi de l'avancement de vos tickets actifs
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {currentTicket ? (
                <ProjectCard
                  title={`Ticket ${formatTicketNumber(currentTicket.numero)}`}
                  subtitle={`${getServiceLabel(currentTicket.service)} • Appelé à ${formatTime(currentTicket.heure_appel)}`}
                  progress={75}
                  status="En cours"
                  color="#22c55e"
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun ticket en cours de traitement
                  </Typography>
                </Box>
              )}

              {waitingTickets.slice(0, 4).map((ticket, index) => (
                <ProjectCard
                  key={ticket.id}
                  title={`Ticket ${formatTicketNumber(ticket.numero)}`}
                  subtitle={`${getServiceLabel(ticket.service)} • Créé à ${formatTime(ticket.heure_creation)}`}
                  progress={Math.max(25, 100 - (index + 1) * 20)}
                  status={index === 0 ? "Démarrage" : "En attente"}
                  color={index === 0 ? "#3b82f6" : "#6b7280"}
                  priority={ticket.priorite === 'urgente'}
                />
              ))}

              {waitingTickets.length === 0 && !currentTicket && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Tous les tickets traités
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Excellente performance ! Aucun ticket en attente.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Section Tâches prioritaires style TaskCI */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              mb: 3
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, backgroundColor: '#22c55e' }}>
                  <CheckCircleIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tickets suivants
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Vos prochains tickets à traiter
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <List disablePadding>
                {currentTicket && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        width: '100%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Traiter le ticket {formatTicketNumber(currentTicket.numero)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {getServiceLabel(currentTicket.service)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label="Aujourd'hui" 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 1 }} 
                        />
                      </Box>
                    </Paper>
                  </ListItem>
                )}

                {waitingTickets.slice(0, 3).map((ticket, index) => (
                  <ListItem key={ticket.id} disablePadding sx={{ mb: 1 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        width: '100%',
                        backgroundColor: ticket.priorite === 'urgente' 
                          ? alpha(theme.palette.error.main, 0.05)
                          : alpha(theme.palette.grey[500], 0.05),
                        border: `1px solid ${ticket.priorite === 'urgente' 
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.grey[500], 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Préparer ticket {formatTicketNumber(ticket.numero)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {getServiceLabel(ticket.service)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={ticket.priorite === 'urgente' ? "Urgent" : "Demain"} 
                          size="small" 
                          color={ticket.priorite === 'urgente' ? "error" : "default"}
                        />
                      </Box>
                    </Paper>
                  </ListItem>
                ))}

                {waitingTickets.length === 0 && !currentTicket && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune tâche prioritaire
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>
          </Paper>

          {/* Section Activité de l'équipe style TaskCI */}
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
                <Avatar sx={{ width: 24, height: 24, backgroundColor: '#8b5cf6' }}>
                  <TimelineIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Activité de l'équipe
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <ActivityItem
                user={user?.name || 'Vous'}
                action="a traité le ticket"
                time="Il y a 5 minutes"
                ticket="A001"
              />
              <ActivityItem
                user="Marie Dubois"
                action="a appelé le ticket"
                time="Il y a 12 minutes"
                ticket="B003"
              />
              <ActivityItem
                user="Jean Martin"
                action="a finalisé le ticket"
                time="Il y a 25 minutes"
                ticket="C002"
              />
              <ActivityItem
                user={user?.name || 'Vous'}
                action="s'est connecté"
                time="Il y a 1 heure"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions rapides style TaskCI */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Actions rapides
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {currentTicket ? (
              <Button
                variant="contained"
                startIcon={<FinishIcon />}
                onClick={handleFinishCurrent}
                disabled={finishCurrentMutation.isLoading}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#ef4444',
                  '&:hover': { backgroundColor: '#dc2626' }
                }}
              >
                {finishCurrentMutation.isLoading ? 'Finalisation...' : 'Terminer ticket actuel'}
              </Button>
            ) : waitingTickets.length > 0 ? (
              <Button
                variant="contained"
                startIcon={<CallIcon />}
                onClick={handleCallNext}
                disabled={callNextMutation.isLoading}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {callNextMutation.isLoading ? 'Appel en cours...' : 'Appeler prochain ticket'}
              </Button>
            ) : null}

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refetchQueue}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Actualiser
            </Button>
          </Box>

          {/* Messages et erreurs */}
          {callNextMutation.data?.message_affichage && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
              }}
            >
              {callNextMutation.data.message_affichage}
            </Alert>
          )}

          {callNextMutation.error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
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
                mb: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
              }}
            >
              {finishCurrentMutation.error.response?.data?.message || 'Erreur lors de la finalisation'}
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Indicateur de chargement global */}
      {(callNextMutation.isLoading || finishCurrentMutation.isLoading) && (
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
    </Box>
  );
};

export default AgentDashboard;