<script setup>
import { ref, onMounted, onUpdated } from 'vue';
import { getPublications, getImagePublications, createPublication,
  commentPub, getCommentByPublicationId, reactPub, reactComment,
  getMyPublication,
  getPublicationById
} from '../services/api';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const users = ref([])
const usersfollow = ref([])
const publications = ref([]);
const pubImages = ref({});
const router = useRouter();
const isLoading = ref(true);

// Afficher le profil et les publications de l'utilisateur
const showProfile = ref(false)
const userProfile = ref([])
const userPublications = ref([])
const userInfos = ref([])
const pub = ref({
  titre: '',
  description: ''
});
const newComments = ref({});
const showCommentInput = ref({});
const isCommenting = ref({});
const comments = ref({});
const reactions = ref({}); // Pour stocker les réactions par publication ID
const commentReactions = ref({}); // Pour stocker les réactions aux commentaires
const reactingPublications = ref(new Set()); // Publications en cours de réaction
const reactingComments = ref(new Set()); // Commentaires en cours de réaction
const isCreatingPost = ref(false); // État de création de post

// NOuveaux états pour gerer les réponses aux commentaires
const replyInputs = ref({})
const editInputs = ref({})
const showReplies = ref({});
const isReplying = ref({}); // Pour gérer l'état de réponse aux commentaires
const isEditing = ref({}); // Pour gérer l'état d'édition des réponses
const isDeleting = ref({}); // Pour gérer l'état de suppression des réponses
const subReplies = ref({}); // Pour stocker les sous-réponses aux commentaires
const replyToReplyComment = ref({}); // Pour stocker les réponses aux réponses commentaires
const isReplyingToReply = ref({}); // Pour gérer l'état de réponse aux réponses commentaires
const userStore = useUserStore();

// Données statiques pour la sidebar
const sidebarItems = ref([
  { name: 'Tech Community', category: 'Technology', liked: true },
  { name: 'Design Hub', category: 'Design', liked: false },
  { name: 'Startup News', category: 'Business', liked: true },
  { name: 'Photo Club', category: 'Photography', liked: false }
]);

const notifications = ref([
  { text: 'John a aimé votre publication', time: '2 min ago' },
  { text: 'Marie a commenté votre photo', time: '1h ago' },
  { text: 'Nouveau message de David', time: '3h ago' },
  { text: 'Votre publication a 10 likes', time: '1 day ago' }
]);

// fonction pour afficher/masque le profil et les publications
function handleclick() {
  showProfile.value =! showProfile.value

  if(showProfile.value) {
    // Si on affiche le profil, on charge les publications de l'utilisateur
    loadMyPublications()
    fetchInfosUser()
  } else {
    // Si on retourne au fil d'actualité, on charge toutes les publications
    loadAllPublications()
  }
}

