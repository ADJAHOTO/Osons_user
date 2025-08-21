<script setup>
import UserAvatar from '../publications/UserAvatar.vue';
import { useUserStore } from '../../stores/userStore';
import { onMounted, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { commentCount, publicationsCount, reactionsCount, 
  countUserFollowed, countFollowersUser
 } = storeToRefs(userStore);

const props = defineProps({
  userInfos: Object,
  handleclick: Function,
});

// Ref pour stocker les informations du badge
const userBadge = ref(null);
const isLoadingBadge = ref(false);

// Fonction pour récuperer le badge de l'utilisateur
async function fetchUserBadge() {
  if (props.userInfos && props.userInfos.id) {
    isLoadingBadge.value = true;
    try {
      const response = await userStore.recupererBadgeUser(props.userInfos.id);
      userBadge.value = response
    } catch (error) {
      console.error("Erreur lors de la récupération du badge utilisateur", error);
      userBadge.value = null;
    } finally {
      isLoadingBadge.value = false;
    }
  }
}

// Fonction pour obtenir la couleur et l'icône du badge
const getBadgeStyle = (badge) => {
  switch (badge) {
    case 'Diamant':
      return {
        bgColor: 'bg-gradient-to-br from-blue-200 to-cyan-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        icon: '💎'
      };
    case 'Platine':
      return {
        bgColor: 'bg-gradient-to-br from-gray-200 to-slate-300',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        icon: '🏆'
      };
    case 'Or':
      return {
        bgColor: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        icon: '🥇'
      };
    case 'Argent':
      return {
        bgColor: 'bg-gradient-to-br from-gray-300 to-gray-400',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        icon: '🥈'
      };
    case 'Bronze':
      return {
        bgColor: 'bg-gradient-to-br from-orange-200 to-orange-300',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        icon: '🥉'
      };
    case 'Aucun':
    return {
      bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-500',
      icon: '✨' 
    };
    default:
      return {
        bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
        textColor: 'text-gray-600',
        iconColor: 'text-gray-500',
        icon: '✨' 
      };
  }
};

// Fonction pour charger les compteurs
const loadCounters = () => {
  userStore.getCountCommentaire();
  userStore.getCountPublications();
  userStore.getCountReactions();
  userStore.recupererCountFollowerUser();
  
  if (props.userInfos && props.userInfos.id) {
    userStore.recupererCountFollowerForUser(props.userInfos.id);
  }
};

// Appeler au montage
onMounted(() => {
  loadCounters();
  fetchUserBadge();
});

// Watcher pour surveiller les changements de userInfos
watch(() => props.userInfos, (newUserInfos, oldUserInfos) => {
  if (newUserInfos && newUserInfos.id && newUserInfos.id !== oldUserInfos?.id) {
    userStore.recupererCountFollowerForUser(newUserInfos.id);
    fetchUserBadge();
  }
}, { deep: true });
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors max-h-86 overflow-y-auto scrollbar-thin"
    @click="handleclick"
  >
    <div class="text-center">
      <div class="relative inline-block mb-4">
        <UserAvatar
          v-if="userInfos && userInfos.id"
          :userId="userInfos.id"
          :username="userInfos.username"
          size="lg"
          class="mx-auto"
        />
        
        <!-- Badge utilisateur -->
        <div v-if="userBadge && !isLoadingBadge && userBadge.badge !== 'Aucun'" class="absolute -bottom-2 -right-2">
          <div 
            :class="[
              'px-2 py-1 rounded-full text-xs font-semibold shadow-lg border-2 border-white',
              getBadgeStyle(userBadge.badge)?.bgColor,
              getBadgeStyle(userBadge.badge)?.textColor
            ]"
            :title="`Badge ${userBadge.badge}`"
          >
            <span class="mr-1">{{ getBadgeStyle(userBadge.badge)?.icon }}</span>
            {{ userBadge.badge }}
          </div>
        </div>
        
        <!-- Indicateur de chargement du badge -->
        <div v-if="isLoadingBadge" class="absolute -bottom-2 -right-2">
          <div class="bg-gray-200 px-2 py-1 rounded-full animate-pulse">
            <div class="w-8 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
      
      <h4 class="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
        {{ userInfos?.username || 'Chargement...' }}
      </h4>
      
      <!-- Badge en version étendue sous le nom -->
      <div v-if="userBadge && !isLoadingBadge && userBadge.badge !== 'Aucun'" class="mb-2">
        <div 
          :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
            getBadgeStyle(userBadge.badge)?.bgColor,
            getBadgeStyle(userBadge.badge)?.textColor
          ]"
        >
          <span class="mr-1 text-sm">{{ getBadgeStyle(userBadge.badge)?.icon }}</span>
          Badge {{ userBadge.badge }}
        </div>
      </div>
      
      <p class="text-xs sm:text-sm text-gray-600 mb-6">
        {{ userInfos?.email || 'Chargement...' }}
      </p>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-xs text-gray-600 mt-1">Commentaires</span>
          <span class="text-sm font-semibold text-blue-700">{{ commentCount }}</span>
        </div>

        <div class="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span class="text-xs text-gray-600 mt-1">Publications</span>
          <span class="text-sm font-semibold text-purple-700">{{ publicationsCount }}</span>
        </div>

        <div class="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.928c.374-1.136 1.607-1.136 1.98 0l1.734 5.246 5.962.86a.5.5 0 01.465.61l-3.976 3.878 1.397 5.95a.5.5 0 01-.746.518L10 15.781l-5.323 3.307a.5.5 0 01-.746-.518l1.397-5.95-3.976-3.878a.5.5 0 01.465-.61l5.962-.86 1.734-5.246z" />
          </svg>
          <span class="text-xs text-gray-600 mt-1">Réactions</span>
          <span class="text-sm font-semibold text-yellow-700">{{ reactionsCount }}</span>
        </div>

        <div class="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM2 17a6 6 0 1112 0H2z" />
          </svg>
          <span class="text-xs text-gray-600 mt-1">Abonnés</span>
          <span class="text-sm font-semibold text-green-700">{{ countFollowersUser }}</span>
        </div>

        <div class="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM2 17a6 6 0 0112 0H2z" />
          </svg>
          <span class="text-xs text-gray-600 mt-2">Utilisateurs suivi</span>
          <span class="text-sm font-semibold text-red-700">{{ countUserFollowed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 2px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
</style>