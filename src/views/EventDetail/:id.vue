<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventById, getImageEvent, getMyTotalCommentByEvent, getCommentByEvenementId, 
         commentEvent, reactComment, reactEvent
        } from '../../services/api';
import { useUserStore } from '../../stores/userStore';        

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const event = ref(null);
const eventImage = ref(null);
const eventComments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const imageLoaded = ref(false);
const newComment = ref('');
const isSubmittingComment = ref(false);
const showCommentsSection = ref(false);

// État des réactions pour l'événement
const eventReaction = ref({
  userReaction: null,
  userReactionId: null,
  isReacting: false
});

// États des réactions pour les commentaires
const commentReactions = ref({});
const reactingComments = ref(new Set());

// Fonction pour charger les détails de l'événement
const loadEvent = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const eventId = route.params.id;

    const response = await getEventById(eventId);
    event.value = response.data;

    const res = await getImageEvent(eventId);
    eventImage.value = res.data.photo;

    // Charger les réactions de l'événement
    await fetchEventReactions(eventId);

  } catch (err) {
    console.error('Erreur:', err);
    error.value = "Impossible de charger l'événement";
  } finally {
    isLoading.value = false;
  }
};

// Fonction pour récupérer les réactions d'un événement
async function fetchEventReactions(eventId) {
  try {
    const userReaction = await userStore.reactionEvent(eventId);
    if (userReaction) {
      eventReaction.value = {
        userReaction: userReaction.type,
        userReactionId: userReaction.id,
        isReacting: false
      };
    } else {
      eventReaction.value = {
        userReaction: null,
        userReactionId: null,
        isReacting: false
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des réactions de l'événement :", error.response?.data || error.message || error);
  }
}

// Fonction pour créer une réaction à un événement
async function toggleEventReaction(reactionType) {
  const eventId = route.params.id;
  if (!eventId || eventReaction.value.isReacting) return;

  eventReaction.value.isReacting = true;

  try {
    const currentUserReactionType = eventReaction.value.userReaction;
    const currentReactionId = eventReaction.value.userReactionId;

    // CAS 1: Suppression (clic sur la même réaction)
    if (currentUserReactionType === reactionType && currentReactionId) {
      await userStore.deleteReaction(currentReactionId);
    }
    // CAS 2: Mise à jour (clic sur une réaction différente)
    else if (currentUserReactionType && currentReactionId) {
      const formData = new FormData();
      formData.append('id_event', eventId);
      formData.append('type', reactionType);
      await userStore.updateReaction(currentReactionId, formData);
    }
    // CAS 3: Création (aucune réaction existante)
    else {
      const formData = new FormData();
      formData.append('id_event', eventId);
      formData.append('type', reactionType);
      await reactEvent(formData);
    }

    // Recharger systématiquement l'état des réactions depuis le serveur
    await fetchEventReactions(eventId);

  } catch (error) {
    console.error("Erreur lors de la réaction à l'événement :", error.response?.data || error.message || error);
    // En cas d'erreur, on recharge aussi pour assurer la cohérence
    await fetchEventReactions(eventId);
  } finally {
    eventReaction.value.isReacting = false;
  }
}


// Récupérer la liste des commentaires pour l'événement concerné
const fetchComments = async () => {
  try {
    const response = await getCommentByEvenementId(route.params.id);
    const comments = response.data || [];

    for (const comment of comments) {
      const userReaction = await userStore.reactionComment(comment.id);
      if (userReaction) {
        comment.userReaction = userReaction.type;
        comment.userReactionId = userReaction.id;
        commentReactions.value[comment.id] = userReaction.type;
      } else {
        comment.userReaction = null;
        comment.userReactionId = null;
        commentReactions.value[comment.id] = null;
      }
    }

    eventComments.value = comments;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error);
  }
};

// Charger la liste des commentaires
const toggleComments = () => {
  showCommentsSection.value = !showCommentsSection.value;
  if (showCommentsSection.value && eventComments.value.length === 0) {
    fetchComments();
  }
};

// Création d'un commentaire pour un événement
const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  isSubmittingComment.value = true;
  
  try {
    const formData = new FormData();
    formData.append('description', newComment.value.trim());
    formData.append('id_evenement', route.params.id);
    
    const response = await commentEvent(formData);

    // Ajouter le nouveau commentaire au début de la liste
    const newCommentObj = {
      id: response.data.id,
      description: newComment.value.trim(),
      date_creation: new Date().toISOString(),
      userReaction: null,
      userReactionId: null
    };

    eventComments.value.unshift(newCommentObj);
    commentReactions.value[newCommentObj.id] = null;
    newComment.value = '';
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
  } finally {
    isSubmittingComment.value = false;
  }
};