// Fonction pour charger les publications du fil d'actualité général
async function loadAllPublications() {
  try {
    isLoading.value = true;
    const res = await getPublications();
    publications.value = res.data && Array.isArray(res.data) ? res.data : [];
    
    // Après avoir chargé les publications, chargez leurs dépendances
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

// Fonction pour charger les publications de l'utilisateur connecté
async function loadMyPublications() {
  try {
    isLoading.value = true;
    const myPublications = await fetchMyPublications();
    publications.value = myPublications || [];
    
    // Après avoir chargé les publications, chargez leurs dépendances
    if (publications.value.length > 0) {
      for (const pub of publications.value) {
        await fetchComments(pub.id);
        await fetchPublicationReactions(pub.id);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des publications de l'utilisateur:", error);
    publications.value = [];
  } finally {
    isLoading.value = false;
  }
}


// Fonction pour récupérer les réactions d'une publication
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

    // Récupérer les réactions pour chaque commentaire
    for (const comment of comments.value[pubId]) {
      const userReaction = await userStore.reactionComment(comment.id);
      if (userReaction) {
        comment.userReaction = userReaction.type;
        comment.userReactionId = userReaction.id;
        commentReactions.value[comment.id] = userReaction.type;
      } else {
        comment.userReaction = null;
        comment.userReactionId = null;
        commentReactions.value[comment.id] = null;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error.response?.data || error.message || error);
  }
}

// Fonction pour créer une publication
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
    
    // Ajouter la nouvelle publication au début
    const newPub = {
      ...response.data,
      date_creation: new Date().toISOString()
    };
    
    publications.value.unshift(newPub);
    
    // Initialiser les réactions et commentaires pour la nouvelle publication
    reactions.value[newPub.id] = { type: null, id: null };
    comments.value[newPub.id] = [];
    
    // Réinitialiser le formulaire
    pub.value = {
      titre: '',
      description: ''
    };
    
  } catch (error) {
    console.error("Une erreur est survenue :", error.response?.data || error.message || error);
  } finally {
    isCreatingPost.value = false;
  }
}

// Fonction pour récuperer mes publications
async function fetchMyPublications() {
  try {
    const response = await getMyPublication()
    return response.data
  } catch (error) {
    console.error("Une erreur est survenue lors de la récupération des publications de l'utilisateur", error.response?.data)
  }
}

// Fonction pour récuperer une publication par son ID
async function fetchPublicationsById(pubId) {
  try {
    const response = await getPublicationById(pubId)
    return response.data
  } catch (error) {
    console.error("Une errreur est survenue lors de la récupération de la publication", error.response?.data)
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
    
    // Ajouter le nouveau commentaire
    const newCommentObj = {
      id: response.data.id,
      description: descriptionText.trim(),
      date_creation: new Date().toISOString(),
      userReaction: null,
      userReactionId: null
    };
    
    comments.value[pubId].unshift(newCommentObj);
    commentReactions.value[newCommentObj.id] = null;
    
    newComments.value[pubId] = '';
    showCommentInput.value[pubId] = false;
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isCommenting.value[pubId] = false;
  }
}

// Fonction pour réagir à une publication (similaire à l'événement)
async function togglePublicationReaction(pubId, reactionType) {
  if (reactingPublications.value.has(pubId)) return;

  reactingPublications.value.add(pubId);

  try {
    const currentReaction = reactions.value[pubId];
    const currentType = currentReaction?.type;
    const currentId = currentReaction?.id;

    // CAS 1: Suppression (clic sur la même réaction)
    if (currentType === reactionType && currentId) {
      await userStore.deleteReaction(currentId);
    }
    // CAS 2: Mise à jour (clic sur une réaction différente)
    else if (currentType && currentId) {
      const formData = new FormData();
      formData.append('id_publication', pubId);
      formData.append('type', reactionType);
      await userStore.updateReaction(currentId, formData);
    }
    // CAS 3: Création (aucune réaction existante)
    else {
      const formData = new FormData();
      formData.append('id_publication', pubId);
      formData.append('type', reactionType);
      await reactPub(formData);
    }

    // Recharger les réactions depuis le serveur
    await fetchPublicationReactions(pubId);

  } catch (error) {
    console.error("Erreur lors de la réaction à la publication :", error.response?.data || error.message || error);
    await fetchPublicationReactions(pubId);
  } finally {
    reactingPublications.value.delete(pubId);
  }
}

// Fonction pour réagir à un commentaire (similaire à l'événement)
async function toggleCommentReaction(commentId, reactionType) {
  if (reactingComments.value.has(commentId)) return;

  reactingComments.value.add(commentId);

  try {
    // Trouver le commentaire dans tous les commentaires
    let comment = null;
    let pubId = null;
    
    for (const [id, commentList] of Object.entries(comments.value)) {
      const foundComment = commentList.find(c => c.id === commentId);
      if (foundComment) {
        comment = foundComment;
        pubId = id;
        break;
      }
    }
    
    if (!comment) {
      console.error('Commentaire non trouvé');
      return;
    }

    const currentUserReaction = comment.userReaction;
    const currentReactionId = comment.userReactionId;

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
      formdata.append('id_comment', commentId);
      formdata.append('type', reactionType);
      await reactComment(formdata);
    }

    // Recharger les commentaires pour cette publication
    await fetchComments(pubId);

  } catch (error) {
    console.error('Erreur lors de la réaction au commentaire:', error);
    // Recharger en cas d'erreur pour assurer la cohérence
    if (pubId) await fetchComments(pubId);
  } finally {
    reactingComments.value.delete(commentId);
  }
}

