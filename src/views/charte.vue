<script setup>
import { ref, onMounted, computed } from 'vue';
import { showCharte } from '../services/api';

const charte = ref(null);
const isLoading = ref(true);
const error = ref(null);
const isHovered = ref(false);

const loadCharte = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await showCharte();
    charte.value = response.data;
  } catch (err) {
    console.error('Erreur:', err);
    error.value = "Impossible de charger la charte";
  } finally {
    isLoading.value = false;
  }
};

const formattedDate = computed(() => {
  if (!charte.value?.date_creation) return '';
  const date = new Date(charte.value.date_creation);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

onMounted(loadCharte);
</script>

<template>
  <section id="chartes" class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-white py-20">
    <!-- Container principal -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- En-tête modernisé -->
      <div class="text-center mb-20">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Notre <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Charte</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Les valeurs fondamentales et les principes qui guident notre engagement envers l'excellence
        </p>
      </div>

      <!-- Carte principale avec design premium -->
      <div class="relative group">
        <!-- Effet de brillance en arrière-plan -->
        <div class="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500"></div>
        
        <!-- Conteneur carte -->
        <div class="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100/50 transition-all duration-500 group-hover:shadow-3xl backdrop-blur-sm">

          <!-- États de chargement/erreur -->
          <div v-if="isLoading" class="p-12 h-96 flex items-center justify-center">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
              <p class="text-gray-600 font-medium">Chargement de la charte...</p>
            </div>
          </div>

          <div v-else-if="error" class="p-12 text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h3>
            <p class="text-gray-600 mb-6">{{ error }}</p>
            <button @click="loadCharte" class="px-6 py-3 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Réessayer
            </button>
          </div>

          <!-- Affichage de la charte -->
          <div v-else-if="charte" class="overflow-hidden">
            <!-- En-tête avec motif décoratif -->
            <div class="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 p-12 md:p-16">
              <!-- Motif décoratif en arrière-plan -->
              <div class="absolute inset-0 opacity-10">
                <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div class="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
              </div>
              
              <div class="relative z-10">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-1 bg-white rounded-full mr-4"></div>
                  <span class="text-orange-100 font-medium uppercase tracking-wider text-sm">Notre Charte</span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold text-white leading-tight">{{ charte.titre }}</h2>
              </div>
            </div>

            <!-- Contenu principal -->
            <div class="p-8 md:p-12">

              <!-- Contenu de la charte -->
              <div class="prose prose-orange max-w-none">
                <div class="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p class="first-letter:text-5xl first-letter:font-bold first-letter:text-orange-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                    {{ charte.description }}
                  </p>
                </div>
              </div>

              <!-- Section signature redesignée -->
              <div class="mt-16 pt-8 border-t border-gray-200">
                <div class="bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl p-8">
                  <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <!-- Informations du signataire -->
                    <div class="flex-1">
                      <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                          <span class="text-white font-bold text-lg">{{ charte.prenom.charAt(0) }}{{ charte.nom.charAt(0) }}</span>
                        </div>
                        <div>
                          <p class="text-xl font-bold text-gray-900">{{ charte.prenom }} {{ charte.nom }}</p>
                          <p class="text-orange-600 font-medium">{{ charte.poste }}</p>
                        </div>
                      </div>
                      
                      <!-- Date et validité -->
                      <div class="flex items-center text-sm text-gray-600 mt-4">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>Document signé le {{ formattedDate }}</span>
                      </div>
                    </div>
                    
                    <!-- Zone de signature -->
                    <div class="flex flex-col items-end">
                      <div class="relative group/signature" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
                        <div class="bg-white border-2 border-dashed border-orange-300 rounded-xl p-6 w-64 h-24 flex items-center justify-center transition-all duration-300 group-hover/signature:border-orange-500 group-hover/signature:bg-orange-50">
                          <div class="text-center">
                            <div class="text-orange-600 font-semibold text-lg mb-1">{{ charte.signature }}</div>
                            <div class="text-xs text-gray-500">Signature </div>
                          </div>
                        </div>
                        
                        <!-- Effet de validation -->
                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucune charte disponible -->
          <div v-else class="p-16 text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Charte non disponible</h3>
            <p class="text-gray-600 max-w-md mx-auto leading-relaxed">La charte n'a pas encore été publiée. Veuillez revenir plus tard ou contacter l'administration.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* Styles personnalisés respectant votre charte */
.prose-orange {
  line-height: 1.8;
  color: #374151;
}

.prose-orange p {
  margin-bottom: 1.5em;
  font-size: 1.125rem;
}

/* Ombre personnalisée */
.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.15);
}

/* Animation d'entrée */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#chartes {
  animation: fadeInUp 0.8s ease-out;
}

/* Effet de première lettre */
.first-letter\:text-5xl::first-letter {
  font-size: 3rem;
  line-height: 1;
}

/* Transitions fluides */
* {
  transition-property: transform, opacity, background-color, color, box-shadow, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Effet de brillance sur les boutons */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Responsive amélioré */
@media (max-width: 768px) {
  .first-letter\:text-5xl::first-letter {
    font-size: 2.5rem;
  }
}
</style>