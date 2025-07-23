import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserPhoto } from '../services/api';

export const useUserStore = defineStore('user', () => {
  const userProfileImage = ref('');
  const defaultProfileImage = '/user.png';
  const isPhotoLoaded = ref(false); // pour éviter de recharger plusieurs fois

  const fetchUserPhoto = async () => {
    if (isPhotoLoaded.value) return; // éviter le double appel

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

  return {
    userProfileImage,
    fetchUserPhoto
  };
});
