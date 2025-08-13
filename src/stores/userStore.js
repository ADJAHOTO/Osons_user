import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserPhoto, updateReact, deleteReact, getReactComment, getReactPub, 
  getReactEvent, createResponseComment, replyToResponseComment, updateResponseComment,
  getResponseComment, getResponsesForComment, deleteResponseComment, hardDeleteResponseComment, 
  suivreUser,
  getFollowerUser,
  getUsersAvailable,
  deleteFollowerUser,
  getBadgeForUser,
  getCountFollowerForUser,
  getCountFollowedUser,
  getUserInfos,
  updateUserInfos,
  updatePhotoProfil,
  deletePhotoProfil,
  getReactReplyComment,
  getCurrentUser,
  getUserPhotoById} from '../services/api';

export const useUserStore = defineStore('user', () => {
  // État pour stocker les informations de l'utilisateur connecté.
  const user = ref(null);
  const userProfileImage = ref('');
  const defaultProfileImage = '/user.png';
  const isPhotoLoaded = ref(false);

  // Nouvel état pour gérer le statut des opérations
  const reactionLoading = ref(false);
  const reactionError = ref(null);

  // Récuperer l'utilisateur connécté
  const fetchCurrentUser = async() =>{
    try {
      // L'appel API retourne les données de l'utilisateur
      const response = await getCurrentUser();
      // On met à jour l'état 'user' avec les données reçues.
      user.value = response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur", error);
      // En cas d'erreur, on s'assure que l'utilisateur est nul.
      user.value = null;
    }
  }
  
  // Récuperer la photo de l'utilisateur
  const fetchUserPhoto = async () => {
    if (isPhotoLoaded.value) return;

    try {
      const res = await getUserPhoto();
      userProfileImage.value = res.data || defaultProfileImage;
    } catch (error) {
      console.error('Erreur lors du chargement de la photo de profil :', error);
      userProfileImage.value = defaultProfileImage;
    } finally {
      isPhotoLoaded.value = true;
    }
  };
  
// Fonction pour mettre à jour une réaction
  const updateReaction = async (id_reaction, payload) => {
    reactionLoading.value = true;
    reactionError.value = null;
    try {
      await updateReact(id_reaction, payload);
      // Optionnel : retourner un succès pour le composant appelant
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réaction :', error);
      reactionError.value = 'Impossible de mettre à jour la réaction.';
      return false;
    } finally {
      reactionLoading.value = false;
    }
  };

  // Fonction pour supprimer une réaction
  const deleteReaction = async (id_reaction) => {
    reactionLoading.value = true;
    reactionError.value = null;
    try {
      await deleteReact(id_reaction);
      // Optionnel : retourner un succès pour le composant appelant
      return true;
    } catch (error) {
      console.error('Une erreur est survenue lors de la suppression de la réaction :', error);
      reactionError.value = 'Impossible de supprimer la réaction.';
      return false;
    } finally {
      reactionLoading.value = false;
    }
  };

// Fonction pour récupérer la réaction d'un commentaire 
const reactionComment = async (id_comment) => {
  try {
    const response = await getReactComment(id_comment);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la réaction du commentaire :', error.response?.data || error.message || error);
    return null;
  }
};

// Fonction pour récuperer la reaction d'une réponse commentaire
const reactionReplyComment = async(id_response_commentaire) =>{
  try {
    const response  = await getReactReplyComment(id_response_commentaire)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récuperation de la reaction pour la reponse du commentaire")
    return null;
  }
}

// Fonction pour récuperer les réactions d'une publication
const reactionPub = async (id_publication) => {
  try {
    const response = await getReactPub(id_publication);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions de la publication :', error.response?.data || error.message || error);
    return null;
  }
};  

// Fonction pour récuperer les reactions d'un évenement
const reactionEvent = async (id_event) => {
  try {
    const response = await getReactEvent(id_event);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions :', error.response?.data || error.message || error);
    return null;
  }
};

// Crée une réponse à un commentaire
const responseComment = async (formData) => {
  try {
    const response = await createResponseComment(formData);
    return response.data;
  } catch (error) {
    console.error('Erreur API lors de la création de la réponse :', error);
    throw error; // Relancer l'erreur originale pour que le composant puisse la traiter
  }
};

// Fonction pour creez une répondre à une réponse commentaire
const createreplyToResponseComment = async ({ id_response_commentaire, description}) =>{
  try {
    if (!id_response_commentaire || !description) {
    throw new Error('Veuillez remplir tous les champs');
  }

  const formData = new FormData();
  formData.append('id_response_commentaire', id_response_commentaire);
  formData.append('description', description);
  
  return await replyToResponseComment(formData);
  } catch (error) {
    console.error(
      'Erreur lors de la réponse à une réponse de commentaire :',
      error.response?.data || error.message || error
    );
    throw error; // utile si tu veux gérer l'erreur dans le frontend plus haut
  }
}

// Fonction pour mettre à jour une réponse de commentaire
const updateResponseComment = async ({ id_response_commentaire, description }) => {
  try {
    if(!id_response_commentaire || !description) {
      throw new Error('Veuillez remplir tous les champs');
    }
    const formData = new FormData();
    formData.append('id_response_commentaire', id_response_commentaire);
    formData.append('description', description);  

    return await updateResponseComment(formData)
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour de la réponse de commentaire :',
      error.response?.data || error.message || error
    );
    throw error; 
  }
}

// Fonction pour récuperer la réponse d'une réponse commentaire
const getResponseReplyComment = async (id_response) => {
  try {
    const response = await getResponseComment(id_response);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse du commentaire :', error.response?.data || error.message || error);
    return null;
  }
}

// Fonction pour récuperer une réponse pour un commentaire
const responsesForComment = async (id_commentaire) => {
  try {
    const response = await getResponsesForComment(id_commentaire);
    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses pour le commentaire :', error.response?.data || error.message || error);
    return null;
  }
}

// Fonction pour supprimer une réponse commentaire
const deleteResponseComment = async (id_response) => {
  try {
    await deleteResponseComment(id_response);
    return true; // Retourne true si la suppression a réussi
  } catch (error) {
    console.error('Erreur lors de la suppression de la réponse commentaire :', error.response?.data || error.message || error);
    return false; // Retourne false en cas d'erreur
  }
}

// Fonction pour supprimer une réponse commentaire de façon définitive
const hardDeleteResponseComment = async (id_response) => {
  try {
    await hardDeleteResponseComment(id_response);
    return true; // Retourne true si la suppression a réussi
  } catch (error) {
    console.error('Erreur lors de la suppression définitive de la réponse commentaire :', error.response?.data || error.message || error);
    return false; // Retourne false en cas d'erreur
  }
}

// ====================================
// ==== FONCTION SUIVI  =============
// ====================================

// Fonction pour suivre un utilisateur 
const followUser = async(id_suivi) => {
  try {
    return await suivreUser(id_suivi)
    // console.log("📦 ID de l'utilisateur à suivre dans userStore.js :", id_suivi);

  } catch (error) {
    if (error.response) {
      console.error("Erreur backend :", error.response.data)
    } else {
      console.error("Erreur inconnue :", error)
    }
    return false;
  }
}


// Fonction pour récuperer les followers d'un utilisateur
const recupererFollowersUser = async() => {
  try {
    const response = await getFollowerUser()
    return response.data
  } catch (error) {
    console.error("une erreur s'est produit lors de la récuperation des followers de l'utilisateur")
  }
}

// Fonction pour récuperer tous les utilisateurs disponibles
const recupererUserAvailaibles = async() => {
  try {
    const response = await getUsersAvailable();
    return response.data
  } catch (error) {
    console.error("Une Erreur est survenue lors de la récuperation de tous les utilisateurs disponibles")
  }
}

// Fonction pour supprimer le follower d'un utilisateur
const supprimerFollowerUser = async(suivi_id) => {
  try {
    await deleteFollowerUser(suivi_id)
    return true
  } catch (error) {
    console.error("Une Erreur est survenue lors de la suppression du follower de l'utilisateur")
  }
}

// Fonction pour récuperer le nombre d'utilisateur suivi
const recupererCountFollowerUser = async() =>{
  try {
    await getCountFollowedUser()
    return true
  } catch (error) {
    console.error("Une erreur est survenu lors de la récupération du nombre d'utilisateur suivi")
  }
}

// Fonction pour récuperer le nombre de followers pour un utilisateur
const recupererCountFollowerForUser = async(user_id) =>{
  try {
    await getCountFollowerForUser(user_id)
    return true
  } catch (error) {
    console.error("Une errreur est survenue lors de la récupération du nombre de followers pour l'utilisateur")
  }
}


// Fonction pour récuperer le badge d'un utilisateur 
const recupererBadgeUser = async(user_id) =>{
  try {
    await getBadgeForUser(user_id)
  } catch (error) {
    console.error("Une erreur est survenue lors de la récupération du badge de l'utilisateur")
  }
}

// Récuperer les informations de l'utilisateur
const fetchUserInfos = async() =>{
  try {
    const response = await getUserInfos()
    return response.data
  } catch (error) {
    console.log("Une erreur est survenue lors de la récupération des informations de l'utilisateur ", error.response?.data)
  }
}

// Fonction pour mettre a jour ses informations
const updateInfos = async() =>{
  try {
    const response = await updateUserInfos(payload)
    return response.data
  } catch (error) {
    console.log("Une erreur s'est produit lors de la mise a jour des informations de l'utilisateur", error.response?.data)
  }
}

// Fonction pour modifier la photo de profil
const updatePhoto = async() =>{
  try {
    const response = await updatePhotoProfil(formData)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la mise a jour de la photo de profil", error.response?.data)
  }
}

// Fonction pour supprimer la photo de profil
const deletePhoto = async() =>{
  try {
    const response = await deletePhotoProfil()
    return true
  } catch (error) {
    console.error("Une erreur esst survenue lors de la suppression de la photo de profil", error.response?.data)
  }
}


// ====================================
// ==== FONCTION UTILISATEUR =============
// ====================================

// Fonction pour mettre a jour les informations d'un utilisateur
const updateInfoUser = async(payload) =>{
  try {
    const response = await updateUserInfos(payload)
    return response.data
  } catch (error) {
    console.error("Une erreur est survenue lors de la mise a jour des informations de l'utilisateur", error.response?.data)
  }
}

// Fonction pour modifier la photo de profil 
const updatePhotoProfilUser = async(formData) =>{
  try {
    const response = await updatePhotoProfil(formData)
    return response
  } catch (error) {
    console.error("Une erreur est survenue lors de la mise a jour de la photo de profil", error.response?.data)
  }
}

// Fonction pour supprimer la photo de profil 
const deletePhotoProfilUser = async() =>{
  try {
    const response = await deletePhotoProfil()
    return response
  } catch (error) {
    console.error("une erreur est survenue lors de la suppression de la photo de profil", error.response?.data)
  }
}

// Fonction pour récuperer la photo de profil de l'utilisateur par son ID 
const fetchUserPhotoById = async(user_id) =>{
  try {
    await getUserPhotoById(user_id)
  } catch (error) {
    console.error("une erreur est survenue lors de la mise a jour de la photo de profil de l'utilisateur", error)
  }
}

  return {
    user, // Exposer le nouvel état 'user'
    userProfileImage,
    fetchUserPhoto,
    fetchUserPhotoById,
    fetchCurrentUser,
    updateReaction,
    deleteReaction,
    reactionLoading,
    reactionError, 
    reactionComment,
    reactionPub,
    reactionEvent,
    responseComment,
    replyToResponseComment,
    updateResponseComment,
    getResponseReplyComment,
    responsesForComment,
    deleteResponseComment,
    hardDeleteResponseComment,
    followUser,
    recupererFollowersUser,
    recupererUserAvailaibles,
    recupererBadgeUser,
    supprimerFollowerUser,
    recupererCountFollowerForUser,
    recupererCountFollowerUser,
    fetchUserInfos,
    updateInfos,
    updatePhoto,
    deletePhoto,
    createreplyToResponseComment,
    reactionReplyComment,
    updateInfoUser,
    updatePhotoProfilUser,
    deletePhotoProfilUser,
    defaultProfileImage,

  };
});