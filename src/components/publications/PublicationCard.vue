<script setup>
import UserAvatar from './UserAvatar.vue';
import ReactionButtons from './ReactionButtons.vue';
import CommentSection from './CommentSection.vue';

const props = defineProps({
  publication: Object,
  getPubImage: Function,
  timeAgo: Function,
  reactions: Object,
  reactingPublications: Set,
  togglePublicationReaction: Function,
  comments: Array,
  showCommentInput: Object,
  newComments: Object,
  isCommenting: Object,
  reactingComments: Set,
  toggleCommentInput: Function,
  cancelComment: Function,
  commentPublication: Function,
  toggleCommentReaction: Function,
});

function handleCommentDeleted(commentId) {
  if (props.comments[props.publication.id]) {
    props.comments[props.publication.id] = props.comments[props.publication.id].filter(
      c => c.id !== commentId
    );
  }
}

function handleCommentUpdated(updatedComment) {
  // Mettre à jour le commentaire dans la liste
  if (props.comments[props.publication.id]) {
    const commentIndex = props.comments[props.publication.id].findIndex(
      c => c.id === updatedComment.id
    );
    
    if (commentIndex !== -1) {
      // Créer une nouvelle copie du tableau pour déclencher la réactivité
      const updatedComments = [...props.comments[props.publication.id]];
      updatedComments[commentIndex] = {
        ...updatedComments[commentIndex],
        description: updatedComment.description
      };
      
      // Mettre à jour la référence (dépend de comment votre état est géré)
      // Si vous utilisez un store, vous devrez peut-être appeler une mutation
      props.comments[props.publication.id] = updatedComments;
    }
  }
}

</script>

<template>
  <article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <!-- En-tête du post optimisé mobile -->
    <div class="p-4 sm:p-6 pb-3 sm:pb-4">
      <div class="flex items-center space-x-3">
        <UserAvatar :userId="publication.id_utilisateur" size="md" />
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
    <div v-if="getPubImage(publication.id)" class="px-0 sm:px-6 pb-3 sm:pb-4">
      <div class="relative overflow-hidden rounded-lg sm:rounded-lg">
        <img 
          :src="getPubImage(publication.id)" 
          alt="Publication Image" 
          class="w-full h-48 sm:h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
        >
      </div>
    </div>

    <!-- Section des réactions optimisée mobile -->
    <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-200">
      <ReactionButtons
        reactionType="publication"
        :reactions="reactions[publication.id]"
        :reacting="reactingPublications.has(publication.id)"
        @toggle-reaction="(type) => togglePublicationReaction(publication.id, type)"
      />
    </div>

    <!-- Section Commentaires optimisée mobile -->
    <CommentSection
      :publicationId="publication.id"
      :publicationUsername="publication.username"
      :comments="comments[publication.id]"
      :showCommentInput="showCommentInput[publication.id]"
      :newComments="newComments[publication.id]"
      :isCommenting="isCommenting[publication.id]"
      :reactingComments="reactingComments"
      :timeAgo="timeAgo"
      :toggleCommentReaction="toggleCommentReaction"
      @toggle-comment-input="toggleCommentInput"
      @update:newComments="(value) => newComments[publication.id] = value"
      @cancel-comment="cancelComment"
      @comment-publication="commentPublication"
      @comment-deleted = "handleCommentDeleted($event)"
      @comment-updated="handleCommentUpdated($event)"
    />
  </article>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