// Fonction pour réagir à un commentaire
async function toggleCommentReaction(commentId, reactionType) {
  if (reactingComments.value.has(commentId)) return;

  reactingComments.value.add(commentId);

  try {
    const comment = eventComments.value.find(c => c.id === commentId);
    if (!comment) {
      console.error('Commentaire non trouvé');
      return;
    }

    const currentUserReaction = comment.userReaction;
    const currentReactionId = comment.userReactionId;

    // CAS 1: Suppression
    if (currentUserReaction === reactionType && currentReactionId) {
      await userStore.deleteReaction(currentReactionId);
    }
    // CAS 2: Mise à jour
    else if (currentUserReaction && currentReactionId) {
      const payload = new FormData();
      payload.append('type', reactionType);
      await userStore.updateReaction(currentReactionId, payload);
    }
    // CAS 3: Création
    else {
      const formdata = new FormData();
      formdata.append('id_comment', commentId);
      formdata.append('type', reactionType);
      await reactComment(formdata);
    }

    // Recharger systématiquement les commentaires pour mettre à jour les réactions
    await fetchComments();

  } catch (error) {
    console.error('Erreur lors de la réaction au commentaire:', error);
    // En cas d'erreur, recharger aussi pour assurer la cohérence
    await fetchComments();
  } finally {
    reactingComments.value.delete(commentId);
  }
}


const formatDate = (dateString) => {
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

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  
  return formatDate(dateString);
};

const formatBase64Image = (base64String) => {
  if (!base64String) return '';
  return `data:image/jpeg;base64,${base64String}`;
};

