<script setup>
import { ref, onMounted } from 'vue';
import { getPublications, getImagePublications, createPublication } from '../services/api';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const publications = ref([]);
const router = useRouter()
const imagePub = ref([]);
const isLoading = ref(true);
const pub = ref({
  titre: '',
  description: ''
});

const userStore = useUserStore()

onMounted(async () => {
  try {
    const res = await getPublications();
    publications.value = res.data;

    const imageRes = await getImagePublications()
    if(imageRes.data && imageRes.data.photo) {
      imagePub.value = imageRes.data.photo
    }
     else {
      console.log("l'api n'a pas renvoyé le tableau d'image" )
      imagePub.value = []
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des publications');
  } finally {
    isLoading.value = false;
  }
});



function formatBase64Image(base64String) {
  if(!base64String) {
    return ''
  }
  return `data:image/jpeg;base64,${base64String}`;
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} Min Ago`;
  if (hours < 24) return `${hours}h Ago`;
  return `${days} days ago`;
}

const likes = ref({});
const comments = ref({});

function toggleLike(index) {
  likes.value[index] = !likes.value[index];
}

function sharePost() {
  // Logique de partage
}

async function createPost() {
  try {
     const payload = {
      titre: pub.value.titre,
      description: pub.value.description,
    };
    
    const res =  await createPublication(payload)
    pub.value = {
       titre: '', 
       description: '' 
    }; 
    publications.value.unshift(res.data); // ajoute la nouvelle publication en haut du feed
    pub.value = res.data
  } catch {
    console.log("une erreur est survenue lors de la creation de la publication")
  }
}

// Données mockées pour la sidebar
const sidebarItems = [
  { name: 'Travel The World', category: 'Life', liked: true },
  { name: 'Foodcert Nikila', category: 'Food' },
  { name: 'Rathi Thelan', category: 'Music' },
  { name: 'Actres Mind', category: 'Fitness' }
];

const notifications = [
  { text: 'Any one can join with us if you want', time: '2 Min Ago' },
  { text: 'Any one can join with us if you want', time: '1 Min Ago' },
  { text: 'Any one can join with us if you want', time: '10 Min Ago' },
  { text: 'Any one can join with us if you want', time: '45 Min Ago' },
  { text: 'Any one can join with us if you want', time: '1h Ago' }
];

const goBack = () => {
  router.push('/');
};

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button 
            @click="goBack"
            class="flex items-center cursor-pointer text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour a l'accueil
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex gap-6 h-screen">
        
        <!-- Colonne de gauche - Profil et suggestions -->
        <div class="w-1/4 space-y-6 overflow-y-auto">
          <!-- Profil utilisateur -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center">
              <img 
                  :src="userStore.userProfileImage" 
                   alt="Profile" 
                   class="w-20 h-20 rounded-full mx-auto mb-4 object-cover">
              <h3 class="font-semibold text-gray-900 mb-1">Deived Leomid</h3>
              <p class="text-sm text-gray-600 mb-4">
                Any one can join with us if you want join with us if you want
              </p>
            </div>
          </div>

          <!-- Page You May Like -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Page You May Like</h3>
            <div class="space-y-4">
              <div v-for="item in sidebarItems" :key="item.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.category }}</p>
                  </div>
                </div>
                <button class="text-red-500 hover:text-red-600" v-if="item.liked">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <button class="text-gray-400 hover:text-gray-600" v-else>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne centrale - Création de post et feed -->
        <div class="w-2/4 space-y-6 overflow-y-auto">
          <!-- Champ de création de post -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-start space-x-4">
              <img 
                   :src="userStore.userProfileImage" 
                   alt="Your avatar" 
                   class="w-12 h-12 rounded-full object-cover">
              <div class="flex-1 space-y-4">
                <!-- Champ pour le titre -->
                <input
                  v-model="pub.titre"
                  placeholder="Titre de votre publication"
                  class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="text"
                >
                
                <!-- Champ pour la description -->
                <textarea 
                  v-model="pub.description"
                  placeholder="Décrivez votre publication..."
                  class="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
                
                <div class="flex items-center justify-between mt-4">
                  <button 
                    @click="createPost"
                    class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    PUBLIER
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Feed des publications -->
          <div v-if="isLoading" class="space-y-6">
            <div v-for="n in 2" :key="n" class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div class="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div class="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
            </div>
          </div>

          <div v-else-if="publications.length > 0" class="space-y-6">
            <article v-for="(pub, index) in publications" :key="index" class="bg-white rounded-lg shadow-sm">
              <!-- En-tête du post -->
              <div class="p-6 pb-4">
                <div class="flex items-center space-x-3">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b647?w=50&h=50&fit=crop&crop=face" 
                       alt="Mary Watson" 
                       class="w-12 h-12 rounded-full object-cover">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">Mary Watson</h3>
                    <p class="text-sm text-gray-500">{{ timeAgo(pub.date || new Date()) }}</p>
                  </div>
                </div>
              </div>

              <!-- Contenu du post -->
              <div class="px-6 pb-4">
                <h2 class="font-semibold text-gray-900 mb-2">{{ pub.titre }}</h2>
                <p class="text-gray-700 leading-relaxed mb-4">{{ pub.description }}</p>
              </div>

              <!-- Image -->
              <div class="px-6 pb-4">
                <div class="rounded-lg overflow-hidden">
                  <img 
                    v-if="imagePub[index]?.photo"
                    :src="formatBase64Image(imagePub[index]?.photo)"
                    :alt="pub.titre" 
                    class="w-full h-64 object-cover"
                  />
                  <img 
                    v-else
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop" 
                    :alt="pub.titre" 
                    class="w-full h-64 object-cover"
                  />
                </div>
              </div>

              <!-- Statistiques -->
              <div class="px-6 pb-3">
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>You and 201 people like this</span>
                  <div class="flex items-center space-x-4">
                    <span>41</span>
                    <span>67</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="border-t border-gray-100 px-6 py-3">
                <div class="flex items-center justify-between">
                  <button 
                    @click="toggleLike(index)"
                    :class="likes[index] ? 'text-blue-600' : 'text-gray-600'"
                    class="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                    </svg>
                    <span class="text-sm">Like</span>
                  </button>

                  <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span class="text-sm">Comment</span>
                  </button>

                  <button class="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                    </svg>
                    <span class="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Colonne de droite - Notifications -->
        <div class="w-1/4 space-y-6 overflow-y-auto">
          <!-- Notifications récentes -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div class="space-y-4">
              <div v-for="(notification, index) in notifications" :key="index" class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 mb-1">{{ notification.text }}</p>
                  <p class="text-xs text-gray-500">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Advertisement -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Advertisement</h3>
            <div class="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 text-white">
              <h4 class="font-bold mb-2">RICE</h4>
              <p class="text-sm opacity-90">Découvrez nos produits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout flex pour 3 colonnes côte à côte */
.flex {
  display: flex;
}

/* Colonnes avec largeurs fixes */
.w-1\/4 {
  width: 25%;
  min-width: 250px;
}

.w-2\/4 {
  width: 50%;
  min-width: 400px;
}

/* Scroll indépendant pour chaque colonne */
.overflow-y-auto {
  overflow-y: auto;
  max-height: calc(100vh - 3rem);
}

/* Responsive */
@media (max-width: 1024px) {
  .flex {
    flex-direction: column;
  }
  
  .w-1\/4,
  .w-2\/4 {
    width: 100%;
    min-width: unset;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

article {
  animation: fadeIn 0.5s ease-out;
}

/* Transitions */
button {
  transition: all 0.2s ease;
}

textarea:focus, input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>