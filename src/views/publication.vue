<script setup>
import { ref, onMounted, onUpdated } from 'vue';
import { getPublications, getImagePublications, createPublication, getMyPublication } from '../services/api';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import PublicationPost from '../components/publication/PublicationPost.vue';

const userStore = useUserStore();
const router = useRouter();

// --- STATE ---
const publications = ref([]);
const pubImages = ref({});
const isLoading = ref(true);
const showProfile = ref(false);
const userInfos = ref({});
const users = ref([]);
const usersfollow = ref([]);

// New post form
const pub = ref({ titre: '', description: '' });
const isCreatingPost = ref(false);

// --- LIFECYCLE ---
onMounted(async () => {
  await loadAllPublications();
  await fetchPubImages();
  await fetchInitialUserData();
  setupColumnScrolling();
});

onUpdated(() => {
  setupColumnScrolling();
});

// --- DATA LOADING ---
async function loadAllPublications() {
  isLoading.value = true;
  try {
    const res = await getPublications();
    publications.value = res.data && Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Erreur lors du chargement des publications générales:", error);
    publications.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function loadMyPublications() {
  isLoading.value = true;
  try {
    const myPublications = await getMyPublication();
    publications.value = myPublications.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des publications de l'utilisateur:", error);
    publications.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function fetchPubImages() {
  try {
    const imageRes = await getImagePublications();
    if (imageRes.data && imageRes.data.photo) {
      if (Array.isArray(imageRes.data.photo)) {
        pubImages.value = imageRes.data.photo.reduce((acc, img) => {
          if (img.id && img.photo) {
            acc[img.id] = img;
          }
          return acc;
        }, {});
      } else if (typeof imageRes.data.photo === 'object') {
        pubImages.value = imageRes.data.photo;
      }
    }
  } catch (imageErr) {
    console.error('Erreur lors de la récupération des images des publications', imageErr);
  }
}

async function fetchInitialUserData() {
  await fetchInfosUser();
  await fetchUser();
  await fetchfollowUser();
}

// --- POST CREATION ---
async function createPost() {
  if (!pub.value.titre.trim() || !pub.value.description.trim()) {
    console.error("Titre et description sont requis");
    return;
  }
  isCreatingPost.value = true;
  try {
    const formdata = new FormData();
    formdata.append('titre', pub.value.titre.trim());
    formdata.append('description', pub.value.description.trim());
    const response = await createPublication(formdata);
    
    const newPub = { ...response.data, date_creation: new Date().toISOString() };
    publications.value.unshift(newPub);
    
    pub.value = { titre: '', description: '' };
  } catch (error) {
    console.error("Une erreur est survenue :", error.response?.data || error.message || error);
  } finally {
    isCreatingPost.value = false;
  }
}

// --- PROFILE & NAVIGATION ---
function handleclick() {
  showProfile.value = !showProfile.value;
  if (showProfile.value) {
    loadMyPublications();
  } else {
    loadAllPublications();
  }
}

const goBack = () => {
  router.push('/');
};

// --- USER & FOLLOWER MANAGEMENT ---
async function fetchUser() {
  try {
    const response = await userStore.recupererUserAvailaibles();
    if (response && Array.isArray(response)) {
      users.value = response.map(user => ({
        ...user,
        photoUrl: user.photo ? formatBase64Image(user.photo) : null
      }));
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
  }
}

async function followUser(userId) {
  try {
    await userStore.followUser(userId);
    await fetchfollowUser();
    await fetchUser();
  } catch (error) {
    console.error("Une erreur est survenue lors du suivi de l'utilisateur", error);
  }
}

async function fetchfollowUser() {
  try {
    const response = await userStore.recupererFollowersUser();
    usersfollow.value = response;
  } catch (error) {
    console.error("Une erreur est survenue lors de la récuperation des followers:", error.response?.data || error.message);
  }
}

async function unfollowUser(suiviId) {
  try {
    const index = usersfollow.value.findIndex(u => u.id === suiviId);
    if (index !== -1) {
      usersfollow.value.splice(index, 1);
    }
    await userStore.supprimerFollowerUser(suiviId);
    await fetchfollowUser();
    await fetchUser();
  } catch (error) {
    console.error("une erreur est survenue lors de la suppression du follower:", error.response?.data);
    await fetchfollowUser();
    await fetchUser();
  }
}

async function fetchInfosUser() {
  try {
    userInfos.value = await userStore.fetchUserInfos();
  } catch (error) {
    console.error("Erreur lors de la récuperation des infos de l'utilisateur", error.response?.data);
  }
}

// --- UI & UTILS ---
const getPubImage = (pubId) => {
  const image = pubImages.value[pubId];
  return image && image.photo ? formatBase64Image(image.photo) : '';
};

function formatBase64Image(base64String) {
  return base64String ? `data:image/jpeg;base64,${base64String}` : '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function setupColumnScrolling() {
  const columns = document.querySelectorAll('.overflow-y-auto');
  columns.forEach(column => {
    column.removeEventListener('wheel', handleWheel);
    column.addEventListener('wheel', handleWheel, { passive: false });
  });
}

function handleWheel(e) {
  if (this.scrollHeight > this.clientHeight) {
    const atTop = this.scrollTop === 0;
    const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1;
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.preventDefault();
      this.scrollTop += e.deltaY * 0.5;
    }
  }
}

// --- STATIC DATA ---
const notifications = ref([
  { text: 'John a aimé votre publication', time: '2 min ago' },
  { text: 'Marie a commenté votre photo', time: '1h ago' },
  { text: 'Nouveau message de David', time: '3h ago' },
  { text: 'Votre publication a 10 likes', time: '1 day ago' }
]);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header responsive -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button 
            @click="goBack"
            class="flex items-center cursor-pointer text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="hidden sm:inline">Retour à l'accueil</span>
          </button>
          
          <h1 class="text-lg sm:text-xl font-bold text-gray-800">Publications</h1>
          
          <button class="lg:hidden text-gray-600 hover:text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-10xl mx-auto px-4 sm:px-6 py-6">
      <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-104px)]">
        
        <!-- Colonne de gauche -->
        <div class="fixed inset-0 bg-white z-40 transform lg:relative lg:transform-none lg:block w-full lg:w-1/6 space-y-6 p-6 lg:p-0 lg:h-full overflow-y-auto transition-transform duration-300 translate-x-full lg:translate-x-0">
          <button class="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <!-- Profil utilisateur -->
          <div
           class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
           @click="handleclick"
           >
            <div class="text-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <img 
                  :src= "formatBase64Image(userInfos.photo)" 
                  alt=""
                >
              </div>
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

          <!-- Utilisateurs suivis -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Utilisateurs suivis</h3>
            <div class="space-y-4">
              <div v-for="user in usersfollow" :key="user.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
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
              <div v-if="usersfollow.length === 0" class="text-center py-4">
                <p class="text-gray-500 text-sm">Vous ne suivez aucun utilisateur pour le moment.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne centrale -->
        <div class="w-full lg:w-3/6 flex flex-col gap-6 lg:h-full">
          <!-- Vue Profil -->
          <template v-if="showProfile">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0 overflow-y-auto">
              <div class="p-6">
                <div class="text-center">
                  <div class="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h3 class="font-semibold text-gray-900 text-xl mb-1">{{  userInfos.username }}</h3>
                  <p class="text-sm text-gray-600 mb-4">Membre depuis le 15 janvier 2023</p>
                  <div class="flex justify-center space-x-4">
                    <div class="text-center"><p class="font-bold text-gray-900">128</p><p class="text-xs text-gray-500">Publications</p></div>
                    <div class="text-center"><p class="font-bold text-gray-900">542</p><p class="text-xs text-gray-500">Abonnés</p></div>
                    <div class="text-center"><p class="font-bold text-gray-900">324</p><p class="text-xs text-gray-500">Abonnements</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto space-y-6">
              <div v-if="isLoading" class="space-y-6">
                <!-- Skeletons -->
              </div>
              <div v-else-if="publications.length > 0" class="space-y-6">
                <PublicationPost
                  v-for="p in publications"
                  :key="p.id"
                  :publication="p"
                  :image-url="getPubImage(p.id)"
                />
              </div>
              <div v-else class="text-center py-8 sm:py-16">
                <!-- No posts message -->
              </div>
            </div>
          </template>

          <!-- Vue Feed -->
          <template v-else>
            <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 flex-shrink-0 overflow-y-auto">
              <div class="flex items-start space-x-3 sm:space-x-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div class="flex-1 space-y-3 sm:space-y-4">
                  <input v-model="pub.titre" placeholder="Titre de votre publication" class="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base" type="text" maxlength="100">
                  <textarea v-model="pub.description" placeholder="Partagez quelque chose d'intéressant..." class="w-full p-3 sm:p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base" rows="2" maxlength="500"></textarea>
                  <div class="flex items-center justify-between">
                    <div class="text-xs sm:text-sm text-gray-500"><span>{{ pub.titre.length }}/100</span> - <span>{{ pub.description.length }}/500</span></div>
                    <button @click="createPost" :disabled="!pub.titre.trim() || !pub.description.trim() || isCreatingPost" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center text-sm sm:text-base">
                      <svg v-if="isCreatingPost" class="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      {{ isCreatingPost ? 'Publication...' : 'PUBLIER' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto space-y-6">
              <div v-if="isLoading" class="space-y-6">
                <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <div class="flex items-center space-x-3 mb-4"><div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div><div class="flex-1"><div class="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 mb-2 animate-pulse"></div><div class="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div></div></div>
                  <div class="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div><div class="h-40 sm:h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                </div>
              </div>
              <div v-else-if="publications.length > 0" class="space-y-6">
                <PublicationPost
                  v-for="p in publications"
                  :key="p.id"
                  :publication="p"
                  :image-url="getPubImage(p.id)"
                />
              </div>
              <div v-else-if="!isLoading" class="text-center py-8 sm:py-16">
                <div class="bg-white rounded-xl p-6 sm:p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"><svg class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg></div>
                  <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Aucune publication</h3>
                  <p class="text-sm sm:text-base text-gray-600">Soyez le premier à partager quelque chose !</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Colonne Notifications -->
        <div class="hidden xl:block w-1.5/6 space-y-6 lg:h-full overflow-y-auto">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base"><svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.022 16.042l-.176-1.764a10.986 10.986 0 010-4.556l.176-1.764a8 8 0 0115.956 0l.176 1.764a10.986 10.986 0 010 4.556l-.176 1.764a8 8 0 01-15.956 0z"/></svg>Notifications récentes</h3>
            <div class="space-y-3 sm:space-y-4">
              <div v-for="(notification, index) in notifications" :key="index" class="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                <div class="flex-1 min-w-0"><p class="text-xs sm:text-sm text-gray-900 mb-1 truncate">{{ notification.text }}</p><p class="text-xxs sm:text-xs text-gray-500">{{ notification.time }}</p></div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Publicité</h3>
            <div class="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 sm:p-6 text-white text-center">
              <h4 class="font-bold text-lg sm:text-xl mb-1 sm:mb-2">RICE</h4>
              <p class="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">Découvrez nos produits innovants</p>
              <button class="bg-white text-orange-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-xs sm:text-sm">En savoir plus</button>
            </div>
          </div>
        </div>

        <!-- Colonne des Utilisateurs -->
        <div class="hidden xl:block w-1/6 space-y-6 lg:h-full overflow-y-auto">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-base"><svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>Utilisateurs</h3>
              <div class="space-y-3 sm:space-y-4">
                  <div v-for="user in users" :key="user.username" class="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <img v-if="user.photoUrl" :src="user.photoUrl" :alt="user.username + ' avatar'" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover">
                      <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"><span class="text-sm sm:text-base font-semibold text-gray-700">{{ user.username.charAt(0) }}</span></div>
                      <div class="flex-1 min-w-0"><p class="text-xs sm:text-sm text-gray-900 font-medium truncate">{{ user.username }}</p></div>
                      <button @click="followUser(user.id)" class="flex items-center justify-center px-2 py-1 text-xs font-medium text-white-300 bg-orange-400 rounded-full hover:bg-orange-500 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base améliorés */
* {
  transition-property: transform, opacity, background-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

article {
  animation: fadeIn 0.3s ease-out;
}

/* États de chargement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Styles pour les réactions actives */
.bg-orange-500, .bg-red-500, .bg-yellow-500, .bg-blue-500 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.h-full {
  height: 100%;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  overscroll-behavior: contain; /* Empêche le scroll sur le parent */
}

/* Amélioration du scroll */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus states améliorés */
textarea:focus, input:focus {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
  outline: none;
}

/* Responsive design amélioré */
@media (max-width: 1023px) {
  /* Masquer la colonne de droite sur tablette */
  .hidden-xl {
    display: none;
  }
  
  /* Ajustements pour tablette */
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-6 {
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }
}

@media (max-width: 767px) {
  /* Menu mobile */
  .fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding-top: 4rem;
  }
  
  .translate-x-full {
    transform: translateX(100%);
  }
  
  /* Ajustements pour mobile */
  .px-4 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-6 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  /* Réduire l'espacement entre les éléments */
  .space-y-6 > * + * {
    margin-top: 1rem;
  }
  
  /* Commentaires plus compacts sur mobile */
  .max-h-48 {
    max-height: 12rem;
  }
  
  /* Masquer le texte des boutons sur très petits écrans */
  @media (max-width: 360px) {
    .flex.flex-wrap.gap-1 button span {
      display: none;
    }
    
    .flex.flex-wrap.gap-1 button svg {
      margin-right: 0;
    }
  }
}

/* Améliorations visuelles */
.prose {
  line-height: 1.6;
}

.group:hover span {
  animation: bounce 0.2s ease-in-out;
}

button:hover:not(:disabled) {
  animation: pulse 0.2s ease-in-out;
}

/* États de survol pour les cartes */
article:hover {
  transform: translateY(-1px);
}

/* Optimisation pour les très grands écrans */
@media (min-width: 1920px) {
  .max-w-7xl {
    max-width: 90rem;
  }
}
</style>