<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { getCurrentUser } from '../services/api';

const router = useRouter();
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const activeSection = ref('home');
const observer = ref(null);
const userStore = useUserStore()
const isProfileDropdownOpen = ref(false);
const photoUrl = ref('');


const sections = ref([
  { id: 'home', name: 'Accueil', href: '/home', isAnchor: true },
  { id: 'apropos', name: 'À propos', href: '/apropos', isAnchor: true },
  { id: 'publications', name: 'Publications', href: '/publication', isAnchor: false },
  { id: 'evenements', name: 'Événements', href: '/evenement', isAnchor: false },
  { id: 'chartes', name: 'Charte', href: '/charte', isAnchor: true },
  { id: 'boutique', name: 'Boutique', href: '/boutique', isAnchor: false },
  { id: 'contacts', name: 'Contacts', href: '/contact', isAnchor: true }
]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};

const setupObserver = () => {
  const options = {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id;
      }
    });
  }, options);

  sections.value.forEach(section => {
    if (section.isAnchor) {
      const element = document.getElementById(section.id);
      if (element) observer.value.observe(element);
    }
  });
};

const scrollToSection = (section) => {
  if (section.isAnchor) {
    const element = document.getElementById(section.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    isMenuOpen.value = false;
  } else {
    router.push(section.href).finally(() => {
      isMenuOpen.value = false;
    });
  }
};

const checkLogin = async () => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      
      // await getCurrentUser(); 
      const response = await userStore.fetchCurrentUser()
      userStore.user = response.data;
    } catch (error) {
      // Si la requête échoue (ex: 401 Unauthorized, 403 Forbidden), le token est invalide ou expiré
      console.error("Erreur lors de la vérification de l'utilisateur connecté :", error.response?.data || error.message);
      localStorage.removeItem('access_token'); 
      localStorage.removeItem('role')
      userStore.user = null;
    }
  } else {
    userStore.user = null; // Pas de token, donc pas connecté
  }
};

const handleClickOutside = (e) => {
  if (!e.target.closest('.profile-dropdown')) {
    isProfileDropdownOpen.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  userStore.user = null; // Réinitialiser l'utilisateur
  console.clear()
  isProfileDropdownOpen.value = false;
  router.push('/');
};


onMounted(() => {
  checkLogin();
  window.addEventListener('scroll', handleScroll);
  setupObserver();
  fetchUserPhoto()

  // Vérifie si une ancre est dans l'URL
  const hash = router.currentRoute.value.hash?.replace('#', '');
  if (hash) {
    setTimeout(() => {
      const section = sections.value.find(sec => sec.id === hash);
      if (section) scrollToSection(section);
    }, 100);
  }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
  if (observer.value) observer.value.disconnect();
});

// Formater le binaire eb string utilisable pour l'image
function formatBase64Image(base64String) {
  if (!base64String) {
    return userStore.defaultProfileImage; 
  }
  return `data:image/jpeg;base64,${base64String}`;
}

// Récuperer la photo de profil de l'utilisateur
async function fetchUserPhoto() {
  try {
    const response = await userStore.fetchCurrentUser();
    photoUrl.value = formatBase64Image(response.data.photo); 
  } catch (error) {
    console.error("Erreur lors de la récupération de la photo de profil :", error.response?.data || error.message);
  }
}

</script>


<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    :class="{
      'bg-white/90 backdrop-blur-md shadow-md': isScrolled,
      'bg-white': !isScrolled
    }"
  >
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <img
            src="../assets/logo khc.png"
            alt="osons"
            class="h-10 w-auto"
          />
          <span class="text-xl font-bold text-gray-900">OSONS</span>
        </div>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center space-x-9">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="section.href"
            @click.prevent="scrollToSection(section)"
            class="text-sm font-medium transition-colors relative"
            :class="{
              'text-orange-600': activeSection === section.id,
              'text-gray-900 hover:text-orange-600': activeSection !== section.id
            }"
          >
            {{ section.name }}
            <span 
              v-if="activeSection === section.id"
              class="absolute bottom-[-8px] left-0 w-full h-0.5 bg-orange-600 transition-all duration-300"
            ></span>
          </a>
          
          <!-- Menu Profil (si connecté) -->
          <div v-if="userStore.isAuthenticated" class="profile-dropdown relative ml-4">
            <button 
              @click="toggleProfileDropdown"
              class="flex items-center gap-1 focus:outline-none"
            >
             <img 
                :src="photoUrl || userStore.defaultProfileImage"
                alt="Photo de profil de l’utilisateur"
                class="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
              />
              <svg 
                class="w-4 h-4 text-gray-600 transition-transform duration-200"
                :class="{ 'transform rotate-180': isProfileDropdownOpen }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div 
              v-show="isProfileDropdownOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <router-link 
                to="/profile"
                @click="isProfileDropdownOpen = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Profil
              </router-link>
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Se déconnecter
              </button>
            </div>
          </div>

          <!-- Bouton Login (si non connecté) -->
          <router-link v-else to="/Login">
            <button class="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition">
              Login
            </button>
          </router-link>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button 
            @click="toggleMenu" 
            class="text-gray-900 hover:text-orange-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div 
      v-show="isMenuOpen" 
      class="md:hidden px-4 pb-4 bg-white shadow-lg transition-all duration-300"
    >
      <div class="pt-4 space-y-3">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="section.href"
          @click.prevent="scrollToSection(section)"
          class="block px-3 py-2 font-medium transition-colors rounded-lg"
          :class="{
            'bg-orange-100 text-orange-600': activeSection === section.id,
            'text-gray-900 hover:bg-gray-100': activeSection !== section.id
          }"
        >
          {{ section.name }}
        </a>

        <!-- Menu Profil (si connecté) -->
        <div v-if="userStore.isAuthenticated" class="pt-2 border-t border-gray-200">
          <router-link 
            to="/profile"
            class="block px-3 py-2 font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Mon Profil
          </router-link>
          <button
            @click="logout"
            class="w-full text-left px-3 py-2 font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Se déconnecter
          </button>
        </div>

        <!-- Bouton Login (si non connecté) -->
        <router-link v-else to="/login">
          <button class="w-full bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition mt-2">
            Login
          </button>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Animation pour le soulignement */
nav a span {
  transform-origin: left center;
  animation: underline 0.3s ease-out;
}

@keyframes underline {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Transition pour le menu mobile */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.profile-dropdown-menu {
  transition: all 0.2s ease;
}

.profile-dropdown-menu-enter-from,
.profile-dropdown-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>