<script setup>
defineProps({
  newComment: {
    type: String,
    default: ''
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:new-comment', 'submit'])
</script>

<template>
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
          :value="newComment"
          @input="$emit('update:new-comment', $event.target.value)"
          placeholder="Partagez votre opinion sur cet événement..."
          class="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="flex justify-between items-center mt-3">
          <span class="text-sm text-gray-500">{{ newComment.length }}/500 caractères</span>
          <button 
            @click="$emit('submit')"
            :disabled="!newComment.trim() || isSubmitting || newComment.length > 500"
            class="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Publication...' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

