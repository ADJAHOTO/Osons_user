<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { getCommentByPublicationId, commentPub, reactPub, reactComment } from '../../services/api';

const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
});

const userStore = useUserStore();

// --- STATE ---
const comments = ref([]);
const reaction = ref({ type: null, id: null });
const commentReactions = ref({});
const newCommentText = ref('');
const showCommentInput = ref(false);
const isCommenting = ref(false);
const reactingPublication = ref(false);
const reactingComments = ref(new Set());

// --- LIFECYCLE ---
onMounted(async () => {
  await fetchComments();
  await fetchPublicationReactions();
});

// --- METHODS ---

// Reactions
async function fetchPublicationReactions() {
  try {
    const userReaction = await userStore.reactionPub(props.publication.id);
    reaction.value = userReaction ? { type: userReaction.type, id: userReaction.id } : { type: null, id: null };
  } catch (error) {
    console.error("Erreur lors de la récupération des réactions :", error.response?.data || error.message || error);
  }
}

async function togglePublicationReaction(reactionType) {
  if (reactingPublication.value) return;
  reactingPublication.value = true;

  try {
    const { type: currentType, id: currentId } = reaction.value || {};

    if (currentType === reactionType && currentId) {
      await userStore.deleteReaction(currentId);
    } else if (currentType && currentId) {
      const formData = new FormData();
      formData.append('id_publication', props.publication.id);
      formData.append('type', reactionType);
      await userStore.updateReaction(currentId, formData);
    } else {
      const formData = new FormData();
      formData.append('id_publication', props.publication.id);
      formData.append('type', reactionType);
      await reactPub(formData);
    }
    await fetchPublicationReactions();
  } catch (error) {
    console.error("Erreur lors de la réaction à la publication :", error.response?.data || error.message || error);
    await fetchPublicationReactions(); // Rollback UI on error
  } finally {
    reactingPublication.value = false;
  }
}

// Comments
async function fetchComments() {
  try {
    const response = await getCommentByPublicationId(props.publication.id);
    comments.value = response.data || [];

    for (const comment of comments.value) {
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
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error.response?.data || error.message || error);
  }
}

async function submitComment() {
  if (!newCommentText.value?.trim()) return;
  isCommenting.value = true;

  try {
    const formData = new FormData();
    formData.append('id_publication', props.publication.id);
    formData.append('description', newCommentText.value.trim());
    const response = await commentPub(formData);

    const newCommentObj = {
      id: response.data.id,
      description: newCommentText.value.trim(),
      date_creation: new Date().toISOString(),
      userReaction: null,
      userReactionId: null,
      username: userStore.user?.username || 'Vous'
    };
    comments.value.unshift(newCommentObj);
    commentReactions.value[newCommentObj.id] = null;
    newCommentText.value = '';
    showCommentInput.value = false;
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isCommenting.value = false;
  }
}

async function toggleCommentReaction(commentId, reactionType) {
  if (reactingComments.value.has(commentId)) return;
  reactingComments.value.add(commentId);

  try {
    const comment = comments.value.find(c => c.id === commentId);
    if (!comment) return;

    const { userReaction: currentUserReaction, userReactionId: currentReactionId } = comment;

    if (currentUserReaction === reactionType && currentReactionId) {
      await userStore.deleteReaction(currentReactionId);
    } else if (currentUserReaction && currentReactionId) {
      const payload = new FormData();
      payload.append('type', reactionType);
      await userStore.updateReaction(currentReactionId, payload);
    } else {
      const formdata = new FormData();
      formdata.append('id_comment', commentId);
      formdata.append('type', reactionType);
      await reactComment(formdata);
    }
    await fetchComments();
  } catch (error) {
    console.error('Erreur lors de la réaction au commentaire:', error);
    await fetchComments();
  } finally {
    reactingComments.value.delete(commentId);
  }
}

// UI Toggles
const toggleCommentInput = () => {
  showCommentInput.value = !showCommentInput.value;
  if (showCommentInput.value) {
    newCommentText.value = '';
  }
};

const cancelComment = () => {
  showCommentInput.value = false;
  newCommentText.value = '';
};

// Utils
function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}
</script>

