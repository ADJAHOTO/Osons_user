<script setup>
import { ref, onMounted} from 'vue'
import UserAvatar from './UserAvatar.vue';
import ReactionButtons from './ReactionButtons.vue';
import { useUserStore } from '../../stores/userStore';
import { reactComment } from '../../services/api';

// Définir le type de réponse envoyés depuis le composant parent 
const props = defineProps({
    commentId: {
        type: String,
        required: true
    },
    publicationUsername: {
        type: String,
        default: 'Utilisateur'
    },
    timeAgo: {
        type: Function,
        required: true
    }
})

const userStore = useUserStore()
const replies = ref([]) // Pour stocker la liste des réponses
const newReplyContent = ref('') // Pour le contenu des nouveaux commentaires
const isSubmittingReply = ref(false)
const reactingReplies = ref(new Set()) // Pour suivre les réponses en cours de réaction (désactiver les boutons)


// Fonction pour récuperer toutes les réponses a un commentaire
const fetchReplies = async () => {
  try {
    const response = await userStore.responsesForComment(props.commentId);

    const fetchedReplies = response.data || []

    for (const reply of fetchedReplies) {
        // Affichez la réponse et l'ID de la réaction AVANT de les modifier
        const userReaction = await userStore.reactionComment(reply.id)
       
        if(userReaction && typeof userReaction === 'object' && userReaction.type && userReaction.id) {
            reply.userReaction = userReaction.type
            reply.userReactionId = userReaction.id
        } else {
            reply.userReaction = null
            reply.userReactionId = null
           
        }
    }
    replies.value = fetchedReplies;
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses :', error.response?.data);
  }
};


// Fonction pour soumettre une nouvelle réponse ou creez une réponse pour le commentaire
async function submitReply() {
  if (!newReplyContent.value.trim() || isSubmittingReply.value) return;
  
  isSubmittingReply.value = true;
  
  try {
    const formData = new FormData();
    formData.append('id_commentaire', props.commentId);
    formData.append('description', newReplyContent.value);
    console.log('Contenu de la description envoyée :', newReplyContent.value); // Ligne de débogage 

    await userStore.responseComment(formData);

    newReplyContent.value = '';
    await fetchReplies();
    
  } catch (error) {
    console.error(
      "Erreur lors de la soumission de la réponse :", 
      error.response ? error.response.data : error.message
    );
  } finally {
    isSubmittingReply.value = false;
  }
}

// Fonction pôur gérer les réactions aux réponses commentaire
async function toggleReplyReaction(replyId, reactionType) {
  if (reactingReplies.value.has(replyId)) return;

  reactingReplies.value.add(replyId);

  try {
    const reply = replies.value.find(r => r.id === replyId);
    if (!reply) {
      console.error('Réaction non trouvé');
      return;
    }

    const currentUserReaction = reply.userReaction;
    const currentReactionId = reply.userReactionId;

    // CAS 1: Suppression
    if (currentUserReaction === reactionType && currentReactionId) {
      await userStore.deleteReaction(currentReactionId);
    }
    // CAS 2: Mise à jour
    else if (currentUserReaction && currentReactionId) {
      const payload = new FormData();
      payload.append('type', reactionType);
      await userStore.updateReaction(currentReactionId, payload);
    }
    // CAS 3: Création
    else {
      const formdata = new FormData();
      formdata.append('id_comment', replyId);
      formdata.append('type', reactionType);
      await reactComment(formdata);
    }

    // Recharger systématiquement les commentaires pour mettre à jour les réactions
    await fetchReplies();

  } catch (error) {
    console.error('Erreur lors de la réaction au commentaire:', error);
    // En cas d'erreur, recharger aussi pour assurer la cohérence
    await fetchReplies();
  } finally {
    reactingReplies.value.delete(replyId);
  }
}

onMounted(() =>{
    fetchReplies()
})

</script>

<template>
  <div class="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
    <!-- Formulaire de réponse -->
    <div class="flex space-x-3">
      <UserAvatar :username="userStore.user?.username || 'Moi'" size="xs" />
      <div class="flex-1">
        <textarea
          v-model="newReplyContent"
          placeholder="Répondre à ce commentaire..."
          class="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
          rows="2"
          maxlength="250"
        ></textarea>
        <div class="flex justify-end mt-1">
          <button
            @click="submitReply"
            :disabled="!newReplyContent.trim() || isSubmittingReply || newReplyContent.length > 250"
            class="px-4 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmittingReply ? 'Envoi...' : 'Répondre' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des réponses -->
    <div v-if="replies.length > 0" class="space-y-3">
      <div v-for="reply in replies" :key="reply.id" class="flex space-x-3">
        <UserAvatar :username="reply.username || 'Utilisateur'" size="xs" />
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-medium text-sm text-gray-900 truncate">{{ reply.username || 'Utilisateur' }}</span>
            <span class="text-gray-500 text-xs">{{ timeAgo(reply.date_creation || new Date()) }}</span>
          </div>
          <div class="bg-gray-100 rounded-lg p-2 mb-2">
            <p class="text-sm text-gray-800 leading-relaxed break-words">{{ reply.description }}</p>
          </div>
          <!-- Boutons de réaction pour les réponses -->
          <ReactionButtons
            reactionType="comment"
            :reactions="{ type: reply.userReaction, id: reply.userReactionId }"
            :reacting="reactingReplies.has(reply.id)"
            @toggle-reaction="(type) => toggleReplyReaction(reply.id, type)"
          />
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 text-sm py-2">
      Aucune réponse pour l'instant.
    </div>
  </div>
</template>


<style scoped>

</style>