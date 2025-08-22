<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  commentsCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['toggle-comments']);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {{ event.titre }}
          </h1>
          
          <div class="flex flex-wrap items-center gap-6 text-orange-100">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="font-medium">{{ formatDate(event.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Description
        </h2>
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 leading-relaxed">{{ event.description }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Catégorie
          </h3>
          <p class="text-gray-600 capitalize">{{ event.type }}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors" @click="$emit('toggle-comments')">
          <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Commentaires
          </h3>
          <p class="text-gray-600">{{ commentsCount }} commentaire{{ commentsCount > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <a 
          v-if="event.lien_pub"
          :href="event.lien_pub" 
          target="_blank"
          class="flex-1 bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          Voir la publication
        </a>
      </div>
    </div>
  </div>
</template>