import { format, isToday, isYesterday, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des dates
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr, { locale: fr });
};

export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm', { locale: fr });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Aujourd'hui à ${formatTime(date)}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Hier à ${formatTime(date)}`;
  }
  
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true, 
    locale: fr 
  });
};

// Formatage des numéros
export const formatTicketNumber = (number) => {
  if (!number) return '';
  return number.toString().padStart(3, '0');
};

// Services disponibles avec leurs libellés
export const SERVICE_LABELS = {
  payement_factures: 'Payement de factures',
  depot_retrait: 'Dépôt/Retrait',
  transfert: 'Transfert',
  conseil_clientele: 'Conseil Clientèle'
};

export const getServiceLabel = (service) => {
  return SERVICE_LABELS[service] || service;
};

// États des tickets
export const TICKET_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.WAITING]: 'En attente',
  [TICKET_STATUS.IN_PROGRESS]: 'En cours',
  [TICKET_STATUS.COMPLETED]: 'Terminé',
  [TICKET_STATUS.CANCELLED]: 'Annulé'
};

export const getTicketStatusLabel = (status) => {
  return TICKET_STATUS_LABELS[status] || status;
};

// Couleurs pour les statuts
export const TICKET_STATUS_COLORS = {
  [TICKET_STATUS.WAITING]: 'warning',
  [TICKET_STATUS.IN_PROGRESS]: 'info',
  [TICKET_STATUS.COMPLETED]: 'success',
  [TICKET_STATUS.CANCELLED]: 'error'
};

export const getTicketStatusColor = (status) => {
  return TICKET_STATUS_COLORS[status] || 'default';
};

// Validation des emails
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Génération de couleurs pour les graphiques
export const generateColors = (count) => {
  const colors = [
    '#1976d2', '#d32f2f', '#388e3c', '#f57c00',
    '#7b1fa2', '#303f9f', '#c2185b', '#689f38',
    '#455a64', '#e64a19', '#512da8', '#00796b'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
};

// Formatage des nombres
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Calcul de pourcentages
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Délai d'attente formaté
export const formatWaitingTime = (minutes) => {
  if (!minutes || minutes < 1) return 'Moins d\'1 minute';
  
  if (minutes < 60) {
    return `${Math.round(minutes)} minute${minutes > 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

// Génération d'ID uniques
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce pour les recherches
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
