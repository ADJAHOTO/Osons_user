<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventById, getImageEvent, getMyTotalCommentByEvent, getCommentByEvenementId, commentEvent, reactComment} from '../../services/api';

const route = useRoute();
const router = useRouter();

const event = ref(null);
const eventImage = ref(null);
const eventComments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const imageLoaded = ref(false);
const newComment = ref('');
const isSubmittingComment = ref(false);
const showCommentsSection = ref(false);
const reactionComment = ref(null);

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

  } catch (err) {
    console.error('Erreur:', err);
    error.value = "Impossible de charger l'événement";
  } finally {
    isLoading.value = false;
  }
};

// Récupérer la liste des commentaires pour l'événement concerné
const loadComments = async () => {
  try {
    const response = await getCommentByEvenementId(route.params.id);
    eventComments.value = response.data || [];
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error);
  }
};

// Charger la liste des commentaires
const toggleComments = () => {
  showCommentsSection.value = !showCommentsSection.value;
  if (showCommentsSection.value && eventComments.value.length === 0) {
    loadComments();
  }
};

// Création d'un commentaire
const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  isSubmittingComment.value = true;
  try {
    const formData = new FormData()
    formData.append('description', newComment.value)
    formData.append('id_evenement', route.params.id)
    
    const response = await commentEvent(formData)

    // Ajouter le nouveau commentaire avec des réactions par défaut
    const newCommentData = {
      ...response.data,
      reactions: {
        dislike: 0,
        love: 0,
        smile: 0,
        heart: 0
      },
      userReaction: null
    };

    eventComments.value.unshift(newCommentData);
    newComment.value = '';
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
  } finally {
    isSubmittingComment.value = false;
  }
};

// Système de réactions
const reactions = [
  { name: 'like', emoji: '👍', label: 'J\'aime' },
  { name: 'heart', emoji: '👎', label: 'Je n\'aime pas', dbField: 'heart' },
  { name: 'adore', emoji: '❤️', label: 'J\'adore', dbField: 'love' },
  { name: 'smile', emoji: '😊', label: 'Sourire', dbField: 'smile' },
];

// Fonction pour réagir a un commentaire
async function toggleReaction(commentId, reactionName) {
  try {
    const comment = eventComments.value.find(c => c.id === commentId);
    if (!comment) return;

    // Vérifier si l'utilisateur a déjà réagi
    if (comment.userReaction === reactionName) {
      // Annuler la réaction
      await reactComment(commentId, reactionName, 'remove');
      comment.userReaction = null;
      comment.reactions[reactionName]--;
    } else {
      // Ajouter ou changer la réaction
      if (comment.userReaction) {
        // Supprimer l'ancienne réaction
        await reactComment(commentId, comment.userReaction, 'remove');
        comment.reactions[comment.userReaction]--;
      }
      // Ajouter la nouvelle réaction
      await reactComment(commentId, reactionName, 'add');
      comment.userReaction = reactionName;
      comment.reactions[reactionName]++;
    }
  } catch (error) {
    console.error('Erreur lors de la réaction:', error);
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
  loadComments();
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
                  <p class="text-gray-600">{{ eventComments.length }}</p>
                </h3>
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
                    
                    <!-- Système de réactions -->
                    <div class="flex items-center space-x-1">
                      <button 
                        v-for="reaction in reactions" 
                        :key="reaction.name"
                        @click="toggleReaction(comment.id, reaction.name)"
                        class="group flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all hover:bg-gray-200"
                        :class="{
                          'bg-orange-100 text-orange-600': comment.userReaction === reaction.name,
                          'text-gray-600 hover:text-gray-800': comment.userReaction !== reaction.name
                        }"
                        :title="reaction.label"
                      >
                        <span class="text-lg group-hover:scale-110 transition-transform">{{ reaction.emoji }}</span>
                        <span v-if="comment.reactions && comment.reactions[reaction.name] > 0" class="font-medium">
                          {{ comment.reactions[reaction.name] }}
                        </span>
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
  50% { transform: scale(1.1); }
}

.group:hover span {
  animation: bounce 0.3s ease-in-out;
}
</style>