// Fonction pour gérer le scroll des colonnes
function setupColumnScrolling() {
  const columns = document.querySelectorAll('.overflow-y-auto');
  
  columns.forEach(column => {
    // Supprime d'abord les anciens écouteurs pour éviter les doublons
    column.removeEventListener('wheel', handleWheel);
    column.addEventListener('wheel', handleWheel, { passive: false });
  });
}

function handleWheel(e) {
  // Vérifie si l'élément peut scroller
  if (this.scrollHeight > this.clientHeight) {
    const atTop = this.scrollTop === 0;
    const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1;
    
    // Empêche le scroll de la page seulement si nécessaire
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.preventDefault();
      // Ajoute un effet de momentum pour ralentir le scroll
      this.scrollTop += e.deltaY * 0.5;
    }
  }
}

onUpdated(() => {
  // Re-setup le scrolling si le DOM change
  setupColumnScrolling();
});

onMounted(async () => {
  try {
    // Par défaut, nous chargeons toutes les publications du fil d'actualité
    await loadAllPublications()

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
      await fetchInfosUser()
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
    console.error("Erreur lors de la récupération d'une réponse de commentaire :", error.response?.data || error.message || error);
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
      console.log("Utilisateurs récupérés :", users.value);
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
  } catch (error) {
    console.error("Une erreur est survenue lors du suivi de l'utilisateur", error);
  }
}

// Fonction pour récuperer followers d'un utilisateur
async function fetchfollowUser() {
  try {
    const response = await userStore.recupererFollowersUser()
    usersfollow.value = response
    console.log("Utilisateurs suivis récupérés avec succès :" ,usersfollow.value)
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
    // Mise à jour optimiste pour une réactivité instantanée
    const index = usersfollow.value.findIndex(u => u.id === suiviId);
    if (index !== -1) {
      usersfollow.value.splice(index, 1);
    }

    await userStore.supprimerFollowerUser(suiviId);

    // Rafraîchir les deux listes pour assurer la cohérence avec le serveur
    await fetchfollowUser();
    await fetchUser();
  } catch (error) {
    console.error("une erreur est survenue lors de la suppression du follower:", error.response?.data);
    // En cas d'erreur, recharger pour annuler la mise à jour optimiste
    await fetchfollowUser();
    await fetchUser();
  }
}

// fonction pour charger les informations de l'utilisateur
async function fetchInfosUser() {
  try {
    const infouser = await userStore.fetchUserInfos()
    userInfos.value = infouser
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
        
        <!-- Colonne de gauche - Mobile first: cachée par défaut, visible avec menu -->
        <div class="fixed inset-0 bg-white z-40 transform lg:relative lg:transform-none lg:block w-full lg:w-1/6 space-y-6 p-6 lg:p-0 lg:h-full overflow-y-auto transition-transform duration-300 translate-x-full lg:translate-x-0">
          <!-- Bouton fermer pour mobile -->
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
                  <!-- Photo de profil ou logo par défaut -->
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
              
              <!-- Message si aucun utilisateur suivi -->
              <div v-if="usersfollow.length === 0" class="text-center py-4">
                <p class="text-gray-500 text-sm">Vous ne suivez aucun utilisateur pour le moment.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne centrale - Largeur adaptative -->
        <div class="w-full lg:w-3/6 flex flex-col gap-6 lg:h-full">
          <!-- Vue Profil (affichée quand showProfile est true) -->
          <template v-if="showProfile">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0 overflow-y-auto">
              <!-- Section supérieure : Informations du profil -->
              <div class="p-6">
                <div class="text-center">
                  <div class="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h3 class="font-semibold text-gray-900 text-xl mb-1">{{  userInfos.username }}</h3>
                  <p class="text-sm text-gray-600 mb-4">
                    Membre depuis le 15 janvier 2023
                  </p>
                  <div class="flex justify-center space-x-4">
                    <div class="text-center">
                      <p class="font-bold text-gray-900">128</p>
                      <p class="text-xs text-gray-500">Publications</p>
                    </div>
                    <div class="text-center">
                      <p class="font-bold text-gray-900">542</p>
                      <p class="text-xs text-gray-500">Abonnés</p>
                    </div>
                    <div class="text-center">
                      <p class="font-bold text-gray-900">324</p>
                      <p class="text-xs text-gray-500">Abonnements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section inférieure : Publications de l'utilisateur -->
            <div class="flex-1 overflow-y-auto space-y-6">
              <!-- Feed des publications optimisé mobile -->
              <div v-if="isLoading" class="space-y-6">
                <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div class="flex-1">
                      <div class="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 mb-2 animate-pulse"></div>
                      <div class="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div class="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div class="h-40 sm:h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                </div>
              </div>

              <div v-else-if="publications.length > 0" class="space-y-6">
                <article v-for="(publication, index) in publications" :key="publication.id || index" 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <!-- En-tête du post optimisé mobile -->
                  <div class="p-4 sm:p-6 pb-3 sm:pb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate">{{ publication.username || 'Utilisateur' }}</h3>
                        <p class="text-xs sm:text-sm text-gray-500">{{ timeAgo(publication.date_creation || new Date()) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Contenu du post optimisé mobile -->
                  <div class="px-4 sm:px-6 pb-3 sm:pb-4">
                    <h2 class="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{{ publication.titre }}</h2>
                    <div class="prose prose-sm max-w-none">
                      <p class="text-gray-700 leading-relaxed text-sm sm:text-base">{{ publication.description }}</p>
                    </div>
                  </div>

                  <!-- Image optimisée mobile -->
                  <div v-if="getPubImage(publication.id)" class="px-0 sm:px-6 pb-3 sm:pb-4">
                    <div class="relative overflow-hidden rounded-lg sm:rounded-lg">
                      <img 
                        :src="getPubImage(publication.id)" 
                        alt="Publication Image" 
                        class="w-full h-48 sm:h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
                      >
                    </div>
                  </div>

                  <!-- Section des réactions optimisée mobile -->
                  <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-200">
                    <div class="grid grid-cols-2 sm:flex flex-wrap gap-1 sm:gap-2 md:gap-3">
                      <button 
                        @click="togglePublicationReaction(publication.id, 'like')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            :fill="reactions[publication.id]?.type === 'like' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'aime</span>
                        <div v-if="reactingPublications.has(publication.id)" class="w-3 h-3 sm:w-4 sm:h-4">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'adore')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            :fill="reactions[publication.id]?.type === 'adore' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'adore</span>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'smile')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            :fill="reactions[publication.id]?.type === 'smile' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">Amusant</span>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'heart')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            :fill="reactions[publication.id]?.type === 'heart' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'aime pas</span>
                      </button>
                    </div>
                  </div>

                  <!-- Section Commentaires optimisée mobile -->
                  <div class="border-t border-gray-100">
                    <!-- Bouton pour afficher/masquer les commentaires -->
                    <div class="px-4 sm:px-6 py-3 bg-gray-50">
                      <button 
                        @click="toggleCommentInput(publication.id)"
                        class="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors w-full justify-center sm:justify-start"
                      >
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span class="font-medium text-sm sm:text-base">
                          {{ comments[publication.id]?.length || 0 }} commentaire{{ (comments[publication.id]?.length || 0) > 1 ? 's' : '' }}
                        </span>
                      </button>
                    </div>

                    <!-- Formulaire de commentaire optimisé mobile -->
                    <div v-if="showCommentInput[publication.id]" class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                      <div class="flex space-x-2 sm:space-x-3">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <textarea
                            v-model="newComments[publication.id]"
                            placeholder="Écrivez votre commentaire..."
                            class="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm sm:text-base"
                            rows="2"
                            maxlength="300"
                          ></textarea>
                          <div class="flex justify-between items-center mt-2 sm:mt-3">
                            <span class="text-xs sm:text-sm text-gray-500">{{ (newComments[publication.id] || '').length }}/300</span>
                            <div class="flex space-x-1 sm:space-x-2">
                              <button 
                                @click="cancelComment(publication.id)"
                                class="px-3 py-1 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm transition-colors"
                              >
                                Annuler
                              </button>
                              <button 
                                @click="commentPublication(publication.id)"
                                :disabled="!newComments[publication.id]?.trim() || isCommenting[publication.id]"
                                class="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm transition-all flex items-center"
                              >
                                <svg v-if="isCommenting[publication.id]" class="animate-spin -ml-1 mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {{ isCommenting[publication.id] ? 'Publication...' : 'Publier' }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Liste des commentaires optimisée mobile -->
                    <div v-if="comments[publication.id]?.length > 0 && showCommentInput[publication.id]" class="border-t border-gray-100">
                      <div class="max-h-48 sm:max-h-64 overflow-y-auto">
                        <div v-for="(comment, commentIndex) in comments[publication.id]" 
                            :key="comment.id || commentIndex" 
                            class="border-b border-gray-50 last:border-b-0">
                          <div class="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                            <div class="flex space-x-2 sm:space-x-3">
                              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                              </div>
                              
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center space-x-1 sm:space-x-2 mb-1">
                                  <span class="font-medium text-xs sm:text-sm text-gray-900 truncate">{{ publication.username || 'Utilisateur' }}</span>
                                  <span class="text-gray-500 text-xxs sm:text-xs">{{ timeAgo(comment.date_creation || new Date()) }}</span>
                                </div>
                                
                                <div class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                  <p class="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{{ comment.description }}</p>
                                </div>
                                
                                <!-- Système de réactions pour commentaires optimisé mobile -->
                                <div class="flex items-center flex-wrap gap-1 sm:gap-2">
                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'like')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                        :fill="comment.userReaction === 'like' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Like</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'adore')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        :fill="comment.userReaction === 'adore' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Adore</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'smile')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        :fill="comment.userReaction === 'smile' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Smile</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'heart')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                                        :fill="comment.userReaction === 'heart' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Dislike</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Message si aucune publication optimisé mobile -->
              <div v-else-if="!isLoading" class="text-center py-8 sm:py-16">
                <div class="bg-white rounded-xl p-6 sm:p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Aucune publication</h3>
                  <p class="text-sm sm:text-base text-gray-600">Soyez le premier à partager quelque chose !</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Vue normale (affichée quand showProfile est false) -->
          <template v-else>
            <!-- Champ de création de post optimisé mobile -->
            <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 flex-shrink-0 overflow-y-auto">
              <div class="flex items-start space-x-3 sm:space-x-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div class="flex-1 space-y-3 sm:space-y-4">
                  <input
                    v-model="pub.titre"
                    placeholder="Titre de votre publication"
                    class="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base"
                    type="text"
                    maxlength="100"
                  >
                  
                  <textarea 
                    v-model="pub.description"
                    placeholder="Partagez quelque chose d'intéressant..."
                    class="w-full p-3 sm:p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base"
                    rows="2"
                    maxlength="500"
                  ></textarea>
                  
                  <div class="flex items-center justify-between">
                    <div class="text-xs sm:text-sm text-gray-500">
                      <span>{{ pub.titre.length }}/100</span> - 
                      <span>{{ pub.description.length }}/500</span>
                    </div>
                    <button 
                      @click="createPost"
                      :disabled="!pub.titre.trim() || !pub.description.trim() || isCreatingPost"
                      class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center text-sm sm:text-base"
                    >
                      <svg v-if="isCreatingPost" class="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isCreatingPost ? 'Publication...' : 'PUBLIER' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feed des publications optimisé mobile -->
            <div class="flex-1 overflow-y-auto space-y-6">
              <div v-if="isLoading" class="space-y-6">
                <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div class="flex-1">
                      <div class="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 mb-2 animate-pulse"></div>
                      <div class="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div class="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div class="h-40 sm:h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                </div>
              </div>

              <div v-else-if="publications.length > 0" class="space-y-6">
                <article v-for="(publication, index) in publications" :key="publication.id || index" 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <!-- En-tête du post optimisé mobile -->
                  <div class="p-4 sm:p-6 pb-3 sm:pb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate">{{ publication.username || 'Utilisateur' }}</h3>
                        <p class="text-xs sm:text-sm text-gray-500">{{ timeAgo(publication.date_creation || new Date()) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Contenu du post optimisé mobile -->
                  <div class="px-4 sm:px-6 pb-3 sm:pb-4">
                    <h2 class="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{{ publication.titre }}</h2>
                    <div class="prose prose-sm max-w-none">
                      <p class="text-gray-700 leading-relaxed text-sm sm:text-base">{{ publication.description }}</p>
                    </div>
                  </div>

                  <!-- Image optimisée mobile -->
                  <div v-if="getPubImage(publication.id)" class="px-0 sm:px-6 pb-3 sm:pb-4">
                    <div class="relative overflow-hidden rounded-lg sm:rounded-lg">
                      <img 
                        :src="getPubImage(publication.id)" 
                        alt="Publication Image" 
                        class="w-full h-48 sm:h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
                      >
                    </div>
                  </div>

                  <!-- Section des réactions optimisée mobile -->
                  <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-200">
                    <div class="grid grid-cols-2 sm:flex flex-wrap gap-1 sm:gap-2 md:gap-3">
                      <button 
                        @click="togglePublicationReaction(publication.id, 'like')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'like' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            :fill="reactions[publication.id]?.type === 'like' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'aime</span>
                        <div v-if="reactingPublications.has(publication.id)" class="w-3 h-3 sm:w-4 sm:h-4">
                          <svg class="animate-spin text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'adore')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'adore' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-rose-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            :fill="reactions[publication.id]?.type === 'adore' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'adore</span>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'smile')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'smile' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            :fill="reactions[publication.id]?.type === 'smile' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">Amusant</span>
                      </button>

                      <button 
                        @click="togglePublicationReaction(publication.id, 'heart')"
                        :disabled="reactingPublications.has(publication.id)"
                        class="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        :class="reactions[publication.id]?.type === 'heart' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            :fill="reactions[publication.id]?.type === 'heart' ? 'currentColor' : 'none'"
                          />
                        </svg>
                        <span class="font-medium">J'aime pas</span>
                      </button>
                    </div>
                  </div>

                  <!-- Section Commentaires optimisée mobile -->
                  <div class="border-t border-gray-100">
                    <!-- Bouton pour afficher/masquer les commentaires -->
                    <div class="px-4 sm:px-6 py-3 bg-gray-50">
                      <button 
                        @click="toggleCommentInput(publication.id)"
                        class="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors w-full justify-center sm:justify-start"
                      >
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span class="font-medium text-sm sm:text-base">
                          {{ comments[publication.id]?.length || 0 }} commentaire{{ (comments[publication.id]?.length || 0) > 1 ? 's' : '' }}
                        </span>
                      </button>
                    </div>

                    <!-- Formulaire de commentaire optimisé mobile -->
                    <div v-if="showCommentInput[publication.id]" class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                      <div class="flex space-x-2 sm:space-x-3">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <textarea
                            v-model="newComments[publication.id]"
                            placeholder="Écrivez votre commentaire..."
                            class="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm sm:text-base"
                            rows="2"
                            maxlength="300"
                          ></textarea>
                          <div class="flex justify-between items-center mt-2 sm:mt-3">
                            <span class="text-xs sm:text-sm text-gray-500">{{ (newComments[publication.id] || '').length }}/300</span>
                            <div class="flex space-x-1 sm:space-x-2">
                              <button 
                                @click="cancelComment(publication.id)"
                                class="px-3 py-1 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm transition-colors"
                              >
                                Annuler
                              </button>
                              <button 
                                @click="commentPublication(publication.id)"
                                :disabled="!newComments[publication.id]?.trim() || isCommenting[publication.id]"
                                class="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm transition-all flex items-center"
                              >
                                <svg v-if="isCommenting[publication.id]" class="animate-spin -ml-1 mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {{ isCommenting[publication.id] ? 'Publication...' : 'Publier' }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Liste des commentaires optimisée mobile -->
                    <div v-if="comments[publication.id]?.length > 0 && showCommentInput[publication.id]" class="border-t border-gray-100">
                      <div class="max-h-48 sm:max-h-64 overflow-y-auto">
                        <div v-for="(comment, commentIndex) in comments[publication.id]" 
                            :key="comment.id || commentIndex" 
                            class="border-b border-gray-50 last:border-b-0">
                          <div class="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                            <div class="flex space-x-2 sm:space-x-3">
                              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                              </div>
                              
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center space-x-1 sm:space-x-2 mb-1">
                                  <span class="font-medium text-xs sm:text-sm text-gray-900 truncate">{{ publication.username || 'Utilisateur' }}</span>
                                  <span class="text-gray-500 text-xxs sm:text-xs">{{ timeAgo(comment.date_creation || new Date()) }}</span>
                                </div>
                                
                                <div class="bg-gray-100 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                  <p class="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{{ comment.description }}</p>
                                </div>
                                
                                <!-- Système de réactions pour commentaires optimisé mobile -->
                                <div class="flex items-center flex-wrap gap-1 sm:gap-2">
                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'like')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'like' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                        :fill="comment.userReaction === 'like' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Like</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'adore')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'adore' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        :fill="comment.userReaction === 'adore' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Adore</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'smile')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'smile' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        :fill="comment.userReaction === 'smile' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Smile</span>
                                  </button>

                                  <button 
                                    @click.stop="toggleCommentReaction(comment.id, 'heart')"
                                    :disabled="reactingComments.has(comment.id)"
                                    class="flex items-center space-x-1 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xxs sm:text-xs"
                                    :class="comment.userReaction === 'heart' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-100'"
                                  >
                                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="2" 
                                        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                                        :fill="comment.userReaction === 'heart' ? 'currentColor' : 'none'"
                                      />
                                    </svg>
                                    <span class="font-medium">Dislike</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Message si aucune publication optimisé mobile -->
              <div v-else-if="!isLoading" class="text-center py-8 sm:py-16">
                <div class="bg-white rounded-xl p-6 sm:p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Aucune publication</h3>
                  <p class="text-sm sm:text-base text-gray-600">Soyez le premier à partager quelque chose !</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Colonne Notifications (masquée sur mobile et tablette) -->
        <div class="hidden xl:block w-1.5/6 space-y-6 lg:h-full overflow-y-auto">
          <!-- Notifications récentes optimisées -->
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.022 16.042l-.176-1.764a10.986 10.986 0 010-4.556l.176-1.764a8 8 0 0115.956 0l.176 1.764a10.986 10.986 0 010 4.556l-.176 1.764a8 8 0 01-15.956 0z"/>
              </svg>
              Notifications récentes
            </h3>
            <div class="space-y-3 sm:space-y-4">
              <div v-for="(notification, index) in notifications" :key="index" class="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs sm:text-sm text-gray-900 mb-1 truncate">{{ notification.text }}</p>
                  <p class="text-xxs sm:text-xs text-gray-500">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>

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
          <!-- Notifications récentes optimisées -->
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-base">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Utilisateurs
              </h3>
              <div class="space-y-3 sm:space-y-4">
                  <div v-for="user in users" :key="user.username" class="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <img v-if="user.photoUrl" :src="user.photoUrl" :alt="user.username + ' avatar'" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover">
                      <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-sm sm:text-base font-semibold text-gray-700">{{ user.username.charAt(0) }}</span>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                          <p class="text-xs sm:text-sm text-gray-900 font-medium truncate">{{ user.username }}</p>
                      </div>

                      <button 
                          @click="followUser(user.id)" 
                          class="flex items-center justify-center px-2 py-1 text-xs font-medium text-white-300 bg-orange-400 rounded-full hover:bg-orange-500 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                          </svg>
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
