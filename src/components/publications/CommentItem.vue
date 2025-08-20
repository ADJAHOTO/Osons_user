<script setup>
import UserAvatar from './UserAvatar.vue';
import ReactionButtons from './ReactionButtons.vue';
import CommentReplySection from './CommentReplySection.vue';
import { ref } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { defineEmits } from 'vue';

const props = defineProps({
  comment: Object,
  reactingComments: Set,
  timeAgo: Function,
  toggleCommentReaction: Function,
});

const showReplies = ref(false)
const userStore = useUserStore();
const emit = defineEmits([
  'comment-deleted',
  'comment-updated'
]);

const isEditing = ref(false);
// Pour stocker le contenu du commentaire en cours d'édition
const editedDescription = ref('')

// Initialiser la valeur d'édition avec le contenu actuel
const initializeEdit = () => {
  editedDescription.value = props.comment.description;
  isEditing.value = true;
};


// Mettre a jour le commentaire
async function updateCommentaire() {
  if (!props.comment.id || !editedDescription.value.trim()) {
    console.error("Le commentaire et la description sont requis pour la mise à jour");
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('description', editedDescription.value);
    
    const response = await userStore.updateCommentId(props.comment.id, formData);
    
    // Émettre l'événement vers le parent avec les données mises à jour
    emit('comment-updated', {
      id: props.comment.id,
      description: editedDescription.value,
    });
    isEditing.value = false;
  } catch (error) {
    console.error('Error updating comment:', error.response?.data || error.message);
  }
}

// Annuler l'édition
function cancelEdit() {
  isEditing.value = false;
  editedDescription.value = props.comment.description;
}

// Supprimer un commentaire
async function deleteCommentaire() {
  if (!props.comment.id) {
    console.error("ID du commentaire requis pour la suppression");
    return;
  }
  try {
    // Appel à l'API pour supprimer le commentaire
    const response = await userStore.deleteCommentId(props.comment.id, { action: 'delete' });
    emit('comment-deleted', props.comment.id); // Émettre un événement pour informer le parent de la suppression


    // Mettre à jour le compteur de commentaires dans le store
    await userStore.getCountCommentaire();

  } catch (error) {
    console.error('Error deleting comment:', error.response?.data || error.message);
  }
}

defineExpose({
  deleteCommentaire,
});
</script>

<template>
  <div class="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
    <div class="flex space-x-2 sm:space-x-3">
      <UserAvatar :userId="comment.id_utilisateur" size="sm" />
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-1 sm:space-x-2 mb-1">
          <span class="font-medium text-xs sm:text-sm text-gray-900 truncate">{{ comment.username || 'Utilisateur' }}</span>
          <span class="text-gray-500 text-xxs sm:text-xs">{{ timeAgo(comment.date_creation || new Date()) }}</span>
        </div>
        
        <!-- Affichage normal ou mode édition -->
        <div v-if="!isEditing" class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
          <p class="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{{ comment.description }}</p>
        </div>
        
        <!-- Formulaire d'édition -->
        <div v-else class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
          <textarea
            v-model="editedDescription"
            class="w-full p-2 border border-gray-300 rounded text-xs sm:text-sm"
            rows="3"
            placeholder="Modifier votre commentaire..."
          ></textarea>
          <div class="flex justify-end space-x-2 mt-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              @click="updateCommentaire"
              :disabled="!editedDescription.trim()"
              class="px-3 py-1 text-xs text-white bg-orange-500 rounded hover:bg-orange-600 disabled:bg-gray-300"
            >
              Enregistrer
            </button>
          </div>
        </div>
        
        <ReactionButtons
          reactionType="comment"
          :reactions="{ type: comment.userReaction, id: comment.userReactionId }"
          :reacting="reactingComments.has(comment.id)"
          @toggle-reaction="(type) => toggleCommentReaction(comment.id, type)"
        />

        <!-- Section pour les réponses -->
        <div class="mt-3">
          <div class="flex items-center space-x-5">
            <!-- Bouton pour afficher/masquer les réponses -->
            <button
              @click="showReplies = !showReplies"
              class="text-blue-500 hover:underline text-xs cursor-pointer"
            >
              {{ showReplies ? 'Masquer' : 'Reply' }}
            </button>

            <button
              v-if="!isEditing"
              @click="initializeEdit"
              class="text-blue-500 hover:underline text-xs cursor-pointer"
            >
              Modifier
            </button>

            <button
              @click="deleteCommentaire"
              class="text-red-500 hover:underline cursor-pointer text-xs"
            >
              Supprimer
            </button>
          </div>

          <CommentReplySection
            v-if="showReplies"
            :commentId="comment.id"
            :publicationUsername="publicationUsername"
            :timeAgo="timeAgo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
