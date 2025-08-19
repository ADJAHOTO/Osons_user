<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// États réactifs
const isEditing = ref(false);
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const fileInput = ref(null);
const isInitialized = ref(false); // Nouveau flag pour éviter les boucles

// Formulaire d'édition
const editForm = reactive({
  nom: '',
  prenoms: '',
  genre: '',
  date_naissance: '',
  pays: '',
  ville: '',
  telephone: '',
  biographie: '',
});

// Initialisation une seule fois au montage
onMounted(async () => {
  if (!user.value?.id && !isInitialized.value) {
    isInitialized.value = true;
    try {
      await userStore.fetchCurrentUser();
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur", error);
    }
  }
});

// Observer les changements sur l'utilisateur du store pour initialiser le formulaire
// Suppression du watcher problématique sur user.value?.id
watch(user, (newUser) => {
  if (newUser && newUser.id) {
    if (!isEditing.value) {
      initializeForm(newUser);
    }
  }
}, { immediate: true, deep: true });

// Fonctions utilitaires
function initializeForm(userData) {
  editForm.nom = userData.nom || '';
  editForm.prenoms = userData.prenoms || '';
  editForm.genre = userData.genre || '';
  editForm.date_naissance = userData.date_nais || '';
  editForm.pays = userData.pays || '';
  editForm.ville = userData.ville || '';
  editForm.telephone = userData.telephone || '';
  editForm.biographie = userData.biographie || '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatBase64Image(base64String) {
  if (!base64String) {
    return userStore.defaultProfileImage; 
  }
  return `data:image/jpeg;base64,${base64String}`;
}

function getCurrentPhoto() {
  if (editForm.photo) {
    return editForm.photo;
  }
  return formatBase64Image(user.value?.photo);
}

// Gestion de l'édition
function startEditing() {
  if (user.value) {
    initializeForm(user.value);
    isEditing.value = true;
  }
}

function cancelEditing() {
  isEditing.value = false;
  editForm.photo = null;
  if (user.value) {
    initializeForm(user.value);
  }
}

// Gestion de la photo
function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      editForm.photo = e.target.result;
    };
    reader.readAsDataURL(file);

    isLoading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await userStore.updatePhotoProfilUser(formData);
      
      // Pas de fetchCurrentUser ici pour éviter la boucle
      // Le store devrait se mettre à jour automatiquement
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la photo de profil", error);
    } finally {
      isLoading.value = false;
    }
  }
}

async function deletePhoto() {
  isLoading.value = true;
  try {
    await userStore.deletePhotoProfilUser();
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
  } finally {
    isLoading.value = false;
  }
}

// Mise à jour des informations du profil (texte)
async function saveInfoChanges() {
  isLoading.value = true;
  try {
    const payload = {
        nom: editForm.nom,
        prenoms: editForm.prenoms, 
        genre: editForm.genre,
        date_nais: editForm.date_naissance, 
        pays: editForm.pays,
        ville: editForm.ville,
        telephone: editForm.telephone,
        biographie: editForm.biographie,
    };
    
    await userStore.updateInfoUser(payload);
    isEditing.value = false;

    // Option 1: Pas de fetchCurrentUser si le store se met à jour automatiquement
    // Option 2: Si nécessaire, ajoutez un délai pour éviter les conflits
    // setTimeout(async () => {
    //   await userStore.fetchCurrentUser();
    // }, 100);

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des informations:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
    <!-- Condition modifiée pour éviter le clignotement -->
    <div v-if="user && user.id">
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-white text-xl font-bold">Profil Utilisateur</h1>
          <div class="flex space-x-2">
            <button
              v-if="!isEditing"
              @click="startEditing"
              :disabled="isLoading"
              class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Modifier</span>
            </button>
            
            <template v-if="isEditing">
              <button
                @click="cancelEditing"
                :disabled="isLoading"
                class="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                @click="saveInfoChanges"
                :disabled="isLoading"
                class="bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>{{ isLoading ? 'Sauvegarde...' : 'Sauvegarder' }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="max-h-64 overflow-y-auto custom-scrollbar">
        <div class="p-6 space-y-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div class="relative group">
              <img 
                :src="getCurrentPhoto()" 
                alt="Photo de profil" 
                class="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-lg transition-transform duration-200 group-hover:scale-105"
              >
              
              <div v-if="isEditing" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div class="flex space-x-1">
                  <button
                    @click="triggerFileInput"
                    :disabled="isLoading"
                    class="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full transition-colors disabled:opacity-50"
                    title="Changer la photo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </button>
                  <button
                    v-if="user.photo"
                    @click="showDeleteConfirm = true"
                    :disabled="isLoading"
                    class="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                    title="Supprimer la photo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="hidden"
              >
            </div>

            <div class="flex-1 text-center sm:text-left">
              <div v-if="!isEditing">
                <h2 class="text-3xl font-bold text-gray-800 mb-1">{{ user.prenoms }} {{ user.nom }}</h2>
                <p class="text-lg text-gray-500 mb-2">@{{ user.username }}</p>
                <span 
                  v-if="user.badge" 
                  class="inline-block bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md"
                >
                  {{ user.badge }}
                </span>
              </div>
              
              <div v-else class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    v-model="editForm.nom"
                    type="text"
                    placeholder="Nom"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                   <input
                    v-model="editForm.prenoms"
                    type="text"
                    placeholder="Prénom"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                </div>
                </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Biographie
            </h3>
            
            <div v-if="!isEditing">
              <p class="text-gray-600 italic leading-relaxed">
                "{{ user.biographie || 'Aucune biographie fournie.' }}"
              </p>
            </div>
            
            <div v-else>
              <textarea
                v-model="editForm.biographie"
                placeholder="Parlez-nous de vous..."
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Informations
            </h3>

            <div v-if="!isEditing" class="space-y-4">
              <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-gray-700">Membre depuis le {{ formatDate(user.date_creation) }}</span>
              </div>
              
              <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-gray-700">{{ user.ville || 'Ville non spécifiée' }}, {{ user.pays || 'Pays non spécifié' }}</span>
              </div>
              
              <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l7 7 7-7"/>
                  </svg>
                  <span class="text-gray-700">{{ user.genre || 'Genre non spécifié' }}</span>
              </div>

              <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-gray-700">Date de naissance : {{ formatDate(user.date_nais) }}</span>
              </div>
              
              <div v-if="user.telephone" class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="text-gray-700">{{ user.telephone }}</span>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select v-model="editForm.genre" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
                  <option value="" disabled>Sélectionner un genre</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
                <input
                  v-model="editForm.date_naissance"
                  type="date"
                  placeholder="Date de naissance"
                  class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  v-model="editForm.ville"
                  type="text"
                  placeholder="Ville"
                  class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                <input
                  v-model="editForm.pays"
                  type="text"
                  placeholder="Pays"
                  class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
              </div>
               <input
                  v-model="editForm.telephone"
                  type="tel"
                  placeholder="Téléphone"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
            </div>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Supprimer la photo</h3>
            <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action est irréversible.</p>
            
            <div class="flex space-x-3">
              <button
                @click="showDeleteConfirm = false"
                :disabled="isLoading"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                @click="deletePhoto"
                :disabled="isLoading"
                class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>{{ isLoading ? 'Suppression...' : 'Supprimer' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Condition améliorée pour le chargement initial uniquement -->
    <div v-else-if="!isInitialized || (!user && !isLoading)" class="p-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-500">Chargement des informations de l'utilisateur...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.custom-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
