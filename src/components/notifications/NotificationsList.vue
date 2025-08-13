<script setup>
defineProps({
  notifications: Array,
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
    <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.022 16.042l-.176-1.764a10.986 10.986 0 010-4.556l.176-1.764a8 8 0 0115.956 0l.176 1.764a10.986 10.986 0 010 4.556l-.176 1.764a8 8 0 01-15.956 0z"/>
      </svg>
      Notifications récentes
    </h3>
    <div class="space-y-3 sm:space-y-4">
      <div v-for="(notification, index) in notifications" :key="index" class="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-900 mb-1 truncate">{{ notification.text }}</p>
          <p class="text-xxs sm:text-xs text-gray-500">{{ notification.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
