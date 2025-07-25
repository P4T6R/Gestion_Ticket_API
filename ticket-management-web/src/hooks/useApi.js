import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService, adminService, referenceService, ticketService } from '../services';

// Clés de requête
export const QUERY_KEYS = {
  // Agent
  AGENT_QUEUE: 'agent-queue',
  AGENT_STATS: 'agent-stats',
  
  // Admin
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_STATISTICS: 'admin-statistics',
  
  // Référence
  AGENCES: 'agences',
  SERVICES: 'services',
  
  // Tickets
  TICKET_QUEUE: 'ticket-queue',
  TICKET_DETAILS: 'ticket-details'
};

// Hooks pour les agents
export const useAgentQueue = (refetchInterval = 5000) => {
  return useQuery({
    queryKey: [QUERY_KEYS.AGENT_QUEUE],
    queryFn: agentService.getQueue,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 2000,
    retry: 1
  });
};

export const useAgentStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.AGENT_STATS],
    queryFn: agentService.getStats,
    refetchInterval: 30000,
    retry: 1
  });
};

export const useCallNextTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: agentService.callNext,
    onSuccess: () => {
      // Actualiser la file d'attente et les stats
      queryClient.invalidateQueries([QUERY_KEYS.AGENT_QUEUE]);
      queryClient.invalidateQueries([QUERY_KEYS.AGENT_STATS]);
    }
  });
};

export const useFinishCurrentTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: agentService.finishCurrent,
    onSuccess: () => {
      // Actualiser la file d'attente et les stats
      queryClient.invalidateQueries([QUERY_KEYS.AGENT_QUEUE]);
      queryClient.invalidateQueries([QUERY_KEYS.AGENT_STATS]);
    }
  });
};

// Hooks pour les administrateurs
export const useAdminDashboard = (refetchInterval = 3000) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn: adminService.getDashboard,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 1000
  });
};

export const useAdminStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STATISTICS],
    queryFn: adminService.getStatistics,
    refetchInterval: 60000
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: adminService.exportReport
  });
};

// Hooks pour les données de référence
export const useAgences = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.AGENCES],
    queryFn: referenceService.getAgences,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000  // 10 minutes
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: referenceService.getServices,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000  // 10 minutes
  });
};

// Hooks pour les tickets
export const useTicketQueue = (agence_id, refetchInterval = 5000) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TICKET_QUEUE, agence_id],
    queryFn: () => ticketService.getQueue(agence_id),
    enabled: !!agence_id,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 2000
  });
};

export const useTicketDetails = (numero, agence_id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TICKET_DETAILS, numero, agence_id],
    queryFn: () => ticketService.getTicketDetails(numero, agence_id),
    enabled: !!(numero && agence_id),
    staleTime: 30000
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ service, agence_id }) => ticketService.createTicket(service, agence_id),
    onSuccess: (data, variables) => {
      // Actualiser la file d'attente de l'agence
      queryClient.invalidateQueries([QUERY_KEYS.TICKET_QUEUE, variables.agence_id]);
    }
  });
};
