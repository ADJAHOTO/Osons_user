<script setup>
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '../../stores/userStore';

const props = defineProps({
  userPhoto: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  }
});

const sizeClasses = {
  sm: 'w-8 h-8 sm:w-10 sm:h-10',
  md: 'w-10 h-10 sm:w-12 sm:h-12',
  lg: 'w-16 h-16 sm:w-20 sm:h-20'
};

const iconSizeClasses = {
  sm: 'w-3 h-3 sm:w-4 sm:h-4',
  md: 'w-5 h-5 sm:w-6 sm:h-6',
  lg: 'w-10 h-10'
};

const userStore = useUserStore()
const userPhoto = ref(null)

// Récuperer la photo depuis la base de donnees sous forme d'une url 
const photoUrl = computed(() => {
  // Priorité à la prop, puis à la photo locale
  const photo = props.userPhoto || userPhoto.value;
  return photo ? `data:image/jpeg;base64,${photo}` : null;
});


async function fetchPhotoUser(userId) {
  try {
    const userData = await userStore.fetchUserPhotoById(userId);
    // Adaptez selon la structure réelle de votre réponse
    userPhoto.value = userData?.photo || 
                      userData?.data?.photo || 
                      null;
  } catch (error) {
    console.error("Failed to fetch user photo", error);
    userPhoto.value = null;
  }
}

onMounted(() =>{
  fetchPhotoUser()
})
</script>

<template>
  <div 
    :class="[sizeClasses[size], 'bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden']"
  >
    <img 
      v-if="photoUrl"
      :src="photoUrl"
      :alt="username ? `${username} avatar` : 'User avatar'"
      class="w-full h-full object-cover"
    >
    <svg v-else :class="[iconSizeClasses[size], 'text-white']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  </div>
</template>

<style scoped>
/* Pas de styles spécifiques nécessaires ici, Tailwind CSS gère tout */
</style>
