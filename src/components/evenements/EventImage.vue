<script setup>
import { ref } from 'vue';

defineProps({
  image: String,
  title: String,
  type: String,
  timeUntilEvent: String
});

const emit = defineEmits(['image-loaded']);
const imageLoaded = ref(false);

const formatBase64Image = (base64String) => {
  if (!base64String) return '';
  return `data:image/jpeg;base64,${base64String}`;
};

const handleImageLoad = () => {
  imageLoaded.value = true;
  emit('image-loaded');
};
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-2xl group">
    <div class="aspect-[16/9] bg-gray-200">
      <img 
        :src="formatBase64Image(image)"
        :alt="title"
        @load="handleImageLoad"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        :class="{ 'opacity-0': !imageLoaded }"
      />
    </div>
    
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
      <div class="absolute top-6 right-6">
        <span class="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold capitalize shadow-lg">
          {{ type }}
        </span>
      </div>
      
      <div class="absolute bottom-6 left-6">
        <div class="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
          <div class="flex items-center text-sm">
            <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-medium text-gray-800">{{ timeUntilEvent }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>