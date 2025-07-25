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
  Divider
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
  AccessTime as AccessTimeIcon
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête moderne */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                File d'Attente - Affichage
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} {new Date().toLocaleTimeString('fr-FR')}
              </Typography>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton 
                onClick={refetch}
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Section Tickets en cours de traitement */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Ticket en cours de traitement
        </Typography>
        
        <Grid container spacing={3}>
          {/* Paiement facture */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 200,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white',
              border: currentTicket?.service === 'payement_factures' ? '2px solid #10b981' : 'none'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Paiement facture
                </Typography>
                
                {currentTicket?.service === 'payement_factures' ? (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#10b981',
                      mb: 1
                    }}>
                      {currentTicket.numero}
                    </Typography>
                    <Chip 
                      label="En cours"
                      sx={{ 
                        bgcolor: '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Appelé à {formatTime(currentTicket.heure_appel)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#6b7280',
                      mb: 2
                    }}>
                      -
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                      Aucun ticket
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Dépôt */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 200,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white',
              border: currentTicket?.service === 'depot_retrait' ? '2px solid #10b981' : 'none'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Dépôt
                </Typography>
                
                {currentTicket?.service === 'depot_retrait' ? (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#10b981',
                      mb: 1
                    }}>
                      {currentTicket.numero}
                    </Typography>
                    <Chip 
                      label="En cours"
                      sx={{ 
                        bgcolor: '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Appelé à {formatTime(currentTicket.heure_appel)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#6b7280',
                      mb: 2
                    }}>
                      -
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                      Aucun ticket
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Retrait */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 200,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white',
              border: currentTicket?.service === 'transfert' ? '2px solid #10b981' : 'none'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Retrait
                </Typography>
                
                {currentTicket?.service === 'transfert' ? (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#10b981',
                      mb: 1
                    }}>
                      {currentTicket.numero}
                    </Typography>
                    <Chip 
                      label="En cours"
                      sx={{ 
                        bgcolor: '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Appelé à {formatTime(currentTicket.heure_appel)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#6b7280',
                      mb: 2
                    }}>
                      -
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                      Aucun ticket
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Autre */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 200,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white',
              border: currentTicket?.service === 'conseil_clientele' ? '2px solid #10b981' : 'none'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Autre
                </Typography>
                
                {currentTicket?.service === 'conseil_clientele' ? (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#10b981',
                      mb: 1
                    }}>
                      {currentTicket.numero}
                    </Typography>
                    <Chip 
                      label="En cours"
                      sx={{ 
                        bgcolor: '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Appelé à {formatTime(currentTicket.heure_appel)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: '#6b7280',
                      mb: 2
                    }}>
                      -
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                      Aucun ticket
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Section File d'attente */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          File d'attente
        </Typography>
        
        <Grid container spacing={3}>
          {/* Paiement facture - Attente */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 300,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Paiement facture
                  </Typography>
                  <Chip 
                    label={`${waitingTickets.filter(t => t.service === 'payement_factures').length} en attente`}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {waitingTickets.filter(t => t.service === 'payement_factures').length > 0 ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Prochains tickets :
                      </Typography>
                      {waitingTickets
                        .filter(t => t.service === 'payement_factures')
                        .slice(0, 3)
                        .map((ticket, index) => (
                          <Box
                            key={ticket.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              bgcolor: index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                              borderRadius: 1,
                              border: index === 0 ? '1px solid #fbbf24' : 'none'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {ticket.numero}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              Position {index + 1}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', mt: 4 }}>
                      Aucun ticket en attente
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Dépôt - Attente */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 300,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Dépôt
                  </Typography>
                  <Chip 
                    label={`${waitingTickets.filter(t => t.service === 'depot_retrait').length} en attente`}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {waitingTickets.filter(t => t.service === 'depot_retrait').length > 0 ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Prochains tickets :
                      </Typography>
                      {waitingTickets
                        .filter(t => t.service === 'depot_retrait')
                        .slice(0, 3)
                        .map((ticket, index) => (
                          <Box
                            key={ticket.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              bgcolor: index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                              borderRadius: 1,
                              border: index === 0 ? '1px solid #fbbf24' : 'none'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {ticket.numero}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              Position {index + 1}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', mt: 4 }}>
                      Aucun ticket en attente
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Retrait - Attente */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 300,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Retrait
                  </Typography>
                  <Chip 
                    label={`${waitingTickets.filter(t => t.service === 'transfert').length} en attente`}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {waitingTickets.filter(t => t.service === 'transfert').length > 0 ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Prochains tickets :
                      </Typography>
                      {waitingTickets
                        .filter(t => t.service === 'transfert')
                        .slice(0, 3)
                        .map((ticket, index) => (
                          <Box
                            key={ticket.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              bgcolor: index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                              borderRadius: 1,
                              border: index === 0 ? '1px solid #fbbf24' : 'none'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {ticket.numero}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              Position {index + 1}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', mt: 4 }}>
                      Aucun ticket en attente
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Autre - Attente */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              minHeight: 300,
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Autre
                  </Typography>
                  <Chip 
                    label={`${waitingTickets.filter(t => t.service === 'conseil_clientele').length} en attente`}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {waitingTickets.filter(t => t.service === 'conseil_clientele').length > 0 ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Prochains tickets :
                      </Typography>
                      {waitingTickets
                        .filter(t => t.service === 'conseil_clientele')
                        .slice(0, 3)
                        .map((ticket, index) => (
                          <Box
                            key={ticket.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              bgcolor: index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                              borderRadius: 1,
                              border: index === 0 ? '1px solid #fbbf24' : 'none'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {ticket.numero}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              Position {index + 1}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', mt: 4 }}>
                      Aucun ticket en attente
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Statistiques du jour */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Statistiques du jour
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              p: 2
            }}>
              <CardContent>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {queueData?.tickets_en_cours?.length || 0}
                </Typography>
                <Typography variant="h6">
                  Tickets émis
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              p: 2
            }}>
              <CardContent>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  0
                </Typography>
                <Typography variant="h6">
                  Tickets traités
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              p: 2
            }}>
              <CardContent>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {waitingTickets.length}
                </Typography>
                <Typography variant="h6">
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Actions cachées pour compatibilité */}
      <Box sx={{ display: 'none' }}>
        <Button onClick={handleCallNext}>Appeler Prochain</Button>
        <Button onClick={handleFinishDialog}>Terminer</Button>
      </Box>
                              variant="outlined"
                              color="success"
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<InfoIcon />}
                          onClick={() => handleTicketInfo(currentTicket)}
                          sx={{ py: 1.5, px: 3 }}
                        >
                          Voir détails
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="large"
                          startIcon={<FinishIcon />}
                          onClick={handleFinishDialog}
                          disabled={finishCurrentMutation.isLoading}
                          sx={{ 
                            py: 1.5, 
                            px: 3,
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
                            }
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
                  <Avatar sx={{ mx: 'auto', mb: 3, bgcolor: 'rgba(255,255,255,0.2)', width: 80, height: 80 }}>
                    <QueueIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ opacity: 0.9, mb: 2 }}>
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
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
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
            </CardContent>
          </Card>
        </Grid>

        {/* File d'attente modernisée */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  File d'attente
                </Typography>
                <Chip 
                  label={`${waitingTickets.length} tickets`}
                  sx={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
              
              {waitingTickets.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { color: 'white', fontWeight: 'bold', borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
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
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '& td': { 
                              color: 'white',
                              borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: index === 0 ? '#3b82f6' : 'rgba(245, 158, 11, 0.2)',
                                  color: index === 0 ? 'white' : '#f59e0b',
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
                                      bgcolor: '#3b82f6',
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
                                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                  color: '#22c55e',
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
                                  ? 'rgba(239, 68, 68, 0.2)' 
                                  : ticket.temps_attente > 5 
                                    ? 'rgba(245, 158, 11, 0.2)' 
                                    : 'rgba(34, 197, 94, 0.2)',
                                color: ticket.temps_attente > 15 
                                  ? '#ef4444' 
                                  : ticket.temps_attente > 5 
                                    ? '#f59e0b' 
                                    : '#22c55e',
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
                                  color: '#3b82f6',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
                  <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'rgba(34, 197, 94, 0.2)', width: 64, height: 64 }}>
                    <CheckIcon sx={{ fontSize: 32, color: '#22c55e' }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                    Aucun ticket en attente
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Tous les tickets ont été traités
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tickets récemment traités - Design moderne */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 20px 40px rgba(5, 150, 105, 0.2)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Récemment traités
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <CheckIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </Stack>
              
              {completedTickets.length > 0 ? (
                <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
                  <Stack spacing={2}>
                    {completedTickets.slice(0, 10).map((ticket, index) => (
                      <Paper 
                        key={ticket.id} 
                        sx={{ 
                          p: 3,
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {formatTicketNumber(ticket.numero)}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              {getServiceLabel(ticket.service)}
                            </Typography>
                            <Chip
                              icon={<CheckIcon />}
                              label="Terminé"
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
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
                                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                  color: '#22c55e',
                                  fontWeight: 'medium'
                                }}
                              />
                              <Chip
                                icon={<ScheduleIcon />}
                                label={formatWaitingTime(ticket.duree_traitement)}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  color: '#3b82f6',
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
                  <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'rgba(245, 158, 11, 0.2)', width: 64, height: 64 }}>
                    <ScheduleIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                    Aucun ticket traité récemment
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Les tickets terminés apparaîtront ici
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog pour finalisation */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Finaliser le ticket
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ticket #{selectedTicket.numero}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Service: {getServiceLabel(selectedTicket.service)}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Heure de création: {formatTime(selectedTicket.heure_creation)}
              </Typography>
              
              <TextField
                multiline
                rows={4}
                fullWidth
                label="Notes (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleFinishCurrent}
            variant="contained"
            disabled={finishCurrentMutation.isLoading}
          >
            {finishCurrentMutation.isLoading ? 'Finalisation...' : 'Finaliser'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QueueManagement;
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

      {/* Dialog pour finalisation */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Finaliser le ticket
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ticket #{selectedTicket.numero}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Service: {getServiceLabel(selectedTicket.service)}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Heure de création: {formatTime(selectedTicket.heure_creation)}
              </Typography>
              
              <TextField
                multiline
                rows={4}
                fullWidth
                label="Notes (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleFinishCurrent}
            variant="contained"
            disabled={finishCurrentMutation.isLoading}
          >
            {finishCurrentMutation.isLoading ? 'Finalisation...' : 'Finaliser'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QueueManagement;
