// Fonction utilitaire pour extraire les données selon la structure API réelle
export const extractQueueData = (apiResponse) => {
  if (!apiResponse) {
    return {
      currentTicket: null,
      waitingTickets: [],
      completedTickets: []
    };
  }
  
  // Structure réelle de l'API selon les données de debug
  const currentTicket = apiResponse.mon_ticket_en_cours || null;
  const waitingTickets = apiResponse.tickets_en_attente || [];
  const completedTickets = apiResponse.tickets_termines || [];
  
  return {
    currentTicket,
    waitingTickets,
    completedTickets
  };
};

export const extractStatsData = (apiResponse) => {
  if (!apiResponse) {
    return {
      tickets_traites: 0,
      temps_moyen_traitement: 0,
      ticket_en_cours: 0
    };
  }
  
  // Structure réelle de l'API selon les données de debug
  const stats = apiResponse.statistiques || {};
  
  return {
    tickets_traites: stats.tickets_traites || 0,
    temps_moyen_traitement: stats.temps_moyen_traitement || 0,
    ticket_en_cours: stats.ticket_en_cours || 0
  };
};

// Fonction pour extraire les données du dashboard admin
export const extractAdminDashboardData = (apiResponse) => {
  if (!apiResponse) {
    return {
      stats_globales: {},
      agences: [],
      agents_actifs: [],
      tickets_recents: [],
      performance_temps_reel: {}
    };
  }
  
  // L'API admin peut avoir une structure différente
  const data = apiResponse.data || apiResponse;
  
  return {
    stats_globales: data.stats_globales || {},
    agences: data.agences || [],
    agents_actifs: data.agents_actifs || [],
    tickets_recents: data.tickets_recents || [],
    performance_temps_reel: data.performance_temps_reel || {}
  };
};

// Fonction pour extraire les statistiques admin
export const extractAdminStatsData = (apiResponse) => {
  if (!apiResponse) {
    return {
      statistiques_globales: {},
      graphiques: {},
      rapports: []
    };
  }
  
  const data = apiResponse.data || apiResponse;
  
  return {
    statistiques_globales: data.statistiques_globales || {},
    graphiques: data.graphiques || {},
    rapports: data.rapports || []
  };
};

// Fonctions utilitaires pour le formatage
export const formatTicketNumber = (numero) => {
  return numero || 'N/A';
};

export const getServiceLabel = (service) => {
  const serviceLabels = {
    'payement_factures': 'Paiement Factures',
    'depot_retrait': 'Dépôt/Retrait',
    'transfert': 'Transfert',
    'conseil_clientele': 'Conseil Clientèle',
    'ouverture_compte': 'Ouverture Compte',
    'credit': 'Crédit'
  };
  
  return serviceLabels[service] || service || 'Service non spécifié';
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};

export const formatWaitingTime = (minutes) => {
  if (!minutes || minutes === 0) return 'Nouveau';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
};