const timeUntilEvent = computed(() => {
  if (!event.value) return null;
  
  const now = new Date();
  const eventDate = new Date(event.value.date);
  const diff = eventDate - now;
  
  if (diff < 0) return 'Événement passé';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
  return 'Très bientôt';
});

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  loadEvent();
  fetchComments();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button 
            @click="goBack"
            class="flex items-center cursor-pointer text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour aux événements
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading" class="animate-pulse">
        <div class="bg-gray-300 h-80 rounded-2xl mb-8"></div>
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <div class="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-300 rounded w-full"></div>
            <div class="h-4 bg-gray-300 rounded w-5/6"></div>
            <div class="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <div class="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="loadEvent" 
            class="px-6 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>

      <div v-else-if="event" class="space-y-8">
        <div class="relative overflow-hidden rounded-2xl shadow-2xl group">
          <div class="aspect-[16/9] bg-gray-200">
            <img 
              :src="formatBase64Image(eventImage)"
              :alt="event.titre"
              @load="imageLoaded = true"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              :class="{ 'opacity-0': !imageLoaded }"
            />
          </div>
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
            <div class="absolute top-6 right-6">
              <span class="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold capitalize shadow-lg">
                {{ event.type }}
              </span>
            </div>
            
            <div class="absolute bottom-6 left-6">
              <div class="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                <div class="flex items-center text-sm">
                  <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="font-medium text-gray-800">{{ timeUntilEvent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {{ event.titre }}
                </h1>
                
                <div class="flex flex-wrap items-center gap-6 text-orange-100">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="font-medium">{{ formatDate(event.date) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Description
              </h2>
              <div class="prose prose-lg max-w-none">
                <p class="text-gray-700 leading-relaxed">{{ event.description }}</p>
              </div>
            </div>

            <!-- Section des réactions pour l'événement -->
            <div class="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Que pensez-vous de cet événement ?
              </h3>
              
              <div class="flex flex-wrap gap-3">
                <button 
                  @click="toggleEventReaction('like')"
                  :disabled="eventReaction.isReacting"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="eventReaction.userReaction === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      :fill="eventReaction.userReaction === 'like' ? 'currentColor' : 'none'"
                    />
                  </svg>
                  <span class="font-medium">J'aime</span>
                  <div v-if="eventReaction.isReacting && eventReaction.userReaction === 'like'" class="w-4 h-4">
                    <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>

                <button 
                  @click="toggleEventReaction('adore')"
                  :disabled="eventReaction.isReacting"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="eventReaction.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      :fill="eventReaction.userReaction === 'adore' ? 'currentColor' : 'none'"
                    />
                  </svg>
                  <span class="font-medium">J'adore</span>
                  <div v-if="eventReaction.isReacting && eventReaction.userReaction === 'adore'" class="w-4 h-4">
                    <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>

                <button 
                  @click="toggleEventReaction('smile')"
                  :disabled="eventReaction.isReacting"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="eventReaction.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      :fill="eventReaction.userReaction === 'smile' ? 'currentColor' : 'none'"
                    />
                  </svg>
                  <span class="font-medium">Amusant</span>
                  <div v-if="eventReaction.isReacting && eventReaction.userReaction === 'smile'" class="w-4 h-4">
                    <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>

                <button 
                  @click="toggleEventReaction('heart')"
                  :disabled="eventReaction.isReacting"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="eventReaction.userReaction === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                      :fill="eventReaction.userReaction === 'heart' ? 'currentColor' : 'none'"
                    />
                  </svg>
                  <span class="font-medium">J'aime pas</span>
                  <div v-if="eventReaction.isReacting && eventReaction.userReaction === 'heart'" class="w-4 h-4">
                    <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  Catégorie
                </h3>
                <p class="text-gray-600 capitalize">{{ event.type }}</p>
              </div>

              <div class="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors" @click="toggleComments">
                <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Commentaires
                </h3>
                <p class="text-gray-600">{{ eventComments.length }} commentaire{{ eventComments.length > 1 ? 's' : '' }}</p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <a 
                v-if="event.lien_pub"
                :href="event.lien_pub" 
                target="_blank"
                class="flex-1 bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group"
              >
                <svg class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Voir la publication
              </a>
            </div>
          </div>
        </div>

        <!-- Section améliorée des commentaires -->
        <div v-if="showCommentsSection" class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <h3 class="text-2xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Commentaires ({{ eventComments.length }})
            </h3>
          </div>

          <!-- Formulaire de création de commentaire -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex space-x-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <textarea 
                  v-model="newComment"
                  placeholder="Partagez votre opinion sur cet événement..."
                  class="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  rows="3"
                  maxlength="500"
                ></textarea>
                <div class="flex justify-between items-center mt-3">
                  <span class="text-sm text-gray-500">{{ newComment.length }}/500 caractères</span>
                  <button 
                    @click="submitComment"
                    :disabled="!newComment.trim() || isSubmittingComment || newComment.length > 500"
                    class="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center"
                  >
                    <svg v-if="isSubmittingComment" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSubmittingComment ? 'Publication...' : 'Publier' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des commentaires -->      
          <div class="max-h-96 overflow-y-auto">
            <div v-if="eventComments.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <p class="text-gray-500 text-lg">Soyez le premier à commenter !</p>
              <p class="text-gray-400 text-sm mt-2">Partagez votre opinion sur cet événement</p>
            </div>

            <div v-for="comment in eventComments" :key="comment.id" class="border-b border-gray-100 last:border-b-0">
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="font-medium text-gray-900">Utilisateur</span>
                      <span class="text-gray-500 text-sm">{{ formatRelativeTime(comment.date_creation) }}</span>
                    </div>
                    
                    <div class="prose prose-sm max-w-none mb-4">
                      <p class="text-gray-700 leading-relaxed break-words">{{ comment.description }}</p>
                    </div>
                    
                    <!-- Système de réactions pour commentaires amélioré -->
                    <div class="flex items-center justify-start space-x-2 mt-3 pt-3 border-t border-gray-100">
                      <button 
                        @click.stop="toggleCommentReaction(comment.id, 'like')"
                        :disabled="reactingComments.has(comment.id)"
                        class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="comment.userReaction === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            :fill="comment.userReaction === 'like' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="text-xs font-medium">Like</span>
                        <div v-if="reactingComments.has(comment.id) && comment.userReaction === 'like'" class="w-3 h-3">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>

                      <button 
                        @click.stop="toggleCommentReaction(comment.id, 'adore')"
                        :disabled="reactingComments.has(comment.id)"
                        class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="comment.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            :fill="comment.userReaction === 'adore' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="text-xs font-medium">Adore</span>
                        <div v-if="reactingComments.has(comment.id) && comment.userReaction === 'adore'" class="w-3 h-3">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>

                      <button 
                        @click.stop="toggleCommentReaction(comment.id, 'smile')"
                        :disabled="reactingComments.has(comment.id)"
                        class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="comment.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            :fill="comment.userReaction === 'smile' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="text-xs font-medium">Smile</span>
                        <div v-if="reactingComments.has(comment.id) && comment.userReaction === 'smile'" class="w-3 h-3">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>

                      <button 
                        @click.stop="toggleCommentReaction(comment.id, 'heart')"
                        :disabled="reactingComments.has(comment.id)"
                        class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="comment.userReaction === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100'"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            :fill="comment.userReaction === 'heart' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="text-xs font-medium">Dislike</span>
                        <div v-if="reactingComments.has(comment.id) && comment.userReaction === 'heart'" class="w-3 h-3">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.prose {
  line-height: 1.7;
}

.prose p {
  margin-bottom: 1.5em;
}

* {
  transition-property: transform, opacity, background-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .aspect-\[16\/9\] {
    aspect-ratio: 4/3;
  }
}

/* Amélioration du scroll */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation pour les réactions */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.group:hover span {
  animation: bounce 0.3s ease-in-out;
}

/* Animations au survol des boutons de réaction */
button:hover:not(:disabled) {
  animation: pulse 0.3s ease-in-out;
}

/* États de chargement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Styles pour les réactions actives */
.bg-orange-500, .bg-red-500, .bg-yellow-500, .bg-blue-500 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive design amélioré */
@media (max-width: 640px) {
  .flex.flex-wrap.gap-3 {
    flex-direction: column;
    align-items: stretch;
  }
  
  .flex.flex-wrap.gap-3 button {
    justify-content: center;
  }
}
</style>