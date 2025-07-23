<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { getEvents, getEventsImages } from '../services/api';
import { useRouter } from 'vue-router'

const events = ref([]);
const eventImages = ref({}); 
const isLoading = ref(true);
const error = ref(null); 
const activeFilter = ref('all');
const router = useRouter();
const windowWidth = ref(window.innerWidth);

onMounted(async () => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });

  try {
    const eventsRes = await getEvents();
    if (eventsRes.data && Array.isArray(eventsRes.data)) {
      events.value = eventsRes.data;
    } else {
      throw new Error("Le format des données des événements est invalide.");
    }

    try {
      const imageRes = await getEventsImages();
      if (imageRes.data && imageRes.data.photo) {
        if (Array.isArray(imageRes.data.photo)) {
          eventImages.value = imageRes.data.photo.reduce((acc, img) => {
            if (img.id && img.photo) {
              acc[img.id] = img;
            }
            return acc;
          }, {});
        } else if (typeof imageRes.data.photo === 'object') {
          eventImages.value = imageRes.data.photo;
        }
      } else {
        eventImages.value = {}; 
      }
    } catch (imageError) {
      console.warn('Erreur lors du chargement des images:', imageError);
      eventImages.value = {};
    }
    
  } catch (err) {
    console.error('Erreur critique lors du chargement des données initiales:', err);
    error.value = err.message || 'Une erreur inattendue est survenue lors du chargement des données.';
  } finally {
    isLoading.value = false;
  }
});

const getEventImage = (eventId) => {
  const image = eventImages.value[eventId];
  if (image?.photo) {
    return formatBase64Image(image.photo);
  }
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIwMCAxNzIuMDkxIDE4Mi4wOTEgMTkwIDE2MCAxOTBDMTM3LjkwOSAxOTAgMTIwIDE3Mi4wOTEgMTIwIDE1MEMxMjAgMTI3LjkwOSAxMzcuOTA5IDExMCAxNjAgMTEwQzE4Mi4wOTEgMTEwIDIwMCAxMjcuOTA5IDIwMCAxNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjAgMjEwSDI4MEwyNDAgMTcwTDIwMCAxOTBMMTYwIDE1MEwxMjAgMTkwVjIxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return events.value;
  return events.value.filter(event => event.type === activeFilter.value);
});

const eventTypes = computed(() => {
  const types = new Set(events.value.map(event => event.type));
  return ['all', ...Array.from(types)];
});

function formatDate(dateString) {
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  } catch (error) {
    console.error('Erreur de formatage de date:', error, 'Chaîne d\'entrée:', dateString);
    return dateString;
  }
}

function formatBase64Image(base64String) {
  if (!base64String) {
    return '';
  }
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  return `data:image/jpeg;base64,${base64String}`;
}

const goBack = () => {
  router.back('/');
};
</script>

<template>
  <section id="evenements" class="min-h-screen bg-gray-50">
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
            Revenir à l'accueil
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Nos <span class="text-orange-500">Événements</span>
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez nos prochains rendez-vous et participez à nos activités
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-3 mb-12">
        <button
          v-for="type in eventTypes"
          :key="type"
          @click="activeFilter = type"
          :class="{
            'bg-orange-500 text-white': activeFilter === type,
            'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600': activeFilter !== type
          }"
          class="px-6 py-2 rounded-full text-sm font-medium capitalize border border-gray-200 transition-all duration-300 shadow-sm"
        >
          {{ type === 'all' ? 'Tous' : type }}
        </button>
      </div>

      <div v-if="error" class="text-center py-16">
        <div class="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="location.reload()" 
            class="px-6 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>

      <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="n in 6" :key="n" class="bg-white rounded-2xl overflow-hidden shadow-lg">
          <div class="animate-pulse bg-gray-200 h-64 w-full"></div>
          <div class="p-6">
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="relative">
        <div class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              v-for="event in filteredEvents" 
              :key="event.id" 
              @click="router.push(`/EventDetail/${event.id}`)"
              class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full group cursor-pointer"
            >
              <div class="relative h-64 w-full overflow-hidden">
                <img 
                  :src="getEventImage(event.id)"
                  :alt="event.titre" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  @error="$event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIwMCAxNzIuMDkxIDE4Mi4wOTEgMTkwIDE2MCAxOTBDMTM3LjkwOSAxOTAgMTIwIDE3Mi4wOTEgMTIwIDE1MEMxMjAgMTI3LjkwOSAxMzcuOTA5IDExMCAxNjAgMTEwQzE4Mi4wOTEgMTEwIDIwMCAxMjcuOTA5IDIwMCAxNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjAgMjEwSDI4MEwyNDAgMTcwTDIwMCAxOTBMMTYwIDE1MEwxMjAgMTkwVjIxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';"
                  loading="lazy"
                />

                <span class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-lg">
                  {{ event.type }}
                </span>

                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div class="p-6 flex-grow flex flex-col">
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {{ event.titre }}
                </h3>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(event.date) }}</span>
                  </div>
                </div>
                
                <p class="text-gray-600 mb-6 flex-grow line-clamp-3 text-sm leading-relaxed">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="!isLoading && !error && filteredEvents.length === 0" class="text-center py-20">
            <div class="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <svg class="w-20 h-20 text-orange-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-2xl font-bold text-gray-800 mb-4">Aucun événement disponible</h3>
              <p class="text-gray-600 leading-relaxed">Aucun événement ne correspond à votre filtre ou aucun événement n'est prévu pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation d'entrée pour les cartes */
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

.grid > div {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
.grid > div:nth-child(4) { animation-delay: 0.4s; }
.grid > div:nth-child(5) { animation-delay: 0.5s; }
.grid > div:nth-child(6) { animation-delay: 0.6s; }

/* Effet de survol personnalisé */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}
</style>