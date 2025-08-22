<script setup>
const emit = defineEmits(["go-back"]);
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <button 
          @click="emit('go-back')"
          class="flex items-center cursor-pointer text-gray-600 hover:text-orange-600 transition-colors group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour aux événements
        </button>
      </div>
    </div>
  </header>
</template>