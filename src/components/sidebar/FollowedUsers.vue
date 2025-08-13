<script setup>
defineProps({
  usersfollow: Array,
  formatDate: Function,
  unfollowUser: Function,
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h3 class="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Utilisateurs suivis</h3>
    <div class="space-y-4">
      <div v-for="user in usersfollow" :key="user.id" class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Photo de profil ou logo par défaut -->
          <div v-if="user.photo" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
            <img :src="user.photo" :alt="user.username" class="w-full h-full object-cover">
          </div>
          <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900 text-xs sm:text-sm">{{ user.username }}</p>
            <p class="text-xs text-gray-500">Suivi depuis {{ formatDate(user.date_suivi) }}</p>
          </div>
        </div>
        <button 
          @click="unfollowUser(user.id)"
          class="transition-colors text-red-500 hover:text-red-600 cursor-pointer"
          title="Ne plus suivre"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
      
      <!-- Message si aucun utilisateur suivi -->
      <div v-if="usersfollow.length === 0" class="text-center py-4">
        <p class="text-gray-500 text-sm">Vous ne suivez aucun utilisateur pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
