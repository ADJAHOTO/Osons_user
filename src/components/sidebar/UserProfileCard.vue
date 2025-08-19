<script setup>
import UserAvatar from '../publications/UserAvatar.vue';
import { useUserStore } from '../../stores/userStore';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { commentCount, publicationsCount } = storeToRefs(userStore);


defineProps({
  userInfos: Object,
  handleclick: Function,
});

function formatBase64Image(base64String) {
  if (!base64String) {
    return '';
  }
  return `data:image/jpeg;base64,${base64String}`;
}

// Appeler l'action du store au montage pour charger la valeur initiale
onMounted(() => {
  userStore.getCountCommentaire();
  userStore.getCountPublications();
});
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    @click="handleclick"
  >
    <div class="text-center">
      <UserAvatar :userPhoto="userInfos.photo" :username="userInfos.username" size="lg" class="mx-auto mb-4" />
      <h4 class="font-semibold text-gary-6900 mb-1 text-sm sm:text-base">{{ userInfos.username }}</h4>
      <p class="text-xs sm:text-sm text-gray-600 mb-4">
        {{ userInfos.email}}
      </p>

      <!-- SVG avec nombre de commentaires -->
      <div class="flex items-center justify-center space-x-2 mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-sm font-medium text-gray-700">{{ commentCount }}</span>
      </div>

      <!-- SVG avec nombre de publications -->
      <div class="flex items-center justify-center space-x-2 mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span class="text-sm font-medium text-gray-700">{{ publicationsCount }}</span>
      </div>
     
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
