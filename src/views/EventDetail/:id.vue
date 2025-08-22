<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventById, getImageEvent, getCommentByEvenementId, reactComment, commentEvent } from '../../services/api';
import { useUserStore } from '../../stores/userStore';
import EventHeader from '../../components/evenements/EventHeader.vue';
import EventImage from '../../components/evenements/EventImage.vue';
import EventInfo from '../../components/evenements/EventInfo.vue';
import EventReactions from '../../components/evenements/EventReactions.vue';
import CommentSection from '../../components/evenements/CommentSection.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const event = ref(null);
const eventImage = ref(null);
const eventComments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const imageLoaded = ref(false);
const showCommentsSection = ref(false);

// Variables manquantes pour les commentaires
const newComment = ref('');
const isSubmittingComment = ref(false);

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
    // Charger les commentaires
    await fetchComments();

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

const toggleComments = () => {
  showCommentsSection.value = !showCommentsSection.value;
  if (showCommentsSection.value) {
    fetchComments(); // Charger les commentaires quand on ouvre la section
  }
};

onMounted(() => {
  loadEvent();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <EventHeader @go-back="goBack" />

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
        <EventImage 
          :image="eventImage"
          :title="event.titre"
          :type="event.type"
          :time-until-event="timeUntilEvent"
          @image-loaded="imageLoaded = true"
        />

        <EventInfo 
          :event="event"
          :format-date="formatDate"
          :comments-count="eventComments.length"
          @toggle-comments="toggleComments"
        />

        <EventReactions 
          :event-reaction="eventReaction"
          :event-id="route.params.id"
          @reaction-toggled="fetchEventReactions(route.params.id)"
        />

      <CommentSection 
        v-if="showCommentsSection"
        :comments="eventComments"
        :new-comment="newComment"
        :is-submitting-comment="isSubmittingComment"
        :reacting-comments="reactingComments"
        @update:new-comment="newComment = $event"
        @submit-comment="submitComment"
        @react-comment="toggleCommentReaction"
      />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Styles spécifiques au parent si nécessaire */
</style>