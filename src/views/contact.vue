<template>
  <section id="contacts" class="bg-gray-50 py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Titre avec dégradé orange -->
      <h1 class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700 mb-12 text-center">
        Contactez-nous
      </h1>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-3 gap-0">
          <!-- Colonne de gauche - Informations avec bordure blanche -->
          <div class="p-8 md:p-10 bg-white border-r border-gray-200">
            <div class="space-y-8">
              <div>
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Sièges
                </h2>
                <div class="pl-7">
                  <p class="text-gray-600 leading-relaxed">
                    Chéganney Ahlto<br>
                    Cotonou - BENIN<br>
                    Tokoin Doumasseise - IMMEUBLE SAM<br>
                    Rue des balles, Bd de la kara - TOCO
                  </p>
                </div>
              </div>

              <div>
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Email
                </h2>
                <div class="pl-7">
                  <p class="text-gray-600">info@kapitalhc.com</p>
                </div>
              </div>

              <div>
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Téléphone
                </h2>
                <div class="pl-7">
                  <p class="text-gray-600">
                    (+223) 99915650<br>
                    (+223) 92040436
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne de droite - Formulaire plus large (2 colonnes sur 3) -->
          <div class="p-8 md:p-10 bg-gray-50 md:col-span-2">
            <form class="max-w-2xl mx-auto space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="nom" class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input type="text" id="nom" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                </div>
                <div>
                  <label for="prenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input type="text" id="prenom" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              </div>

              <div>
                <label for="objet" class="block text-sm font-medium text-gray-700 mb-2">Objet</label>
                <input type="text" id="objet" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea id="message" rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
              </div>

              <div class="pt-2">
                <button type="submit" class="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md">
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ContactSection'
}
</script>

<style>
/* Animation d'entrée */
#contact {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour les inputs */
input, textarea {
  transition: all 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
  border-color: #f97316;
}
</style>