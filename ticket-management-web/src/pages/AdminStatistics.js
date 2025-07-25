import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  Container,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendIcon,
  Assessment as StatsIcon,
  Schedule as TimeIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useAdminStatistics, useExportReport, useAgences } from '../hooks/useApi';
import StatsCard from '../components/common/StatsCard';
import { LoadingWithText } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { 
  formatNumber,
  generateColors,
  getServiceLabel,
  formatDate
} from '../utils/helpers';
import { extractAdminStatsData } from '../utils/dataExtractors';

const AdminStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedAgence, setSelectedAgence] = useState('all');

  // Récupération des données
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useAdminStatistics();

  const { data: agencesData } = useAgences();
  const exportMutation = useExportReport();

  // Extraire le tableau d'agences des données
  const agencesList = Array.isArray(agencesData) 
    ? agencesData 
    : Array.isArray(agencesData?.data) 
      ? agencesData.data 
      : [];

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
    // Ici vous pourriez refetch avec les nouveaux paramètres
  };

  const handleAgenceChange = (event) => {
    setSelectedAgence(event.target.value);
    // Ici vous pourriez refetch avec les nouveaux paramètres
  };

  const handleExportReport = async () => {
    try {
      await exportMutation.mutateAsync({
        period: selectedPeriod,
        agence_id: selectedAgence !== 'all' ? selectedAgence : null
      });
      // Le téléchargement sera géré côté serveur
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  if (statsLoading && !statsData) {
    return <LoadingWithText text="Chargement des statistiques..." />;
  }

  if (statsError) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des statistiques"
        onRetry={refetchStats}
      />
    );
  }

  const data = statsData || {};
  const {
    stats_generales = {},
    repartition_services = [],
    performance_agences = [],
    evolution_temporelle = [],
    top_agents = [],
    temps_attente = {}
  } = data;

  // Couleurs pour les graphiques
  const colors = generateColors(8);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* En-tête moderne avec gradient */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                <AnalyticsIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Statistiques et Analyses
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Données analytiques complètes et tableaux de bord
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
                  Période
                </InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Période"
                  onChange={handlePeriodChange}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="today">Aujourd'hui</MenuItem>
                  <MenuItem value="week">Cette semaine</MenuItem>
                  <MenuItem value="month">Ce mois</MenuItem>
                  <MenuItem value="quarter">Ce trimestre</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
                  Agence
                </InputLabel>
                <Select
                  value={selectedAgence}
                  label="Agence"
                  onChange={handleAgenceChange}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">Toutes</MenuItem>
                  {agencesList.map((agence) => (
                    <MenuItem key={agence.id} value={agence.id}>
                      {agence.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
                disabled={exportMutation.isLoading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {exportMutation.isLoading ? 'Export...' : 'Exporter'}
              </Button>
            </Stack>
          </Stack>
          
          {/* Indicateur de chargement intégré */}
          {statsLoading && (
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
        
        {/* Effet décoratif */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        />
      </Box>

      {/* Statistiques générales - Style conforme à l'image */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#f0fdf9',
            border: '1px solid #d1fae5',
            borderRadius: 3,
            borderLeft: '4px solid #10b981',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#047857', mb: 1 }}>
                    {stats_generales.total_tickets || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                    Total tickets
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: '#d1fae5', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StatsIcon sx={{ fontSize: 32, color: '#10b981' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 3,
            borderLeft: '4px solid #06b6d4',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(6, 182, 212, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#0891b2', mb: 1 }}>
                    {stats_generales.temps_moyen ? Math.round(stats_generales.temps_moyen) : 0}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                    Temps moyen (min)
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: '#bae6fd', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TimeIcon sx={{ fontSize: 32, color: '#06b6d4' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 3,
            borderLeft: '4px solid #8b5cf6',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#7c3aed', mb: 1 }}>
                    {stats_generales.taux_satisfaction || 75}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                    Taux satisfaction
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
                  <TrendIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: 3,
            borderLeft: '4px solid #f59e0b',
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#d97706', mb: 1 }}>
                    {stats_generales.agents_actifs || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                    Agents actifs
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    sur {stats_generales.total_agents || 0}
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: '#fed7aa', 
                  borderRadius: '50%', 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Répartition par services */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Répartition par services
              </Typography>
              
              {repartition_services.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repartition_services}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${getServiceLabel(name)} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {repartition_services.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value), 'Tickets']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: '#f0f9ff', color: '#1d4ed8', border: '1px solid #bae6fd' }}>
                  Aucune donnée disponible
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance par agences */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Performance par agences
              </Typography>
              
              {performance_agences.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performance_agences}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tickets_traites" fill="#667eea" name="Tickets traités" />
                    <Bar dataKey="temps_moyen" fill="#f093fb" name="Temps moyen (min)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: '#f0f9ff', color: '#1d4ed8', border: '1px solid #bae6fd' }}>
                  Aucune donnée disponible
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Évolution temporelle */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Évolution temporelle
              </Typography>
              
              {evolution_temporelle.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolution_temporelle}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periode" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="tickets_crees" 
                      stackId="1" 
                      stroke="#667eea" 
                      fill="#667eea" 
                      name="Tickets créés"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tickets_traites" 
                      stackId="2" 
                      stroke="#f093fb" 
                      fill="#f093fb" 
                      name="Tickets traités"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: '#f0f9ff', color: '#1d4ed8', border: '1px solid #bae6fd' }}>
                  Aucune donnée disponible
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top agents */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Top agents performers
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Agent</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Tickets</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Temps moy.</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top_agents.length > 0 ? (
                      top_agents.map((agent, index) => (
                        <TableRow key={agent.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={index + 1}
                                size="small"
                                sx={{
                                  backgroundColor: '#667eea',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  minWidth: 24
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
                                {agent.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151' }}>
                              {formatNumber(agent.tickets_traites)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {agent.temps_moyen ? `${Math.round(agent.temps_moyen)} min` : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${agent.performance}%`}
                              size="small"
                              sx={{
                                backgroundColor: agent.performance >= 90 ? '#d1fae5' : agent.performance >= 70 ? '#fed7aa' : '#fecaca',
                                color: agent.performance >= 90 ? '#047857' : agent.performance >= 70 ? '#d97706' : '#dc2626',
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
                            Aucune donnée disponible
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

        {/* Analyse des temps d'attente */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
                Analyse des temps d'attente
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 2
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d4ed8' }}>
                      {temps_attente.moyen ? Math.round(temps_attente.moyen) : '1288'}
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
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fed7aa',
                    borderRadius: 2
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                      {temps_attente.maximum ? Math.round(temps_attente.maximum) : '0'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Temps maximum (min)
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ color: '#374151', fontWeight: 'medium' }}>
                      Répartition des temps d'attente:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`< 5 min: ${temps_attente.moins_5min || 0}%`} 
                        size="small" 
                        sx={{
                          backgroundColor: '#d1fae5',
                          color: '#047857',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip 
                        label={`5-15 min: ${temps_attente.entre_5_15min || 0}%`} 
                        size="small" 
                        sx={{
                          backgroundColor: '#fed7aa',
                          color: '#d97706',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip 
                        label={`> 15 min: ${temps_attente.plus_15min || 0}%`} 
                        size="small" 
                        sx={{
                          backgroundColor: '#fecaca',
                          color: '#dc2626',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Messages d'erreur */}
      {exportMutation.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {exportMutation.error.response?.data?.message || 'Erreur lors de l\'export'}
        </Alert>
      )}
    </Container>
  );
};

export default AdminStatistics;
