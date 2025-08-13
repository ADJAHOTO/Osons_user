<script setup>
defineProps({
  reactionType: String, // 'publication' ou 'comment'
  reactions: Object, // L'objet des réactions pour la publication/commentaire
  reacting: Boolean, // Indique si une réaction est en cours
});

const emit = defineEmits(['toggle-reaction']);

const toggleReaction = (type) => {
  emit('toggle-reaction', type);
};
</script>

<template>
  <div class="grid grid-cols-2 sm:flex flex-wrap gap-1 sm:gap-2 md:gap-3">
    <button 
      @click="toggleReaction('like')"
      :disabled="reacting"
      :class="[
        'flex items-center justify-center sm:justify-start space-x-1 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
        reactionType === 'comment' ? 'px-3 py-1 rounded-full text-xs sm:text-sm' : 'sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm',
        reactionType === 'comment' ? 
          (reactions?.type === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100') :
          (reactions?.type === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200')
      ]"
    >
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          :fill="reactions?.type === 'like' ? 'currentColor' : 'none'"
        />
      </svg>
      <span class="font-medium" :class="reactionType === 'comment' ? 'text-xs' : ''">J'aime</span>
      <div v-if="reacting && reactions?.type === 'heart'" class="w-3 h-3">
        <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </button>

    <button 
      @click="toggleReaction('adore')"
      :disabled="reacting"
      :class="[
        'flex items-center justify-center sm:justify-start space-x-1 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
        reactionType === 'comment' ? 'px-3 py-1 rounded-full text-xs sm:text-sm' : 'sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm',
        reactionType === 'comment' ? 
          (reactions?.type === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100') :
          (reactions?.type === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200')
      ]"
    >
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          :fill="reactions?.type === 'adore' ? 'currentColor' : 'none'"
        />
      </svg>
      <span class="font-medium" :class="reactionType === 'comment' ? 'text-xs' : ''">J'adore</span>
    </button>

    <button 
      @click="toggleReaction('smile')"
      :disabled="reacting"
      :class="[
        'flex items-center justify-center sm:justify-start space-x-1 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
        reactionType === 'comment' ? 'px-3 py-1 rounded-full text-xs sm:text-sm' : 'sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm',
        reactionType === 'comment' ? 
          (reactions?.type === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100') :
          (reactions?.type === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200')
      ]"
    >
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          :fill="reactions?.type === 'smile' ? 'currentColor' : 'none'"
        />
      </svg>
      <span class="font-medium" :class="reactionType === 'comment' ? 'text-xs' : ''">Amusant</span>
    </button>

    <button 
      @click="toggleReaction('heart')"
      :disabled="reacting"
      :class="[
        'flex items-center justify-center sm:justify-start space-x-1 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
        reactionType === 'comment' ? 'px-3 py-1 rounded-full text-xs sm:text-sm' : 'sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm',
        reactionType === 'comment' ? 
          (reactions?.type === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100') :
          (reactions?.type === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200')
      ]"
    >
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          :fill="reactions?.type === 'heart' ? 'currentColor' : 'none'"
        />
      </svg>
      <span class="font-medium" :class="reactionType === 'comment' ? 'text-xs' : ''">Dislike</span>
    </button>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
