<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser, getCurrentUser } from '../services/api';

const form = ref({
  username: '',
  password: ''
});

const showPassword = ref(false);
const errorMessage = ref('');
const router = useRouter();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  try {
    await loginUser(form.value.username, form.value.password);
    const response = await getCurrentUser();
    const user = response.data;

    localStorage.setItem('role', user.role);
    router.push('/');
  } catch (error) {
    errorMessage.value = "Identifiants invalides. Veuillez réessayer.";
    console.error(error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-12 px-8 shadow-xl rounded-3xl sm:px-12">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">OSONS</h1>
          <h2 class="text-xl font-semibold text-orange-500">Connectez-vous</h2>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <input 
              v-model="form.username" 
              type="text" 
              placeholder="Nom d'utilisateur"
              required 
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            >
          </div>

          <!-- Champ mot de passe avec bouton afficher/masquer -->
          <div class="relative">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Mot de passe"
              required 
              class="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            >
            <button
              v-if="form.password.length > 0"
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>

          <div class="flex justify-end pt-2">
            <a href="#" class="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-200">
              Mot de passe oublié ?
            </a>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              class="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Connexion
            </button>
          </div>
        </form>

        <!-- Message d'erreur -->
        <p v-if="errorMessage" class="text-red-600 text-sm mt-4 text-center">
          {{ errorMessage }}
        </p>

        <!-- Footer -->
        <div class="text-center mt-6 space-x-1">
          <span class="text-gray-600 text-sm">Vous n'avez pas un compte ?</span>
          <a href="/register" class="font-semibold text-gray-700 hover:text-orange-500 text-sm transition-colors duration-200">
            Inscrivez-vous
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
