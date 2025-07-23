import axios from 'axios';
import { parseJwt } from '../utils/jwt';

const apiUrl = import.meta.env.VITE_API_URL;
const apiUrl1 = import.meta.env.VITE_API_URL_1;
const apiUrl2 = import.meta.env.VITE_API_URL_2
const apiUrl3 = import.meta.env.VITE_API_URL_3
const apiUrl4 = import.meta.env.VITE_API_URL_4
const apiUrl5 = import.meta.env.VITE_API_URL_5
const apiUrl6 = import.meta.env.VITE_API_URL_6

// Vérifier si l'utilisateur est connecté
export const isLoggedIn = () => {
  return localStorage.getItem('access_token')
 !== null;
};

// Vérifier les rôles
export const isAdmin = () => localStorage.getItem('role') === 'admin';
export const isUser = () => localStorage.getItem('role') === 'user';
export const isSuperAdmin = () => localStorage.getItem('role') === 'super_admin';
export const isDeletedUser = () => localStorage.getItem('role') === 'deleted_user';
export const isSuspendedUser = () => localStorage.getItem('role') === 'suspended_user';

export const isNormalOrAdmin = () => {
  const role = localStorage.getItem('role');
  return role === 'user' || role === 'admin';
};
export const isNormalOrDeletedUser = () => {
  const role = localStorage.getItem('role');
  return role === 'user' || role === 'deleted_user';
};
export const isNormalOrSuspendedUser = () => {
  const role = localStorage.getItem('role');
  return role === 'user' || role === 'suspended_user';
};


// === Fonction utilitaire : ajoute le token dans les headers ===
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getUserIdFromToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const decoded = parseJwt(token);
  return decoded?.id || null; // ou 'user_id', selon ton backend
};



// ====================================
// ==== AUTHENTIFICATION =============
// ====================================
// Inscription d'un nouvel utilisateur
export const registerUser = async (payload) => {
  try {
    const response = await axios.post(`${apiUrl}/auth/register`, payload);

    const confirmationToken = response.data?.token_confirmation_email;
    if (confirmationToken) {
      console.log('Token de confirmation reçu :', confirmationToken);

      // ✅ Vérifie automatiquement le compte après inscription
      await axios.post(`${apiUrl}/auth/verify`, null, {
        params: { token: confirmationToken },
      });
      console.log('Compte vérifié avec succès après inscription');
    } else {
      console.warn('Aucun token de confirmation reçu.');
    }

    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error.response?.data || error.message);
    throw error;
  }
};


export const loginUser = async (loginInput, password) => {
  const isEmail = loginInput.includes('@')
  const url = isEmail
    ? `${apiUrl}/auth/login_with_email`
    : `${apiUrl}/auth/login_with_username`

  const formData = new FormData()
  formData.append('grant_type', 'password')
  formData.append('username', loginInput)
  formData.append('password', password)
  formData.append('scope', '')
  formData.append('client_id', 'string')
  formData.append('client_secret', 'string')

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const data = response.data

    localStorage.setItem('access_token', data.access_token)

    console.log('Connexion réussie :', data)

    return data // Laisse le composant décider de la redirection

  } catch (error) {
    console.error('Erreur lors de la connexion :', error.response?.data || error.message)
    throw error
  }
}

// Récupérer le token d'authentification
export const getAuthToken = () => {
  return localStorage.getItem('access_token')
;
};
// Récupérer le rôle de l'utilisateur
export const getUserRole = () => {
  return localStorage.getItem('role');
};

