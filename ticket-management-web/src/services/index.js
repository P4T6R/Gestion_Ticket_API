import api from './api';

// Services d'authentification
export const authService = {
  // Connexion
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Récupérer les données utilisateur stockées
  getCurrentUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

// Services pour les tickets publics
export const ticketService = {
  // Créer un nouveau ticket
  createTicket: async (service, agence_id) => {
    const response = await api.post('/tickets', { service, agence_id });
    return response.data;
  },

  // Obtenir la file d'attente d'une agence
  getQueue: async (agence_id) => {
    const response = await api.get(`/tickets/queue?agence_id=${agence_id}`);
    return response.data;
  },

  // Obtenir les détails d'un ticket
  getTicketDetails: async (numero, agence_id) => {
    const response = await api.get(`/tickets/${numero}?agence_id=${agence_id}`);
    return response.data;
  }
};

// Services pour les agents
export const agentService = {
  // Obtenir la file d'attente de l'agence de l'agent
  getQueue: async () => {
    const response = await api.get('/agent/queue');
    return response.data;
  },

  // Appeler le prochain ticket
  callNext: async () => {
    const response = await api.post('/agent/call-next');
    return response.data;
  },

  // Terminer le ticket en cours
  finishCurrent: async () => {
    const response = await api.post('/agent/finish-current');
    return response.data;
  },

  // Obtenir les statistiques de l'agent
  getStats: async () => {
    const response = await api.get('/agent/stats');
    return response.data;
  }
};

// Services pour les administrateurs
export const adminService = {
  // Obtenir le tableau de bord temps réel
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Obtenir les statistiques globales
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  // Exporter un rapport
  exportReport: async (params) => {
    const response = await api.post('/admin/export-report', params);
    return response.data;
  }
};

// Services pour les données de référence
export const referenceService = {
  // Obtenir la liste des agences
  getAgences: async () => {
    const response = await api.get('/agences');
    return response.data;
  },

  // Obtenir la liste des services
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  }
};
