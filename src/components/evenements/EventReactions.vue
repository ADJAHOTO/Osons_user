<script setup>
import { ref, watch } from 'vue';
import { reactEvent } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();
const props = defineProps({
  eventReaction: { type: Object, required: true },
  eventId: { type: [String, Number], required: true }
});

const emit = defineEmits(['reaction-toggled']);
const localReaction = ref({ ...props.eventReaction });

async function toggleEventReaction(reactionType) {
  if (!props.eventId || localReaction.value.isReacting) return;

  localReaction.value.isReacting = true;

  // pour rollback si l’API échoue
  const prev = { ...localReaction.value };

  try {
    const currentType = localReaction.value.userReaction;
    const currentId   = localReaction.value.userReactionId;

    // CAS 1: Suppression (clic sur la même réaction)
    if (currentType === reactionType && currentId) {
      await userStore.deleteReaction(currentId);
      localReaction.value.userReaction = null;
      localReaction.value.userReactionId = null;
    }

    // CAS 2: Mise à jour (clic sur une réaction différente)
    else if (currentType && currentId) {
      const formData = new FormData();
      formData.append('id_event', props.eventId);
      formData.append('type', reactionType);

      const resp = await userStore.updateReaction(currentId, formData);
      const newId =
        resp?.data?.id ??
        resp?.data?.reaction?.id ?? // au cas où l’API retourne un objet
        currentId;                  // certaines API gardent le même id

      localReaction.value.userReaction = reactionType;
      localReaction.value.userReactionId = newId;
    }

    // CAS 3: Création (aucune réaction existante)
    else {
      const formData = new FormData();
      formData.append('id_event', props.eventId);
      formData.append('type', reactionType);

      const resp = await reactEvent(formData);
      const newId =
        resp?.data?.id ??
        resp?.data?.reaction?.id ?? // variante fréquente
        null;                       // si 204 No Content

      localReaction.value.userReaction = reactionType;
      localReaction.value.userReactionId = newId;
    }

    // informer le parent (sans refetch API)
    emit('reaction-toggled', {
      userReaction: localReaction.value.userReaction,
      userReactionId: localReaction.value.userReactionId
    });

  } catch (error) {
    // rollback UI si l’API échoue
    localReaction.value = prev;
    console.error("Erreur lors de la réaction :", error.response?.data || error.message || error);

    emit('reaction-toggled', {
      userReaction: localReaction.value.userReaction,
      userReactionId: localReaction.value.userReactionId
    });
  } finally {
    localReaction.value.isReacting = false;
  }
}

// garder le child sync si le parent met à jour la prop
watch(
  () => props.eventReaction,
  (val) => { localReaction.value = { ...val }; },
  { deep: true, immediate: true }
);
</script>


<template>
  <div class="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
      Que pensez-vous de cet événement ?
    </h3>
    
    <div class="flex flex-wrap gap-3">
      <button 
        @click="toggleEventReaction('like')"
        :disabled="localReaction.isReacting"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="localReaction.userReaction === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            :fill="localReaction.userReaction === 'like' ? 'currentColor' : 'none'"
          />
        </svg>
        <span class="font-medium">J'aime</span>
        <div v-if="localReaction.isReacting && localReaction.userReaction === 'like'" class="w-4 h-4">
          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </button>

      <button 
        @click="toggleEventReaction('adore')"
        :disabled="localReaction.isReacting"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="localReaction.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            :fill="localReaction.userReaction === 'adore' ? 'currentColor' : 'none'"
          />
        </svg>
        <span class="font-medium">J'adore</span>
        <div v-if="localReaction.isReacting && localReaction.userReaction === 'adore'" class="w-4 h-4">
          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </button>

      <button 
        @click="toggleEventReaction('smile')"
        :disabled="localReaction.isReacting"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="localReaction.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            :fill="localReaction.userReaction === 'smile' ? 'currentColor' : 'none'"
          />
        </svg>
        <span class="font-medium">Amusant</span>
        <div v-if="localReaction.isReacting && localReaction.userReaction === 'smile'" class="w-4 h-4">
          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </button>

      <button 
        @click="toggleEventReaction('heart')"
        :disabled="localReaction.isReacting"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="localReaction.userReaction === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            :fill="localReaction.userReaction === 'heart' ? 'currentColor' : 'none'"
          />
        </svg>
        <span class="font-medium">J'aime pas</span>
        <div v-if="localReaction.isReacting && localReaction.userReaction === 'heart'" class="w-4 h-4">
          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>