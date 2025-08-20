<script setup>
import { ref, onMounted, onUpdated } from 'vue';
import { getPublications, getImagePublications, createPublication,
  commentPub, getCommentByPublicationId, reactPub, reactComment,
  getMyPublication,
  getPublicationById
} from '../services/api';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

import PublicationForm from '../components/publications/PublicationForm.vue';
import PublicationList from '../components/publications/PublicationList.vue';
import UserProfileCard from '../components/sidebar/UserProfileCard.vue';
import FollowedUsers from '../components/sidebar/FollowedUsers.vue';
import SuggestedUsers from '../components/sidebar/SuggestedUsers.vue';
import UserInfos from '../components/publications/UserInfos.vue';
import NotificationsList from '../components/notifications/NotificationsList.vue';
import UserAvatar from '../components/publications/UserAvatar.vue';

const users = ref([]);
const usersfollow = ref([]);
const publications = ref([]);
const pubImages = ref({});
const router = useRouter();
const isLoading = ref(true);

// Afficher le profil et les publications de l'utilisateur
const showProfile = ref(false);
const userInfos = ref({});

// États pour les commentaires et réactions (maintenus ici car ils sont globaux aux publications)
const newComments = ref({});
const showCommentInput = ref({});
const isCommenting = ref({});
const comments = ref({});
const reactions = ref({});
const reactingPublications = ref(new Set());
const reactingComments = ref(new Set());
const isCreatingPost = ref(false);

// NOuveaux états pour gerer les réponses aux commentaires (laissés ici pour l'instant)
const replyInputs = ref({});
const editInputs = ref({});
const showReplies = ref({});
const isReplying = ref({});
const isEditing = ref({});
const isDeleting = ref({});
const subReplies = ref({});
const replyToReplyComment = ref({});
const isReplyingToReply = ref({});

const isMobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const userStore = useUserStore();

// Données statiques pour la sidebar (notifications)
const notifications = ref([
  { text: 'John a aimé votre publication', time: '2 min ago' },
  { text: 'Marie a commenté votre photo', time: '1h ago' },
  { text: 'Nouveau message de David', time: '3h ago' },
  { text: 'Votre publication a 10 likes', time: '1 day ago' }
]);

// fonction pour afficher/masque le profil et les publications
function handleclick() {
  showProfile.value = !showProfile.value;

  if (showProfile.value) {
    loadMyPublications();
    fetchInfosUser();
  } else {
    loadAllPublications();
  }
}

