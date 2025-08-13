<script setup>
import UserAvatar from './UserAvatar.vue';
import ReactionButtons from './ReactionButtons.vue';
import CommentReplySection from './CommentReplySection.vue';
import { ref } from 'vue';

defineProps({
  comment: Object,
  publicationUsername: String,
  reactingComments: Set,
  timeAgo: Function,
  toggleCommentReaction: Function,
});

const showReplies = ref(false)
</script>

<template>
  <div class="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
    <div class="flex space-x-2 sm:space-x-3">
      <UserAvatar :username="publicationUsername" size="sm" />
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-1 sm:space-x-2 mb-1">
          <span class="font-medium text-xs sm:text-sm text-gray-900 truncate">{{ publicationUsername || 'Utilisateur' }}</span>
          <span class="text-gray-500 text-xxs sm:text-xs">{{ timeAgo(comment.date_creation || new Date()) }}</span>
        </div>
        
        <div class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
          <p class="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{{ comment.description }}</p>
        </div>
        
        <ReactionButtons
          reactionType="comment"
          :reactions="{ type: comment.userReaction, id: comment.userReactionId }"
          :reacting="reactingComments.has(comment.id)"
          @toggle-reaction="(type) => toggleCommentReaction(comment.id, type)"
        />

        <!-- Section pour les réponses -->
        <div class="mt-2">
          <!-- Bouton pour afficher/masquer les réponses -->
          <button
            @click="showReplies = !showReplies"
            class="text-blue-500 hover:underline text-xs"
          >
            {{ showReplies ? 'Masquer' : 'Reply' }}
          </button>

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
