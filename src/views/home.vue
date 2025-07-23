<script setup>
import { ref, onMounted, computed } from 'vue'
import { userEvents, getEventsImages } from '@/services/api' 

const events = ref([]) // Pour stocker les détails des événements (titre, description, etc.)
const imageEvent = ref([]) // Pour stocker les objets d'images (id, photo Base64)
const index = ref(0) // Index pour le diaporama

// Appel API dès le montage du composant
onMounted(async () => {
  try {
    const resEvents = await userEvents() // Appel pour les détails des événements
    events.value = resEvents.data

    const imageRes = await getEventsImages() // Appel pour les images
    if(imageRes.data && imageRes.data.photo) {
      imageEvent.value = imageRes.data.photo
    }
    else {
      console.log("L'API n'a pas renvoyé le tableau d'images.")
      imageEvent.value = [] // Correction ici
    }

    // Démarrer le défilement auto
    setInterval(() => {
      // Assure-toi que les deux tableaux (événements et images) ne sont pas vides
      if (events.value.length > 0 && imageEvent.value.length > 0) {
        index.value = (index.value + 1) % Math.min(events.value.length, imageEvent.value.length)
        // Utilise Math.min au cas où les tailles des tableaux diffèrent
      }
    }, 5000)
  } catch (error) {
    console.error("Erreur de récupération des événements ou des images :", error)
  }
})

// L'objet image courant à afficher dans le diaporama
const currentEventImage = computed(() => {
  if (imageEvent.value && imageEvent.value.length > 0) {
    return imageEvent.value[index.value] // Retourne l'objet { id, photo }
  }
  return null
})

// Les détails de l'événement courant (titre, description)
const currentEventDetails = computed(() => {
    if (events.value && events.value.length > 0) {
        // NOTE: Cette approche suppose que l'ordre et la taille des tableaux 'events' et 'imageEvent'
        // sont synchronisés et que l'index correspond à la fois à l'image et à l'événement associé.
        // Si ce n'est pas garanti par ton API, il faudrait une logique de correspondance par ID.
        return events.value[index.value];
    }
    return null;
});

// Fonction pour formater la chaîne Base64 pour l'attribut src
function formatBase64Image(base64String) {
  if(!base64String) {
    return ''
  }
  return `data:image/jpeg;base64,${base64String}`;
}
</script>

<template>
  <section id="home">
    <div class="relative w-full h-screen overflow-hidden">
      <transition-group name="slide-fade" tag="div">
        <div
          v-if="currentEventImage && currentEventDetails" :key="currentEventImage.id"
          class="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-[2000ms] ease-out"
          :style="{ backgroundImage: `url(${formatBase64Image(currentEventImage.photo)})` }"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/40"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <div class="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse"></div>
          <div class="absolute bottom-40 left-16 w-24 h-24 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full animate-bounce"></div>
          <div class="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-lg rotate-45 animate-spin"></div>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center px-8 max-w-7xl">
              <div class="relative mb-12">
                <h1 class="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 leading-none tracking-tighter drop-shadow-2xl animate-fade-in-up">
                  {{ currentEventDetails.titre }}
                </h1>
                <div class="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black text-white/10 blur-lg animate-pulse">
                  {{ currentEventDetails.titre }}
                </div>
              </div>
              
              <div class="relative">
                <div class="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl rounded-2xl"></div>
                <div class="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <p class="text-xl md:text-3xl lg:text-4xl text-gray-100 leading-relaxed font-light tracking-wide animate-fade-in-up animation-delay-500">
                    {{ currentEventDetails.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        
        </div>
      </transition-group>
    </div>
  </section>
</template>

<style scoped>
/* Transition personnalisée pour le diaporama */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-100px) scale(1.05);
}

/* Animations personnalisées */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

.animation-delay-500 {
  animation-delay: 0.5s;
  opacity: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 4s linear infinite;
}

/* Effet de parallaxe sur l'image */
.scale-105 {
  transform: scale(1.05);
}

/* Effet glassmorphism */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

/* Glow effect pour le texte */
.drop-shadow-2xl {
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.5));
}
</style>