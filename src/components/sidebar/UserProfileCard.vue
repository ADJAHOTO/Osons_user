<script setup>
import UserAvatar from '../publications/UserAvatar.vue';

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
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    @click="handleclick"
  >
    <div class="text-center">
      <UserAvatar :userPhoto="userInfos.photo" :username="userInfos.username" size="lg" class="mx-auto mb-4" />
      <h3 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{{ userInfos.nom }} {{ userInfos.prenoms }}</h3>
      <h4 class="font-semibold text-gary-6900 mb-1 text-sm sm:text-base">{{ userInfos.username }}</h4>
      <p class="text-xs sm:text-sm text-gray-600 mb-4">
        {{ userInfos.email}}
      </p>
      <p class="text-xs sm:text-sm text-gray-600 mb-4">
        {{ userInfos.telephone}}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
