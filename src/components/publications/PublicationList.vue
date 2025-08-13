<script setup>
import PublicationCard from './PublicationCard.vue';

defineProps({
  publications: Array,
  isLoading: Boolean,
  getPubImage: Function,
  timeAgo: Function,
  reactions: Object,
  reactingPublications: Set,
  togglePublicationReaction: Function,
  comments: Object,
  showCommentInput: Object,
  newComments: Object,
  isCommenting: Object,
  reactingComments: Set,
  toggleCommentInput: Function,
  cancelComment: Function,
  commentPublication: Function,
  toggleCommentReaction: Function,
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="space-y-6">
      <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="flex-1">
            <div class="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 mb-2 animate-pulse"></div>
            <div class="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
          </div>
        </div>
        <div class="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
        <div class="h-40 sm:h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="publications.length > 0" class="space-y-6">
      <PublicationCard
        v-for="(publication, index) in publications"
        :key="publication.id || index"
        :publication="publication"
        :getPubImage="getPubImage"
        :timeAgo="timeAgo"
        :reactions="reactions"
        :reactingPublications="reactingPublications"
        :togglePublicationReaction="togglePublicationReaction"
        :comments="comments"
        :showCommentInput="showCommentInput"
        :newComments="newComments"
        :isCommenting="isCommenting"
        :reactingComments="reactingComments"
        :toggleCommentInput="toggleCommentInput"
        :cancelComment="cancelComment"
        :commentPublication="commentPublication"
        :toggleCommentReaction="toggleCommentReaction"
      />
    </div>

    <div v-else-if="!isLoading" class="text-center py-8 sm:py-16">
      <div class="bg-white rounded-xl p-6 sm:p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Aucune publication</h3>
        <p class="text-sm sm:text-base text-gray-600">Soyez le premier à partager quelque chose !</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
