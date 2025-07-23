<script setup>
import { ref } from 'vue'
import { registerUser } from '../services/api'
import { useRouter } from 'vue-router'

// Champs inscription
const username = ref('')
const email = ref('')
const telephone = ref('')
const password = ref('')
const titre = ref('')
const motivation = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const router = useRouter()

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function handleRegister() {
  const payload = {
    username: username.value,
    email: email.value,
    telephone: telephone.value,
    mot_de_passe: password.value,
    is_utilisateur_verifie: false,
    titre: titre.value,
    motivation: motivation.value,
    date_creation: new Date().toISOString()
  }

  try {
    const res = await registerUser(payload)
    if (res) {
      username.value = ''
      email.value = ''
      telephone.value = ''
      password.value = ''
      titre.value = ''
      motivation.value = ''
      alert('Compte créé et vérifié avec succès ! Vous pouvez maintenant vous connecter.')
      router.push('/login')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de l\'inscription.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-12 px-8 shadow-xl rounded-3xl sm:px-12">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">OSONS</h1>
          <h2 class="text-xl font-semibold text-orange-500">Inscrivez-vous</h2>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <input 
              v-model="username" 
              type="text" 
              placeholder="Nom d'utilisateur" 
              required 
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            />
          </div>

          <div>
            <input 
              v-model="email" 
              type="email" 
              placeholder="Email" 
              required 
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            />
          </div>

          <div>
            <input 
              v-model="telephone" 
              type="tel" 
              placeholder="Téléphone" 
              required 
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            />
          </div>

          <!-- Champ mot de passe avec bouton afficher/masquer -->
          <div class="relative">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Mot de passe" 
              required 
              class="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            />
            <button
              v-if="password.length > 0"
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>

          <div>
            <input 
              v-model="titre" 
              type="text" 
              placeholder="Titre" 
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
            />
          </div>

          <div>
            <textarea 
              v-model="motivation" 
              placeholder="Motivation" 
              rows="3"
              class="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 resize-none"
            ></textarea>
          </div>

          <div v-if="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              class="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Valider
            </button>
          </div>
        </form>

        <!-- Footer -->
        <div class="text-center mt-6 space-x-1">
          <span class="text-gray-600 text-sm">J'ai un compte !</span>
          <a href="/login" class="font-semibold text-gray-700 hover:text-orange-500 text-sm transition-colors duration-200">
            Connexion
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
