<script setup>
import { formatRelativeTime } from '../../utils/dateUtils';

defineProps({
  comment: {
    type: Object,
    required: true
  },
  reactingComments: {
    type: Set,
    default: () => new Set()
  }
})

defineEmits(['react'])
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
          
          <div class="prose prose-sm max-w-none mb-4">
            <p class="text-gray-700 leading-relaxed break-words">{{ comment.description }}</p>
          </div>
          
          <!-- Système de réactions pour commentaires amélioré -->
          <div class="flex items-center justify-start space-x-2 mt-3 pt-3 border-t border-gray-100">
            <button 
              @click.stop="$emit('react', comment.id, 'like')"
              :disabled="reactingComments.has(comment.id)"
              class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="comment.userReaction === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  :fill="comment.userReaction === 'like' ? 'currentColor' : 'none'"
                />
              </svg>
              <span class="text-xs font-medium">Like</span>
              <div v-if="reactingComments.has(comment.id)" class="w-3 h-3">
                <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>

            <button 
              @click.stop="$emit('react', comment.id, 'adore')"
              :disabled="reactingComments.has(comment.id)"
              class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="comment.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  :fill="comment.userReaction === 'adore' ? 'currentColor' : 'none'"
                />
              </svg>
              <span class="text-xs font-medium">Adore</span>
              <div v-if="reactingComments.has(comment.id)" class="w-3 h-3">
                <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>

            <button 
              @click.stop="$emit('react', comment.id, 'smile')"
              :disabled="reactingComments.has(comment.id)"
              class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="comment.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  :fill="comment.userReaction === 'smile' ? 'currentColor' : 'none'"
                />
              </svg>
              <span class="text-xs font-medium">Smile</span>
              <div v-if="reactingComments.has(comment.id)" class="w-3 h-3">
                <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>

            <button 
              @click.stop="$emit('react', comment.id, 'heart')"
              :disabled="reactingComments.has(comment.id)"
              class="flex items-center space-x-1 px-3 py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="comment.userReaction === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405-.905.904 0 .715.211 1.413.608 2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                  :fill="comment.userReaction === 'heart' ? 'currentColor' : 'none'"
                />
              </svg>
              <span class="text-xs font-medium">Dislike</span>
              <div v-if="reactingComments.has(comment.id)" class="w-3 h-3">
                <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>