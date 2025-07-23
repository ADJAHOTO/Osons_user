<script setup>
import { ref, onMounted } from 'vue';
import { getapropos } from '../services/api';

const apropos = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await getapropos();
    apropos.value = res.data;
  } catch (err) {
    console.error('Erreur lors de la récupération des à propos:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section id="apropos" class="min-h-screen flex items-center justify-center py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-orange-100 to-orange-300"></div>
        <p class="text-gray-500">Chargement des informations...</p>
      </div>

      <div v-else-if="apropos" class="flex flex-col lg:flex-row gap-12 xl:gap-70 items-start">
        <!-- Colonne gauche -->
        <div class="w-full lg:w-2/5 xl:w-1/3 flex flex-col items-center lg:items-start">
          <div class="relative group w-full max-w-xs">
            <div class="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
            <div class="relative w-full h-80 aspect-square bg-white rounded-2xl overflow-hidden shadow-xl">
              <img
                v-if="apropos.photo"
                :src="'data:image/jpeg;base64,' + apropos.photo"
                alt="Photo du Directeur"
                class="object-cover w-full h-full"
              />
              <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="mt-8 text-center lg:text-left w-full">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ apropos.signature || 'Prénom Nom' }}
            </h2>
            <p class="text-orange-600 mt-1">Directeur Général</p>

            <div v-if="apropos.signature" class="mt-6">
              <img
                :src="apropos.signature"
                alt="Signature"
                class="max-h-16 w-auto mx-auto lg:mx-0 filter drop-shadow"
              />
            </div>
            <div v-else-if="apropos.signature_text" class="mt-6 border-l-4 border-orange-300 pl-4 py-2 bg-orange-50 rounded-r-lg">
              <p class="text-gray-600 italic">
                "{{ apropos.signature_text }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="w-full lg:w-3/5 xl:w-2/3 space-y-8">
          <h1 class="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
            {{ apropos.titre || 'NOTRE IDENTITÉ' }}
          </h1>

          <div class="space-y-8">
            <!-- Notre Histoire -->
            <div class="relative group p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
              <div class="absolute -inset-1 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <div class="relative z-10">
                <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  Notre Histoire
                </h2>
                <p class="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {{ apropos.qui_sommes_nous || "Notre histoire est marquée par l'innovation et l'engagement envers nos clients." }}
                </p>
              </div>
            </div>

            <!-- Nos Objectifs -->
            <div class="relative group p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
              <div class="absolute -inset-1 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <div class="relative z-10">
                <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  Nos Objectifs
                </h2>
                <p class="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {{ apropos.objectifs || "Nous visons l'excellence dans tous nos services pour satisfaire nos clients." }}
                </p>
              </div>
            </div>

            <!-- Notre Vision -->
            <div class="relative group p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
              <div class="absolute -inset-1 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <div class="relative z-10">
                <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  Notre Vision
                </h2>
                <p class="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {{ apropos.vision || "Construire un avenir meilleur grâce à notre expertise et notre passion." }}
                </p>
              </div>
            </div>
          </div>

          <button class="mt-6 px-6 py-3 sm:px-8 sm:py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center group">
            Découvrir plus
            <svg class="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Si pas de contenu -->
      <div v-else class="text-center text-gray-500 py-10">
        Aucun contenu disponible pour le moment.
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.group:hover .group-hover\:animate-float {
  animation: float 2s ease-in-out infinite;
}

.text-gray-700 {
  color: #4b5563;
}

@media (max-width: 1024px) {
  #apropos {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }
}
</style>