<template>
  <article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <!-- En-tête du post optimisé mobile -->
    <div class="p-4 sm:p-6 pb-3 sm:pb-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate">{{ publication.username || 'Utilisateur' }}</h3>
          <p class="text-xs sm:text-sm text-gray-500">{{ timeAgo(publication.date_creation || new Date()) }}</p>
        </div>
      </div>
    </div>

    <!-- Contenu du post optimisé mobile -->
    <div class="px-4 sm:px-6 pb-3 sm:pb-4">
      <h2 class="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{{ publication.titre }}</h2>
      <div class="prose prose-sm max-w-none">
        <p class="text-gray-700 leading-relaxed text-sm sm:text-base">{{ publication.description }}</p>
      </div>
    </div>

    <!-- Image optimisée mobile -->
    <div v-if="imageUrl" class="px-0 sm:px-6 pb-3 sm:pb-4">
      <div class="relative overflow-hidden rounded-lg sm:rounded-lg">
        <img 
          :src="imageUrl" 
          alt="Publication Image" 
          class="w-full h-48 sm:h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
        >
      </div>
    </div>

    <!-- Section des réactions optimisée mobile -->
    <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-200">
      <div class="grid grid-cols-2 sm:flex flex-wrap gap-1 sm:gap-2 md:gap-3">
        <button 
          @click="togglePublicationReaction('like')"
          :disabled="reactingPublication"
          class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          :class="reaction?.type === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              :fill="reaction?.type === 'like' ? 'currentColor' : 'none'"
            />
          </svg>
          <span class="font-medium">J'aime</span>
          <div v-if="reactingPublication" class="w-3 h-3 sm:w-4 sm:h-4">
            <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </button>

        <button 
          @click="togglePublicationReaction('adore')"
          :disabled="reactingPublication"
          class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          :class="reaction?.type === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              :fill="reaction?.type === 'adore' ? 'currentColor' : 'none'"
            />
          </svg>
          <span class="font-medium">J'adore</span>
        </button>

        <button 
          @click="togglePublicationReaction('smile')"
          :disabled="reactingPublication"
          class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          :class="reaction?.type === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              :fill="reaction?.type === 'smile' ? 'currentColor' : 'none'"
            />
          </svg>
          <span class="font-medium">Amusant</span>
        </button>

        <button 
          @click="togglePublicationReaction('heart')"
          :disabled="reactingPublication"
          class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          :class="reaction?.type === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              :fill="reaction?.type === 'heart' ? 'currentColor' : 'none'"
            />
          </svg>
          <span class="font-medium">J'aime pas</span>
        </button>
      </div>
    </div>

    <!-- Section Commentaires optimisée mobile -->
    <div class="border-t border-gray-100">
      <!-- Bouton pour afficher/masquer les commentaires -->
      <div class="px-4 sm:px-6 py-3 bg-gray-50">
        <button 
          @click="toggleCommentInput"
          class="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors w-full justify-center sm:justify-start"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="font-medium text-sm sm:text-base">
            {{ comments.length || 0 }} commentaire{{ (comments.length || 0) > 1 ? 's' : '' }}
          </span>
        </button>
      </div>

      <!-- Formulaire de commentaire optimisé mobile -->
      <div v-if="showCommentInput" class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
        <div class="flex space-x-2 sm:space-x-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div class="flex-1">
            <textarea
              v-model="newCommentText"
              placeholder="Écrivez votre commentaire..."
              class="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm sm:text-base"
              rows="2"
              maxlength="300"
            ></textarea>
            <div class="flex justify-between items-center mt-2 sm:mt-3">
              <span class="text-xs sm:text-sm text-gray-500">{{ (newCommentText || '').length }}/300</span>
              <div class="flex space-x-1 sm:space-x-2">
                <button 
                  @click="cancelComment"
                  class="px-3 py-1 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm transition-colors"
                >
                  Annuler
                </button>
                <button 
                  @click="submitComment"
                  :disabled="!newCommentText?.trim() || isCommenting"
                  class="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm transition-all flex items-center"
                >
                  <svg v-if="isCommenting" class="animate-spin -ml-1 mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isCommenting ? 'Publication...' : 'Publier' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des commentaires optimisée mobile -->
      <div v-if="comments.length > 0 && showCommentInput" class="border-t border-gray-100">
        <div class="max-h-48 sm:max-h-64 overflow-y-auto">
          <div v-for="(comment, commentIndex) in comments" 
              :key="comment.id || commentIndex" 
              class="border-b border-gray-50 last:border-b-0">
            <div class="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
              <div class="flex space-x-2 sm:space-x-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-1 sm:space-x-2 mb-1">
                    <span class="font-medium text-xs sm:text-sm text-gray-900 truncate">{{ comment.username || 'Utilisateur' }}</span>
                    <span class="text-gray-500 text-xxs sm:text-xs">{{ timeAgo(comment.date_creation || new Date()) }}</span>
                  </div>
                  
                  <div class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                    <p class="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{{ comment.description }}</p>
                  </div>
                  
                  <!-- Système de réactions pour commentaires optimisé mobile -->
                  <div class="flex items-center flex-wrap gap-1 sm:gap-2">
                    <button 
                      @click.stop="toggleCommentReaction(comment.id, 'like')"
                      :disabled="reactingComments.has(comment.id)"
                      class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                      :class="comment.userReaction === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'"
                    >
                      <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          :fill="comment.userReaction === 'like' ? 'currentColor' : 'none'"
                        />
                      </svg>
                      <span class="font-medium">Like</span>
                    </button>

                    <button 
                      @click.stop="toggleCommentReaction(comment.id, 'adore')"
                      :disabled="reactingComments.has(comment.id)"
                      class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                      :class="comment.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'"
                    >
                      <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          :fill="comment.userReaction === 'adore' ? 'currentColor' : 'none'"
                        />
                      </svg>
                      <span class="font-medium">Adore</span>
                    </button>

                    <button 
                      @click.stop="toggleCommentReaction(comment.id, 'smile')"
                      :disabled="reactingComments.has(comment.id)"
                      class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                      :class="comment.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'"
                    >
                      <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          :fill="comment.userReaction === 'smile' ? 'currentColor' : 'none'"
                        />
                      </svg>
                      <span class="font-medium">Smile</span>
                    </button>

                    <button 
                      @click.stop="toggleCommentReaction(comment.id, 'heart')"
                      :disabled="reactingComments.has(comment.id)"
                      class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                      :class="comment.userReaction === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100'"
                    >
                      <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                          :fill="comment.userReaction === 'heart' ? 'currentColor' : 'none'"
                        />
                      </svg>
                      <span class="font-medium">Dislike</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>