// Fonction pour charger les publications du fil d'actualité général
async function loadAllPublications() {
  try {
    isLoading.value = true;
    const res = await getPublications();
    publications.value = res.data && Array.isArray(res.data) ? res.data : [];

    if (publications.value.length > 0) {
      for (const pub of publications.value) {
        await fetchComments(pub.id);
        await fetchPublicationReactions(pub.id);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des publications générales:", error);
    publications.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Fonction pour charger les publications de l\'utilisateur connecté
async function loadMyPublications() {
  try {
    isLoading.value = true;
    const myPublications = await getMyPublication();
    publications.value = myPublications.data || [];

    if (publications.value.length > 0) {
      for (const pub of publications.value) {
        await fetchComments(pub.id);
        await fetchPublicationReactions(pub.id);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des publications de l\'utilisateur:", error);
    publications.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Fonction pour récupérer les réactions d\'une publication
async function fetchPublicationReactions(pubId) {
  try {
    const userReaction = await userStore.reactionPub(pubId);
    if (userReaction) {
      reactions.value[pubId] = {
        type: userReaction.type,
        id: userReaction.id
      };
    } else {
      reactions.value[pubId] = {
        type: null,
        id: null
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des réactions :", error.response?.data || error.message || error);
  }
}

// Récupérer la liste des commentaires pour une publication
async function fetchComments(pubId) {
  try {
    const response = await getCommentByPublicationId(pubId);
    comments.value[pubId] = response.data || [];

    for (const comment of comments.value[pubId]) {
      const userReaction = await userStore.reactionComment(comment.id);
      if (userReaction && typeof userReaction === 'object' && userReaction.type && userReaction.id) {
        comment.userReaction = userReaction.type;
        comment.userReactionId = userReaction.id;
      } else {
        comment.userReaction = null;
        comment.userReactionId = null;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error.response?.data || error.message || error);
  }
}

// Fonction pour créer une publication
async function createPost(newPubData) {
  isCreatingPost.value = true;

  try {
    const formdata = new FormData();
    formdata.append('titre', newPubData.titre.trim());
    formdata.append('description', newPubData.description.trim());

    const response = await createPublication(formdata);

    const newPub = {
      ...response.data,
      date_creation: new Date().toISOString()
    };

    publications.value.unshift(newPub);

    reactions.value[newPub.id] = { type: null, id: null };
    comments.value[newPub.id] = [];

    // Mettre à jour le compteur de commentaires dans le store
    await userStore.getCountPublications();

  } catch (error) {
    console.error("Une erreur est survenue :", error.response?.data || error.message || error);
  } finally {
    isCreatingPost.value = false;
  }
}

// Fonction pour commenter une publication
async function commentPublication(pubId) {
  const descriptionText = newComments.value[pubId];
  if (!descriptionText?.trim()) return;

  isCommenting.value[pubId] = true;

  try {
    const formData = new FormData();
    formData.append('id_publication', pubId);
    formData.append('description', descriptionText.trim());

    const response = await commentPub(formData);

    if (!comments.value[pubId]) {
      comments.value[pubId] = [];
    }

    const newCommentObj = {
      id: response.data.id,
      description: descriptionText.trim(),
      date_creation: new Date().toISOString(),
      userReaction: null,
      userReactionId: null
    };

    comments.value[pubId].unshift(newCommentObj);
    newComments.value[pubId] = '';
    showCommentInput.value[pubId] = false;

    // Mettre à jour le compteur de commentaires dans le store
    await userStore.getCountCommentaire();

  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isCommenting.value[pubId] = false;
  }
}

// Fonction pour réagir à une publication
async function togglePublicationReaction(pubId, reactionType) {
  if (reactingPublications.value.has(pubId)) return;

  reactingPublications.value.add(pubId);

  const originalReaction = { ...reactions.value[pubId] };

  try {
    const currentReaction = reactions.value[pubId];
    const currentType = currentReaction?.type;
    const currentId = currentReaction?.id;

    if (currentType === reactionType && currentId) {
      // Mise à jour optimiste : supprime la réaction
      reactions.value[pubId] = { type: null, id: null };
      await userStore.deleteReaction(currentId);


    // Mettre à jour le compteur de commentaires dans le store
    await userStore.getCountReactions();

    } else if (currentType && currentId) {
      // Mise à jour optimiste : change la réaction
      reactions.value[pubId] = { ...reactions.value[pubId], type: reactionType };
      const formData = new FormData();
      formData.append('id_publication', pubId);
      formData.append('type', reactionType);
      await userStore.updateReaction(currentId, formData);
    } else {
      // Mise à jour optimiste : ajoute une nouvelle réaction
      reactions.value[pubId] = { ...reactions.value[pubId], type: reactionType };
      const formData = new FormData();
      formData.append('id_publication', pubId);
      formData.append('type', reactionType);
      await reactPub(formData);

      // Re-fetch pour obtenir le nouvel ID de la réaction
      await fetchPublicationReactions(pubId);

    // Mettre à jour le compteur de commentaires dans le store
      await userStore.getCountReactions();

    }

  } catch (error) {
    console.error("Erreur lors de la réaction à la publication :", error.response?.data || error.message || error);
    // En cas d\'erreur, annuler la mise à jour optimiste
    reactions.value[pubId] = originalReaction;
  } finally {
    reactingPublications.value.delete(pubId);
  }
}

// Fonction pour réagir à un commentaire
async function toggleCommentReaction(commentId, reactionType) {
  if (reactingComments.value.has(commentId)) return;

  reactingComments.value.add(commentId);

  // Trouver le commentaire et sa publication parente
  let comment = null;
  let pubId = null;
  
  for (const [id, commentList] of Object.entries(comments.value)) {
    comment = commentList.find(c => c.id === commentId);
    if (comment) {
      pubId = id;
      break;
    }
  }

  if (!comment) {
    console.error('Commentaire non trouvé');
    reactingComments.value.delete(commentId);
    return;
  }

  // Sauvegarde de l\'état original pour rollback si erreur
  const originalState = {
    reaction: comment.userReaction,
    reactionId: comment.userReactionId
  };

  try {
    const currentReaction = comment.userReaction;
    const currentReactionId = comment.userReactionId;

    // Cas 1: Suppression si même réaction cliquée
    if (currentReaction === reactionType && currentReactionId) {
      comment.userReaction = null;
      comment.userReactionId = null;
      await userStore.deleteReaction(currentReactionId);


    // Mettre à jour le compteur de commentaires dans le store
      await userStore.getCountReactions();

      return;
    }

    // Cas 2: Modification si réaction différente existe déjà
    if (currentReactionId) {
      comment.userReaction = reactionType;
      const formData = new FormData();
      formData.append('type', reactionType);
      await userStore.updateReaction(currentReactionId, formData);
      return;
    }

    // Cas 3: Nouvelle réaction
    comment.userReaction = reactionType;
    const formData = new FormData();
    formData.append('id_comment', commentId);
    formData.append('type', reactionType);
    
    const response = await reactComment(formData);


    // Gestion de la réponse
    if (response?.data?.id) {
      comment.userReactionId = response.data.id;
    } else {
      // Fallback si l\'API ne retourne pas l\'ID
      const freshReaction = await userStore.reactionComment(commentId);
      if (freshReaction) {
        comment.userReaction = freshReaction.type;
        comment.userReactionId = freshReaction.id;
      }
    }

    // Mettre à jour le compteur de commentaires dans le store
    await userStore.getCountReactions();

  } catch (error) {
    // Rollback en cas d\'erreur
    console.error('Erreur réaction commentaire:', {
      error,
      commentId,
      reactionType,
      currentState: originalState
    });
    
    comment.userReaction = originalState.reaction;
    comment.userReactionId = originalState.reactionId;
    
  } finally {
    reactingComments.value.delete(commentId);
  }
}

// Fonction pour gérer le scroll des colonnes
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

onUpdated(() => {
  setupColumnScrolling();
});

onMounted(async () => {
  try {
    await loadAllPublications();

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
        } else {
          pubImages.value = {};
          console.error('Unexpected image data format:', imageRes.data.photo);
        }
      }
      setupColumnScrolling();
      await fetchUser();
      await fetchfollowUser();
      await fetchInfosUser();
    } catch (imageErr) {
      console.error('Erreur lors de la récupération des images des publications', imageErr);
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des publications');
    pubImages.value = {};
  } finally {
    isLoading.value = false;
  }
});

const getPubImage = (pubId) => {
  const image = pubImages.value[pubId];
  if (image && image.photo) {
    return formatBase64Image(image.photo);
  }
  return '';
};

function formatBase64Image(base64String) {
  if (!base64String) {
    return '';
  }
  return `data:image/jpeg;base64,${base64String}`;
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}

// Fonctions utilitaires
const toggleCommentInput = (pubId) => {
  showCommentInput.value[pubId] = !showCommentInput.value[pubId];
  if (showCommentInput.value[pubId]) {
    newComments.value[pubId] = '';
  }
};

const cancelComment = (pubId) => {
  showCommentInput.value[pubId] = false;
  newComments.value[pubId] = '';
};

const goBack = () => {
  router.push('/');
};

// Fonction pour récuperer toutes les réponses a une réponse commentaire
const fetchReplies = async (commentId) => {
  try {
    const replies = await userStore.getResponsesForComment(commentId);
    subReplies.value[commentId] = replies;
    showReplies.value[commentId] = true;
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses :', error);
  }
};


// Fonction pour récuperer une réponse commentaire
async function fetchReply(commentId, replyToCommentId) {
  try {
    const response = await userStore.getResponseForComment(commentId, replyToCommentId);
    return response.data || null;
  } catch (error) {
    console.error("Erreur lors de la récupération d\'une réponse de commentaire :", error.response?.data || error.message || error);
    return null;
  }
}


// Fonction pour répondre a un commentaire
async function replyToComment(commentId) {
  const replyText = replyInputs.value[commentId];
  if (!replyText?.trim()) return;

  isReplying.value[commentId] = true;

  try {
    const formData = new FormData();
    formData.append('id_commentaire', commentId);
    formData.append('description', replyText.trim());
    const response = await userStore.responseComment(formData);

    await fetchReplies(commentId); // Recharge les réponses
    replyInputs.value[commentId] = '';
  } catch (error) {
    console.error("Erreur lors de la réponse au commentaire :", error);
  } finally {
    isReplying.value[commentId] = false;
  }
}

// Fonction pour répondre à une réponse de commentaire
async function replyToSubReplies(commentId, replyToCommentId) {
  const replyText = replyToReplyComment.value[replyToCommentId];
  if (!replyText?.trim()) return;

  isReplyingToReply.value[replyToCommentId] = true;

  try {
    const formData = new FormData();
    formData.append('id_response_commentaire', commentId);
    formData.append('description', replyText.trim());
    const response = await userStore.replyToResponseComment(formData);

    await fetchReplies(commentId); // Recharge les réponses
    replyToReplyComment.value[replyToCommentId] = '';
  } catch (error) {
    console.error("Erreur lors de la réponse à une réponse de commentaire :", error);
  } finally {
    isReplyingToReply.value[replyToCommentId] = false;
  }
}

// Fonction pour récuperer tous les utilisateurs 
async function fetchUser() {
  try {
    const response = await userStore.recupererUserAvailaibles();
    
    if (response && Array.isArray(response)) {
      users.value = response.map(user => ({
        ...user,
        photoUrl: user.photo ? formatBase64Image(user.photo) : null
      }));

      // ✅ Vérification des champs reçus
      // console.log("Utilisateurs récupérés :", users.value);
    } else {
      console.error("Format de données inattendu:", response);
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
  }
}

// Fonction pour suivre un utilisateur
async function followUser(userId) {
  try {
    await userStore.followUser(userId);
    // Recharger les listes pour refléter le changement
    await fetchfollowUser();
    await fetchUser();

    // Mettre à jour le compteur des abonnes de l'utilisateur dans le store
    await userStore.recupererCountFollowerForUser(userId);

    // Mettre à jour le compteur des utilisateur suivi de l'utilisateur courant
    await userStore.recupererCountFollowerUser();

  } catch (error) {
    console.error("Une erreur est survenue lors du suivi de l\'utilisateur", error);
  }
}

// Fonction pour récuperer followers d'un utilisateur
async function fetchfollowUser() {
  try {
    const response = await userStore.recupererFollowersUser()
    usersfollow.value = response
    // console.log("Utilisateurs suivis récupérés avec succès :" ,usersfollow.value)

     // Mettre à jour le compteur des abonnes de l'utilisateur dans le store
    await userStore.recupererCountFollowerForUser();
  } catch (error) {
    console.error("Une erreur est survenue lors de la récuperzation des followers:", error.response?.data || error.message)
  }
}

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}


// Supprimer un suivi utilisateur  
async function unfollowUser(suiviId) {
  try {
    // Mise à jour optimiste pour une réactivité instantan\u00e9e
    const index = usersfollow.value.findIndex(u => u.id === suiviId);
    if (index !== -1) {
      usersfollow.value.splice(index, 1);
    }

    await userStore.supprimerFollowerUser(suiviId);

    // Rafraîchir les deux listes pour assurer la cohérence avec le serveur
    await fetchfollowUser();
    await fetchUser();

     // Mettre à jour le compteur des abonnes de l'utilisateur dans le store
    await userStore.recupererCountFollowerForUser();
  } catch (error) {
    console.error("une erreur est survenue lors de la suppression du follower:", error.response?.data);
    // En cas d\'erreur, recharger pour annuler la mise à jour optimiste
    await fetchfollowUser();
    await fetchUser();
  }
}

// fonction pour charger les informations de l\'utilisateur
async function fetchInfosUser() {
  try {
    const infouser = await userStore.fetchUserInfos()
    userInfos.value = infouser.data
    // console.log("Informations utilisateur récupérées avec succès :", userInfos.value);
  } catch (error) {
    console.error("Erreur lors de la récuperation des infos de l'utilisateur", error.response?.data)
  }
}

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
          
          <!-- Bouton menu mobile -->
          <button @click="toggleMobileMenu" class="lg:hidden text-gray-600 hover:text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-8xl mx-auto px-4 sm:px-6 py-6">
      <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-104px)]">
        
        <!-- Colonne de gauche - Mobile first: cachée par défaut, visible avec menu -->
        <div 
          class="fixed inset-0 bg-white z-40 transform lg:relative lg:transform-none lg:block w-full lg:w-1/6 space-y-6 p-6 lg:p-0 lg:h-full overflow-y-auto transition-transform duration-300 lg:translate-x-0"
          :class="{'translate-x-full': !isMobileMenuOpen, 'translate-x-0': isMobileMenuOpen}"
        >
          <!-- Bouton fermer pour mobile -->
          <button @click="toggleMobileMenu" class="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <UserProfileCard :userInfos="userInfos" :handleclick="handleclick" />

          <FollowedUsers :usersfollow="usersfollow" :formatDate="formatDate" :unfollowUser="unfollowUser" />
        </div>

        <!-- Colonne centrale - Largeur adaptative -->
        <div class="w-full lg:w-3/6 flex flex-col gap-6 lg:h-full">
          <!-- Vue Profil (affichée quand showProfile est true) -->
          <template v-if="showProfile">
            <UserInfos :user="userInfos" />

            <div class="flex-1 overflow-y-auto min-h-0">
              <PublicationList
                :publications="publications"
                :isLoading="isLoading"
                :getPubImage="getPubImage"
                :timeAgo="timeAgo"
                :reactions="reactions"
                :reactingPublications="reactingPublications"
                :togglePublicationReaction="togglePublicationReaction"
                :comments="comments"
                :showCommentInput="showCommentInput"
                :newComments="newComments"
                :isCommenting="isCommenting"
                :reactingComments="reactingComments"
                :toggleCommentInput="toggleCommentInput"
                :cancelComment="cancelComment"
                :commentPublication="commentPublication"
                :toggleCommentReaction="toggleCommentReaction"
              />
            </div>
          </template>

          <!-- Vue normale (affichée quand showProfile est false) -->
          <template v-else>
            <PublicationForm :isCreatingPost="isCreatingPost" @create-post="createPost" />

            <div class="flex-1 overflow-y-auto min-h-0">
              <PublicationList
                :publications="publications"
                :isLoading="isLoading"
                :getPubImage="getPubImage"
                :timeAgo="timeAgo"
                :reactions="reactions"
                :reactingPublications="reactingPublications"
                :togglePublicationReaction="togglePublicationReaction"
                :comments="comments"
                :showCommentInput="showCommentInput"
                :newComments="newComments"
                :isCommenting="isCommenting"
                :reactingComments="reactingComments"
                :toggleCommentInput="toggleCommentInput"
                :cancelComment="cancelComment"
                :commentPublication="commentPublication"
                :toggleCommentReaction="toggleCommentReaction"
              />
            </div>
          </template>
        </div>

        <!-- Colonne Notifications (masquée sur mobile et tablette) -->
        <div class="hidden xl:block w-1/6 space-y-6 lg:h-full overflow-y-auto">
          <NotificationsList :notifications="notifications" />

          <!-- Advertisement optimisé -->
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Publicité</h3>
            <div class="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 sm:p-6 text-white text-center">
              <h4 class="font-bold text-lg sm:text-xl mb-1 sm:mb-2">RICE</h4>
              <p class="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">Découvrez nos produits innovants</p>
              <button class="bg-white text-orange-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-xs sm:text-sm">
                En savoir plus
              </button>
            </div>
          </div>
        </div>

        <!-- Colonne des Utilisateurs -->
        <div class="hidden xl:block w-1/6 space-y-6 lg:h-full overflow-y-auto">
          <SuggestedUsers :users="users" :followUser="followUser" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base améliorés */
*{
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
  
  /* Réduire l\'espacement entre les éléments */
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
