<script setup>
import { ref } from 'vue';
import UserAvatar from './UserAvatar.vue';

const props = defineProps({
  isCreatingPost: Boolean,
  userInfos: Object,
});

const emit = defineEmits(['create-post']);

const pub = ref({
  titre: '',
  description: ''
});

function createPost() {
  if (!pub.value.titre.trim() || !pub.value.description.trim()) {
    console.error("Titre et description sont requis");
    return;
  }
  emit('create-post', { ...pub.value });
  pub.value = { titre: '', description: '' }; // Réinitialiser le formulaire
}

</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100 flex-shrink-0 overflow-y-auto">
    <div class="flex items-start space-x-3">
       <UserAvatar
        v-if="userInfos && userInfos.id"
        :userId="userInfos.id"
        :username="userInfos.username"
        size="sm"
        class="mt-1"
      />
      <div class="flex-1 space-y-3">
        <input
          v-model="pub.titre"
          placeholder="Titre de votre publication"
          class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
          type="text"
          maxlength="100"
        >
        
        <textarea 
          v-model="pub.description"
          placeholder="Partagez quelque chose d'intéressant..."
          class="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
          rows="2"
          maxlength="500"
        ></textarea>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            <span>{{ pub.titre.length }}/100</span> - 
            <span>{{ pub.description.length }}/500</span>
          </div>
          <button 
            @click="createPost"
            :disabled="!pub.titre.trim() || !pub.description.trim() || isCreatingPost"
            class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center text-sm"
          >
            <svg v-if="isCreatingPost" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isCreatingPost ? 'Publication...' : 'PUBLIER' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>