<script setup>
defineProps({
  users: Array,
  followUser: Function,
});

function formatBase64Image(base64String) {
  if (!base64String) {
    return '';
  }
  return `data:image/jpeg;base64,${base64String}`;
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
    <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-base">
      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
      Utilisateurs
    </h3>
    <div class="space-y-3 sm:space-y-4">
      <div v-for="user in users" :key="user.username" class="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <img v-if="user.photoUrl" :src="user.photoUrl" :alt="user.username + ' avatar'" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover">
        <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-sm sm:text-base font-semibold text-gray-700">{{ user.username.charAt(0) }}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-900 font-medium truncate">{{ user.username }}</p>
        </div>

        <button 
          @click="followUser(user.id)" 
          class="flex items-center justify-center px-2 py-1 text-xs font-medium text-white-300 bg-orange-400 rounded-full hover:bg-orange-500 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
