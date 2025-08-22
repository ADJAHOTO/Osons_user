<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { formatRelativeTime } from '../../utils/dateUtils';
import CommentReplySection from './CommentReplySection.vue';
import CommentReactions from './CommentReactions.vue';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  reactingComments: {
    type: Set,
    default: () => new Set()
  }
})

const emit = defineEmits(['react', 'comment-deleted', 'comment-updated']);
const userStore = useUserStore();
const isEditing = ref(false);
const editedDescription = ref('');
const showReplies = ref(false)

// Initialiser la valeur d'édition avec le contenu actuel
function initializeEdit() {
  editedDescription.value = props.comment.description;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

// Mettre a jour le commentaire
async function updateCommentaire() {
  if (!props.comment.id || !editedDescription.value.trim()) {
    console.error("Le commentaire et la description sont requis pour la mise à jour");
    return;
  }
  
  try {
      const formData = new FormData()
      formData.append('description', editedDescription.value.trim())
      const result = await userStore.updateCommentId(props.comment.id, formData)
      
      if (result) {
        emit('comment-updated', { 
          id: props.comment.id, 
          description: editedDescription.value.trim() 
        })
        isEditing.value = false
      }
    } catch (e) {
      console.error('Erreur update commentaire', e)
    }
}

// Supprimer le commentaire
async function deleteCommentaire() {
  if (!props.comment.id) return

  try {
    const result = await userStore.deleteCommentId(props.comment.id)
    
    if (result) {
      emit('comment-deleted', props.comment.id)
      await userStore.getCountCommentaire()
    }
  } catch (e) {
    console.error('Erreur delete commentaire', e)
  }
}

//  Fonction pour gérer les réactions du composant enfant
function handleReaction(commentId, reactionType) {
  emit('react', commentId, reactionType)
}
</script>

<template>
  <div class="border-b border-gray-100 last:border-b-0">
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
          
          <div v-if="!isEditing" class="prose prose-sm max-w-none mb-4">
            <p class="text-gray-700 leading-relaxed break-words">{{ comment.description }}</p>
          </div>
          <div v-else class="prose prose-sm max-w-none mb-4">
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

          <!--  Utilisation du composant CommentReactions -->
          <CommentReactions
            :comment="comment"
            :reactingComments="reactingComments"
            @react="handleReaction"
          />

          <div class="flex items-center space-x-5 mt-3">
             <button
              @click="showReplies = !showReplies"
              class="text-blue-500  text-xs cursor-pointer"
            >
              {{ showReplies ? 'Masquer' : 'Reply' }}
            </button>

            <button
              v-if="!isEditing"
              @click="initializeEdit"
              class="text-blue-500  text-xs cursor-pointer"
            >
              Modifier
            </button>
            <button
              @click="deleteCommentaire"
              class="text-red-500  cursor-pointer text-xs"
            >
              Supprimer
            </button>
          </div>
          
          <CommentReplySection
            v-if="showReplies"
            :commentId="comment.id"
            :timeAgo="formatRelativeTime"
            :reacting-comments="reactingComments"
          />
        </div>
      </div>
    </div>
  </div>
</template>