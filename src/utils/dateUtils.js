// src/utils/dateUtils.js

export const formatDate = (dateString) => {
  const options = { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  
  return formatDate(dateString);
};

export const formatBase64Image = (base64String) => {
  if (!base64String) return '';
  return `data:image/jpeg;base64,${base64String}`;
};

export const timeUntilEvent = (eventDate) => {
  if (!eventDate) return null;
  
  const now = new Date();
  const eventDateObj = new Date(eventDate);
  const diff = eventDateObj - now;
  
  if (diff < 0) return 'Événement passé';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
  return 'Très bientôt';
};