export async function getCurrentUser() {
  const token = localStorage.getItem('access_token')
  return await axios.get(`${apiUrl}/user/current_user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export const logoutUser = () => {
  localStorage.clear();
};

// Récupérer l'utilisateur connecté
axios.get(`${apiUrl}/user/current_user`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
});

// ====================================
// ====  A  PROPOS =============
// ====================================

//recuperer un apropos 
export const getapropos = ()  => {
  return axios.get(`${apiUrl1}/about_us/actif`, getAuthHeaders())
}

// ====================================
// ====  UTILISATEUR =============
// ====================================

// recuperer les évenements Public 
export const userEvents = () =>  {
  return axios.get(`${apiUrl4}/Event_public/get_all_allawed_event`)
}

// Récuperer les événements publics 
export const getEvents = ()  => {
  return axios.get(`${apiUrl4}/Event_public/get_all_event_by_recent`, getAuthHeaders())
}    

// Récuperer les images d'évenements 
export const getEventsImages = ()  => {
  return axios.get(`${apiUrl4}/Event_public/get_all_event_images`, getAuthHeaders())
}

// Récuperer un evenment par son ID
export const getEventById = (event_id)  => {
  return axios.get(`${apiUrl4}/Event_public/get_event_by_id/${event_id}`, getAuthHeaders())
}

// Recherche evenement 
export const foundEvent = ()  => {
  return axios.get(`${apiUrl4}/Event_public/recherche/`, getAuthHeaders())
}

// Récuperer un evenment par categorie
export const getEventByCategorie = (categorie_id)  => {
  return axios.get(`${apiUrl4}/Event_public/get_event_by_categorie/${categorie_id}`, getAuthHeaders())
}

// Récuperer l'image d'un évenement
export const getImageEvent = (event_id)  => {
  return axios.get(`${apiUrl4}/Event_public/get_event_image/${event_id}`, getAuthHeaders())
}


// ====================================
// ====  CHARTE =============
// ====================================

// Afficher la charte aux utilisateurs 
export const showCharte = ()  => {
  return axios.get(`${apiUrl3}/notre_charte/notre_charte`, getAuthHeaders())
}

// ====================================
// ====  UTILISATEUR =============
// ====================================

// Changer son mot de passe 
export const changePassword = () => {
  return axios.put(`${apiUrl}/user/reset_password_in_app`, getAuthHeaders())
}

// reset a password 
export const resetPassword = () => {
  return axios.put(`${apiUrl}/user/reset_password`, getAuthHeaders())
}

// ====================================
// ====  INFOS UTILISATEUR =============
// ====================================

// Mise a jour des informations de l'utilisateur connecté par lui meme
export const updateUserInfos = () => {
  return axios.patch(`${apiUrl}/user_infos/photo_profil`, getAuthHeaders())
}

// Modifier la photo de profill
export const updatePhotoProfil = () => {
  return axios.put(`${apiUrl}/user_infos/update_photo_profil`, getAuthHeaders())
}

// Supprimer la photo de profil
export const deletePhotoProfil = () => {
  return axios.delete(`${apiUrl}/user_infos/delete_photo_profil`, getAuthHeaders())
}

// Route pour recuperer la photo d'un utilisateur 
export const getUserPhoto = () => {
  return axios.get(`${apiUrl}/user_infos/photo_profil`, getAuthHeaders())
}

// Route pour recuperer la photo de profil d'un utilisateur par son ID 
export const getUserPhotoById = (user_id) => {
  return axios.get(`${apiUrl}/user_infos/photo_profil/${user_id}`, getAuthHeaders())
}

// Rechercher la liste d'utilisateur par email ou ID 
export const foundUserlist = () => {
  return axios.post(`${apiUrl}/user_infos/recherche_par_email_ou_id`, getAuthHeaders())
}

// Récuperer la liste d'utilisateur par email ou ID 
export const getUserlist = () => {
  return axios.post(`${apiUrl}/user_infos/list-by-id-and-mail`, getAuthHeaders())
}

// Récuperer la liste d'utilisateur par email, ID et username 
export const getlist = () => {
  return axios.post(`${apiUrl}/user_infos/list-by-id-mail-username`, getAuthHeaders())
}

// ====================================
// ====  PUBLICATIONS UTILISATEUR =============
// ====================================

// Récuperer les publications depuis la plus récente  
export const getPublications = ()  => {
  return axios.get(`${apiUrl2}/publication_utilisateur/publications/`, getAuthHeaders())
}
 
// Creez une publication 
export const createPublication = (payload)  => {
  return axios.post(`${apiUrl2}/publication_utilisateur/publications/`,payload, getAuthHeaders())
}

// Récuperer mes publications
export const getMyPublication = ()  => {
  return axios.get(`${apiUrl2}/publication_utilisateur/publications/mes/`, getAuthHeaders())
}

// Récuperer mes publications
export const getPublicationById = (pub_id)  => {
  return axios.get(`${apiUrl2}/publication_utilisateur/publications/${pub_id}`, getAuthHeaders())
}

// Mettre a jour une publication
export const updateMyPublication = (publication_id, publication)  => {
  return axios.put(`${apiUrl2}/publication_utilisateur/publications/${publication_id}`, getAuthHeaders())
}

// Récuperer mes publications
export const deletePublication = (publication_id)  => {
  return axios.delete(`${apiUrl2}/publication_utilisateur/publications/${publication_id}`, getAuthHeaders())
}

// Récuperer les images des publications 
export const getImagePublications = ()  => {
  return axios.get(`${apiUrl2}/publication_utilisateur/publications/images/`, getAuthHeaders())
}

// Récuperer une image par son ID 
export const getImagePublicationById = (publication_id)  => {
  return axios.get(`${apiUrl2}/publication_utilisateur/publications/${publication_id}/image`, getAuthHeaders())
}

// ====================================
// ==== COMMENTAIRE =============
// ====================================

// Creez un commentaire pour une publication
export const commentPub = (payload)  => {
  return axios.post(`${apiUrl5}/commentaire/create_comment_for_pub`,payload, getAuthHeaders())
}

// Creez un commentaire pour une évenement
export const commentEvent = (payload)  => {
  return axios.post(`${apiUrl5}/commentaire/create_comment_for_event`,payload, getAuthHeaders())
}


// Creez un commentaire pour un produit
export const commentProduct = (payload)  => {
  return axios.post(`${apiUrl5}/commentaire/create_comment_for_product`,payload, getAuthHeaders())
}


// recuperer un commentaire pour un évenement, publication, produit par son id 
export const getComment = (comment_id)  => {
  return axios.get(`${apiUrl5}/commentaire/comment/${comment_id}`, getAuthHeaders())
}

// mettre a jour un commentaire pour un évenement, publication, produit par son id 
export const updateComment = (comment_id)  => {
  return axios.put(`${apiUrl5}/commentaire/update_comment/${comment_id}`, getAuthHeaders())
}

// supprimer un commentaire pour un évenement, publication, produit par son id 
export const deleteComment = (comment_id)  => {
  return axios.delete(`${apiUrl5}/commentaire/delete_comment/${comment_id}`, getAuthHeaders())
}

// recuperer les commentaires d'une publication par  son  ID publication
export const getCommentByPublicationId = (id_publication)  => {
  return axios.get(`${apiUrl5}/commentaire/comments_by_publication/${id_publication}`, getAuthHeaders())
}

// recuperer les commentaires d'un evenement par son  ID evenement
export const getCommentByEvenementId = (id_evenement)  => {
  return axios.get(`${apiUrl5}/commentaire/comments_by_evenement/${id_evenement}`, getAuthHeaders())
}


// recuperer les  commentaires d'un produit par son  ID produit
export const getCommentByProductId = (id_product)  => {
  return axios.get(`${apiUrl5}/commentaire/comments_by_product/${id_product}`, getAuthHeaders())
}

// recuperer le nombre total de  commentaire
export const getMyTotalComment = ()  => {
  return axios.get(`${apiUrl5}/commentaire/my_comments_count`, getAuthHeaders())
}

// recuperer le nombre total de  commentaire par evenement
export const getMyTotalCommentByEvent = (event_id)  => {
  return axios.get(`${apiUrl5}/commentaire/commens_count_by_event/${event_id}`, getAuthHeaders())
}

// recuperer le nombre total de  commentaire par publication
export const getMyTotalCommentByPub = (publication_id)  => {
  return axios.get(`${apiUrl5}/commentaire/commens_count_by_publication/${publication_id}`, getAuthHeaders())
}

// recuperer le nombre total de  commentaire par produict
export const getMyTotalCommentByProduct = (product_id)  => {
  return axios.get(`${apiUrl5}/commentaire/commens_count_by_product/${product_id}`, getAuthHeaders())
}

// ====================================
// ==== COMMENTAIRE ADMIN =============
// ====================================


// recuperer les commentaires par utilisateur
export const getCommentByUser = (user_id)  => {
  return axios.get(`${apiUrl5}/commentaire/admin/commens_by_user/${user_id}`, getAuthHeaders())
}

// recuperer les commentaires par publication
export const getCommentByPub = (publication_id)  => {
  return axios.get(`${apiUrl5}/commentaire/admin/commens_by_publication/${publication_id}`, getAuthHeaders())
}

// recuperer les commentaires par evenement
export const getCommentByEvent = (event_id)  => {
  return axios.get(`${apiUrl5}/commentaire/admin/commens_by_event/${event_id}`, getAuthHeaders())
}

// recuperer les commentaires par produict
export const getCommentByProduct = (product_id)  => {
  return axios.get(`${apiUrl5}/commentaire/admin/commens_by_product/${product_id}`, getAuthHeaders())
}

// recuperer tous les commentaires
export const getAllComments = ()  => {
  return axios.get(`${apiUrl5}/commentaire/admin/all_comments`, getAuthHeaders())
}

// mettre a jour  un commentaire valide
export const updateCommentValide = ()  => {
  return axios.put(`${apiUrl5}/commentaire/admin/valide_comment/${comment_id}`, getAuthHeaders())
}

// supprimer un commentaire valide
export const deleteCommentsValide = ()  => {
  return axios.delete(`${apiUrl5}/commentaire/admin/delete_comment/${comment_id}`, getAuthHeaders())
}

// recuperer les statistiques des commentaires 
export const statComments = ()  => {
  return axios.delete(`${apiUrl5}/commentaire/admin/statistiques`, getAuthHeaders())
}


// ====================================
// ==== REACTIONS UTILISATEUR =============
// ====================================

// creer une reaction pour une publication
export const reactPub = (payload)  => {
  return axios.post(`${apiUrl6}/reaction/react_for_pub`, payload, getAuthHeaders())
}


// creer une reaction pour un commentaire
export const reactComment = (payload)  => {
  return axios.post(`${apiUrl6}/reaction/react_for_comment`, payload, getAuthHeaders())
}

// creer une reaction pour un évenement
export const reactEvent = (payload)  => {
  return axios.post(`${apiUrl6}/reaction/react_for_event`, payload, getAuthHeaders())
}

// creer une reaction pour un produit
export const reactProduct = (payload)  => {
  return axios.post(`${apiUrl6}/reaction/react_for_product`, payload, getAuthHeaders())
}

// mettre a jour  une reaction 
export const updateReact = (id_reaction)  => {
  return axios.put(`${apiUrl6}/reaction/update_reaction/${id_reaction}`, getAuthHeaders())
}

// supprimer la reaction 
export const deleteReact = (id_reaction)  => {
  return axios.delete(`${apiUrl6}/reaction/delete_reaction/${id_reaction}`, getAuthHeaders())
}

// Le nombre de reaction d'un utilisateur 
export const countUserReact = ()  => {
  return axios.get(`${apiUrl6}/reaction/count_user_reactions`, getAuthHeaders())
} 

// Le nombre de reaction par type pour une publication
export const countReactType = (id_publication)  => {
  return axios.get(`${apiUrl6}/reaction/count_reactions_by_type/${id_publication}`, getAuthHeaders())
} 

// Le nombre de reaction pour une publication
export const countReactPub = (id_publication)  => {
  return axios.get(`${apiUrl6}/reaction/count_total_reactions/${id_publication}`, getAuthHeaders())
} 

// Le nombre de reaction par  type d'événement
export const countReactTypeEvt = (id_evenement)  => {
  return axios.get(`${apiUrl6}/reaction/count_reactions_by_type_event/${id_evenement}`, getAuthHeaders())
} 

// Le nombre de reaction par évenement
export const countReactEvt = (id_evenement)  => {
  return axios.get(`${apiUrl6}/reaction/count_total_reactions_event/${id_evenement}`, getAuthHeaders())
} 

// Le nombre de reaction par type de produit
export const countReactTypeProd = (id_produit)  => {
  return axios.get(`${apiUrl6}/reaction/count_reactions_by_type_product/${id_produit}`, getAuthHeaders())
}

// Le nombre de reaction par produit
export const countReactProd = (id_produit)  => {
  return axios.get(`${apiUrl6}/reaction/count_total_reactions_product/${id_produit}`, getAuthHeaders())
}

// Le nombre de reaction par type de commentaire
export const countReactTypeComment = (id_commentaire)  => {
  return axios.get(`${apiUrl6}/reaction/count_reactions_by_type_comment/${id_commentaire}`, getAuthHeaders())
}

// Le nombre de reaction par commentaire
export const countReactComment = (id_commentaire)  => {
  return axios.get(`${apiUrl6}/reaction/count_total_reactions_comment/${id_commentaire}`, getAuthHeaders())
}

// Le nombre de reaction par type de réponse commentaire
export const countReactTypeResponseComment = (id_reponse_commentaire) => {
  return axios.get(`${apiUrl6}/reaction/count_reactions_by_type_response_commentaire/${id_reponse_commentaire}`, getAuthHeaders())
}

// Le nombre de reaction par réponse commentaire
export const countReactResponseComment = (id_reponse_commentaire) => {
  return axios.get(`${apiUrl6}/reaction/count_total_reactions_response_commentaire/${id_reponse_commentaire}`, getAuthHeaders())
}

// ====================================
// ==== REACTIONS ADMIN =============
// ====================================

// Récupérer le nombre de réaction d'un utilisateur 
export const getUserReactions = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user/${id_utilisateur}`, getAuthHeaders())
}

// Récupérer le nombre de réaction par évenement
export const getEventReactions = (id_utilisateur) => {  
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_event/${id_utilisateur}`, getAuthHeaders())
}

// Récupérer le nombre de réaction par produit
export const getProductReactions = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_product/${id_utilisateur}`, getAuthHeaders())
}

// Récupérer le nombre de réaction par publication
export const getPublicationReactions = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_publication/${id_utilisateur}`, getAuthHeaders())
}

// Récupérer le nombre de réaction par commentaire
export const getCommentReactions = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_comment/${id_utilisateur}`, getAuthHeaders())
} 

// Récupérer le nombre de réaction d'un utilisateur par réponse commentaire
export const getResponseCommentReactions = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_response_commentaire/${id_utilisateur}`, getAuthHeaders())
}

// Récupérer les réactions d'un utilisateur par type
export const getReactionsByType = (id_utilisateur) => {
  return axios.get(`${apiUrl6}/reaction/admin/count_total_reactions_user_by_type/${id_utilisateur}`, getAuthHeaders())
}




