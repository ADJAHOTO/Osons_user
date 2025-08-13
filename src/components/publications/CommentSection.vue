<script setup>
import { ref } from 'vue';
import UserAvatar from './UserAvatar.vue';
import CommentItem from './CommentItem.vue';

const props = defineProps({
  publicationId: [String, Number],
  publicationUsername: String,
  comments: Array,
  showCommentInput: Boolean,
  newComments: String,
  isCommenting: Boolean,
  reactingComments: Set,
  timeAgo: Function,
  toggleCommentReaction: Function,
});

const emit = defineEmits([
  'toggle-comment-input',
  'update:newComments',
  'cancel-comment',
  'comment-publication',
]);

const updateNewComments = (event) => {
  emit('update:newComments', event.target.value);
};

const handleCommentPublication = () => {
  emit('comment-publication', props.publicationId);
};
</script>

<template>
  <div class="border-t border-gray-100">
    <!-- Bouton pour afficher/masquer les commentaires -->
    <div class="px-4 sm:px-6 py-3 bg-gray-50">
      <button 
        @click="emit('toggle-comment-input', publicationId)"
        class="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors w-full justify-center sm:justify-start"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="font-medium text-sm sm:text-base">
          {{ comments?.length || 0 }} commentaire{{ (comments?.length || 0) > 1 ? 's' : '' }}
        </span>
      </button>
    </div>

    <!-- Formulaire de commentaire optimisé mobile -->
    <div v-if="showCommentInput" class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
      <div class="flex space-x-2 sm:space-x-3">
        <UserAvatar :username="publicationUsername" size="sm" />
        <div class="flex-1">
          <textarea
            :value="newComments"
            @input="updateNewComments"
            placeholder="Écrivez votre commentaire..."
            class="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm sm:text-base"
            rows="2"
            maxlength="300"
          ></textarea>
          <div class="flex justify-between items-center mt-2 sm:mt-3">
            <span class="text-xs sm:text-sm text-gray-500">{{ (newComments || '').length }}/300</span>
            <div class="flex space-x-1 sm:space-x-2">
              <button 
                @click="emit('cancel-comment', publicationId)"
                class="px-3 py-1 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm transition-colors"
              >
                Annuler
              </button>
              <button 
                @click="handleCommentPublication"
                :disabled="!newComments?.trim() || isCommenting"
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
    <div v-if="comments?.length > 0 && showCommentInput" class="border-t border-gray-100">
      <div>
        <div v-for="(comment, commentIndex) in comments" 
            :key="comment.id || commentIndex" 
            class="border-b border-gray-50 last:border-b-0">
          <CommentItem 
            :comment="comment"
            :publicationUsername="publicationUsername"
            :reactingComments="reactingComments"
            :timeAgo="timeAgo"
            :toggleCommentReaction="toggleCommentReaction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
